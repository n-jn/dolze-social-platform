"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CampaignDetailPage from "../../../../components/campaigns/CampaignDetailPage";

export default function CampaignDetailWrapper() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/campaigns/${id}`)
      .then((res) => res.json())
      .then((data) => setCampaign(data));
  }, [id]);

  if (!campaign) return <p className="text-gray-500">Loading campaign...</p>;

  return <CampaignDetailPage campaign={campaign} />;
}
