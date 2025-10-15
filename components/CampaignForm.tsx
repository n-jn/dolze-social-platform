// components/CampaignForm.tsx
"use client";
import { useState } from "react";
import { Campaign } from "@/models/campaign";

interface Props {
  uid: string;
  onCreate: (campaign: Campaign) => void;
}

export default function CampaignForm({ uid, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const campaign: Campaign = {
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      targetPlatforms: platforms,
      createdBy: uid,
    };
    const res = await fetch("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(campaign),
    });
    if (res.ok) {
      const data = await res.json();
      onCreate(data);
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setPlatforms([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 border rounded">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Campaign Title"
        className="border p-2 rounded w-full"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="border p-2 rounded w-full"
      />
      <div className="flex gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded w-1/2"
          required
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded w-1/2"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Target Platforms</label>
        <div className="flex gap-2 mt-1">
          {["Twitter", "Instagram", "LinkedIn"].map((p) => (
            <label key={p} className="flex items-center gap-1">
              <input
                type="checkbox"
                value={p}
                checked={platforms.includes(p)}
                onChange={(e) => {
                  if (e.target.checked) setPlatforms([...platforms, p]);
                  else setPlatforms(platforms.filter((pl) => pl !== p));
                }}
              />
              {p}
            </label>
          ))}
        </div>
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
        Create Campaign
      </button>
    </form>
  );
}
