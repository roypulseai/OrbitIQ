import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
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

export interface SchemaDrift {
  hasDrift: boolean;
  added: string[];
  removed: string[];
  typeChanged: { column: string; oldType: string; newType: string }[];
  summary: string;
}

@Injectable()
export class IngestionService {
  private storageDir: string;

  constructor(private readonly prisma: PrismaService) {
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

    const record = await this.prisma.uploadedFile.create({
      data: {
        workspaceId,
        originalName: file.originalname,
        storedPath,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedBy,
      },
    });
    return {
      id: record.id,
      workspaceId: record.workspaceId,
      originalName: record.originalName,
      storedPath: record.storedPath,
      mimeType: record.mimeType,
      sizeBytes: record.sizeBytes,
      uploadedBy: record.uploadedBy,
      uploadedAt: record.uploadedAt,
    };
  }

  async getUpload(id: string): Promise<UploadedFile> {
    const file = await this.prisma.uploadedFile.findUnique({ where: { id } });
    if (!file) throw new NotFoundException(`Upload ${id} not found`);
    return {
      id: file.id,
      workspaceId: file.workspaceId,
      originalName: file.originalName,
      storedPath: file.storedPath,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      uploadedBy: file.uploadedBy,
      uploadedAt: file.uploadedAt,
    };
  }

  async listUploads(workspaceId: string): Promise<UploadedFile[]> {
    const files = await this.prisma.uploadedFile.findMany({
      where: { workspaceId },
      orderBy: { uploadedAt: "desc" },
    });
    return files.map(f => ({
      id: f.id,
      workspaceId: f.workspaceId,
      originalName: f.originalName,
      storedPath: f.storedPath,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes,
      uploadedBy: f.uploadedBy,
      uploadedAt: f.uploadedAt,
    }));
  }

  async profileFile(fileId: string): Promise<SchemaProfile> {
    const file = await this.getUpload(fileId);
    const ext = path.extname(file.originalName).toLowerCase();
    const tableName = path.basename(file.originalName, ext).replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();

    const profileId = crypto.randomUUID();
    let profile: SchemaProfile;
    try {
      const result = await this.parseAndProfile(file.storedPath, ext);
      const saved = await this.prisma.ingestionProfile.create({
        data: {
          fileId,
          tableName,
          columns: JSON.stringify(result.columns),
          rowCount: result.rowCount,
          columnCount: result.columns.length,
          status: "completed",
        },
      });
      profile = {
        id: saved.id,
        fileId: saved.fileId,
        tableName: saved.tableName,
        columns: result.columns,
        rowCount: saved.rowCount,
        columnCount: saved.columnCount,
        profiledAt: saved.profiledAt,
        status: saved.status as "completed",
      };
    } catch (error) {
      const saved = await this.prisma.ingestionProfile.create({
        data: {
          fileId,
          tableName,
          columns: "[]",
          rowCount: 0,
          columnCount: 0,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Profiling failed",
        },
      });
      profile = {
        id: saved.id,
        fileId: saved.fileId,
        tableName: saved.tableName,
        columns: [],
        rowCount: 0,
        columnCount: 0,
        profiledAt: saved.profiledAt,
        status: "error",
        errorMessage: saved.errorMessage || undefined,
      };
    }
    return profile;
  }

  async getProfile(id: string): Promise<SchemaProfile> {
    const saved = await this.prisma.ingestionProfile.findUnique({ where: { id } });
    if (!saved) throw new NotFoundException(`Profile ${id} not found`);
    return {
      id: saved.id,
      fileId: saved.fileId,
      tableName: saved.tableName,
      columns: typeof saved.columns === "string" ? JSON.parse(saved.columns) : saved.columns,
      rowCount: saved.rowCount,
      columnCount: saved.columnCount,
      profiledAt: saved.profiledAt,
      status: saved.status as "completed" | "error",
      errorMessage: saved.errorMessage || undefined,
    };
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
              this.prisma.ingestedTable.create({
                data: { fileId, tableName: resolvedTableName, schemaName: "main", databasePath: dbPath },
              }).then(saved => {
                resolve({ id: saved.id, fileId: saved.fileId, tableName: saved.tableName, schema: saved.schemaName, databasePath: saved.databasePath, createdAt: saved.createdAt });
              }).catch(reject);
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
                this.prisma.ingestedTable.create({
                  data: {
                    fileId,
                    tableName: resolvedTableName,
                    schemaName: "main",
                    databasePath: dbPath,
                  },
                }).then(saved => {
                  const table: DuckDBTable = {
                    id: saved.id,
                    fileId: saved.fileId,
                    tableName: saved.tableName,
                    schema: saved.schemaName,
                    databasePath: saved.databasePath,
                    createdAt: saved.createdAt,
                  };
                  resolve(table);
                }).catch(reject);
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
              this.prisma.ingestedTable.create({
                data: { fileId, tableName: resolvedTableName, schemaName: "main", databasePath: dbPath },
              }).then(saved => {
                resolve({ id: saved.id, fileId: saved.fileId, tableName: saved.tableName, schema: saved.schemaName, databasePath: saved.databasePath, createdAt: saved.createdAt });
              }).catch(reject);
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
              this.prisma.ingestedTable.create({
                data: { fileId, tableName: resolvedTableName, schemaName: "main", databasePath: dbPath },
              }).then(saved => {
                resolve({ id: saved.id, fileId: saved.fileId, tableName: saved.tableName, schema: saved.schemaName, databasePath: saved.databasePath, createdAt: saved.createdAt });
              }).catch(reject);
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
    const tables = await this.prisma.ingestedTable.findMany({ orderBy: { createdAt: "desc" } });
    return tables.map(t => ({ id: t.id, fileId: t.fileId, tableName: t.tableName, schema: t.schemaName, databasePath: t.databasePath, createdAt: t.createdAt }));
  }

