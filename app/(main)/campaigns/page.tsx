"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Pencil } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { DeleteCampaignButton } from "../../../components/campaigns/DeleteCampaignButton";
import { Campaign } from "@/models/campaign";
import { useUser } from "reactfire";

const platforms = ["Twitter", "Instagram", "LinkedIn"];

export default function CampaignsPage() {
  const { data } = useUser();
  console.log("User data:", data);
  const uid = data?.uid;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<Campaign>>({
    title: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    targetPlatforms: [],
  });
  const [datePicker, setDatePicker] = useState<"start" | "end" | null>(null);

  const fetchCampaigns = async () => {
    const res = await fetch("/api/campaigns?uid=" + uid, { cache: "no-store" });
    const data = await res.json();
    setCampaigns(data);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [uid]);

  const handleSave = async () => {
    const method = form.id ? "PATCH" : "POST";
    const url = form.id ? `/api/campaigns/${form.id}` : "/api/campaigns";
    const body = {
      ...form,
      startDate: form.startDate,
      endDate: form.endDate,
      createdBy: data?.uid,
    };

    // Store previous state for rollback
    const prevCampaigns = [...campaigns];

    // Optimistically update UI
    let newCampaigns;
    if (form.id) {
      // Edit
      newCampaigns = campaigns.map((c) =>
        c.id === form.id ? { ...c, ...form } : c
      );
    } else {
      // Create
      const tempId = `temp-${Date.now()}`;
      newCampaigns = [
        ...campaigns,
        { ...form, id: tempId, startDate: form.startDate, endDate: form.endDate },
      ];
    }
    setCampaigns(newCampaigns);
    setDialogOpen(false);
    setForm({
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      targetPlatforms: [],
    });

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("API error");
      // Refetch campaigns to sync with backend
      await fetchCampaigns();
    } catch (err) {
      // Rollback on failure
      setCampaigns(prevCampaigns);
      alert("Failed to save campaign. Rolled back changes.");
    }
  };

  // Optimistic delete with rollback
  const handleDelete = async (id: string) => {
    // Store previous state for rollback
    const prevCampaigns = [...campaigns];
    // Immediately remove from UI
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("API error");
      await fetchCampaigns();
    } catch (err) {
      // Rollback if API fails
      setCampaigns(prevCampaigns);
      alert("Failed to delete campaign. Rolled back changes.");
    }
  };

  return (
    <div className="container py-10 space-y-8">
      <div className="flex justify-between items-center md:flex-row flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Campaign Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Campaign</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Campaign" : "New Campaign"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Campaign Title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your campaign..."
                />
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Button
                    variant="outline"
                    onClick={() => setDatePicker("start")}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(form.startDate, "PPP")}
                  </Button>
                  {datePicker === "start" && (
                    <div className="absolute z-50 mt-2 bg-white border rounded-md shadow-md p-2">
                      <Calendar
                        mode="single"
                        selected={form.startDate}
                        onSelect={(date) => {
                          if (date) {
                            setForm({ ...form, startDate: date });
                            setDatePicker(null);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label>End Date</Label>
                  <Button
                    variant="outline"
                    onClick={() => setDatePicker("end")}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(form.endDate, "PPP")}
                  </Button>
                  {datePicker === "end" && (
                    <div className="absolute z-50 mt-2 bg-white border rounded-md shadow-md p-2">
                      <Calendar
                        mode="single"
                        selected={form.endDate}
                        onSelect={(date) => {
                          if (date && date > form.startDate) {
                            setForm({ ...form, endDate: date });
                            setDatePicker(null);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Target Platforms */}
              <div>
                <Label>Target Platforms</Label>
                <Select
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      targetPlatforms: prev.targetPlatforms.includes(v)
                        ? prev.targetPlatforms.filter((x) => x !== v)
                        : [...prev.targetPlatforms, v],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p} value={p}>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={form.targetPlatforms.includes(p)}
                            readOnly
                          />
                          {p}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Platforms</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link
                  href={`/campaigns/${c.id}`}
                  className="text-blue-600 hover:underline font-medium m-auto"
                >
                  {c.title}
                </Link>
              </TableCell>
              <TableCell>{format(c.startDate, "PPP")}</TableCell>
              <TableCell>{format(c.endDate, "PPP")}</TableCell>
              <TableCell>{c.targetPlatforms.join(", ")}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setForm({
                      ...c,
                      startDate: new Date(c.startDate),
                      endDate: new Date(c.endDate),
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <DeleteCampaignButton campaignId={c.id!} onDelete={handleDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
