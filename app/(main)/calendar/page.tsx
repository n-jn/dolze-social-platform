"use client";
import { useState } from "react";
import CampaignFilter from "@/components/campaigns/CampaignFilter";
import PostsCalendar from "@/components/calendar/PostsCalendar";
import { useUser } from "reactfire";

export default function Calendar() {
  const { data } = useUser();
  const uid = data?.uid || null;
  const [filterCampaign, setFilterCampaign] = useState<string>("");
  const [filterPlatform, setFilterPlatform] = useState<string>("");
  const [calendarKey, setCalendarKey] = useState<number>(0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Social Media Dashboard</h1>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <CampaignFilter uid={uid} onFilterChange={setFilterCampaign} />
        <select
          className="border p-1 rounded"
          onChange={(e) => setFilterPlatform(e.target.value)}
        >
          <option value="">All Platforms</option>
          <option value="Twitter">Twitter/X</option>
          <option value="Instagram">Instagram</option>
          <option value="LinkedIn">LinkedIn</option>
        </select>
      </div>

      <PostsCalendar
        key={calendarKey}
        uid={uid}
        filterCampaign={filterCampaign}
        filterPlatform={filterPlatform}
      />
    </div>
  );
}
