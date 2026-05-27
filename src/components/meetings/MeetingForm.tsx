//src/components/meetings/MeetingForm.tsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarPlus } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { User } from "../../types";
import { getInvestors, getEntrepreneurs } from "../../services/userService";
import { createMeeting } from "../../services/meetingService";
import { useAuth } from "../../context/AuthContext";

interface MeetingFormProps {
  onCreated: () => void;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({ onCreated }) => {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    requestedTo: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);

        const data =
          user?.role === "entrepreneur"
            ? await getInvestors()
            : await getEntrepreneurs();

        setUsers(data.users || []);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [user?.role]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.requestedTo || !form.date || !form.startTime || !form.endTime) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await createMeeting(form);
      toast.success("Meeting request created successfully");

      setForm({
        title: "",
        description: "",
        requestedTo: "",
        date: "",
        startTime: "",
        endTime: "",
      });

      onCreated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Meeting Title"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Investor Pitch Meeting"
        fullWidth
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select User
        </label>
        <select
          name="requestedTo"
          value={form.requestedTo}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="">
            {isLoadingUsers ? "Loading..." : "Select user"}
          </option>

          {users.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} — {item.role}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Date"
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        fullWidth
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Time"
          name="startTime"
          type="time"
          value={form.startTime}
          onChange={handleChange}
          fullWidth
        />

        <Input
          label="End Time"
          name="endTime"
          type="time"
          value={form.endTime}
          onChange={handleChange}
          fullWidth
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Discuss startup funding opportunity"
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        />
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isSubmitting}
        leftIcon={<CalendarPlus size={18} />}
      >
        Schedule Meeting
      </Button>
    </form>
  );
};