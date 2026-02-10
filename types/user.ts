export type UserRole = 'FREELANCER' | 'MARKET_MAKER';

export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  createdAt: Date;
}