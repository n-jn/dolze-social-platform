export type Platform = "Twitter" | "Instagram" | "LinkedIn";

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  targetPlatforms: Platform[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
