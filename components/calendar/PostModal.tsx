"use client";
import { useState, useEffect } from "react";
import Modal from "react-modal";
import { Post } from "@/models/post";
import PlatformIcon from "./PlatformIcon";

interface PostModalProps {
  isOpen: boolean;
  post: Post;
  onClose: () => void;
  onSave: (updatedPost: Post) => void;
}

export default function PostModal({ isOpen, post, onClose, onSave }: PostModalProps) {
  const [formData, setFormData] = useState<Post>(post);

  useEffect(() => {
    setFormData(post); // reset form when post changes
  }, [post]);

  const handleChange = (field: keyof Post, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit Post"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto max-h-[80vh]"
    >
      <h2 className="text-xl font-bold mb-4">Edit Post</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange("content", e.target.value)}
            className="w-full border p-2 rounded resize-none"
            rows={3}
          />
        </div>

        {/* Platform */}
        <div>
          <label className="block text-sm font-medium mb-1">Platform</label>
          <select
            value={formData.platform}
            onChange={(e) => handleChange("platform", e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="Twitter">Twitter/X</option>
            <option value="Instagram">Instagram</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>
        </div>

        {/* Campaign */}
        <div>
          <label className="block text-sm font-medium mb-1">Campaign ID</label>
          <input
            type="text"
            value={formData.campaignId}
            onChange={(e) => handleChange("campaignId", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Scheduled Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Scheduled Date</label>
          <input
            type="datetime-local"
            value={new Date(formData.scheduledDate).toISOString().slice(0, 16)}
            onChange={(e) =>
              handleChange("scheduledDate", new Date(e.target.value))
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
