export interface IUser {
  id: string;
  nickname: string;
  email?: string;
  status?: string;
  username?: string;
  avatarUrl?: string;
}
export interface ITeam {
  id: string;
  name: string;
  inviteCode: string;
  isDefaultTeam: boolean;
  isDeleted: boolean;
  planId: number;
  planType: string;
  status: string;
  expireAt: string;
}
