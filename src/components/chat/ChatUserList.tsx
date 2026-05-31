// import React from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { formatDistanceToNow } from 'date-fns';
// import { ChatConversation } from '../../types';
// import { Avatar } from '../ui/Avatar';
// import { Badge } from '../ui/Badge';
// import { findUserById } from '../../data/users';
// import { useAuth } from '../../context/AuthContext';

// interface ChatUserListProps {
//   conversations: ChatConversation[];
// }

// export const ChatUserList: React.FC<ChatUserListProps> = ({ conversations }) => {
//   const navigate = useNavigate();
//   const { userId: activeUserId } = useParams<{ userId: string }>();
//   const { user: currentUser } = useAuth();
  
//   if (!currentUser) return null;
  
//   const handleSelectUser = (userId: string) => {
//     navigate(`/chat/${userId}`);
//   };

//   return (
//     <div className="bg-white border-r border-gray-200 w-full md:w-64 overflow-y-auto">
//       <div className="py-4">
//         <h2 className="px-4 text-lg font-semibold text-gray-800 mb-4">Messages</h2>
        
//         <div className="space-y-1">
//           {conversations.length > 0 ? (
//             conversations.map(conversation => {
//               // Get the other participant (not the current user)
//               const otherParticipantId = conversation.participants.find(id => id !== currentUser.id);
//               if (!otherParticipantId) return null;
              
//               const otherUser = findUserById(otherParticipantId);
//               if (!otherUser) return null;
              
//               const lastMessage = conversation.lastMessage;
//               const isActive = activeUserId === otherParticipantId;
              
//               return (
//                 <div
//                   key={conversation.id}
//                   className={`px-4 py-3 flex cursor-pointer transition-colors duration-200 ${
//                     isActive
//                       ? 'bg-primary-50 border-l-4 border-primary-600'
//                       : 'hover:bg-gray-50 border-l-4 border-transparent'
//                   }`}
//                   onClick={() => handleSelectUser(otherUser.id)}
//                 >
//                   <Avatar
//                     src={otherUser.avatarUrl}
//                     alt={otherUser.name}
//                     size="md"
//                     status={otherUser.isOnline ? 'online' : 'offline'}
//                     className="mr-3 flex-shrink-0"
//                   />
                  
//                   <div className="flex-1 min-w-0">
//                     <div className="flex justify-between items-baseline">
//                       <h3 className="text-sm font-medium text-gray-900 truncate">
//                         {otherUser.name}
//                       </h3>
                      
//                       {lastMessage && (
//                         <span className="text-xs text-gray-500">
//                           {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: false })}
//                         </span>
//                       )}
//                     </div>
                    
//                     <div className="flex justify-between items-center mt-1">
//                       {lastMessage && (
//                         <p className="text-xs text-gray-600 truncate">
//                           {lastMessage.senderId === currentUser.id ? 'You: ' : ''}
//                           {lastMessage.content}
//                         </p>
//                       )}
                      
//                       {lastMessage && !lastMessage.isRead && lastMessage.senderId !== currentUser.id && (
//                         <Badge variant="primary" size="sm" rounded>New</Badge>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <div className="px-4 py-8 text-center">
//               <p className="text-sm text-gray-500">No conversations yet</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };


import React from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageUser, NexusConversation } from "../../types";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";

interface ChatUserListProps {
  conversations: NexusConversation[];
  users: MessageUser[];
  activeUserId?: string;
  onSelectUser: (user: MessageUser) => void;
}

export const ChatUserList: React.FC<ChatUserListProps> = ({
  conversations,
  users,
  activeUserId,
  onSelectUser,
}) => {
  const conversationUserIds = new Set(
    conversations.map((conversation) => conversation.user._id),
  );

  const newUsers = users.filter((user) => !conversationUserIds.has(user._id));

  return (
    <div className="bg-white border-r border-gray-200 w-full md:w-80 overflow-y-auto">
      <div className="py-4">
        <h2 className="px-4 text-lg font-semibold text-gray-800 mb-4">
          Messages
        </h2>

        <div className="space-y-1">
          {conversations.map((conversation) => {
            const otherUser = conversation.user;
            const lastMessage = conversation.lastMessage;
            const isActive = activeUserId === otherUser._id;

            return (
              <button
                type="button"
                key={otherUser._id}
                className={`w-full text-left px-4 py-3 flex cursor-pointer transition-colors duration-200 ${
                  isActive
                    ? "bg-primary-50 border-l-4 border-primary-600"
                    : "hover:bg-gray-50 border-l-4 border-transparent"
                }`}
                onClick={() => onSelectUser(otherUser)}
              >
                <Avatar
                  src={otherUser.avatarUrl}
                  alt={otherUser.name}
                  size="md"
                  status={otherUser.isOnline ? "online" : "offline"}
                  className="mr-3 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {otherUser.name}
                    </h3>

                    {lastMessage && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDistanceToNow(new Date(lastMessage.createdAt), {
                          addSuffix: false,
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-1 gap-2">
                    <p className="text-xs text-gray-600 truncate">
                      {lastMessage.content}
                    </p>

                    {conversation.unreadCount > 0 && (
                      <Badge variant="primary" size="sm" rounded>
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {newUsers.length > 0 && (
            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="px-4 text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Start new chat
              </p>

              {newUsers.map((item) => {
                const isActive = activeUserId === item._id;

                return (
                  <button
                    type="button"
                    key={item._id}
                    className={`w-full text-left px-4 py-3 flex cursor-pointer transition-colors duration-200 ${
                      isActive
                        ? "bg-primary-50 border-l-4 border-primary-600"
                        : "hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                    onClick={() => onSelectUser(item)}
                  >
                    <Avatar
                      src={item.avatarUrl}
                      alt={item.name}
                      size="md"
                      status={item.isOnline ? "online" : "offline"}
                      className="mr-3 flex-shrink-0"
                    />

                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize">
                        {item.role}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {conversations.length === 0 && newUsers.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">No users available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};