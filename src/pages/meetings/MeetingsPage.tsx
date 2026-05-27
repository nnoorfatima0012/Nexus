//src/pages/meetings/MeetingsPage.tsx
import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Meeting } from "../../types";
import { getMyMeetings } from "../../services/meetingService";
import { MeetingForm } from "../../components/meetings/MeetingForm";
import { MeetingCard } from "../../components/meetings/MeetingCard";

export const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMeetings = async () => {
    try {
      setIsLoading(true);
      const data = await getMyMeetings();
      setMeetings(data.meetings || []);
    } catch {
      toast.error("Failed to load meetings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <p className="text-gray-600">Schedule and manage investor-startup meetings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Schedule Meeting</h2>
          </CardHeader>
          <CardBody>
            <MeetingForm onCreated={loadMeetings} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">My Meetings</h2>
            <CalendarDays size={20} className="text-gray-500" />
          </CardHeader>

          <CardBody>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading meetings...</p>
            ) : meetings.length === 0 ? (
              <p className="text-sm text-gray-500">No meetings found.</p>
            ) : (
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <MeetingCard
                    key={meeting._id}
                    meeting={meeting}
                    onUpdated={loadMeetings}
                  />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};