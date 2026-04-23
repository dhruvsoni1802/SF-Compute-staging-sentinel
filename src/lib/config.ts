import fs from "fs";
import path from "path";
import { parse } from "yaml";

export interface SentinelConfig {
  minGpuNodes: number;
  minMemoryGb: number;
  minCpuCores: number;
  requiredNamespaces: string[];
}

export const DEFAULT_SENTINEL_CONFIG: SentinelConfig = {
  minGpuNodes: 2,
  minMemoryGb: 256,
  minCpuCores: 64,
  requiredNamespaces: ["default"],
};

function num(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const n = parseFloat(value);
    if (Number.isFinite(n)) {
      return n;
    }
  }
  return fallback;
}

function strArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  return value.filter((x): x is string => typeof x === "string");
}

function mergeParsed(data: Record<string, unknown>): SentinelConfig {
  const d = DEFAULT_SENTINEL_CONFIG;
  return {
    minGpuNodes: Math.max(0, Math.floor(num(data.minGpuNodes, d.minGpuNodes))),
    minMemoryGb: Math.max(0, num(data.minMemoryGb, d.minMemoryGb)),
    minCpuCores: Math.max(0, num(data.minCpuCores, d.minCpuCores)),
    requiredNamespaces: strArray(data.requiredNamespaces, d.requiredNamespaces),
  };
}

/** Load sentinel.config.yaml. Missing file → defaults. Invalid YAML → throws Error. */
export function loadConfig(configPath: string): { config: SentinelConfig; usedFile: boolean } {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    return { config: { ...DEFAULT_SENTINEL_CONFIG }, usedFile: false };
  }

  const raw = fs.readFileSync(resolved, "utf8");
  let parsed: unknown;
  try {
    parsed = parse(raw);
  } catch (e: unknown) {
    const hint = e instanceof Error ? e.message : String(e);
    throw new Error(`invalid YAML in ${resolved}: ${hint}`);
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`invalid config root in ${resolved}: expected a mapping`);
  }

  return { config: mergeParsed(parsed as Record<string, unknown>), usedFile: true };
}
