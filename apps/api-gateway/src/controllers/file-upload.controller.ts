import { Controller, Post, Get, Delete, Body, Param, Req, UploadedFile, UseInterceptors, HttpException, HttpStatus } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { IngestionService } from "../services/ingestion.service";
import { RealProfilingService } from "../services/real-profiling.service";

@Controller("api/v1/ingestion")
export class FileUploadController {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly profilingService: RealProfilingService,
  ) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body("workspaceId") workspaceId: string,
    @Body("uploadedBy") uploadedBy: string,
  ) {
    if (!file) {
      throw new HttpException("No file provided", HttpStatus.BAD_REQUEST);
    }
    const result = await this.ingestionService.uploadFile(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      workspaceId || "default",
      uploadedBy || "system",
    );
    return {
      id: result.id,
      originalName: result.originalName,
      sizeBytes: result.sizeBytes,
      mimeType: result.mimeType,
      uploadedAt: result.uploadedAt,
    };
  }

  @Get("files/:workspaceId")
  async listFiles(@Param("workspaceId") workspaceId: string) {
    return this.ingestionService.listUploads(workspaceId);
  }

  @Post("profile/:fileId")
  async profileFile(@Param("fileId") fileId: string) {
    return this.ingestionService.profileFile(fileId);
  }

  @Post("ingest/:fileId")
  async ingestToDuckDB(
    @Param("fileId") fileId: string,
    @Body("tableName") tableName?: string,
  ) {
    return this.ingestionService.ingestToDuckDB(fileId, tableName);
  }

  @Get("tables")
  async listTables() {
    return this.ingestionService.listTables("");
  }

  @Get("tables/:tableId/query")
  async queryTable(
    @Param("tableId") tableId: string,
    @Body("limit") limit?: number,
    @Body("offset") offset?: number,
  ) {
    return this.ingestionService.queryTable(tableId, limit || 100, offset || 0);
  }

  @Delete("tables/:tableId")
  async deleteTable(@Param("tableId") tableId: string) {
    return this.ingestionService.deleteTable(tableId);
  }

  @Get("profiles")
  async listProfiles() {
    return this.profilingService.listProfiles();
  }

  @Post("profiles/:tableId")
  async profileTable(@Param("tableId") tableId: string) {
    return this.profilingService.profileTable(tableId);
  }
}
