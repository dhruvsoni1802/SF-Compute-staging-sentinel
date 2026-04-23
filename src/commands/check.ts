import { loadConfig } from "../lib/config";
import { connectCluster } from "../lib/cluster";

interface CheckOptions {
  context: string;
  config: string;
}

export async function checkCommand(opts: CheckOptions): Promise<void> {
  await loadConfig(opts.config);
  console.log(`config: ${opts.config}`);
  console.log(`context: ${opts.context}`);

  const cluster = await connectCluster(opts.context);

  if (!cluster.connected) {
    console.log(`error: ${cluster.error}`);
    process.exit(1);
  }

  console.log(`ok: ${cluster.name} (${cluster.serverUrl})`);
  console.log("(checks not implemented yet)");
}
