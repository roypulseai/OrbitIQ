import { Injectable } from "@nestjs/common";
import { CLSService, PIITag } from "./cls.service";

@Injectable()
export class PIIScanningService {
  constructor(private readonly clsService: CLSService) {}

  async scanTableForPII(
    modelId: string,
    tableId: string,
    columns: string[]
  ): Promise<PIITag[]> {
    const results: PIITag[] = [];
    for (const col of columns) {
      const detection = this.clsService.autoDetectPII(col);
      if (detection) {
        const tag: PIITag = {
          id: crypto.randomUUID(),
          columnName: col,
          tableId,
          modelId,
          confidence: detection.confidence,
          source: "regex",
          piiType: detection.piiType,
          createdAt: new Date(),
        };
        results.push(tag);
      }
    }
    return results;
  }

  async getPIITags(modelId: string): Promise<PIITag[]> {
    return this.clsService.getPIITags(modelId);
  }
}
