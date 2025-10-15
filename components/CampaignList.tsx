// components/CampaignList.tsx
import { Campaign } from "@/models/campaign";

interface Props {
  campaigns: Campaign[];
  onSelect: (campaign: Campaign) => void;
}

export default function CampaignList({ campaigns, onSelect }: Props) {
  return (
    <div className="grid gap-2">
      {campaigns.map((c) => (
        <div
          key={c.id}
          className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
          onClick={() => onSelect(c)}
        >
          <h3 className="font-bold">{c.title}</h3>
          <p className="text-sm text-gray-600">{c.description}</p>
          <p className="text-xs text-gray-400">
            {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
