import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

export interface IngestionConfig {
  workspaceId: string;
  storageDir?: string;
}

export interface UploadedFile {
  id: string;
  workspaceId: string;
  originalName: string;
  storedPath: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface SchemaColumn {
  name: string;
  inferredType: "string" | "integer" | "float" | "boolean" | "date" | "datetime" | "timestamp" | "currency" | "percentage" | "unknown";
  nullPercentage: number;
  cardinality: number;
  sampleValues: unknown[];
  detectedFormat?: string;
  maxLength?: number;
  precision?: number;
  scale?: number;
}

export interface SchemaProfile {
  id: string;
  fileId: string;
  tableName: string;
  columns: SchemaColumn[];
  rowCount: number;
  columnCount: number;
  profiledAt: Date;
  status: "pending" | "completed" | "error";
  errorMessage?: string;
}

export interface DuckDBTable {
  id: string;
  fileId: string;
  tableName: string;
  schema: string;
  databasePath: string;
  createdAt: Date;
}

@Injectable()
export class IngestionService {
  private files: Map<string, UploadedFile> = new Map();
  private profiles: Map<string, SchemaProfile> = new Map();
  private tables: Map<string, DuckDBTable> = new Map();
  private storageDir: string;

  constructor() {
    this.storageDir = path.join(process.cwd(), ".orbitiq-uploads");
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async uploadFile(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    workspaceId: string,
    uploadedBy: string
  ): Promise<UploadedFile> {
    const id = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".csv", ".tsv", ".xlsx", ".xls", ".parquet", ".json"];
    if (!allowedExts.includes(ext)) {
      throw new BadRequestException(`Unsupported file type: ${ext}. Allowed: ${allowedExts.join(", ")}`);
    }

    const storedName = `${id}${ext}`;
    const storedPath = path.join(this.storageDir, storedName);
    fs.writeFileSync(storedPath, file.buffer);

    const record: UploadedFile = {
      id,
      workspaceId,
      originalName: file.originalname,
      storedPath,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy,
      uploadedAt: new Date(),
    };
    this.files.set(id, record);
    return record;
  }

  async getUpload(id: string): Promise<UploadedFile> {
    const file = this.files.get(id);
    if (!file) throw new NotFoundException(`Upload ${id} not found`);
    return file;
  }

  async listUploads(workspaceId: string): Promise<UploadedFile[]> {
    return Array.from(this.files.values()).filter(f => f.workspaceId === workspaceId);
  }

  async profileFile(fileId: string): Promise<SchemaProfile> {
    const file = await this.getUpload(fileId);
    const ext = path.extname(file.originalName).toLowerCase();
    const tableName = path.basename(file.originalName, ext).replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();

    const profileId = crypto.randomUUID();
    const profile: SchemaProfile = {
      id: profileId,
      fileId,
      tableName,
      columns: [],
      rowCount: 0,
      columnCount: 0,
      profiledAt: new Date(),
      status: "pending",
    };
    this.profiles.set(profileId, profile);

    try {
      const result = await this.parseAndProfile(file.storedPath, ext);
      profile.columns = result.columns;
      profile.rowCount = result.rowCount;
      profile.columnCount = result.columns.length;
      profile.status = "completed";
    } catch (error) {
      profile.status = "error";
      profile.errorMessage = error instanceof Error ? error.message : "Profiling failed";
    }
    return profile;
  }

  async getProfile(id: string): Promise<SchemaProfile> {
    const profile = this.profiles.get(id);
    if (!profile) throw new NotFoundException(`Profile ${id} not found`);
    return profile;
  }

