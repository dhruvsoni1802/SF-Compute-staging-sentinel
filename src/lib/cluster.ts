import { execSync } from "child_process";

export interface ClusterConnection {
  connected: boolean;
  name: string;
  serverUrl: string;
  error?: string;
}

export async function connectCluster(context: string): Promise<ClusterConnection> {
  try {
    const activeContext =
      context === "current"
        ? execSync("kubectl config current-context", { stdio: ["pipe", "pipe", "pipe"] })
            .toString()
            .trim()
        : context;

    const serverUrl = execSync(
      `kubectl config view -o jsonpath='{.clusters[?(@.name=="${activeContext}")].cluster.server}'`,
      { stdio: ["pipe", "pipe", "pipe"] }
    )
      .toString()
      .trim();

    execSync("kubectl api-resources --request-timeout=5s > /dev/null 2>&1", {
      stdio: ["pipe", "pipe", "pipe"],
    });

    return {
      connected: true,
      name: activeContext,
      serverUrl: serverUrl || "unknown",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message.split("\n")[0] : String(err);
    return {
      connected: false,
      name: context,
      serverUrl: "",
      error: msg,
    };
  }
}
