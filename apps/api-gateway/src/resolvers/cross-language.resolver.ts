import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import {
  SupportedLanguage,
  TranslationEntry,
  CrossLanguageMatch,
  TranslateColumnInput,
  BatchTranslateInput,
} from "../schema";
import { CrossLanguageService } from "../services/cross-language.service";

@Resolver()
export class CrossLanguageResolver {
  constructor(private readonly crossLangService: CrossLanguageService) {}

  // ─── Queries ────────────────────────────────────────────────────────────

  @Query(() => [SupportedLanguage], { name: "supportedLanguages" })
  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    return this.crossLangService.getSupportedLanguages() as any;
  }

  @Query(() => [TranslationEntry], { name: "translationDictionary" })
  async getTranslationDictionary(
    @Args("fromLang") fromLang: string,
    @Args("toLang") toLang: string
  ): Promise<TranslationEntry[]> {
    return this.crossLangService.getTranslationDictionary(fromLang, toLang) as any;
  }

  @Query(() => [CrossLanguageMatch], { name: "crossLanguageMatches" })
  async getCrossLanguageMatches(
    @Args("connectionId", { nullable: true }) connectionId?: string,
    @Args("targetLang", { nullable: true }) targetLang?: string
  ): Promise<CrossLanguageMatch[]> {
    return this.crossLangService.getMatches() as any;
  }

  // ─── Mutations ──────────────────────────────────────────────────────────

  @Mutation(() => String)
  async translateColumnName(
    @Args("name") name: string,
    @Args("fromLang") fromLang: string,
    @Args("toLang") toLang: string
  ): Promise<string> {
    return this.crossLangService.translateColumnName(name, fromLang, toLang);
  }

  @Mutation(() => [CrossLanguageMatch])
  async batchTranslate(
    @Args("columns", { type: () => [TranslateColumnInput] }) columns: TranslateColumnInput[],
    @Args("targetLang") targetLang: string
  ): Promise<CrossLanguageMatch[]> {
    const results = this.crossLangService.batchTranslate(
      columns.map((c) => ({ name: c.name, lang: c.fromLang })),
      targetLang
    );
    return results.map((r) => ({
      id: crypto.randomUUID(),
      sourceColumn: r.name,
      sourceLang: r.sourceLang,
      translatedColumn: r.translated,
      targetLang: r.targetLang,
      matchedEntityId: `entity-${r.translated.toLowerCase()}`,
      confidence: 0.9,
      translationMethod: "dictionary",
    })) as any;
  }
}
