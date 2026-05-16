export type ReviewObjectives = {
  corpo: string;
  ielts: string;
  outreach: string;
  autonomia: string;
  vita: string;
};

export type ReviewAnswers = {
  whatWorked: string;
  whereDispersed: string;
  bestBlock: string;
  whatToCut: string;
  topPriority: string;
  dispersingProject: string;
  bestHabit: string;
  whatToEliminate: string;
};

export type Review = {
  id: string;
  weekStart: string;
  savedAt: string;
  answers: ReviewAnswers;
  objectives: ReviewObjectives;
};
