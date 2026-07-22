import { Connector } from "./interfaces";
import { ConnectorMetadata } from "./types";

export class ConnectorRegistry {
  private connectors: Map<string, Connector> = new Map();

  register(connector: Connector): void {
    const name = connector.metadata.name;
    if (this.connectors.has(name)) {
      throw new Error(`Connector "${name}" is already registered`);
    }
    this.connectors.set(name, connector);
  }

  unregister(name: string): boolean {
    return this.connectors.delete(name);
  }

  get(name: string): Connector | undefined {
    return this.connectors.get(name);
  }

  has(name: string): boolean {
    return this.connectors.has(name);
  }

  list(): ConnectorMetadata[] {
    return Array.from(this.connectors.values()).map((c) => c.metadata);
  }

  listNames(): string[] {
    return Array.from(this.connectors.keys());
  }
}

export const connectorRegistry = new ConnectorRegistry();
