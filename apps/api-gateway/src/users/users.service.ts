import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserInput, UpdateUserInput } from "./users.resolver";
import { PrismaService } from "../services/prisma.service";
import { AuthenticatedUser } from "../auth/jwt.strategy";

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
  constructor(private readonly prisma: PrismaService) {}

  async findAll(orgId: string): Promise<UserRecord[]> {
    const users = await this.prisma.user.findMany({ where: { orgId } });
    return users.map((u) => ({
      ...u,
      attributes: JSON.parse(u.attributes || "{}"),
    }));
  }

  async findOne(id: string): Promise<UserRecord> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return { ...user, attributes: JSON.parse(user.attributes || "{}") };
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return { ...user, attributes: JSON.parse(user.attributes || "{}") };
  }

  async findOrCreateFromToken(tokenUser: AuthenticatedUser): Promise<UserRecord> {
    let user = await this.prisma.user.findUnique({
      where: { email: tokenUser.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          orgId: tokenUser.orgId,
          email: tokenUser.email,
          name: tokenUser.name,
          ssoSubject: tokenUser.id,
          attributes: JSON.stringify({ roles: tokenUser.roles }),
        },
      });
    } else if (user.ssoSubject !== tokenUser.id) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name: tokenUser.name,
          ssoSubject: tokenUser.id,
          attributes: JSON.stringify({ roles: tokenUser.roles }),
        },
      });
    }

    return { ...user, attributes: JSON.parse(user.attributes || "{}") };
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    const user = await this.prisma.user.create({
      data: {
        orgId: input.orgId,
        email: input.email,
        name: input.name,
        ssoSubject: input.ssoSubject,
        attributes: JSON.stringify(input.attributes || {}),
      },
    });
    return { ...user, attributes: JSON.parse(user.attributes || "{}") };
  }

  async update(id: string, input: UpdateUserInput): Promise<UserRecord> {
    await this.findOne(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.attributes && { attributes: JSON.stringify(input.attributes) }),
      },
    });
    return { ...user, attributes: JSON.parse(user.attributes || "{}") };
  }

  async delete(id: string): Promise<boolean> {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return true;
  }
}
