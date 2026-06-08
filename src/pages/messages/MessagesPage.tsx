

// import React, { useEffect, useRef, useState } from "react";
// import { MessageCircle, Send } from "lucide-react";
// import toast from "react-hot-toast";

// import { useAuth } from "../../context/AuthContext";
// import { ChatUserList } from "../../components/chat/ChatUserList";
// import { ChatMessage } from "../../components/chat/ChatMessage";
// import { Button } from "../../components/ui/Button";
// import { Avatar } from "../../components/ui/Avatar";
// import { MessageUser, NexusConversation, NexusMessage } from "../../types";
// import {
//   getConversations,
//   getMessagesWithUser,
//   markMessagesAsRead,
// } from "../../services/messageService";
// import { getEntrepreneurs, getInvestors } from "../../services/userService";
// import { getSocket } from "../../services/socketService";

// export const MessagesPage: React.FC = () => {
//   const { user } = useAuth();

//   const [conversations, setConversations] = useState<NexusConversation[]>([]);
//   const [availableUsers, setAvailableUsers] = useState<MessageUser[]>([]);
//   const [selectedUser, setSelectedUser] = useState<MessageUser | null>(null);
//   const [messages, setMessages] = useState<NexusMessage[]>([]);
//   const [messageText, setMessageText] = useState("");
//   const [isLoadingMessages, setIsLoadingMessages] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const [typingUserId, setTypingUserId] = useState<string | null>(null);

//   const bottomRef = useRef<HTMLDivElement | null>(null);
//   const selectedUserRef = useRef<MessageUser | null>(null);
//   const typingTimeoutRef = useRef<number | null>(null);

//   useEffect(() => {
//     selectedUserRef.current = selectedUser;
//   }, [selectedUser]);

//   const loadConversations = async () => {
//     try {
//       const data = await getConversations();
//       setConversations(data.conversations || []);
//     } catch {
//       toast.error("Failed to load conversations");
//     }
//   };

//   const loadAvailableUsers = async () => {
//     if (!user) return;

//     try {
//       const data =
//         user.role === "entrepreneur"
//           ? await getInvestors()
//           : await getEntrepreneurs();

//       const users = (data.users || []).map((item: any) => ({
//         _id: item._id || item.id,
//         name: item.name,
//         email: item.email,
//         role: item.role,
//         avatarUrl: item.avatarUrl,
//         isOnline: item.isOnline,
//       }));

//       setAvailableUsers(
//         users.filter((item: MessageUser) => item._id !== user.id),
//       );
//     } catch {
//       toast.error("Failed to load users");
//     }
//   };

//   const loadMessages = async (otherUser: MessageUser) => {
//     try {
//       setIsLoadingMessages(true);

//       const data = await getMessagesWithUser(otherUser._id);
//       setMessages(data.messages || []);

//       await markMessagesAsRead(otherUser._id);

//       const socket = getSocket();
//       socket.emit("mark-messages-read", {
//         senderId: otherUser._id,
//       });

//       await loadConversations();
//     } catch {
//       toast.error("Failed to load messages");
//     } finally {
//       setIsLoadingMessages(false);
//     }
//   };

//   useEffect(() => {
//     if (!user) return;

//     loadConversations();
//     loadAvailableUsers();

//     const socket = getSocket();

//     const handleReceiveMessage = async (incomingMessage: NexusMessage) => {
//       const activeUser = selectedUserRef.current;

//       const senderId = incomingMessage.sender._id;
//       const receiverId = incomingMessage.receiver._id;

//       const belongsToActiveConversation =
//         activeUser &&
//         (senderId === activeUser._id || receiverId === activeUser._id);

//       if (belongsToActiveConversation) {
//         setMessages((prev) => {
//           const alreadyExists = prev.some(
//             (message) => message._id === incomingMessage._id,
//           );

//           if (alreadyExists) return prev;

