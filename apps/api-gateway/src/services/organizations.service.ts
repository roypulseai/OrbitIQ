import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrganizationInput } from "../schema";

interface OrganizationRecord {
  id: string;
  name: string;
  region: string;
  compliancePackId?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class OrganizationsService {
  private organizations: Map<string, OrganizationRecord> = new Map();

  async findAll(): Promise<OrganizationRecord[]> {
    return Array.from(this.organizations.values());
  }

  async findOne(id: string): Promise<OrganizationRecord> {
    const org = this.organizations.get(id);
    if (!org) {
      throw new NotFoundException(`Organization ${id} not found`);
    }
    return org;
  }

  async create(input: CreateOrganizationInput): Promise<OrganizationRecord> {
    const org: OrganizationRecord = {
      id: crypto.randomUUID(),
      name: input.name,
      region: input.region,
      compliancePackId: input.compliancePackId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.organizations.set(org.id, org);
    return org;
  }
}
