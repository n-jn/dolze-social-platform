"use client";
import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { EventDropArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import PostModal from "./PostModal";
import PlatformIcon from "./PlatformIcon";
import { Post } from "@/models/post";

interface PostsCalendarProps {
  uid: string | null;
  filterCampaign?: string;
  filterPlatform?: string;
}

const platformColors: Record<string, string> = {
  Twitter: "#1DA1F2",
  Instagram: "#C13584",
  LinkedIn: "#0077B5",
};

export default function PostsCalendar({
  uid,
  filterCampaign,
  filterPlatform,
}: PostsCalendarProps) {
  const [posts, setPosts] = useState<Post[]>([]);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((p) => !filterCampaign || p.campaignId === filterCampaign)
      .filter((p) => !filterPlatform || p.platform === filterPlatform);
  }, [posts, filterCampaign, filterPlatform]);

  const events = useMemo<EventInput[]>(() => {
    return filteredPosts.map((p) => ({
      id: p.id,
      title: p.content.slice(0, 50),
      start: p.scheduledDate,
      allDay: false,
      backgroundColor: platformColors[p.platform] || "#6B7280",
      borderColor: platformColors[p.platform] || "#6B7280",
      extendedProps: { post: p },
    }));
  }, [filteredPosts]);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPosts = async () => {
    if (!uid) return;
    console.log("Fetching posts for uid:", uid);
    const res = await fetch(`/api/posts?uid=${uid}`, { cache: "no-store" });
    const data: Post[] = await res.json();

    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, [uid]);

  const handleEventClick = (info: any) => {
    const post = info.event.extendedProps.post as Post;
    setSelectedPost(info.event.extendedProps.post);
    setModalOpen(true);
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const post = info.event.extendedProps.post as Post;
    if (!post.id) {
      info.revert();
      return;
    }

    const prevPosts = [...posts]; // save state for rollback
    const newDate = info.event.start!;
    // Optimistically update UI
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, scheduledDate: newDate } : p
      )
    );

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify({ scheduledDate: newDate.toISOString() }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update post");
    } catch (err) {
      console.error(err);
      // rollback
      setPosts(prevPosts);
      fetchPosts();
      info.revert();
    }
  };

  const handleSavePost = async (updatedPost: Post) => {
    const prevPosts = [...posts];
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );

    try {
      // ensure scheduledDate is sent as UTC ISO string
      const payload = {
        ...updatedPost,
        scheduledDate:
          updatedPost.scheduledDate instanceof Date
            ? updatedPost.scheduledDate.toISOString()
            : updatedPost.scheduledDate,
      };

      const res = await fetch(`/api/posts/${updatedPost.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to save post");
    } catch (err) {
      console.error(err);
      setPosts(prevPosts);
    } finally {
      setModalOpen(false);
      fetchPosts();
    }
  };

  const eventContent = (eventInfo: any) => {
    const post = eventInfo.event.extendedProps.post as Post;
    return (
      <div
        className="flex items-center gap-1 p-1 text-xs text-white truncate"
        style={{
          backgroundColor: platformColors[post.platform] || "#6B7280",
          borderRadius: "4px",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
        title={post.content}
      >
        <PlatformIcon
          platform={post.platform}
          className="w-3 h-3 flex-shrink-0"
        />
        <span className="truncate">{post.content}</span>
      </div>
    );
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        timeZone="local"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        events={events}
        eventClick={handleEventClick}
        editable
        eventDrop={handleEventDrop}
        eventContent={eventContent}
        height="auto"
      />
      {selectedPost && (
        <PostModal
          isOpen={modalOpen}
          post={selectedPost}
          onClose={() => setModalOpen(false)}
          onSave={handleSavePost}
        />
      )}
    </>
  );
}