//           return [...prev, incomingMessage];
//         });

//         await markMessagesAsRead(activeUser._id);

//         socket.emit("mark-messages-read", {
//           senderId: activeUser._id,
//         });
//       } else {
//         toast.success(`${incomingMessage.sender.name} sent you a message`);
//       }

//       await loadConversations();
//     };

//     const handleMessageSent = async (sentMessage: NexusMessage) => {
//       const activeUser = selectedUserRef.current;

//       if (!activeUser) return;

//       const receiverId = sentMessage.receiver._id;

//       if (receiverId === activeUser._id) {
//         setMessages((prev) => {
//           const alreadyExists = prev.some(
//             (message) => message._id === sentMessage._id,
//           );

//           if (alreadyExists) return prev;

//           return [...prev, sentMessage];
//         });
//       }

//       await loadConversations();
//     };

//     const handleTypingStart = ({ userId }: { userId: string }) => {
//       setTypingUserId(userId);
//     };

//     const handleTypingStop = () => {
//       setTypingUserId(null);
//     };

//     const handleUserOnline = ({ userId }: { userId: string }) => {
//       setAvailableUsers((prev) =>
//         prev.map((item) =>
//           item._id === userId ? { ...item, isOnline: true } : item,
//         ),
//       );

//       setSelectedUser((prev) =>
//         prev && prev._id === userId ? { ...prev, isOnline: true } : prev,
//       );
//     };

//     const handleUserOffline = ({ userId }: { userId: string }) => {
//       setAvailableUsers((prev) =>
//         prev.map((item) =>
//           item._id === userId ? { ...item, isOnline: false } : item,
//         ),
//       );

//       setSelectedUser((prev) =>
//         prev && prev._id === userId ? { ...prev, isOnline: false } : prev,
//       );
//     };

//     socket.on("receive-message", handleReceiveMessage);
//     socket.on("message-sent", handleMessageSent);
//     socket.on("typing-start", handleTypingStart);
//     socket.on("typing-stop", handleTypingStop);
//     socket.on("chat-user-online", handleUserOnline);
//     socket.on("chat-user-offline", handleUserOffline);

//     return () => {
//       socket.off("receive-message", handleReceiveMessage);
//       socket.off("message-sent", handleMessageSent);
//       socket.off("typing-start", handleTypingStart);
//       socket.off("typing-stop", handleTypingStop);
//       socket.off("chat-user-online", handleUserOnline);
//       socket.off("chat-user-offline", handleUserOffline);
//     };
//   }, [user?.id, user?.role]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages.length]);

//   const handleSelectUser = async (otherUser: MessageUser) => {
//     setSelectedUser(otherUser);
//     setTypingUserId(null);
//     await loadMessages(otherUser);
//   };

//   const handleTyping = (value: string) => {
//     setMessageText(value);

//     if (!selectedUser) return;

//     const socket = getSocket();

//     socket.emit("typing-start", {
//       receiverId: selectedUser._id,
//     });

//     if (typingTimeoutRef.current) {
//       window.clearTimeout(typingTimeoutRef.current);
//     }

//     typingTimeoutRef.current = window.setTimeout(() => {
//       socket.emit("typing-stop", {
//         receiverId: selectedUser._id,
//       });
//     }, 900);
//   };

//   const handleSendMessage = async (event: React.FormEvent) => {
//     event.preventDefault();

//     if (!selectedUser || !messageText.trim()) return;

//     setIsSending(true);

//     const socket = getSocket();
//     const contentToSend = messageText.trim();

//     socket.emit(
//       "send-message",
//       {
//         receiverId: selectedUser._id,
//         content: contentToSend,
//       },
//       (response: {
//         success: boolean;
//         message: string;
//         chatMessage?: NexusMessage;
//       }) => {
//         setIsSending(false);

//         if (!response.success) {
//           toast.error(response.message || "Failed to send message");
//           return;
//         }