  async ingestToDuckDB(fileId: string, tableName?: string): Promise<DuckDBTable> {
    const file = await this.getUpload(fileId);
    const ext = path.extname(file.originalName).toLowerCase();
    const resolvedTableName = tableName || path.basename(file.originalName, ext).replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();

    const dbPath = path.join(this.storageDir, "ingestion.duckdb");
    const duckdb = require("duckdb");

    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(dbPath, (err: Error | null) => {
        if (err) return reject(err);

        if (ext === ".csv" || ext === ".tsv") {
          const delimiter = ext === ".tsv" ? "\t" : ",";
          db.run(`
            CREATE OR REPLACE TABLE "${resolvedTableName}" AS 
            SELECT * FROM read_csv_auto('${file.storedPath.replace(/'/g, "''")}', delim='${delimiter}', header=true, sample_size=10000)
          `, (err2: Error | null) => {
            if (err2) {
              db.close(() => {});
              return reject(err2);
            }
            db.all(`SELECT COUNT(*) as cnt FROM "${resolvedTableName}"`, (err3: Error | null, rows: any[]) => {
              db.close(() => {});
              if (err3) return reject(err3);
              const table: DuckDBTable = {
                id: crypto.randomUUID(),
                fileId,
                tableName: resolvedTableName,
                schema: "main",
                databasePath: dbPath,
                createdAt: new Date(),
              };
              this.tables.set(table.id, table);
              resolve(table);
            });
          });
        } else if (ext === ".xlsx" || ext === ".xls") {
          this.convertExcelToCsv(file.storedPath).then(csvPath => {
            db.run(`
              CREATE OR REPLACE TABLE "${resolvedTableName}" AS 
              SELECT * FROM read_csv_auto('${csvPath.replace(/'/g, "''")}', header=true, sample_size=10000)
            `, (err2: Error | null) => {
              fs.unlinkSync(csvPath);
              if (err2) {
                db.close(() => {});
                return reject(err2);
              }
              db.all(`SELECT COUNT(*) as cnt FROM "${resolvedTableName}"`, (err3: Error | null, rows: any[]) => {
                db.close(() => {});
                if (err3) return reject(err3);
                const table: DuckDBTable = {
                  id: crypto.randomUUID(),
                  fileId,
                  tableName: resolvedTableName,
                  schema: "main",
                  databasePath: dbPath,
                  createdAt: new Date(),
                };
                this.tables.set(table.id, table);
                resolve(table);
              });
            });
          }).catch(reject);
        } else if (ext === ".parquet") {
          db.run(`
            CREATE OR REPLACE TABLE "${resolvedTableName}" AS 
            SELECT * FROM read_parquet('${file.storedPath.replace(/'/g, "''")}')
          `, (err2: Error | null) => {
            if (err2) {
              db.close(() => {});
              return reject(err2);
            }
            db.all(`SELECT COUNT(*) as cnt FROM "${resolvedTableName}"`, (err3: Error | null, rows: any[]) => {
              db.close(() => {});
              if (err3) return reject(err3);
              const table: DuckDBTable = {
                id: crypto.randomUUID(),
                fileId,
                tableName: resolvedTableName,
                schema: "main",
                databasePath: dbPath,
                createdAt: new Date(),
              };
              this.tables.set(table.id, table);
              resolve(table);
            });
          });
        } else if (ext === ".json") {
          db.run(`
            CREATE OR REPLACE TABLE "${resolvedTableName}" AS 
            SELECT * FROM read_json_auto('${file.storedPath.replace(/'/g, "''")}')
          `, (err2: Error | null) => {
            if (err2) {
              db.close(() => {});
              return reject(err2);
            }
            db.all(`SELECT COUNT(*) as cnt FROM "${resolvedTableName}"`, (err3: Error | null, rows: any[]) => {
              db.close(() => {});
              if (err3) return reject(err3);
              const table: DuckDBTable = {
                id: crypto.randomUUID(),
                fileId,
                tableName: resolvedTableName,
                schema: "main",
                databasePath: dbPath,
                createdAt: new Date(),
              };
              this.tables.set(table.id, table);
              resolve(table);
            });
          });
        } else {
          db.close(() => {});
          reject(new BadRequestException(`Unsupported file type: ${ext}`));
        }
      });
    });
  }

  async listTables(workspaceId: string): Promise<DuckDBTable[]> {
    return Array.from(this.tables.values());
  }

  async queryTable(tableId: string, limit: number = 100, offset: number = 0): Promise<{ columns: string[]; rows: Record<string, unknown>[]; rowCount: number }> {
    const table = this.tables.get(tableId);
    if (!table) throw new NotFoundException(`Table ${tableId} not found`);

    const duckdb = require("duckdb");
    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(table.databasePath, (err: Error | null) => {
        if (err) return reject(err);
        db.all(`SELECT * FROM "${table.tableName}" LIMIT $1 OFFSET $2`, [limit, offset], (err2: Error | null, rows: any[]) => {
          if (err2) {
            db.close(() => {});
            return reject(err2);
          }
          db.all(`SELECT COUNT(*) as cnt FROM "${table.tableName}"`, (err3: Error | null, countRows: any[]) => {
            db.close(() => {});
            if (err3) return reject(err3);
            const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
            resolve({
              columns,
              rows,
              rowCount: countRows[0]?.cnt || 0,
            });
          });
        });
      });
    });
  }

  async deleteTable(tableId: string): Promise<boolean> {
    const table = this.tables.get(tableId);
    if (!table) throw new NotFoundException(`Table ${tableId} not found`);
    const duckdb = require("duckdb");
    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(table.databasePath, (err: Error | null) => {
        if (err) return reject(err);
        db.run(`DROP TABLE IF EXISTS "${table.tableName}"`, (err2: Error | null) => {
          db.close(() => {});
          if (err2) return reject(err2);
          this.tables.delete(tableId);
          resolve(true);
        });
      });
    });
  }

  private async parseAndProfile(filePath: string, ext: string): Promise<{ columns: SchemaColumn[]; rowCount: number }> {
    if (ext === ".csv" || ext === ".tsv") {
      return this.profileCsv(filePath, ext === ".tsv" ? "\t" : ",");
    } else if (ext === ".xlsx" || ext === ".xls") {
      return this.profileExcel(filePath);
    } else if (ext === ".json") {
      return this.profileJson(filePath);
    } else if (ext === ".parquet") {
      return this.profileParquet(filePath);
    }
    throw new BadRequestException(`Unsupported file type for profiling: ${ext}`);
  }

  private async profileCsv(filePath: string, delimiter: string): Promise<{ columns: SchemaColumn[]; rowCount: number }> {
    const Papa = require("papaparse");
    const content = fs.readFileSync(filePath, "utf-8");
    const result = Papa.parse(content, {
      delimiter,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    const headers = result.meta.fields || [];
    const rows = result.data as Record<string, string>[];
    const columns: SchemaColumn[] = headers.map((header: string) => {
      const values = rows.map((r: Record<string, string>) => r[header]).filter((v: string) => v !== null && v !== undefined && v !== "");
      const nullCount = rows.length - values.length;
      const uniqueValues = new Set(values);
      return {
        name: header,
        inferredType: this.inferType(values),
        nullPercentage: rows.length > 0 ? Math.round((nullCount / rows.length) * 10000) / 100 : 0,
        cardinality: uniqueValues.size,
        sampleValues: Array.from(uniqueValues).slice(0, 5),
        detectedFormat: this.detectFormat(values),
        maxLength: this.getMaxLength(values),
      };
    });

    return { columns, rowCount: rows.length };
  }

  private async profileExcel(filePath: string): Promise<{ columns: SchemaColumn[]; rowCount: number }> {
    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new BadRequestException("No worksheets found in Excel file");

    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell: any, colNumber: number) => {
      headers[colNumber - 1] = String(cell.value || `Column_${colNumber}`);
    });

    const rows: Record<string, string>[] = [];
    worksheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber === 1) return;
      const record: Record<string, string> = {};
      headers.forEach((header, idx) => {
        const cell = row.getCell(idx + 1);
        record[header] = cell.value != null ? String(cell.value) : "";
      });
      rows.push(record);
    });

    const columns: SchemaColumn[] = headers.map((header) => {
      const values = rows.map(r => r[header]).filter(v => v !== null && v !== undefined && v !== "");
      const nullCount = rows.length - values.length;
      const uniqueValues = new Set(values);
      return {
        name: header,
        inferredType: this.inferType(values),
        nullPercentage: rows.length > 0 ? Math.round((nullCount / rows.length) * 10000) / 100 : 0,
        cardinality: uniqueValues.size,
        sampleValues: Array.from(uniqueValues).slice(0, 5),
        detectedFormat: this.detectFormat(values),
        maxLength: this.getMaxLength(values),
      };
    });

    return { columns, rowCount: rows.length };
  }

  private async profileJson(filePath: string): Promise<{ columns: SchemaColumn[]; rowCount: number }> {
    const content = fs.readFileSync(filePath, "utf-8");
    let rows: Record<string, unknown>[] = [];
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      rows = parsed;
    } else if (typeof parsed === "object") {
      const firstKey = Object.keys(parsed)[0];
      if (Array.isArray(parsed[firstKey])) {
        rows = parsed[firstKey];
      } else {
        rows = [parsed];
      }
    }

    const allKeys = new Set<string>();
    rows.forEach(r => Object.keys(r).forEach(k => allKeys.add(k)));
    const headers = Array.from(allKeys);

    const columns: SchemaColumn[] = headers.map(header => {
      const values = rows.map(r => r[header] != null ? String(r[header]) : "").filter(v => v !== "");
      const nullCount = rows.length - values.length;
      const uniqueValues = new Set(values);
      return {
        name: header,
        inferredType: this.inferType(values),
        nullPercentage: rows.length > 0 ? Math.round((nullCount / rows.length) * 10000) / 100 : 0,
        cardinality: uniqueValues.size,
        sampleValues: Array.from(uniqueValues).slice(0, 5),
        maxLength: this.getMaxLength(values),
      };
    });

    return { columns, rowCount: rows.length };
  }

  private async profileParquet(filePath: string): Promise<{ columns: SchemaColumn[]; rowCount: number }> {
    const duckdb = require("duckdb");
    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(":memory:", (err: Error | null) => {
        if (err) return reject(err);
        db.all(`SELECT * FROM read_parquet('${filePath.replace(/'/g, "''")}') LIMIT 1000`, (err2: Error | null, rows: any[]) => {
          if (err2) {
            db.close(() => {});
            return reject(err2);
          }
          const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
          const columns: SchemaColumn[] = headers.map(header => {
            const values = rows.map((r: any) => r[header] != null ? String(r[header]) : "").filter((v: string) => v !== "");
            const nullCount = rows.length - values.length;
            const uniqueValues = new Set(values);
            return {
              name: header,
              inferredType: this.inferType(values),
              nullPercentage: rows.length > 0 ? Math.round((nullCount / rows.length) * 10000) / 100 : 0,
              cardinality: uniqueValues.size,
              sampleValues: Array.from(uniqueValues).slice(0, 5),
              maxLength: this.getMaxLength(values),
            };
          });
          db.all(`SELECT COUNT(*) as cnt FROM read_parquet('${filePath.replace(/'/g, "''")}')`, (err3: Error | null, countRows: any[]) => {
            db.close(() => {});
            if (err3) return reject(err3);
            resolve({ columns, rowCount: countRows[0]?.cnt || rows.length });
          });
        });
      });
    });
  }

  private async convertExcelToCsv(excelPath: string): Promise<string> {
    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new BadRequestException("No worksheets found");

    const rows: string[] = [];
    worksheet.eachRow((row: any) => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell: any) => {
        const val = cell.value != null ? String(cell.value) : "";
        cells.push(val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val);
      });
      rows.push(cells.join(","));
    });

    const csvPath = excelPath.replace(/\.[^.]+$/, ".tmp.csv");
    fs.writeFileSync(csvPath, rows.join("\n"));
    return csvPath;
  }

  private inferType(values: unknown[]): SchemaColumn["inferredType"] {
    if (values.length === 0) return "unknown";
    const sample = values.slice(0, 1000);

    let intCount = 0;
    let floatCount = 0;
    let boolCount = 0;
    let dateCount = 0;
    let datetimeCount = 0;
    let currencyCount = 0;
    let percentCount = 0;

    for (const v of sample) {
      const s = String(v).trim();
      if (s === "" || s === "null" || s === "NULL" || s === "N/A" || s === "-") continue;

      if (/^(true|false|yes|no|0|1)$/i.test(s)) { boolCount++; continue; }
      if (/^[\$€£]\s*[\d,]+\.?\d*$/.test(s)) { currencyCount++; continue; }
      if (/^\d+\.?\d*\s*%$/.test(s)) { percentCount++; continue; }
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { dateCount++; continue; }
      if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s)) { datetimeCount++; continue; }
      if (/^-?\d+$/.test(s)) { intCount++; continue; }
      if (/^-?\d+\.\d+$/.test(s)) { floatCount++; continue; }
    }

    const total = intCount + floatCount + boolCount + dateCount + datetimeCount + currencyCount + percentCount;
    const threshold = sample.length * 0.8;

    if (currencyCount > threshold * 0.5) return "currency";
    if (percentCount > threshold * 0.5) return "percentage";
    if (dateCount > threshold) return "date";
    if (datetimeCount > threshold) return "datetime";
    if (boolCount > threshold) return "boolean";
    if (intCount > threshold) return "integer";
    if (floatCount > threshold) return "float";
    if (intCount + floatCount > threshold) return "float";
    return "string";
  }

  private detectFormat(values: unknown[]): string | undefined {
    const sample = values.slice(0, 500);
    if (sample.length === 0) return undefined;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^\+?[\d\s\-\(\)]{7,15}$/;
    const urlRe = /^https?:\/\//;
    const zipRe = /^\d{5}(-\d{4})?$/;
    const ipRe = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    let emailScore = 0, phoneScore = 0, urlScore = 0, zipScore = 0, ipScore = 0, uuidScore = 0;

    for (const v of sample) {
      const s = String(v).trim();
      if (emailRe.test(s)) emailScore++;
      else if (phoneRe.test(s)) phoneScore++;
      else if (urlRe.test(s)) urlScore++;
      else if (zipRe.test(s)) zipScore++;
      else if (ipRe.test(s)) ipScore++;
      else if (uuidRe.test(s)) uuidScore++;
    }

    const threshold = sample.length * 0.7;
    if (emailScore > threshold) return "email";
    if (phoneScore > threshold) return "phone";
    if (urlScore > threshold) return "url";
    if (zipScore > threshold) return "zip";
    if (ipScore > threshold) return "ip";
    if (uuidScore > threshold) return "uuid";
    return undefined;
  }

  private getMaxLength(values: unknown[]): number {
    let max = 0;
    for (const v of values.slice(0, 1000)) {
      const len = String(v).length;
      if (len > max) max = len;
    }
    return max;
  }
}
