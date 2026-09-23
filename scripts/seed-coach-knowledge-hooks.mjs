/**
 * Node resolve hook so --apply can import coachKnowledgeStore → getSql.
 * Dry-run never loads this. Vite aliases (@/ → src/) and extensionless
 * ./dbRuntime stay as they are in the app; this hook is CLI-only.
 */
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const workspace = join(dirname(fileURLToPath(import.meta.url)), "..");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const abs = join(workspace, "src", specifier.slice(2));
    const withTs = abs.endsWith(".ts") ? abs : `${abs}.ts`;
    if (existsSync(withTs)) {
      return { url: pathToFileURL(withTs).href, shortCircuit: true };
    }
  }
  if (
    specifier.startsWith(".") &&
    !/\.[a-zA-Z][a-zA-Z0-9]*$/.test(specifier) &&
    context.parentURL
  ) {
    try {
      const candidate = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(fileURLToPath(candidate))) {
        return { url: candidate.href, shortCircuit: true };
      }
    } catch {
      // fall through to default resolver
    }
  }
  return nextResolve(specifier, context);
}