//         setMessageText("");

//         socket.emit("typing-stop", {
//           receiverId: selectedUser._id,
//         });
//       },
//     );
//   };

//   if (!user) return null;

//   return (
//     <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in flex">
//       <ChatUserList
//         conversations={conversations}
//         users={availableUsers}
//         activeUserId={selectedUser?._id}
//         onSelectUser={handleSelectUser}
//       />

//       <div className="flex-1 flex flex-col min-w-0">
//         {selectedUser ? (
//           <>
//             <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
//               <Avatar
//                 src={selectedUser.avatarUrl}
//                 alt={selectedUser.name}
//                 size="md"
//                 status={selectedUser.isOnline ? "online" : "offline"}
//               />

//               <div>
//                 <h2 className="font-semibold text-gray-900">
//                   {selectedUser.name}
//                 </h2>
//                 <p className="text-xs text-gray-500 capitalize">
//                   {selectedUser.isOnline ? "Online" : selectedUser.role}
//                 </p>
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
//               {isLoadingMessages ? (
//                 <p className="text-sm text-gray-500">Loading messages...</p>
//               ) : messages.length > 0 ? (
//                 messages.map((message) => (
//                   <ChatMessage
//                     key={message._id}
//                     message={message}
//                     currentUserId={user.id}
//                   />
//                 ))
//               ) : (
//                 <div className="h-full flex flex-col items-center justify-center text-center">
//                   <MessageCircle size={40} className="text-gray-300 mb-3" />
//                   <h2 className="text-lg font-medium text-gray-900">
//                     No messages yet
//                   </h2>
//                   <p className="text-gray-500 text-sm">
//                     Send your first message to start the conversation.
//                   </p>
//                 </div>
//               )}

//               {typingUserId === selectedUser._id && (
//                 <p className="text-xs text-gray-500 mt-2">
//                   {selectedUser.name} is typing...
//                 </p>
//               )}

//               <div ref={bottomRef} />
//             </div>

//             <form
//               onSubmit={handleSendMessage}
//               className="p-4 border-t border-gray-200 bg-white flex gap-3"
//             >
//               <input
//                 value={messageText}
//                 onChange={(event) => handleTyping(event.target.value)}
//                 placeholder={`Message ${selectedUser.name}...`}
//                 className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
//               />

//               <Button
//                 type="submit"
//                 isLoading={isSending}
//                 disabled={!messageText.trim()}
//                 leftIcon={<Send size={18} />}
//               >
//                 Send
//               </Button>
//             </form>
//           </>
//         ) : (
//           <div className="h-full flex flex-col items-center justify-center p-8 text-center">
//             <div className="bg-gray-100 p-6 rounded-full mb-4">
//               <MessageCircle size={32} className="text-gray-400" />
//             </div>

//             <h2 className="text-xl font-medium text-gray-900">
//               Select a conversation
//             </h2>

