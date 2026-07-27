import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { ObjectType, Field, InputType, Float, Int } from "@nestjs/graphql";
import { IngestionService, UploadedFile, SchemaColumn, SchemaProfile, DuckDBTable, SchemaDrift } from "../services/ingestion.service";

@ObjectType()
export class GQLSchemaColumn {
  @Field() name: string;
  @Field() inferredType: string;
  @Field(() => Float) nullPercentage: number;
  @Field(() => Int) cardinality: number;
  @Field(() => [String]) sampleValues: string[];
  @Field({ nullable: true }) detectedFormat?: string;
  @Field(() => Int, { nullable: true }) maxLength?: number;
}

@ObjectType()
export class GQLSchemaProfile {
  @Field(() => ID) id: string;
  @Field(() => ID) fileId: string;
  @Field() tableName: string;
  @Field(() => [GQLSchemaColumn]) columns: GQLSchemaColumn[];
  @Field(() => Int) rowCount: number;
  @Field(() => Int) columnCount: number;
  @Field() profiledAt: Date;
  @Field() status: string;
  @Field({ nullable: true }) errorMessage?: string;
}

@ObjectType()
export class GQLUploadedFile {
  @Field(() => ID) id: string;
  @Field(() => ID) workspaceId: string;
  @Field() originalName: string;
  @Field() storedPath: string;
  @Field() mimeType: string;
  @Field(() => Int) sizeBytes: number;
  @Field() uploadedBy: string;
  @Field() uploadedAt: Date;
}

@ObjectType()
export class GQLDuckDBTable {
  @Field(() => ID) id: string;
  @Field(() => ID) fileId: string;
  @Field() tableName: string;
  @Field() schema: string;
  @Field() databasePath: string;
  @Field() createdAt: Date;
}

@ObjectType()
export class GQLQueryResult {
  @Field(() => [String]) columns: string[];
  @Field(() => [String]) rows: string;
  @Field(() => Int) rowCount: number;
}

@InputType()
export class ProfileFileInput {
  @Field(() => ID) fileId: string;
}

@InputType()
export class IngestToDuckDBInput {
  @Field(() => ID) fileId: string;
  @Field({ nullable: true }) tableName?: string;
}

@InputType()
export class QueryTableInput {
  @Field(() => ID) tableId: string;
  @Field(() => Int, { defaultValue: 100 }) limit: number;
  @Field(() => Int, { defaultValue: 0 }) offset: number;
}

@ObjectType()
export class GQLSchemaDriftTypeChanged {
  @Field() column: string;
  @Field() oldType: string;
  @Field() newType: string;
}

@ObjectType()
export class GQLSchemaDrift {
  @Field() hasDrift: boolean;
  @Field(() => [String]) added: string[];
  @Field(() => [String]) removed: string[];
  @Field(() => [GQLSchemaDriftTypeChanged]) typeChanged: GQLSchemaDriftTypeChanged[];
  @Field() summary: string;
}

@ObjectType()
export class GQLRefreshResult {
  @Field(() => GQLDuckDBTable) table: GQLDuckDBTable;
  @Field(() => GQLSchemaDrift) drift: GQLSchemaDrift;
}

@InputType()
export class RefreshTableInput {
  @Field(() => ID) tableId: string;
  @Field(() => ID) fileId: string;
}

@Resolver()
export class IngestionResolver {
  constructor(private readonly ingestionService: IngestionService) {}

  @Query(() => [GQLUploadedFile])
  async listUploads(@Args("workspaceId") workspaceId: string): Promise<GQLUploadedFile[]> {
    const files = await this.ingestionService.listUploads(workspaceId);
    return files.map(f => ({
      ...f,
      uploadedAt: f.uploadedAt,
    }));
  }

  @Query(() => GQLSchemaProfile)
  async getProfile(@Args("id") id: string): Promise<GQLSchemaProfile> {
    const profile = await this.ingestionService.getProfile(id);
    return {
      ...profile,
      columns: profile.columns.map(c => ({
        ...c,
        sampleValues: c.sampleValues.map(String),
      })),
    };
  }

  @Query(() => [GQLDuckDBTable])
  async listIngestedTables(): Promise<GQLDuckDBTable[]> {
    return this.ingestionService.listTables("");
  }

  @Mutation(() => GQLUploadedFile)
  async uploadFile(
    @Args("workspaceId") workspaceId: string,
    @Args("uploadedBy") uploadedBy: string,
  ): Promise<GQLUploadedFile> {
    throw new Error("Use multipart form upload endpoint instead of GraphQL mutation");
  }

  @Mutation(() => GQLSchemaProfile)
  async profileFile(@Args("input") input: ProfileFileInput): Promise<GQLSchemaProfile> {
    const profile = await this.ingestionService.profileFile(input.fileId);
    return {
      ...profile,
      columns: profile.columns.map(c => ({
        ...c,
        sampleValues: c.sampleValues.map(String),
      })),
    };
  }

  @Mutation(() => GQLDuckDBTable)
  async ingestToDuckDB(@Args("input") input: IngestToDuckDBInput): Promise<GQLDuckDBTable> {
    return this.ingestionService.ingestToDuckDB(input.fileId, input.tableName);
  }

  @Mutation(() => Boolean)
  async deleteIngestedTable(@Args("tableId") tableId: string): Promise<boolean> {
    return this.ingestionService.deleteTable(tableId);
  }

  @Mutation(() => GQLRefreshResult)
  async refreshTable(@Args("input") input: RefreshTableInput): Promise<GQLRefreshResult> {
    const result = await this.ingestionService.refreshTable(input.tableId, input.fileId);
    return {
      table: result.table,
      drift: result.drift,
    };
  }
}
