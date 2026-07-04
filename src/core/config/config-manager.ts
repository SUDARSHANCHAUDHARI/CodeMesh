import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { DEFAULT_CONFIG, type CodeMeshConfig } from "./types.js";

const CONFIG_PATH = join(DEFAULT_CONFIG.codemeshRepoPath, ".codemesh", "config.json");

export class ConfigManager {
  async load(): Promise<CodeMeshConfig> {
    try {
      const raw = await readFile(CONFIG_PATH, "utf8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) } as CodeMeshConfig;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  async init(overrides: Partial<CodeMeshConfig> = {}): Promise<string> {
    const config: CodeMeshConfig = { ...DEFAULT_CONFIG, ...definedValues(overrides) };
    await mkdir(dirname(CONFIG_PATH), { recursive: true });
    await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");
    return CONFIG_PATH;
  }
}

function definedValues<T extends object>(input: Partial<T>): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}
