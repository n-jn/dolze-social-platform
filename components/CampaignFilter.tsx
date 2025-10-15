"use client";
import { useEffect, useState } from "react";
import { Campaign } from "@/models/campaign";

interface CampaignFilterProps {
  uid: string;
  onFilterChange: (campaignId: string) => void;
}

export default function CampaignFilter({ uid, onFilterChange }: CampaignFilterProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!uid) return;
    fetch(`/api/campaigns?uid=${uid}`)
      .then((res) => res.json())
      .then(setCampaigns)
      .catch(console.error);
  }, [uid]);

  return (
    <select onChange={(e) => onFilterChange(e.target.value)} className="border p-1 rounded">
      <option value="">All Campaigns</option>
      {campaigns.map((c) => (
        <option key={c.id} value={c.id}>
          {c.title}
        </option>
      ))}
    </select>
  );
}
