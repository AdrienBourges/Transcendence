import { BonusPreference, InviteStatus } from './common';

// user basic informations
export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  languages: string[];
  discord?: string;
  status: 'online' | 'offline';
}

// Group information
export interface Group {
  id: string;
  projectName: string;
  deadline: string;
  bonus: 'yes' | 'no' | 'none';
  details?: string;
  ownerId: string;
  members: UserProfile[];
}

// chat information
export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  conversationId: string;
}