  async queryTable(tableId: string, limit: number = 100, offset: number = 0): Promise<{ columns: string[]; rows: Record<string, unknown>[]; rowCount: number }> {
    const tableRecord = await this.prisma.ingestedTable.findUnique({ where: { id: tableId } });
    if (!tableRecord) throw new NotFoundException(`Table ${tableId} not found`);

    const duckdb = require("duckdb");
    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(tableRecord.databasePath, (err: Error | null) => {
        if (err) return reject(err);
        db.all(`SELECT * FROM "${tableRecord.tableName}" LIMIT $1 OFFSET $2`, [limit, offset], (err2: Error | null, rows: any[]) => {
          if (err2) {
            db.close(() => {});
            return reject(err2);
          }
          db.all(`SELECT COUNT(*) as cnt FROM "${tableRecord.tableName}"`, (err3: Error | null, countRows: any[]) => {
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

  async executeSQL(sql: string, databasePath?: string): Promise<{ columns: string[]; rows: Record<string, unknown>[]; rowCount: number; executionTimeMs: number }> {
    const duckdb = require("duckdb");
    const dbPath = databasePath || path.join(this.storageDir, "ingestion.duckdb");
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(dbPath, (err: Error | null) => {
        if (err) return reject(err);
        db.all(sql, (err2: Error | null, rows: any[]) => {
          db.close(() => {});
          if (err2) return reject(err2);
          const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
          resolve({
            columns,
            rows,
            rowCount: rows.length,
            executionTimeMs: Date.now() - start,
          });
        });
      });
    });
  }

  async listAllTables(): Promise<{ id: string; tableName: string; databasePath: string; rowCount?: number }[]> {
    const tables = await this.prisma.ingestedTable.findMany({ orderBy: { createdAt: "desc" } });
    return tables.map(t => ({ id: t.id, tableName: t.tableName, databasePath: t.databasePath }));
  }

  async deleteTable(tableId: string): Promise<boolean> {
    const tableRecord = await this.prisma.ingestedTable.findUnique({ where: { id: tableId } });
    if (!tableRecord) throw new NotFoundException(`Table ${tableId} not found`);
    const duckdb = require("duckdb");
    return new Promise((resolve, reject) => {
      const db = new duckdb.Database(tableRecord.databasePath, (err: Error | null) => {
        if (err) return reject(err);
        db.run(`DROP TABLE IF EXISTS "${tableRecord.tableName}"`, (err2: Error | null) => {
          db.close(() => {});
          if (err2) return reject(err2);
          this.prisma.ingestedTable.delete({ where: { id: tableId } }).then(() => resolve(true)).catch(reject);
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

  async refreshTable(tableId: string, fileId: string): Promise<{ table: DuckDBTable; drift: SchemaDrift }> {
    const existingTable = await this.prisma.ingestedTable.findUnique({ where: { id: tableId } });
    if (!existingTable) throw new NotFoundException(`Table ${tableId} not found`);

    const file = await this.getUpload(fileId);
    const ext = path.extname(file.originalName).toLowerCase();

    const oldProfile = await this.prisma.ingestionProfile.findFirst({
      where: { tableName: existingTable.tableName },
      orderBy: { profiledAt: "desc" },
    });
    const oldColumns: SchemaColumn[] = oldProfile
      ? (typeof oldProfile.columns === "string" ? JSON.parse(oldProfile.columns) : oldProfile.columns)
      : [];

    const newProfileResult = await this.parseAndProfile(file.storedPath, ext);
    const drift = this.detectDrift(oldColumns, newProfileResult.columns);

    const duckdb = require("duckdb");
    const dbPath = existingTable.databasePath;
    const tableName = existingTable.tableName;

    const table = await new Promise<DuckDBTable>((resolve, reject) => {
      const db = new duckdb.Database(dbPath, (err: Error | null) => {
        if (err) return reject(err);
        let loadSql: string;
        if (ext === ".csv" || ext === ".tsv") {
          const delim = ext === ".tsv" ? "\\t" : ",";
          loadSql = `CREATE OR REPLACE TABLE "${tableName}" AS SELECT * FROM read_csv_auto('${file.storedPath.replace(/'/g, "''")}', header=true, delim='${delim}', sample_size=10000)`;
        } else if (ext === ".xlsx" || ext === ".xls") {
          this.convertExcelToCsv(file.storedPath).then(csvPath => {
            db.run(`CREATE OR REPLACE TABLE "${tableName}" AS SELECT * FROM read_csv_auto('${csvPath.replace(/'/g, "''")}', header=true, sample_size=10000)`, (err2: Error | null) => {
              fs.unlinkSync(csvPath);
              if (err2) { db.close(() => {}); return reject(err2); }
              this.finishRefresh(db, dbPath, tableName, existingTable, newProfileResult, fileId).then(resolve).catch(reject);
            });
          }).catch(reject);
          return;
        } else if (ext === ".parquet") {
          loadSql = `CREATE OR REPLACE TABLE "${tableName}" AS SELECT * FROM read_parquet('${file.storedPath.replace(/'/g, "''")}')`;
        } else if (ext === ".json") {
          loadSql = `CREATE OR REPLACE TABLE "${tableName}" AS SELECT * FROM read_json_auto('${file.storedPath.replace(/'/g, "''")}')`;
        } else {
          db.close(() => {});
          return reject(new BadRequestException(`Unsupported file type: ${ext}`));
        }
        db.run(loadSql!, (err2: Error | null) => {
          if (err2) { db.close(() => {}); return reject(err2); }
          this.finishRefresh(db, dbPath, tableName, existingTable, newProfileResult, fileId).then(resolve).catch(reject);
        });
      });
    });

    return { table, drift };
  }

  private async finishRefresh(
    db: any, dbPath: string, tableName: string,
    existingTable: any, newProfileResult: { columns: SchemaColumn[]; rowCount: number },
    fileId: string
  ): Promise<DuckDBTable> {
    return new Promise((resolve, reject) => {
      db.all(`SELECT COUNT(*) as cnt FROM "${tableName}"`, (err: Error | null, rows: any[]) => {
        db.close(() => {});
        if (err) return reject(err);
        this.prisma.ingestionProfile.create({
          data: {
            fileId,
            tableName,
            columns: JSON.stringify(newProfileResult.columns),
            rowCount: newProfileResult.rowCount,
            columnCount: newProfileResult.columns.length,
            status: "completed",
          },
        }).then(() => {
          resolve({
            id: existingTable.id,
            fileId: existingTable.fileId,
            tableName: existingTable.tableName,
            schema: existingTable.schemaName,
            databasePath: existingTable.databasePath,
            createdAt: existingTable.createdAt,
          });
        }).catch(reject);
      });
    });
  }

  detectDrift(oldColumns: SchemaColumn[], newColumns: SchemaColumn[]): SchemaDrift {
    const oldMap = new Map(oldColumns.map(c => [c.name, c]));
    const newMap = new Map(newColumns.map(c => [c.name, c]));

    const added = newColumns.filter(c => !oldMap.has(c.name));
    const removed = oldColumns.filter(c => !newMap.has(c.name));
    const typeChanged: { column: string; oldType: string; newType: string }[] = [];

    for (const [name, newCol] of newMap) {
      const oldCol = oldMap.get(name);
      if (oldCol && oldCol.inferredType !== newCol.inferredType) {
        typeChanged.push({ column: name, oldType: oldCol.inferredType, newType: newCol.inferredType });
      }
    }

    return {
      hasDrift: added.length > 0 || removed.length > 0 || typeChanged.length > 0,
      added: added.map(c => c.name),
      removed: removed.map(c => c.name),
      typeChanged,
      summary: [
        added.length > 0 ? `${added.length} added` : "",
        removed.length > 0 ? `${removed.length} removed` : "",
        typeChanged.length > 0 ? `${typeChanged.length} type changed` : "",
      ].filter(Boolean).join(", ") || "No changes detected",
    };
  }
}
