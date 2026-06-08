import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MessageCircle,
  Users,
  Calendar,
  Building2,
  MapPin,
  UserCircle,
  FileText,
  DollarSign,
  Send,
} from "lucide-react";

import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { getUserById } from "../../services/userService";
import { Entrepreneur } from "../../types";
import { RequestCollaborationButton } from "../../components/collaboration/RequestCollaborationButton";

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEntrepreneur = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getUserById(id);

        if (data.user && data.user.role === "entrepreneur") {
          setEntrepreneur(data.user);
        }
      } catch (error) {
        console.error("Failed to load entrepreneur profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntrepreneur();
  }, [id]);

  if (isLoading) {
    return <div className="p-6">Loading entrepreneur profile...</div>;
  }

  if (!entrepreneur || entrepreneur.role !== "entrepreneur") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">
          Entrepreneur not found
        </h2>
        <p className="text-gray-600 mt-2">
          The entrepreneur profile you're looking for doesn't exist or has been
          removed.
        </p>
        <Link to="/dashboard/investor">
          <Button variant="outline" className="mt-4">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const isCurrentUser = currentUser?.id === entrepreneur.id;
  const isInvestor = currentUser?.role === "investor";

  // Temporary until collaboration backend is implemented

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={entrepreneur.avatarUrl}
              alt={entrepreneur.name}
              size="xl"
              status={entrepreneur.isOnline ? "online" : "offline"}
              className="mx-auto sm:mx-0"
            />

            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {entrepreneur.name}
              </h1>

              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Founder at {entrepreneur.startupName || "N/A"}
              </p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                {entrepreneur.industry && (
                  <Badge variant="primary">{entrepreneur.industry}</Badge>
                )}

                {entrepreneur.location && (
                  <Badge variant="gray">
                    <MapPin size={14} className="mr-1" />
                    {entrepreneur.location}
                  </Badge>
                )}

                {entrepreneur.foundedYear && (
                  <Badge variant="accent">
                    <Calendar size={14} className="mr-1" />
                    Founded {entrepreneur.foundedYear}
                  </Badge>
                )}

                {entrepreneur.teamSize && (
                  <Badge variant="secondary">
                    <Users size={14} className="mr-1" />
                    {entrepreneur.teamSize} team members
                  </Badge>
                )}

                {entrepreneur.currentFundingStage && (
                  <Badge variant="secondary">
                    {entrepreneur.currentFundingStage}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <>
                <Link to={`/messages?userId=${entrepreneur.id}`}>
                  <Button
                    variant="outline"
                    leftIcon={<MessageCircle size={18} />}
                  >
                    Message
                  </Button>
                </Link>

                {isInvestor && (
                  <RequestCollaborationButton
                    receiverId={entrepreneur.id}
                    receiverName={entrepreneur.name}
                  />
                )}
              </>
            )}

            {isCurrentUser && (
              <Link to="/settings">
                <Button variant="outline" leftIcon={<UserCircle size={18} />}>
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">About</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700">
                {entrepreneur.bio || "No bio added yet."}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Startup Overview
              </h2>
            </CardHeader>

            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900">
                    Problem Statement
                  </h3>
                  <p className="text-gray-700 mt-1">
                    {entrepreneur.problemStatement ||
                      entrepreneur.pitchSummary ||
                      "Problem statement not added yet."}
                  </p>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900">
                    Solution
                  </h3>
                  <p className="text-gray-700 mt-1">
                    {entrepreneur.solution ||
                      entrepreneur.pitchSummary ||
                      "Solution details not added yet."}
                  </p>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900">
                    Market Opportunity
                  </h3>
                  <p className="text-gray-700 mt-1">
                    {entrepreneur.marketOpportunity ||
                      "Market opportunity details not added yet."}
                  </p>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900">
                    Competitive Advantage
                  </h3>
                  <p className="text-gray-700 mt-1">
                    {entrepreneur.competitiveAdvantage ||
                      "Competitive advantage not added yet."}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Team</h2>
              <span className="text-sm text-gray-500">
                {entrepreneur.teamSize || 1} members
              </span>
            </CardHeader>

            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center p-3 border border-gray-200 rounded-md">
                  <Avatar
                    src={entrepreneur.avatarUrl}
                    alt={entrepreneur.name}
                    size="md"
                    className="mr-3"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {entrepreneur.name}
                    </h3>
                    <p className="text-xs text-gray-500">Founder & CEO</p>
                  </div>
                </div>

                <div className="flex items-center p-3 border border-gray-200 rounded-md">
                  <Avatar
                    src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
                    alt="Team Member"
                    size="md"
                    className="mr-3"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Alex Johnson
                    </h3>
                    <p className="text-xs text-gray-500">CTO</p>
                  </div>
                </div>

                <div className="flex items-center p-3 border border-gray-200 rounded-md">
                  <Avatar
                    src="https://images.pexels.com/photos/773371/pexels-photo-773371.jpeg"
                    alt="Team Member"
                    size="md"
                    className="mr-3"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Jessica Chen
                    </h3>
                    <p className="text-xs text-gray-500">Head of Product</p>
                  </div>
                </div>

                {(entrepreneur.teamSize || 0) > 3 && (
                  <div className="flex items-center justify-center p-3 border border-dashed border-gray-200 rounded-md">
                    <p className="text-sm text-gray-500">
                      + {(entrepreneur.teamSize || 0) - 3} more team members
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Funding</h2>
            </CardHeader>

            <CardBody>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Current Round</span>
                  <div className="flex items-center mt-1">
                    <DollarSign size={18} className="text-accent-600 mr-1" />
                    <p className="text-lg font-semibold text-gray-900">
                      {entrepreneur.fundingNeeded || "Not specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Valuation</span>
                  <p className="text-md font-medium text-gray-900">
                    {entrepreneur.valuation || "Not specified"}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">
                    Previous Funding
                  </span>
                  <p className="text-md font-medium text-gray-900">
                    {entrepreneur.previousFunding || "Not specified"}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Funding Timeline
                  </span>

                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Pre-seed</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Seed</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">
                        {entrepreneur.currentFundingStage || "Current Stage"}
                      </span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Documents</h2>
            </CardHeader>

            <CardBody>
              <div className="space-y-3">
                {["Pitch Deck", "Business Plan", "Financial Projections"].map(
                  (doc) => (
                    <div
                      key={doc}
                      className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-2 bg-primary-50 rounded-md mr-3">
                        <FileText size={18} className="text-primary-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {doc}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Updated recently
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ),
                )}
              </div>

              {!isCurrentUser && isInvestor && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Request access to detailed documents and financials by
                    sending a collaboration request.
                  </p>

                  <RequestCollaborationButton
                    receiverId={entrepreneur.id}
                    receiverName={entrepreneur.name}
                    className="mt-3 w-full"
                    fullWidth
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
