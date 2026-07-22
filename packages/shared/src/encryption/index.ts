import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

export class EncryptionService {
  private key: Buffer;

  constructor(masterKey: string) {
    const salt = "orbitiq-salt-v1";
    this.key = scryptSync(masterKey, salt, KEY_LENGTH);
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    const result = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, "hex"),
    ]);

    return result.toString("base64");
  }

  decrypt(ciphertext: string): string {
    const data = Buffer.from(ciphertext, "base64");

    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  encryptConfig(config: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = ["password", "secret", "token", "apiKey", "api_key"];

    const encrypted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(config)) {
      if (
        sensitiveFields.includes(key.toLowerCase()) &&
        typeof value === "string"
      ) {
        encrypted[key] = this.encrypt(value);
      } else {
        encrypted[key] = value;
      }
    }

    return encrypted;
  }

  decryptConfig(config: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = ["password", "secret", "token", "apiKey", "api_key"];

    const decrypted: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(config)) {
      if (
        sensitiveFields.includes(key.toLowerCase()) &&
        typeof value === "string"
      ) {
        decrypted[key] = this.decrypt(value);
      } else {
        decrypted[key] = value;
      }
    }

    return decrypted;
  }

  hash(data: string): string {
    const salt = randomBytes(SALT_LENGTH);
    const hash = scryptSync(data, salt, KEY_LENGTH);
    return `${salt.toString("hex")}:${hash.toString("hex")}`;
  }

  verify(data: string, hash: string): boolean {
    const [saltHex, hashHex] = hash.split(":");
    const salt = Buffer.from(saltHex, "hex");
    const expectedHash = Buffer.from(hashHex, "hex");
    const actualHash = scryptSync(data, salt, KEY_LENGTH);
    return expectedHash.equals(actualHash);
  }
}

let encryptionService: EncryptionService | null = null;

export function getEncryptionService(): EncryptionService {
  if (!encryptionService) {
    const masterKey = process.env.ENCRYPTION_MASTER_KEY || "orbitiq-default-key-change-in-production";
    encryptionService = new EncryptionService(masterKey);
  }
  return encryptionService;
}
