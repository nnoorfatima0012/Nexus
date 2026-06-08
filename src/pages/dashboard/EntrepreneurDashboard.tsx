// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Users, Bell, Calendar, TrendingUp, AlertCircle, PlusCircle } from 'lucide-react';
// import { Button } from '../../components/ui/Button';
// import { Card, CardBody, CardHeader } from '../../components/ui/Card';
// import { Badge } from '../../components/ui/Badge';
// import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
// import { InvestorCard } from '../../components/investor/InvestorCard';
// import { useAuth } from '../../context/AuthContext';
// import { CollaborationRequest } from '../../types';
// import { getRequestsForEntrepreneur } from '../../data/collaborationRequests';
// import { investors } from '../../data/users';

// export const EntrepreneurDashboard: React.FC = () => {
//   const { user } = useAuth();
//   const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
//   const [recommendedInvestors, setRecommendedInvestors] = useState(investors.slice(0, 3));
  
//   useEffect(() => {
//     if (user) {
//       // Load collaboration requests
//       const requests = getRequestsForEntrepreneur(user.id);
//       setCollaborationRequests(requests);
//     }
//   }, [user]);
  
//   const handleRequestStatusUpdate = (requestId: string, status: 'accepted' | 'rejected') => {
//     setCollaborationRequests(prevRequests => 
//       prevRequests.map(req => 
//         req.id === requestId ? { ...req, status } : req
//       )
//     );
//   };
  
//   if (!user) return null;
  
//   const pendingRequests = collaborationRequests.filter(req => req.status === 'pending');
  
//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
//           <p className="text-gray-600">Here's what's happening with your startup today</p>
//         </div>
        
//         <Link to="/investors">
//           <Button
//             leftIcon={<PlusCircle size={18} />}
//           >
//             Find Investors
//           </Button>
//         </Link>
//       </div>
      
//       {/* Summary cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card className="bg-primary-50 border border-primary-100">
//           <CardBody>
//             <div className="flex items-center">
//               <div className="p-3 bg-primary-100 rounded-full mr-4">
//                 <Bell size={20} className="text-primary-700" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-primary-700">Pending Requests</p>
//                 <h3 className="text-xl font-semibold text-primary-900">{pendingRequests.length}</h3>
//               </div>
//             </div>
//           </CardBody>
//         </Card>
        
//         <Card className="bg-secondary-50 border border-secondary-100">
//           <CardBody>
//             <div className="flex items-center">
//               <div className="p-3 bg-secondary-100 rounded-full mr-4">
//                 <Users size={20} className="text-secondary-700" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-secondary-700">Total Connections</p>
//                 <h3 className="text-xl font-semibold text-secondary-900">
//                   {collaborationRequests.filter(req => req.status === 'accepted').length}
//                 </h3>
//               </div>
//             </div>
//           </CardBody>
//         </Card>
        
//         <Card className="bg-accent-50 border border-accent-100">
//           <CardBody>
//             <div className="flex items-center">
//               <div className="p-3 bg-accent-100 rounded-full mr-4">
//                 <Calendar size={20} className="text-accent-700" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-accent-700">Upcoming Meetings</p>
//                 <h3 className="text-xl font-semibold text-accent-900">2</h3>
//               </div>
//             </div>
//           </CardBody>
//         </Card>
        
//         <Card className="bg-success-50 border border-success-100">
//           <CardBody>
//             <div className="flex items-center">
//               <div className="p-3 bg-green-100 rounded-full mr-4">
//                 <TrendingUp size={20} className="text-success-700" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-success-700">Profile Views</p>
//                 <h3 className="text-xl font-semibold text-success-900">24</h3>
//               </div>
//             </div>
//           </CardBody>
//         </Card>
//       </div>
      
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Collaboration requests */}
//         <div className="lg:col-span-2 space-y-4">
//           <Card>
//             <CardHeader className="flex justify-between items-center">
//               <h2 className="text-lg font-medium text-gray-900">Collaboration Requests</h2>
//               <Badge variant="primary">{pendingRequests.length} pending</Badge>
//             </CardHeader>
            
