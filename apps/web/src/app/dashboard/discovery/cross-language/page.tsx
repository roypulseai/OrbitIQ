"use client";

import { useState } from "react";
import { Languages, ArrowRightLeft, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";

const DICTIONARY_ENTRIES = [
  { source: "customer", target: "Kunde" },
  { source: "order", target: "Bestellung" },
  { source: "product", target: "Produkt" },
  { source: "revenue", target: "Umsatz" },
  { source: "quantity", target: "Menge" },
  { source: "price", target: "Preis" },
  { source: "date", target: "Datum" },
  { source: "category", target: "Kategorie" },
  { source: "email", target: "E-Mail" },
  { source: "name", target: "Name" },
  { source: "total", target: "Gesamt" },
  { source: "sales", target: "Verkauf" },
];

const MATCH_RESULTS = [
  { original: "Umsatz", lang: "DE", translated: "Revenue", targetLang: "EN", entity: "Revenue (Retail)", confidence: 98 },
  { original: "Bestellungsdatum", lang: "DE", translated: "Order Date", targetLang: "EN", entity: "OrderDate (Retail)", confidence: 95 },
  { original: "clientes", lang: "ES", translated: "Customers", targetLang: "EN", entity: "Customer (Retail)", confidence: 97 },
  { original: "ingresos_mensuales", lang: "ES", translated: "Monthly Revenue", targetLang: "EN", entity: "MRR (SaaS)", confidence: 88 },
  { original: "Benutzername", lang: "DE", translated: "Username", targetLang: "EN", entity: "Subscriber (SaaS)", confidence: 92 },
  { original: "monto_total", lang: "ES", translated: "Total Amount", targetLang: "EN", entity: "Revenue (Retail)", confidence: 90 },
];

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸", count: 14 },
  { code: "de", name: "German", flag: "🇩🇪", count: 14 },
  { code: "es", name: "Spanish", flag: "🇪🇸", count: 14 },
  { code: "fr", name: "French", flag: "🇫🇷", count: 8 },
];

function confidenceColor(c: number) {
  if (c >= 95) return "text-green-400";
  if (c >= 85) return "text-yellow-400";
  return "text-orange-400";
}

export default function CrossLanguagePage() {
  const [fromLang, setFromLang] = useState("en");
  const [toLang, setToLang] = useState("de");

  const swap = () => {
    setFromLang(toLang);
    setToLang(fromLang);
  };

  return (
    <div className="min-h-full bg-surface-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cross-Language Matching</h1>
          <p className="text-surface-6 text-sm mt-1">Translate and match column names across languages</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
          <Languages className="w-4 h-4" /> Run Translation
        </button>
      </div>

      {/* Language Selector */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-surface-6 uppercase mb-1.5 block">From Language</label>
            <select
              value={fromLang}
              onChange={(e) => setFromLang(e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent/30"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={swap}
            className="mt-5 p-2 rounded-lg bg-surface-3 border border-border hover:bg-surface-4 text-white/60 hover:text-white transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <label className="text-xs font-semibold text-surface-6 uppercase mb-1.5 block">To Language</label>
            <select
              value={toLang}
              onChange={(e) => setToLang(e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent/30"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Translation Dictionary */}
      <div className="bg-surface-2 border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-white">Translation Dictionary</h3>
          <span className="text-xs text-surface-6 ml-auto">{DICTIONARY_ENTRIES.length} entries</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {DICTIONARY_ENTRIES.map((entry) => (
            <div key={entry.source} className="flex items-center gap-2 bg-surface-3 border border-border rounded-lg px-3 py-2">
              <span className="text-sm text-white font-mono">{entry.source}</span>
              <ArrowRight className="w-3 h-3 text-surface-6 shrink-0" />
              <span className="text-sm text-accent font-mono">{entry.target}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Language Match Results */}
      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-white">Cross-Language Match Results</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-surface-6 uppercase">Original Column</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-surface-6 uppercase">Language</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-surface-6 uppercase">Translated</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-surface-6 uppercase">Target Lang</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-surface-6 uppercase">Matched Entity</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-surface-6 uppercase">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {MATCH_RESULTS.map((r, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-surface-3/30 transition-colors">
                <td className="px-5 py-3 text-sm text-white font-mono">{r.original}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">{r.lang}</span>
                </td>
                <td className="px-5 py-3 text-sm text-accent font-mono">{r.translated}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/20">{r.targetLang}</span>
                </td>
                <td className="px-5 py-3 text-sm text-white/80">{r.entity}</td>
                <td className="px-5 py-3">
                  <span className={`text-sm font-semibold ${confidenceColor(r.confidence)}`}>
                    {r.confidence}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Supported Languages */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {LANGUAGES.map((lang) => (
          <div key={lang.code} className="bg-surface-2 border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lang.flag}</span>
              <div>
                <div className="text-sm font-semibold text-white">{lang.name}</div>
                <div className="text-xs text-surface-6">{lang.count} translations</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400">Supported</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
