import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MessageCircle,
  Building2,
  MapPin,
  UserCircle,
  BarChart3,
  Briefcase,
} from "lucide-react";

import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { getUserById } from "../../services/userService";
import { Investor } from "../../types";
import { RequestCollaborationButton } from "../../components/collaboration/RequestCollaborationButton";

export const InvestorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [investor, setInvestor] = useState<Investor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvestor = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getUserById(id);

        if (data.user && data.user.role === "investor") {
          setInvestor(data.user);
        }
      } catch (error) {
        console.error("Failed to load investor profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvestor();
  }, [id]);

  if (isLoading) {
    return <div className="p-6">Loading investor profile...</div>;
  }

  if (!investor || investor.role !== "investor") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Investor not found</h2>
        <p className="text-gray-600 mt-2">
          The investor profile you're looking for doesn't exist or has been
          removed.
        </p>

        <Link to="/dashboard/entrepreneur">
          <Button variant="outline" className="mt-4">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const isCurrentUser = currentUser?.id === investor.id;
  const isEntrepreneur = currentUser?.role === "entrepreneur";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={investor.avatarUrl}
              alt={investor.name}
              size="xl"
              status={investor.isOnline ? "online" : "offline"}
              className="mx-auto sm:mx-0"
            />

            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {investor.name}
              </h1>

              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Investor • {investor.totalInvestments || 0} investments
              </p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge variant="primary">
                  <MapPin size={14} className="mr-1" />
                  {investor.location || "Location not specified"}
                </Badge>

                {investor.investmentStage?.map((stage, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {stage}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <>
                <Link to={`/messages?userId=${investor.id}`}>
                  <Button
                    variant="outline"
                    leftIcon={<MessageCircle size={18} />}
                  >
                    Message
                  </Button>
                </Link>

                {isEntrepreneur && (
                  <RequestCollaborationButton
                    receiverId={investor.id}
                    receiverName={investor.name}
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
                {investor.bio || "No bio added yet."}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Investment Interests
              </h2>
            </CardHeader>

            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900">
                    Industries
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {investor.investmentInterests?.length ? (
                      investor.investmentInterests.map((interest, index) => (
                        <Badge key={index} variant="primary" size="md">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No investment interests added yet.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900">
                    Investment Stages
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {investor.investmentStage?.length ? (
                      investor.investmentStage.map((stage, index) => (
                        <Badge key={index} variant="secondary" size="md">
                          {stage}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No investment stages added yet.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900">
                    Investment Criteria
                  </h3>

                  {investor.investmentCriteria?.length ? (
                    <ul className="mt-2 space-y-2 text-gray-700">
                      {investor.investmentCriteria.map((criteria, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mt-1.5 mr-2"></span>
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">
                      No investment criteria added yet.
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Portfolio Companies
              </h2>

              <span className="text-sm text-gray-500">
                {investor.portfolioCompanies?.length || 0} companies
              </span>
            </CardHeader>

            <CardBody>
              {investor.portfolioCompanies?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {investor.portfolioCompanies.map((company, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 border border-gray-200 rounded-md"
                    >
                      <div className="p-3 bg-primary-50 rounded-md mr-3">
                        <Briefcase size={18} className="text-primary-700" />
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {company}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Portfolio company
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No portfolio companies added yet.
                </p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Investment Details
              </h2>
            </CardHeader>

            <CardBody>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">
                    Investment Range
                  </span>

                  <p className="text-lg font-semibold text-gray-900">
                    {investor.minimumInvestment || "N/A"} -{" "}
                    {investor.maximumInvestment || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">
                    Total Investments
                  </span>

                  <p className="text-md font-medium text-gray-900">
                    {investor.totalInvestments || 0} companies
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">
                    Typical Investment Timeline
                  </span>

                  <p className="text-md font-medium text-gray-900">
                    {investor.typicalInvestmentTimeline || "Not specified"}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Investment Focus
                  </span>

                  {investor.investmentFocus?.length ? (
                    <div className="mt-2 space-y-2">
                      {investor.investmentFocus.map((focus, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-xs font-medium">
                            {focus.label}
                          </span>

                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  Math.max(focus.percentage || 0, 0),
                                  100,
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">
                      No investment focus added yet.
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Investment Stats
              </h2>
            </CardHeader>

            <CardBody>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Successful Exits
                      </h3>

                      <p className="text-xl font-semibold text-primary-700 mt-1">
                        {investor.successfulExits || 0}
                      </p>
                    </div>

                    <BarChart3 size={24} className="text-primary-600" />
                  </div>
                </div>

                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Avg. ROI
                      </h3>

                      <p className="text-xl font-semibold text-primary-700 mt-1">
                        {investor.averageROI || "N/A"}
                      </p>
                    </div>

                    <BarChart3 size={24} className="text-primary-600" />
                  </div>
                </div>

                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Active Investments
                      </h3>

                      <p className="text-xl font-semibold text-primary-700 mt-1">
                        {investor.portfolioCompanies?.length || 0}
                      </p>
                    </div>

                    <BarChart3 size={24} className="text-primary-600" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
