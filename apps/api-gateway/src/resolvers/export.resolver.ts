import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { ObjectType, Field } from "@nestjs/graphql";
import { ExportService, ExportFormat } from "../services/export.service";
import { AuditService } from "../services/audit.service";

@ObjectType()
export class ExportResult {
  @Field()
  data: string;

  @Field()
  mimeType: string;

  @Field()
  filename: string;
}

@Resolver()
export class ExportResolver {
  constructor(
    private readonly exportService: ExportService,
    private readonly auditService: AuditService
  ) {}

  @Mutation(() => ExportResult)
  async exportData(
    @Args("data") data: string,
    @Args("format") format: ExportFormat,
    @Args("filename", { nullable: true }) filename?: string
  ): Promise<ExportResult> {
    const parsedData = JSON.parse(data) as Record<string, unknown>[];

    const result = this.exportService.export(parsedData, {
      format,
      filename,
    });

    await this.auditService.log({
      action: "export.execute",
      target: "export",
      metadata: {
        format,
        rowCount: parsedData.length,
        filename: result.filename,
      },
    });

    return {
      data: String(result.data),
      mimeType: result.mimeType,
      filename: result.filename,
    };
  }

  @Mutation(() => [String])
  async getSupportedExportFormats(): Promise<string[]> {
    return this.exportService.getSupportedFormats();
  }
}
