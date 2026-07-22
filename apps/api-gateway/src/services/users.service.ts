import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserInput, UpdateUserInput } from "../schema";

interface UserRecord {
  id: string;
  orgId: string;
  email: string;
  name: string;
  ssoSubject?: string;
  attributes: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  private users: Map<string, UserRecord> = new Map();

  async findAll(orgId: string): Promise<UserRecord[]> {
    return Array.from(this.users.values()).filter((u) => u.orgId === orgId);
  }

  async findOne(id: string): Promise<UserRecord> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async getCurrentUser(): Promise<UserRecord> {
    const users = Array.from(this.users.values());
    if (users.length === 0) {
      throw new NotFoundException("No user found");
    }
    return users[0];
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    const user: UserRecord = {
      id: crypto.randomUUID(),
      orgId: input.orgId,
      email: input.email,
      name: input.name,
      ssoSubject: input.ssoSubject,
      attributes: input.attributes || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<UserRecord> {
    const user = await this.findOne(id);
    const updated = {
      ...user,
      ...input,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    this.users.delete(id);
    return true;
  }
}
