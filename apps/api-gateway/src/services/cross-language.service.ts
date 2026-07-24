import { Injectable, NotFoundException } from "@nestjs/common";

export interface TranslationEntry {
  id: string;
  sourceLang: string;
  sourceTerm: string;
  targetLang: string;
  targetTerm: string;
  domain: "retail" | "saas" | "finance" | "general";
  confidence: number;
}

export interface CrossLanguageMatch {
  id: string;
  sourceColumn: string;
  sourceLang: string;
  translatedColumn: string;
  targetLang: string;
  matchedEntityId: string;
  confidence: number;
  translationMethod: string;
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  translationCount: number;
}

type Dictionary = Record<string, string>;

@Injectable()
export class CrossLanguageService {
  private dictionaries: Map<string, Dictionary> = new Map();
  private matchResults: Map<string, CrossLanguageMatch> = new Map();

  constructor() {
    this.initDictionaries();
    this.seedMatches();
  }

  // ─── Translation ─────────────────────────────────────────────────────────

  translateColumnName(name: string, fromLang: string, toLang: string): string {
    const dict = this.getDictionaries(fromLang, toLang);
    const nameLower = name.toLowerCase();

    // Exact match
    if (dict[nameLower]) return dict[nameLower];

    // Try splitting by common delimiters and translating parts
    const parts = name.split(/[_\-\s]+/);
    const translated = parts.map((part) => {
      const p = part.toLowerCase();
      return dict[p] || part;
    });

    return translated.join("_");
  }

  batchTranslate(
    columns: { name: string; lang: string }[],
    targetLang: string
  ): { name: string; sourceLang: string; translated: string; targetLang: string }[] {
    return columns.map((col) => ({
      name: col.name,
      sourceLang: col.lang,
      translated: this.translateColumnName(col.name, col.lang, targetLang),
      targetLang,
    }));
  }

  getSupportedLanguages(): SupportedLanguage[] {
    return [
      { code: "en", name: "English", nativeName: "English", translationCount: 14 },
      { code: "de", name: "German", nativeName: "Deutsch", translationCount: 14 },
      { code: "es", name: "Spanish", nativeName: "Español", translationCount: 14 },
      { code: "fr", name: "French", nativeName: "Français", translationCount: 8 },
    ];
  }

  getTranslationDictionary(fromLang: string, toLang: string): TranslationEntry[] {
    const dict = this.getDictionaries(fromLang, toLang);
    return Object.entries(dict).map(([source, target], index) => ({
      id: `trans-${fromLang}-${toLang}-${index}`,
      sourceLang: fromLang,
      sourceTerm: source,
      targetLang: toLang,
      targetTerm: target,
      domain: "general" as const,
      confidence: 0.95,
    }));
  }

  matchCrossLanguage(
    columns: { name: string; lang: string }[],
    targetLang: string,
    vertical?: string
  ): CrossLanguageMatch[] {
    const results: CrossLanguageMatch[] = [];

    for (const col of columns) {
      const translated = this.translateColumnName(col.name, col.lang, targetLang);
      const match: CrossLanguageMatch = {
        id: crypto.randomUUID(),
        sourceColumn: col.name,
        sourceLang: col.lang,
        translatedColumn: translated,
        targetLang,
        matchedEntityId: `entity-${translated.toLowerCase().replace(/[_\-\s]/g, "-")}`,
        confidence: this.calculateConfidence(col.name, translated),
        translationMethod: "dictionary",
      };
      this.matchResults.set(match.id, match);
      results.push(match);
    }

    return results;
  }

  getMatches(): CrossLanguageMatch[] {
    return Array.from(this.matchResults.values());
  }

  // ─── Internal ────────────────────────────────────────────────────────────

  private getDictionaries(fromLang: string, toLang: string): Dictionary {
    const key = `${fromLang}->${toLang}`;
    const dict = this.dictionaries.get(key);
    if (!dict) throw new NotFoundException(`Dictionary ${fromLang} → ${toLang} not found`);
    return dict;
  }

  private calculateConfidence(source: string, translated: string): number {
    if (source === translated) return 0.99;
    const sourceLen = source.length;
    const transLen = translated.length;
    const lenRatio = Math.min(sourceLen, transLen) / Math.max(sourceLen, transLen);
    return Math.round((0.75 + lenRatio * 0.2) * 100) / 100;
  }

  // ─── Dictionaries ────────────────────────────────────────────────────────