//             <p className="text-gray-600 text-center mt-2">
//               Choose a user from the left side to start messaging.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { ChatUserList } from "../../components/chat/ChatUserList";
import { ChatMessage } from "../../components/chat/ChatMessage";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { MessageUser, NexusConversation, NexusMessage } from "../../types";
import {
  getConversations,
  getMessagesWithUser,
  markMessagesAsRead,
} from "../../services/messageService";
import {
  getEntrepreneurs,
  getInvestors,
  getUserById,
} from "../../services/userService";
import { getSocket } from "../../services/socketService";

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const targetUserId = searchParams.get("userId");

  const [conversations, setConversations] = useState<NexusConversation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<MessageUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<MessageUser | null>(null);
  const [messages, setMessages] = useState<NexusMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const selectedUserRef = useRef<MessageUser | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const normalizeUserForChat = (item: any): MessageUser => ({
    _id: item._id || item.id,
    name: item.name,
    email: item.email,
    role: item.role,
    avatarUrl: item.avatarUrl,
    isOnline: item.isOnline,
  });

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data.conversations || []);
      return data.conversations || [];
    } catch {
      toast.error("Failed to load conversations");
      return [];
    }
  };

  const loadAvailableUsers = async () => {
    if (!user) return [];

    try {
      const data =
        user.role === "entrepreneur"
          ? await getInvestors()
          : await getEntrepreneurs();

      const users = (data.users || []).map(normalizeUserForChat);

      const filteredUsers = users.filter(
        (item: MessageUser) => item._id !== user.id,
      );

      setAvailableUsers(filteredUsers);
      return filteredUsers;
    } catch {
      toast.error("Failed to load users");
      return [];
    }
  };

  const findOrFetchTargetUser = async (
    userId: string,
    users: MessageUser[],
    conversationsList: NexusConversation[],
  ): Promise<MessageUser | null> => {
    const userFromList = users.find((item) => item._id === userId);

    if (userFromList) return userFromList;

    const userFromConversation = conversationsList.find(
      (conversation) => conversation.user._id === userId,
    )?.user;

    if (userFromConversation) return userFromConversation;

    try {
      const data = await getUserById(userId);

      if (!data.user) return null;

      return normalizeUserForChat(data.user);
    } catch {
      toast.error("Failed to open conversation");
      return null;
    }
  };

  const loadMessages = async (otherUser: MessageUser) => {
    try {
      setIsLoadingMessages(true);

      const data = await getMessagesWithUser(otherUser._id);
      setMessages(data.messages || []);

      await markMessagesAsRead(otherUser._id);

      const socket = getSocket();

      socket.emit("mark-messages-read", {
        senderId: otherUser._id,
      });

      await loadConversations();
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;

      const [conversationsList, usersList] = await Promise.all([
        loadConversations(),
        loadAvailableUsers(),
      ]);

      if (!targetUserId || targetUserId === user.id) return;

      const targetUser = await findOrFetchTargetUser(
        targetUserId,
        usersList,
        conversationsList,
      );

      if (!targetUser) return;

      setSelectedUser(targetUser);
      setTypingUserId(null);
      await loadMessages(targetUser);
    };

    loadInitialData();
  }, [user?.id, user?.role, targetUserId]);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();

    const handleReceiveMessage = async (incomingMessage: NexusMessage) => {
      const activeUser = selectedUserRef.current;

      const senderId = incomingMessage.sender._id;
      const receiverId = incomingMessage.receiver._id;

      const belongsToActiveConversation =
        activeUser &&
        (senderId === activeUser._id || receiverId === activeUser._id);

      if (belongsToActiveConversation) {
        setMessages((prev) => {
          const alreadyExists = prev.some(
            (message) => message._id === incomingMessage._id,
          );

          if (alreadyExists) return prev;

          return [...prev, incomingMessage];
        });

        await markMessagesAsRead(activeUser._id);

        socket.emit("mark-messages-read", {
          senderId: activeUser._id,
        });
      } else {
        toast.success(`${incomingMessage.sender.name} sent you a message`);
      }

      await loadConversations();
    };

    const handleMessageSent = async (sentMessage: NexusMessage) => {
      const activeUser = selectedUserRef.current;

      if (!activeUser) return;

      const receiverId = sentMessage.receiver._id;

      if (receiverId === activeUser._id) {
        setMessages((prev) => {
          const alreadyExists = prev.some(
            (message) => message._id === sentMessage._id,
          );

          if (alreadyExists) return prev;

          return [...prev, sentMessage];
        });
      }

      await loadConversations();
    };

    const handleTypingStart = ({ userId }: { userId: string }) => {
      setTypingUserId(userId);
    };

    const handleTypingStop = () => {
      setTypingUserId(null);
    };

    const handleUserOnline = ({ userId }: { userId: string }) => {
      setAvailableUsers((prev) =>
        prev.map((item) =>
          item._id === userId ? { ...item, isOnline: true } : item,
        ),
      );

      setSelectedUser((prev) =>
        prev && prev._id === userId ? { ...prev, isOnline: true } : prev,
      );
    };

    const handleUserOffline = ({ userId }: { userId: string }) => {
      setAvailableUsers((prev) =>
        prev.map((item) =>
          item._id === userId ? { ...item, isOnline: false } : item,
        ),
      );

      setSelectedUser((prev) =>
        prev && prev._id === userId ? { ...prev, isOnline: false } : prev,
      );
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("message-sent", handleMessageSent);
    socket.on("typing-start", handleTypingStart);
    socket.on("typing-stop", handleTypingStop);
    socket.on("chat-user-online", handleUserOnline);
    socket.on("chat-user-offline", handleUserOffline);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("message-sent", handleMessageSent);
      socket.off("typing-start", handleTypingStart);
      socket.off("typing-stop", handleTypingStop);
      socket.off("chat-user-online", handleUserOnline);
      socket.off("chat-user-offline", handleUserOffline);
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSelectUser = async (otherUser: MessageUser) => {
    setSelectedUser(otherUser);
    setTypingUserId(null);
    await loadMessages(otherUser);
  };

  const handleTyping = (value: string) => {
    setMessageText(value);

    if (!selectedUser) return;

    const socket = getSocket();

    socket.emit("typing-start", {
      receiverId: selectedUser._id,
    });

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit("typing-stop", {
        receiverId: selectedUser._id,
      });
    }, 900);
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedUser || !messageText.trim()) return;

    setIsSending(true);

    const socket = getSocket();
    const contentToSend = messageText.trim();

    socket.emit(
      "send-message",
      {
        receiverId: selectedUser._id,
        content: contentToSend,
      },
      (response: {
        success: boolean;
        message: string;
        chatMessage?: NexusMessage;
      }) => {
        setIsSending(false);

        if (!response.success) {
          toast.error(response.message || "Failed to send message");
          return;
        }

        setMessageText("");

        socket.emit("typing-stop", {
          receiverId: selectedUser._id,
        });
      },
    );
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in flex">
      <ChatUserList
        conversations={conversations}
        users={availableUsers}
        activeUserId={selectedUser?._id}
        onSelectUser={handleSelectUser}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {selectedUser ? (
          <>
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
              <Avatar
                src={selectedUser.avatarUrl}
                alt={selectedUser.name}
                size="md"
                status={selectedUser.isOnline ? "online" : "offline"}
              />

              <div>
                <h2 className="font-semibold text-gray-900">
                  {selectedUser.name}
                </h2>
                <p className="text-xs text-gray-500 capitalize">
                  {selectedUser.isOnline ? "Online" : selectedUser.role}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
              {isLoadingMessages ? (
                <p className="text-sm text-gray-500">Loading messages...</p>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <ChatMessage
                    key={message._id}
                    message={message}
                    currentUserId={user.id}
                  />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <MessageCircle size={40} className="text-gray-300 mb-3" />
                  <h2 className="text-lg font-medium text-gray-900">
                    No messages yet
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Send your first message to start the conversation.
                  </p>
                </div>
              )}

              {typingUserId === selectedUser._id && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedUser.name} is typing...
                </p>
              )}

              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 bg-white flex gap-3"
            >
              <input
                value={messageText}
                onChange={(event) => handleTyping(event.target.value)}
                placeholder={`Message ${selectedUser.name}...`}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />

              <Button
                type="submit"
                isLoading={isSending}
                disabled={!messageText.trim()}
                leftIcon={<Send size={18} />}
              >
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <MessageCircle size={32} className="text-gray-400" />
            </div>

            <h2 className="text-xl font-medium text-gray-900">
              Select a conversation
            </h2>

            <p className="text-gray-600 text-center mt-2">
              Choose a user from the left side to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};