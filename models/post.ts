import { Platform } from "./campaign";

export interface Post {
  id: string;
  campaignId: string;
  content: string;
  platform: Platform;
  scheduledDate: Date;
  status: "draft" | "scheduled" | "published";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
