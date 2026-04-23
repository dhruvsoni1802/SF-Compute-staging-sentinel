/** Kubernetes-style memory quantity → bytes (binary Ki/Mi/Gi). */
export function memoryToBytes(quantity: string): number {
  const q = quantity.trim();
  const m = q.match(/^(\d+)(Ki|Mi|Gi|Ti)?$/i);
  if (!m) {
    const n = parseInt(q, 10);
    return Number.isFinite(n) ? n : 0;
  }
  const n = parseInt(m[1], 10);
  const unit = (m[2] || "").toLowerCase();
  const mult: Record<string, number> = {
    "": 1,
    ki: 1024,
    mi: 1024 ** 2,
    gi: 1024 ** 3,
    ti: 1024 ** 4,
  };
  return n * (mult[unit] ?? 1);
}

/** CPU allocatable → millicores (e.g. "8", "500m", "12.5"). */
export function cpuToMillicores(quantity: string): number {
  const s = quantity.trim();
  if (s.endsWith("m")) {
    const n = parseInt(s.slice(0, -1), 10);
    return Number.isFinite(n) ? n : 0;
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 1000) : 0;
}

export function bytesToGi(bytes: number): number {
  return bytes / 1024 ** 3;
}

function gpuCountOnNode(allocatable: Record<string, string> | undefined): number {
  const raw = allocatable?.["nvidia.com/gpu"];
  if (raw === undefined) {
    return 0;
  }
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function isGpuNode(allocatable: Record<string, string> | undefined): boolean {
  return gpuCountOnNode(allocatable) > 0;
}

export interface NodeInventory {
  gpuNodeCount: number;
  totalMemoryBytes: number;
  totalCpuMillicores: number;
}

interface NodeListJson {
  items?: Array<{
    status?: { allocatable?: Record<string, string> };
  }>;
}

export function parseNodeInventory(json: string): NodeInventory {
  const data = JSON.parse(json) as NodeListJson;
  const items = data.items ?? [];

  let gpuNodeCount = 0;
  let totalMemoryBytes = 0;
  let totalCpuMillicores = 0;

  for (const node of items) {
    const alloc = node.status?.allocatable;
    if (isGpuNode(alloc)) {
      gpuNodeCount += 1;
    }
    const mem = alloc?.memory;
    if (mem) {
      totalMemoryBytes += memoryToBytes(mem);
    }
    const cpu = alloc?.cpu;
    if (cpu) {
      totalCpuMillicores += cpuToMillicores(cpu);
    }
  }

  return { gpuNodeCount, totalMemoryBytes, totalCpuMillicores };
}
