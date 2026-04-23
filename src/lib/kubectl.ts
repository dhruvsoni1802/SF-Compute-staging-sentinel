import { execSync } from "child_process";

export function resolveContext(context: string): string {
  if (context === "current") {
    return execSync("kubectl config current-context", { stdio: ["pipe", "pipe", "pipe"] })
      .toString()
      .trim();
  }
  return context;
}

export function kubectlArgs(contextName: string): string[] {
  return ["--context", contextName];
}

export function execKubectl(contextName: string, args: string[]): string {
  const full = ["kubectl", ...kubectlArgs(contextName), ...args];
  return execSync(full.join(" "), {
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: 32 * 1024 * 1024,
  }).toString();
}
