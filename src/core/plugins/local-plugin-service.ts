import { readFile, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import type { PluginKind, PluginManifest, PluginStatus } from "./types.js";

export interface LocalPluginValidation {
  path: string;
  manifest?: PluginManifest;
  errors: string[];
}

const VALID_KINDS: PluginKind[] = ["repository-source", "knowledge-source", "agent", "capsule-renderer", "dashboard", "automation"];
const VALID_STATUSES: PluginStatus[] = ["active", "planned"];

export class LocalPluginService {
  constructor(private readonly codemeshRepoPath: string) {}

  async list(): Promise<PluginManifest[]> {
    const validations = await this.validate();
    return validations
      .filter((validation) => validation.errors.length === 0 && validation.manifest)
      .map((validation) => validation.manifest as PluginManifest);
  }

  async validate(): Promise<LocalPluginValidation[]> {
    const pluginDir = this.pluginDir();
    const filenames = await readdir(pluginDir).catch(() => []);
    return Promise.all(
      filenames
        .filter((filename) => filename.endsWith(".json"))
        .map(async (filename) => validateManifestFile(join(pluginDir, basename(filename))))
    );
  }

  private pluginDir(): string {
    return join(this.codemeshRepoPath, ".codemesh", "plugins");
  }
}

async function validateManifestFile(path: string): Promise<LocalPluginValidation> {
  const errors: string[] = [];
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    return { path, errors: [error instanceof Error ? error.message : String(error)] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { path, errors: [error instanceof Error ? error.message : String(error)] };
  }

  const manifest = parsed as Partial<PluginManifest>;
  if (!manifest.name || typeof manifest.name !== "string") {
    errors.push("name must be a string");
  }
  if (!manifest.kind || !VALID_KINDS.includes(manifest.kind)) {
    errors.push(`kind must be one of: ${VALID_KINDS.join(", ")}`);
  }
  if (!manifest.status || !VALID_STATUSES.includes(manifest.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  if (!manifest.description || typeof manifest.description !== "string") {
    errors.push("description must be a string");
  }
  if (!Array.isArray(manifest.capabilities) || !manifest.capabilities.every((capability) => typeof capability === "string")) {
    errors.push("capabilities must be an array of strings");
  }

  return {
    path,
    manifest: errors.length === 0 ? manifest as PluginManifest : undefined,
    errors
  };
}
