export type ProjectMetric = {
  key: string;
  label: string;
  value: number;
};

export type WeeklyEval = {
  weekStart: string;
  produced: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  isPrimary: boolean;
  status: "active" | "paused";
  metrics: ProjectMetric[];
  weeklyEvals: WeeklyEval[];
  notes: string;
};
