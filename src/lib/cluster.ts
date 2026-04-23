import { execSync } from "child_process";
import { execKubectl, kubectlArgs, resolveContext } from "./kubectl";

export interface ClusterConnection {
  connected: boolean;
  name: string;
  serverUrl: string;
  error?: string;
}

function serverUrlForContext(contextName: string): string {
  const clusterName = execSync(
    `kubectl config view -o jsonpath='{.contexts[?(@.name=="${contextName}")].context.cluster}'`,
    { stdio: ["pipe", "pipe", "pipe"] }
  )
    .toString()
    .trim();

  if (!clusterName) {
    return "";
  }

  return execSync(
    `kubectl config view -o jsonpath='{.clusters[?(@.name=="${clusterName}")].cluster.server}'`,
    { stdio: ["pipe", "pipe", "pipe"] }
  )
    .toString()
    .trim();
}

export async function connectCluster(context: string): Promise<ClusterConnection> {
  try {
    const name = resolveContext(context);
    const serverUrl = serverUrlForContext(name) || "unknown";

    execSync(
      ["kubectl", ...kubectlArgs(name), "api-resources", "--request-timeout=5s"].join(" "),
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    return {
      connected: true,
      name,
      serverUrl,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message.split("\n")[0] : String(err);
    return {
      connected: false,
      name: context === "current" ? "(current)" : context,
      serverUrl: "",
      error: msg,
    };
  }
}

export function fetchNodesJson(contextName: string): string {
  return execKubectl(contextName, ["get", "nodes", "-o", "json"]);
}
