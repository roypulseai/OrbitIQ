import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
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
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<OrganizationRecord[]> {
    return this.prisma.organization.findMany();
  }

  async findOne(id: string): Promise<OrganizationRecord> {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  async create(input: CreateOrganizationInput): Promise<OrganizationRecord> {
    return this.prisma.organization.create({
      data: {
        name: input.name,
        region: input.region,
        compliancePackId: input.compliancePackId,
      },
    });
  }
}
