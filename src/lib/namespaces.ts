interface NamespaceListJson {
  items?: Array<{ metadata?: { name?: string } }>;
}

export function parseNamespaceNames(json: string): Set<string> {
  const data = JSON.parse(json) as NamespaceListJson;
  const names = new Set<string>();
  for (const item of data.items ?? []) {
    const n = item.metadata?.name;
    if (n) {
      names.add(n);
    }
  }
  return names;
}

export function missingNamespaces(required: string[], present: Set<string>): string[] {
  return required.filter((ns) => !present.has(ns));
}
