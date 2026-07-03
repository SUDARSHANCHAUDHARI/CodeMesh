import { mkdir, readFile, appendFile } from "node:fs/promises";
import { join } from "node:path";

export interface UsageEventInput {
  agent: string;
  task: string;
  repo?: string;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
}

export interface UsageEvent extends UsageEventInput {
  id: string;
  createdAt: string;
}

export interface UsageSummary {
  days: number;
  totalEvents: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number;
  byAgent: Array<{
    agent: string;
    events: number;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
  }>;
}

export class UsageService {
  constructor(private readonly codemeshRepoPath: string) {}

  async add(input: UsageEventInput): Promise<UsageEvent> {
    const event: UsageEvent = {
      id: new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-"),
      createdAt: new Date().toISOString(),
      agent: input.agent,
      task: input.task,
      repo: input.repo,
      tokensIn: input.tokensIn,
      tokensOut: input.tokensOut,
      costUsd: input.costUsd
    };

    await mkdir(this.usageDir(), { recursive: true });
    await appendFile(this.eventsPath(), `${JSON.stringify(event)}\n`, "utf8");
    return event;
  }

  async list(limit = 20): Promise<UsageEvent[]> {
    const events = await this.readEvents();
    return events
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, Math.max(1, Math.floor(limit)));
  }

  async summary(days = 7): Promise<UsageSummary> {
    const cutoff = Date.now() - Math.max(1, Math.floor(days)) * 24 * 60 * 60 * 1000;
    const events = (await this.readEvents()).filter((event) => {
      return new Date(event.createdAt).getTime() >= cutoff;
    });
    const byAgent = new Map<string, UsageSummary["byAgent"][number]>();

    for (const event of events) {
      const row = byAgent.get(event.agent) ?? {
        agent: event.agent,
        events: 0,
        tokensIn: 0,
        tokensOut: 0,
        costUsd: 0
      };
      row.events += 1;
      row.tokensIn += event.tokensIn ?? 0;
      row.tokensOut += event.tokensOut ?? 0;
      row.costUsd += event.costUsd ?? 0;
      byAgent.set(event.agent, row);
    }

    return {
      days: Math.max(1, Math.floor(days)),
      totalEvents: events.length,
      totalTokensIn: events.reduce((sum, event) => sum + (event.tokensIn ?? 0), 0),
      totalTokensOut: events.reduce((sum, event) => sum + (event.tokensOut ?? 0), 0),
      totalCostUsd: events.reduce((sum, event) => sum + (event.costUsd ?? 0), 0),
      byAgent: Array.from(byAgent.values()).sort((left, right) => right.events - left.events || left.agent.localeCompare(right.agent))
    };
  }

  private async readEvents(): Promise<UsageEvent[]> {
    const raw = await readFile(this.eventsPath(), "utf8").catch(() => "");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as UsageEvent);
  }

  private usageDir(): string {
    return join(this.codemeshRepoPath, ".codemesh", "usage");
  }

  private eventsPath(): string {
    return join(this.usageDir(), "events.jsonl");
  }
}
