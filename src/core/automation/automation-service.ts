export type AutomationPlanKind = "daily" | "weekly";

export interface AutomationCommandPlan {
  kind: AutomationPlanKind;
  commands: string[];
}

export class AutomationService {
  commandPlan(kind: AutomationPlanKind): AutomationCommandPlan {
    const reportCommand = kind === "daily" ? "codemesh report daily" : "codemesh report weekly";

    return {
      kind,
      commands: [
        "codemesh scan repos",
        "codemesh scan knowledge",
        "codemesh graph generate",
        "codemesh dashboard generate",
        reportCommand,
        "codemesh report usage-summary --days 7"
      ]
    };
  }
}
