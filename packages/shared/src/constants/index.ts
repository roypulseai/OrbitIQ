export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
  DATA_STEWARD: "data_steward",
  SECURITY_ADMIN: "security_admin",
} as const;

export const CONTENT_TYPES = {
  DASHBOARD: "dashboard",
  REPORT: "report",
  EXPLORE: "explore",
  MODEL: "model",
  DATA_STORY: "data_story",
  ALERT: "alert",
  SCHEDULED_REPORT: "scheduled_report",
} as const;

export const CONNECTOR_TYPES = {
  POSTGRESQL: "postgresql",
  MYSQL: "mysql",
  SQLSERVER: "sqlserver",
  SNOWFLAKE: "snowflake",
  BIGQUERY: "bigquery",
  REDSHIFT: "redshift",
  DATABRICKS: "databricks",
  SALESFORCE: "salesforce",
  HUBSPOT: "hubspot",
  CSV: "csv",
  EXCEL: "excel",
  JSON: "json",
} as const;

export const DISCOVERY_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const ANALYTICS_JOB_TYPES = {
  FORECAST: "forecast",
  HYPOTHESIS: "hypothesis",
  CLUSTER: "cluster",
  CLASSIFICATION: "classification",
  REGRESSION: "regression",
} as const;

export const CARDINALITY = {
  ONE_TO_ONE: "1:1",
  ONE_TO_MANY: "1:N",
  MANY_TO_MANY: "N:N",
} as const;

export const MODEL_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export const AI_PROVIDERS = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GOOGLE: "google",
  MISTRAL: "mistral",
  COHERE: "cohere",
  AZURE_OPENAI: "azure_openai",
  AWS_BEDROCK: "aws_bedrock",
  OLLAMA: "ollama",
  VLLM: "vllm",
} as const;

export const COMPLIANCE_PACKS = {
  GDPR: "gdpr",
  CCPA: "ccpa",
  DPDP: "dpdp",
  FADP: "fadp",
} as const;

export const MASKING_TYPES = {
  FULL: "full",
  PARTIAL: "partial",
  HASH: "hash",
  TOKENIZE: "tokenize",
  GENERALIZE: "generalize",
} as const;

export const QUERY_LATENCY_TARGETS = {
  CACHED_MS: 300,
  LIVE_MS: 3000,
  DASHBOARD_LOAD_FIRST_PAINT_MS: 2000,
  DASHBOARD_LOAD_FULL_MS: 4000,
  AI_RESPONSE_CLOUD_MS: 8000,
  AI_RESPONSE_LOCAL_MS: 15000,
} as const;

export const CONCURRENT_USERS_TARGET = 10000;

export const LOCALIZATION_LANGUAGES = [
  "en",
  "de",
  "fr",
  "it",
  "es",
  "pt",
  "hi",
  "zh",
  "ja",
  "ar",
] as const;
