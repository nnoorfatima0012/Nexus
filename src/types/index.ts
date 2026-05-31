export type UserRole = "entrepreneur" | "investor";

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   avatarUrl: string;
//   bio: string;
//   location?: string;
//   isOnline?: boolean;
//   createdAt: string;
// }

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  location?: string;
  isOnline?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
}

export interface MeetingUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Meeting {
  _id: string;
  title: string;
  description: string;
  requestedBy: MeetingUser;
  requestedTo: MeetingUser;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  meetingLink: string;
  createdAt: string;
  updatedAt: string;
}

export interface Entrepreneur extends User {
  role: "entrepreneur";
  startupName: string;
  pitchSummary: string;
  problemStatement?: string;
  solution?: string;
  marketOpportunity?: string;
  competitiveAdvantage?: string;
  fundingNeeded: string;
  valuation?: string;
  previousFunding?: string;
  currentFundingStage?: string;
  industry: string;
  location: string;
  foundedYear: number;
  teamSize: number;
}

export interface Investor extends User {
  role: "investor";
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
  investmentCriteria?: string[];
  typicalInvestmentTimeline?: string;
  investmentFocus?: {
    label: string;
    percentage: number;
  }[];
  successfulExits?: number;
  averageROI?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface CollaborationRequest {
  id: string;
  investorId: string;
  entrepreneurId: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

// export interface Document {
//   id: string;
//   name: string;
//   type: string;
//   size: string;
//   lastModified: string;
//   shared: boolean;
//   url: string;
//   ownerId: string;
// }

export interface DocumentUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface NexusDocument {
  _id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  cloudinaryPublicId: string;
  uploadedBy: DocumentUser;
  relatedUser: DocumentUser | null;
  version: number;
  status: "pending" | "reviewed" | "signed" | "rejected";
  signatureUrl: string;
  signaturePublicId: string;
  signedBy: DocumentUser | null;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Transaction {
  _id: string;
  type: "deposit" | "withdraw" | "transfer";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  provider: "stripe" | "paypal_mock" | "wallet";
  fromUser: TransactionUser | null;
  toUser: TransactionUser | null;
  note: string;
  failureReason: string;
  reference: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

// export interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string, role: UserRole) => Promise<void>;
//   register: (
//     name: string,
//     email: string,
//     password: string,
//     role: UserRole,
//   ) => Promise<void>;
//   logout: () => void;
//   forgotPassword: (email: string) => Promise<void>;
//   resetPassword: (token: string, newPassword: string) => Promise<void>;
//   updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
//   isAuthenticated: boolean;
//   isLoading: boolean;
// }

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<any>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<void>;
  verifyTwoFactorLogin: (tempUserId: string, otpCode: string) => Promise<void>;
  enableTwoFactor: () => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}
