import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { MemoryEntry } from "../memory/memory-service.js";
import type { RepositoryRecord } from "../plugins/types.js";
import type { UsageEvent } from "../usage/usage-service.js";

export interface GraphNode {
  id: string;
  label: string;
  kind: "repository" | "category" | "source" | "agent" | "usage" | "memory";
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface CodeMeshGraph {
  generatedAt: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphSummary {
  nodes: number;
  edges: number;
  byKind: Array<{ kind: GraphNode["kind"]; count: number }>;
}

export class GraphService {
  constructor(private readonly codemeshRepoPath: string) {}

  async generate(input: {
    repositories: RepositoryRecord[];
    usageEvents: UsageEvent[];
    memories: MemoryEntry[];
  }): Promise<string> {
    const graph = buildGraph(input);
    await mkdir(this.graphDir(), { recursive: true });
    await writeFile(this.graphPath(), `${JSON.stringify(graph, null, 2)}\n`, "utf8");
    return this.graphPath();
  }

  async summary(): Promise<GraphSummary> {
    const graph = await this.readGraph();
    const byKind = new Map<GraphNode["kind"], number>();
    for (const node of graph.nodes) {
      byKind.set(node.kind, (byKind.get(node.kind) ?? 0) + 1);
    }

    return {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      byKind: Array.from(byKind.entries())
        .map(([kind, count]) => ({ kind, count }))
        .sort((left, right) => right.count - left.count || left.kind.localeCompare(right.kind))
    };
  }

  async search(query: string): Promise<GraphNode[]> {
    const graph = await this.readGraph();
    const normalizedQuery = query.toLowerCase();
    return graph.nodes
      .filter((node) => node.id.toLowerCase().includes(normalizedQuery) || node.label.toLowerCase().includes(normalizedQuery))
      .slice(0, 50);
  }

  private async readGraph(): Promise<CodeMeshGraph> {
    const raw = await readFile(this.graphPath(), "utf8");
    return JSON.parse(raw) as CodeMeshGraph;
  }

  private graphDir(): string {
    return join(this.codemeshRepoPath, ".codemesh", "graph");
  }

  private graphPath(): string {
    return join(this.graphDir(), "graph.json");
  }
}

function buildGraph(input: {
  repositories: RepositoryRecord[];
  usageEvents: UsageEvent[];
  memories: MemoryEntry[];
}): CodeMeshGraph {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  for (const repo of input.repositories) {
    addNode(nodes, `repo:${repo.id}`, repo.name, "repository");
    addNode(nodes, `category:${repo.category}`, repo.category, "category");
    addNode(nodes, `source:${repo.source}`, repo.source, "source");
    edges.push({ from: `repo:${repo.id}`, to: `category:${repo.category}`, label: "in-category" });
    edges.push({ from: `repo:${repo.id}`, to: `source:${repo.source}`, label: "from-source" });
  }

  for (const event of input.usageEvents) {
    addNode(nodes, `usage:${event.id}`, event.task, "usage");
    addNode(nodes, `agent:${event.agent}`, event.agent, "agent");
    edges.push({ from: `usage:${event.id}`, to: `agent:${event.agent}`, label: "used-agent" });
    if (event.repo) {
      addNode(nodes, `repo-hint:${event.repo}`, event.repo, "repository");
      edges.push({ from: `usage:${event.id}`, to: `repo-hint:${event.repo}`, label: "for-repo" });
    }
  }

  for (const memory of input.memories) {
    addNode(nodes, `memory:${memory.filename}`, memory.filename, "memory");
  }

  return {
    generatedAt: new Date().toISOString(),
    nodes: Array.from(nodes.values()).sort((left, right) => left.kind.localeCompare(right.kind) || left.label.localeCompare(right.label)),
    edges
  };
}

function addNode(nodes: Map<string, GraphNode>, id: string, label: string, kind: GraphNode["kind"]): void {
  if (!nodes.has(id)) {
    nodes.set(id, { id, label, kind });
  }
}