  private initDictionaries(): void {
    // English → German
    this.dictionaries.set("en->de", {
      customer: "Kunde",
      order: "Bestellung",
      product: "Produkt",
      revenue: "Umsatz",
      quantity: "Menge",
      price: "Preis",
      date: "Datum",
      category: "Kategorie",
      email: "E-Mail",
      name: "Name",
      total: "Gesamt",
      sales: "Verkauf",
      user: "Benutzer",
      subscription: "Abonnement",
    });

    // English → Spanish
    this.dictionaries.set("en->es", {
      customer: "cliente",
      order: "pedido",
      product: "producto",
      revenue: "ingreso",
      quantity: "cantidad",
      price: "precio",
      date: "fecha",
      category: "categoría",
      email: "correo",
      name: "nombre",
      total: "total",
      sales: "ventas",
      user: "usuario",
      subscription: "suscripción",
    });

    // English → French
    this.dictionaries.set("en->fr", {
      customer: "client",
      order: "commande",
      product: "produit",
      revenue: "revenu",
      quantity: "quantité",
      price: "prix",
      date: "date",
      category: "catégorie",
      email: "courriel",
      name: "nom",
      total: "total",
      sales: "ventes",
      user: "utilisateur",
      subscription: "abonnement",
    });

    // German → English (reverse)
    this.dictionaries.set("de->en", {
      Kunde: "customer",
      Bestellung: "order",
      Produkt: "product",
      Umsatz: "revenue",
      Menge: "quantity",
      Preis: "price",
      Datum: "date",
      Kategorie: "category",
      "E-Mail": "email",
      Gesamt: "total",
      Verkauf: "sales",
      Benutzer: "user",
      Abonnement: "subscription",
    });

    // Spanish → English (reverse)
    this.dictionaries.set("es->en", {
      cliente: "customer",
      pedido: "order",
      producto: "product",
      ingreso: "revenue",
      cantidad: "quantity",
      precio: "price",
      fecha: "date",
      categoría: "category",
      correo: "email",
      total: "total",
      ventas: "sales",
      usuario: "user",
      suscripción: "subscription",
    });

    // French → English (reverse)
    this.dictionaries.set("fr->en", {
      client: "customer",
      commande: "order",
      produit: "product",
      revenu: "revenue",
      quantité: "quantity",
      prix: "price",
      date: "date",
      catégorie: "category",
      courriel: "email",
      total: "total",
      ventes: "sales",
      utilisateur: "user",
      abonnement: "subscription",
    });
  }

  // ─── Seed ────────────────────────────────────────────────────────────────

  private seedMatches(): void {
    const mockMatches: Omit<CrossLanguageMatch, "id">[] = [
      {
        sourceColumn: "Umsatz",
        sourceLang: "de",
        translatedColumn: "Revenue",
        targetLang: "en",
        matchedEntityId: "entity-revenue-retail",
        confidence: 0.98,
        translationMethod: "dictionary",
      },
      {
        sourceColumn: "Bestellungsdatum",
        sourceLang: "de",
        translatedColumn: "OrderDate",
        targetLang: "en",
        matchedEntityId: "entity-order-date-retail",
        confidence: 0.95,
        translationMethod: "dictionary",
      },
      {
        sourceColumn: "clientes",
        sourceLang: "es",
        translatedColumn: "Customers",
        targetLang: "en",
        matchedEntityId: "entity-customer-retail",
        confidence: 0.97,
        translationMethod: "dictionary",
      },
      {
        sourceColumn: "ingresos_mensuales",
        sourceLang: "es",
        translatedColumn: "Monthly_Revenue",
        targetLang: "en",
        matchedEntityId: "entity-mrr-saas",
        confidence: 0.88,
        translationMethod: "dictionary",
      },
      {
        sourceColumn: "Benutzername",
        sourceLang: "de",
        translatedColumn: "Username",
        targetLang: "en",
        matchedEntityId: "entity-subscriber-saas",
        confidence: 0.92,
        translationMethod: "dictionary",
      },
      {
        sourceColumn: "monto_total",
        sourceLang: "es",
        translatedColumn: "total_amount",
        targetLang: "en",
        matchedEntityId: "entity-revenue-retail",
        confidence: 0.9,
        translationMethod: "dictionary",
      },
    ];

    for (const def of mockMatches) {
      const match: CrossLanguageMatch = { id: crypto.randomUUID(), ...def };
      this.matchResults.set(match.id, match);
    }
  }
}
