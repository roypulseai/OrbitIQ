import { Injectable } from "@nestjs/common";

export type ExportFormat = "csv" | "json" | "xlsx" | "parquet";

interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  delimiter?: string;
}

interface ExportResult {
  data: string | Buffer;
  mimeType: string;
  filename: string;
}

@Injectable()
export class ExportService {
  export(data: Record<string, unknown>[], options: ExportOptions): ExportResult {
    const filename = options.filename || `export-${Date.now()}`;

    switch (options.format) {
      case "csv":
        return this.exportToCSV(data, filename, options);
      case "json":
        return this.exportToJSON(data, filename);
      case "xlsx":
        return this.exportToXLSX(data, filename);
      case "parquet":
        return this.exportToParquet(data, filename);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private exportToCSV(
    data: Record<string, unknown>[],
    filename: string,
    options: ExportOptions
  ): ExportResult {
    if (data.length === 0) {
      return {
        data: "",
        mimeType: "text/csv",
        filename: `${filename}.csv`,
      };
    }

    const delimiter = options.delimiter || ",";
    const includeHeaders = options.includeHeaders !== false;

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) {
            return "";
          }
          if (typeof value === "string" && (value.includes(delimiter) || value.includes('"') || value.includes("\n"))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        })
        .join(delimiter)
    );

    const csv = includeHeaders
      ? [headers.join(delimiter), ...rows].join("\n")
      : rows.join("\n");

    return {
      data: csv,
      mimeType: "text/csv",
      filename: `${filename}.csv`,
    };
  }

  private exportToJSON(data: Record<string, unknown>[], filename: string): ExportResult {
    const json = JSON.stringify(data, null, 2);

    return {
      data: json,
      mimeType: "application/json",
      filename: `${filename}.json`,
    };
  }

  private exportToXLSX(data: Record<string, unknown>[], filename: string): ExportResult {
    // Placeholder for XLSX export
    // In a real implementation, this would use a library like xlsx or exceljs
    const json = JSON.stringify(data, null, 2);

    return {
      data: json,
      mimeType: "application/json",
      filename: `${filename}.json`,
    };
  }

  private exportToParquet(data: Record<string, unknown>[], filename: string): ExportResult {
    // Placeholder for Parquet export
    // In a real implementation, this would use a library like parquetjs
    const json = JSON.stringify(data, null, 2);

    return {
      data: json,
      mimeType: "application/json",
      filename: `${filename}.json`,
    };
  }

  getSupportedFormats(): ExportFormat[] {
    return ["csv", "json", "xlsx", "parquet"];
  }

  getMimeType(format: ExportFormat): string {
    switch (format) {
      case "csv":
        return "text/csv";
      case "json":
        return "application/json";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "parquet":
        return "application/octet-stream";
      default:
        return "application/octet-stream";
    }
  }
}
