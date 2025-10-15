import { Campaign } from "@/models/campaign";
import { Post } from "@/models/post";

export async function generatePosts(campaign: Campaign) {
  const startDate = new Date(campaign.startDate.seconds * 1000);
  const posts: Post[] = campaign.targetPlatforms.map((platform, i) => ({
    campaignId: campaign.id,
    content: `${campaign.title} - ${campaign.description} #${platform}`,
    platform,
    scheduledDate: new Date(startDate.getTime() + i * 86400000),
    status: "draft",
    createdBy: campaign.createdBy,
  }));

  for (const post of posts) {
    await fetch("/api/posts", {
      method: "POST",
      body: JSON.stringify(post),
      headers: { "Content-Type": "application/json" },
    });
  }
}