//             <CardBody>
//               {collaborationRequests.length > 0 ? (
//                 <div className="space-y-4">
//                   {collaborationRequests.map(request => (
//                     <CollaborationRequestCard
//                       key={request.id}
//                       request={request}
//                       onStatusUpdate={handleRequestStatusUpdate}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
//                     <AlertCircle size={24} className="text-gray-500" />
//                   </div>
//                   <p className="text-gray-600">No collaboration requests yet</p>
//                   <p className="text-sm text-gray-500 mt-1">When investors are interested in your startup, their requests will appear here</p>
//                 </div>
//               )}
//             </CardBody>
//           </Card>
//         </div>
        
//         {/* Recommended investors */}
//         <div className="space-y-4">
//           <Card>
//             <CardHeader className="flex justify-between items-center">
//               <h2 className="text-lg font-medium text-gray-900">Recommended Investors</h2>
//               <Link to="/investors" className="text-sm font-medium text-primary-600 hover:text-primary-500">
//                 View all
//               </Link>
//             </CardHeader>
            
//             <CardBody className="space-y-4">
//               {recommendedInvestors.map(investor => (
//                 <InvestorCard
//                   key={investor.id}
//                   investor={investor}
//                   showActions={false}
//                 />
//               ))}
//             </CardBody>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };


import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Bell,
  Calendar,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Check,
  X,
  MessageCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

import { Button } from "../../components/ui/Button";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { InvestorCard } from "../../components/investor/InvestorCard";
import { useAuth } from "../../context/AuthContext";

