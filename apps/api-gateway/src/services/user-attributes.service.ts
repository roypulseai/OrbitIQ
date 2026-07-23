import { Injectable, NotFoundException } from "@nestjs/common";

export interface UserAttributeRecord {
  userId: string;
  attributes: Record<string, string>;
  updatedAt: Date;
}

@Injectable()
export class UserAttributesService {
  private store: Map<string, UserAttributeRecord> = new Map();

  constructor() {
    this.seedMockData();
  }

  getUserAttributes(userId: string): UserAttributeRecord | undefined {
    return this.store.get(userId);
  }

  setUserAttribute(
    userId: string,
    key: string,
    value: string
  ): UserAttributeRecord {
    const existing = this.store.get(userId);
    const attrs = { ...(existing?.attributes ?? {}), [key]: value };
    const record: UserAttributeRecord = {
      userId,
      attributes: attrs,
      updatedAt: new Date(),
    };
    this.store.set(userId, record);
    return record;
  }

  bulkSetAttributes(
    userId: string,
    attributes: Record<string, string>
  ): UserAttributeRecord {
    const existing = this.store.get(userId);
    const merged = { ...(existing?.attributes ?? {}), ...attributes };
    const record: UserAttributeRecord = {
      userId,
      attributes: merged,
      updatedAt: new Date(),
    };
    this.store.set(userId, record);
    return record;
  }

  getAttributeKeys(): string[] {
    const keys = new Set<string>();
    for (const record of this.store.values()) {
      for (const key of Object.keys(record.attributes)) {
        keys.add(key);
      }
    }
    return Array.from(keys).sort();
  }

  listAll(): UserAttributeRecord[] {
    return Array.from(this.store.values());
  }

  private seedMockData(): void {
    const now = new Date("2026-01-15");

    this.store.set("user-001", {
      userId: "user-001",
      attributes: { region: "US", department: "Engineering", role: "admin", cost_center: "CC001", levels: "user-002,user-003" },
      updatedAt: now,
    });
    this.store.set("user-002", {
      userId: "user-002",
      attributes: { region: "EU", department: "Sales", role: "editor", cost_center: "CC002", levels: "" },
      updatedAt: now,
    });
    this.store.set("user-003", {
      userId: "user-003",
      attributes: { region: "APAC", department: "Engineering", role: "viewer", cost_center: "CC003", levels: "" },
      updatedAt: now,
    });
    this.store.set("user-004", {
      userId: "user-004",
      attributes: { region: "US", department: "Data", role: "data_steward", cost_center: "CC001", levels: "" },
      updatedAt: now,
    });
  }
}
