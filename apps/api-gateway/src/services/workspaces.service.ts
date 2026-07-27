import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { CreateWorkspaceInput, UpdateWorkspaceInput } from "../schema";

interface WorkspaceRecord {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string): Promise<WorkspaceRecord[]> {
    return this.prisma.workspace.findMany({ where: { orgId } });
  }

  async findOne(id: string): Promise<WorkspaceRecord> {
    const ws = await this.prisma.workspace.findUnique({ where: { id } });
    if (!ws) throw new NotFoundException(`Workspace ${id} not found`);
    return ws;
  }

  async create(input: CreateWorkspaceInput): Promise<WorkspaceRecord> {
    return this.prisma.workspace.create({
      data: {
        orgId: input.orgId,
        name: input.name,
        description: input.description,
      },
    });
  }

  async update(id: string, input: UpdateWorkspaceInput): Promise<WorkspaceRecord> {
    await this.findOne(id);
    return this.prisma.workspace.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    await this.prisma.workspace.delete({ where: { id } });
    return true;
  }
}
