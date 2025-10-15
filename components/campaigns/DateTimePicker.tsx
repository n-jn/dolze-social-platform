import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

function DateTimePicker({ post, onChange }: { post: Post; onChange: (d: Date) => void }) {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState(post.scheduledDate);

  const handleSave = () => {
    onChange(tempDate);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        onClick={() => setOpen((prev) => !prev)}
        className="text-sm px-2 py-1"
      >
        {format(post.scheduledDate, "PPP, HH:mm")}
      </Button>

      {open && (
        <div className="absolute z-50 mt-2 bg-white border rounded-md shadow-lg p-2">
          <Calendar
            mode="single"
            selected={tempDate}
            onSelect={(date) => date && setTempDate(date)}
          />
          <input
            type="time"
            value={format(tempDate, "HH:mm")}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(":").map(Number);
              const newDate = new Date(tempDate);
              newDate.setHours(hours);
              newDate.setMinutes(minutes);
              setTempDate(newDate);
            }}
            className="border rounded px-2 py-1 mt-2 w-full"
          />
          <div className="flex justify-end mt-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
