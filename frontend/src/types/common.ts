// src/types/index.ts

export type BonusPreference = 'yes' | 'no' | 'none';

export type InviteStatus = 'pending' | 'accepted' | 'declined';

export type NotificationType = 'group_invite' | 'friend_request' | 'message';


export enum BonusPreference {
  YES = 'yes',
  NO = 'no',
  NONE = 'none'
}
