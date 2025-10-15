"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Campaign } from "@/models/campaign";
import { Post } from "@/models/post";

interface Props {
  campaign: Campaign;
}

// Simple styling map per platform
const platformColors: Record<string, string> = {
  Twitter: "bg-blue-50 text-blue-700",
  Instagram: "bg-pink-50 text-pink-700",
  LinkedIn: "bg-sky-50 text-sky-800",
};

// Reusable datetime + platform editor component
function PostEditor({
  post,
  onChange,
}: {
  post: Post;
  onChange: (updated: Post) => void;
}) {
  const [editingDate, setEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(post.scheduledDate);

  return (
    <div className="flex flex-col gap-2">
      {/* Scheduled date picker */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingDate(!editingDate)}
          className="text-sm w-full justify-start"
        >
          {format(post.scheduledDate, "PPP, HH:mm")}
        </Button>

        {editingDate && (
          <div className="absolute z-50 bg-white border rounded-md shadow-md mt-2 p-3 w-64">
            <Calendar
              mode="single"
              selected={tempDate}
              onSelect={(date) => date && setTempDate(date)}
            />
            <input
              type="time"
              value={format(tempDate, "HH:mm")}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                const newDate = new Date(tempDate);
                newDate.setHours(h);
                newDate.setMinutes(m);
                setTempDate(newDate);
              }}
              className="mt-2 border rounded px-2 py-1 w-full text-sm"
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingDate(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onChange({ ...post, scheduledDate: tempDate });
                  setEditingDate(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Platform selector */}
      <select
        value={post.platform}
        onChange={(e) => onChange({ ...post, platform: e.target.value })}
        className="border rounded px-2 py-1 text-sm"
      >
        {["Twitter", "Instagram", "LinkedIn"].map((platform) => (
          <option key={platform} value={platform}>
            {platform}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CampaignDetailPage({ campaign }: Props) {
  const router = useRouter();
  const [generatedPosts, setGeneratedPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [editIndex, setEditIndex] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all saved posts on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/posts?campaignId=${campaign.id}`, {
          cache: "no-store",
        });
        const data = await res.json();
        const posts = data.map((p: any) => ({
          ...p,
          scheduledDate: new Date(p.scheduledDate),
        }));
        setSavedPosts(posts);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Could not load posts.",
        });
      }
    })();
  }, [campaign.id]);

  // Generate mock posts client-side for demonstration
  const generatePosts = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 800));

    const start = new Date(campaign.startDate);
    const posts: Post[] = [];

    for (const platform of campaign.targetPlatforms) {
      const count = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < count; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        posts.push({
          content: `${campaign.title} — ${campaign.description} #${platform}`,
          platform,
          scheduledDate: date,
          campaignId: campaign.id,
          status: "draft",
        });
      }
    }

    setGeneratedPosts(posts);
    setLoading(false);
  };

  // Save a new post to Firestore
  const handleSave = async (post: Post, index: number) => {
    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, scheduledDate: post.scheduledDate.toISOString() }),
      });

      setGeneratedPosts((prev) => prev.filter((_, i) => i !== index));
      setSavedPosts((prev) => [...prev, post]);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save post." });
    }
  };

  // Update post content, date, or platform in Firestore
  const handleUpdate = async (post: Post, index: number) => {
    try {
      setSavedPosts((prev) => {
        const copy = [...prev];
        copy[index] = post;
        return copy;
      });

      await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          scheduledDate: post.scheduledDate.toISOString(),
        }),
      });

      toast({ title: "Post updated", description: "Changes saved." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update post." });
    }
  };

  // Delete post permanently
  const handleDelete = async (post: Post, index: number) => {
    try {
      await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      setSavedPosts((prev) => prev.filter((_, i) => i !== index));
      toast({ title: "Post deleted" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete post." });
    }
  };

  // Handle edit start / save
  const startEdit = (index: number, saved = false) => {
    setEditIndex(index + (saved ? "-s" : "-u"));
    setEditContent(saved ? savedPosts[index].content : generatedPosts[index].content);
  };

  const saveEdit = async () => {
    if (!editIndex) return;
    const [i, type] = editIndex.split("-");
    const index = parseInt(i, 10);

    if (type === "s") {
      const updated = { ...savedPosts[index], content: editContent };
      await handleUpdate(updated, index);
    } else {
      setGeneratedPosts((prev) => {
        const copy = [...prev];
        copy[index].content = editContent;
        return copy;
      });
    }

    setEditIndex(null);
    setEditContent("");
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      {/* Navigation */}
      <Button variant="ghost" size="sm" onClick={() => router.push("/campaigns")} className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </Button>

      {/* Campaign Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-900">{campaign.title}</h2>
        <p className="mt-2 text-gray-600">{campaign.description}</p>

        <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-700">
          <div><span className="font-medium">Start:</span> {format(new Date(campaign.startDate), "PPP")}</div>
          <div><span className="font-medium">End:</span> {format(new Date(campaign.endDate), "PPP")}</div>
          <div className="flex gap-2 items-center">
            <span className="font-medium">Platforms:</span>
            {campaign.targetPlatforms.map((p) => (
              <Badge key={p} className={`${platformColors[p]} px-2 py-1`}>{p}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Generate posts button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={generatePosts} className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} Generate Posts
        </Button>
      </div>

      {/* Unsaved posts */}
      {generatedPosts.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-2">Generated Posts (Unsaved)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedPosts.map((post, i) => (
              <div key={i} className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md">
                {editIndex === `${i}-u` ? (
                  <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} />
                ) : (
                  <p className="text-gray-700 mb-2 line-clamp-4">{post.content}</p>
                )}

                <PostEditor post={post} onChange={(p) => handleUpdate(p, i)} />

                <div className="flex justify-end gap-2 mt-3">
                  {editIndex === `${i}-u` ? (
                    <Button size="sm" variant="outline" onClick={saveEdit}>Save</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEdit(i)}><Pencil className="w-4 h-4" /></Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => handleSave(post, i)}>Save Post</Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Saved posts */}
      {savedPosts.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-2">Saved Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPosts.map((post, i) => (
              <div key={post.id || i} className="bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md">
                {editIndex === `${i}-s` ? (
                  <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} />
                ) : (
                  <p className="text-gray-700 mb-2 line-clamp-4">{post.content}</p>
                )}

                <PostEditor post={post} onChange={(p) => handleUpdate(p, i)} />

                <div className="flex justify-end gap-2 mt-3">
                  {editIndex === `${i}-s` ? (
                    <Button size="sm" variant="outline" onClick={saveEdit}>Save</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEdit(i, true)}><Pencil className="w-4 h-4" /></Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(post, i)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
