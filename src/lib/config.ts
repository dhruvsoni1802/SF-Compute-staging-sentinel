import fs from "fs";
import path from "path";

export interface SentinelConfig {
  minGpuNodes: number;
  minCpuCores: number;
  minMemoryGb: number;
  requiredNamespaces: string[];
}

const DEFAULTS: SentinelConfig = {
  minGpuNodes: 1,
  minCpuCores: 8,
  minMemoryGb: 32,
  requiredNamespaces: ["default"],
};

export async function loadConfig(configPath: string): Promise<SentinelConfig> {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    return DEFAULTS;
  }
  return DEFAULTS;
}