import { Investor, Meeting, NexusCollaboration } from "../../types";
import { getInvestors } from "../../services/userService";
import { getMyMeetings } from "../../services/meetingService";
import { getNotifications } from "../../services/notificationService";
import {
  getMyCollaborations,
  acceptCollaboration,
  rejectCollaboration,
} from "../../services/collaborationService";

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [collaborations, setCollaborations] = useState<NexusCollaboration[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [recommendedInvestors, setRecommendedInvestors] = useState<Investor[]>(
    [],
  );
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const [collaborationsData, meetingsData, investorsData, notificationsData] =
        await Promise.all([
          getMyCollaborations(),
          getMyMeetings(),
          getInvestors(),
          getNotifications(),
        ]);

      setCollaborations(collaborationsData.collaborations || []);
      setMeetings(meetingsData.meetings || []);
      setRecommendedInvestors((investorsData.users || []).slice(0, 3));
      setUnreadNotifications(notificationsData.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load entrepreneur dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  if (!user) return null;

  const receivedCollaborations = collaborations.filter(
    (collaboration) => collaboration.receiver._id === user.id,
  );

  const pendingRequests = receivedCollaborations.filter(
    (collaboration) => collaboration.status === "pending",
  );

  const acceptedConnections = collaborations.filter(
    (collaboration) => collaboration.status === "accepted",
  );

  const upcomingMeetings = meetings.filter((meeting) => {
    if (meeting.status !== "accepted") return false;

    const meetingDateTime = new Date(`${meeting.date}T${meeting.startTime}:00`);
    return meetingDateTime >= new Date();
  });

  const handleAccept = async (collaborationId: string) => {
    try {
      const data = await acceptCollaboration(collaborationId);

      setCollaborations((prevCollaborations) =>
        prevCollaborations.map((collaboration) =>
          collaboration._id === collaborationId
            ? data.collaboration
            : collaboration,
        ),
      );

      toast.success("Collaboration request accepted");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to accept collaboration";
      toast.error(message);
    }
  };

  const handleReject = async (collaborationId: string) => {
    try {
      const data = await rejectCollaboration(collaborationId);

      setCollaborations((prevCollaborations) =>
        prevCollaborations.map((collaboration) =>
          collaboration._id === collaborationId
            ? data.collaboration
            : collaboration,
        ),
      );

      toast.success("Collaboration request rejected");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to reject collaboration";
      toast.error(message);
    }
  };

  const getStatusBadge = (status: NexusCollaboration["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "accepted":
        return <Badge variant="success">Accepted</Badge>;
      case "rejected":
        return <Badge variant="error">Declined</Badge>;
      case "cancelled":
        return <Badge variant="gray">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your startup today
          </p>
        </div>

        <Link to="/investors">
          <Button leftIcon={<PlusCircle size={18} />}>Find Investors</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Bell size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">
                  Pending Requests
                </p>
                <h3 className="text-xl font-semibold text-primary-900">
                  {pendingRequests.length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <Users size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">
                  Total Connections
                </p>
                <h3 className="text-xl font-semibold text-secondary-900">
                  {acceptedConnections.length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Calendar size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">
                  Upcoming Meetings
                </p>
                <h3 className="text-xl font-semibold text-accent-900">
                  {upcomingMeetings.length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-success-50 border border-success-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <TrendingUp size={20} className="text-success-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-success-700">
                  Unread Notifications
                </p>
                <h3 className="text-xl font-semibold text-success-900">
                  {unreadNotifications}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collaboration requests */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Collaboration Requests
              </h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>

            <CardBody>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading collaboration requests...</p>
                </div>
              ) : receivedCollaborations.length > 0 ? (
                <div className="space-y-4">
                  {receivedCollaborations.map((collaboration) => {
                    const sender = collaboration.sender;

                    return (
                      <Card
                        key={collaboration._id}
                        className="transition-all duration-300"
                      >
                        <CardBody className="flex flex-col">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <Avatar
                                src={sender.avatarUrl}
                                alt={sender.name}
                                size="md"
                                status={sender.isOnline ? "online" : "offline"}
                                className="mr-3"
                              />

                              <div>
                                <h3 className="text-md font-semibold text-gray-900">
                                  {sender.name}
                                </h3>

                                <p className="text-sm text-gray-500">
                                  {sender.role === "investor"
                                    ? "Investor"
                                    : "Entrepreneur"}
                                  {" • "}
                                  {formatDistanceToNow(
                                    new Date(collaboration.createdAt),
                                    { addSuffix: true },
                                  )}
                                </p>
                              </div>
                            </div>

                            {getStatusBadge(collaboration.status)}
                          </div>

                          <div className="mt-4">
                            <p className="text-sm text-gray-600">
                              {collaboration.message}
                            </p>
                          </div>
                        </CardBody>

                        <CardFooter className="border-t border-gray-100 bg-gray-50">
                          {collaboration.status === "pending" ? (
                            <div className="flex justify-between w-full">
                              <div className="space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<X size={16} />}
                                  onClick={() =>
                                    handleReject(collaboration._id)
                                  }
                                >
                                  Decline
                                </Button>

                                <Button
                                  variant="success"
                                  size="sm"
                                  leftIcon={<Check size={16} />}
                                  onClick={() =>
                                    handleAccept(collaboration._id)
                                  }
                                >
                                  Accept
                                </Button>
                              </div>

                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<MessageCircle size={16} />}
                                onClick={() => navigate(`/chat/${sender._id}`)}
                              >
                                Message
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-between w-full">
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<MessageCircle size={16} />}
                                onClick={() => navigate(`/messages?userId=${sender._id}`)}
                              >
                                Message
                              </Button>

                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                  navigate(`/profile/${sender.role}/${sender._id}`)
                                }
                              >
                                View Profile
                              </Button>
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No collaboration requests yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    When investors are interested in your startup, their requests
                    will appear here
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Recommended investors */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Recommended Investors
              </h2>
              <Link
                to="/investors"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </CardHeader>

            <CardBody className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading investors...</p>
              ) : recommendedInvestors.length > 0 ? (
                recommendedInvestors.map((investor) => (
                  <InvestorCard
                    key={investor.id}
                    investor={investor}
                    showActions={false}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No investors available yet.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};