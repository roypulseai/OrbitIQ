declare module "pg" {
  export interface PoolConfig {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    ssl?: boolean | object;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  }

  export interface QueryResult {
    rows: Record<string, any>[];
    rowCount: number;
    fields: { name: string; dataTypeID: number }[];
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query(text: string, params?: unknown[]): Promise<QueryResult>;
    connect(): Promise<PoolClient>;
    end(): Promise<void>;
  }

  export class PoolClient {
    query(text: string, params?: unknown[]): Promise<QueryResult>;
    release(): void;
  }
}

declare module "mysql2/promise" {
  export interface ConnectionConfig {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    ssl?: string | object;
    connectTimeout?: number;
    waitForConnections?: boolean;
    connectionLimit?: number;
  }

  export class Pool {
    constructor(config?: ConnectionConfig);
    query(sql: string, params?: unknown[]): Promise<any>;
    end(): Promise<void>;
  }

  export function createConnection(config: ConnectionConfig): Promise<any>;
}

declare module "@google-cloud/bigquery" {
  export class BigQuery {
    constructor(options?: Record<string, unknown>);
    query(query: string | { query: string; params?: unknown[] }): Promise<any>;
    getDatasets(): Promise<any>;
    dataset(datasetId: string): any;
  }

  export interface Dataset {
    getTables(): Promise<any>;
    table(tableId: string): Table;
  }

  export interface Table {
    getMetadata(): Promise<any>;
  }
}

declare module "snowflake-sdk" {
  export interface ConnectionOptions {
    account: string;
    username: string;
    password?: string;
    authenticator?: string;
    token?: string;
    database?: string;
    schema?: string;
    warehouse?: string;
    role?: string;
    insecureConnect?: boolean;
  }

  export function createConnection(options: ConnectionOptions): Connection;

  export interface Connection {
    connect(callback: (err: Error | null) => void): void;
    execute(options: Record<string, any>): Statement;
    destroy(callback?: (err: Error | null) => void): void;
  }

  export interface Statement {
    getColumnNames(): string[];
    getColumns(): { name: string; type: string }[];
    getRows(): Record<string, unknown>[];
    streamRows(): any;
    cancel(): void;
    getSqlText(): string;
    numRows: number;
    getStatementId(): string;
  }
}
