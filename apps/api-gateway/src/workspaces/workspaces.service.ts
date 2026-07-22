import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateWorkspaceInput, UpdateWorkspaceInput } from "./workspaces.resolver";

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
  private workspaces: Map<string, WorkspaceRecord> = new Map();

  async findAll(orgId: string): Promise<WorkspaceRecord[]> {
    return Array.from(this.workspaces.values()).filter(
      (w) => w.orgId === orgId
    );
  }

  async findOne(id: string): Promise<WorkspaceRecord> {
    const workspace = this.workspaces.get(id);
    if (!workspace) {
      throw new NotFoundException(`Workspace ${id} not found`);
    }
    return workspace;
  }

  async create(input: CreateWorkspaceInput): Promise<WorkspaceRecord> {
    const workspace: WorkspaceRecord = {
      id: crypto.randomUUID(),
      orgId: input.orgId,
      name: input.name,
      description: input.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workspaces.set(workspace.id, workspace);
    return workspace;
  }

  async update(id: string, input: UpdateWorkspaceInput): Promise<WorkspaceRecord> {
    const workspace = await this.findOne(id);
    const updated = {
      ...workspace,
      ...input,
      updatedAt: new Date(),
    };
    this.workspaces.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const workspace = await this.findOne(id);
    this.workspaces.delete(id);
    return true;
  }
}
