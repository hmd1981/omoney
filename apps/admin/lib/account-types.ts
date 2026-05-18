export type UserAccountSummary = {
  totalOrders: number;
  completedOrders: number;
  openOrders: number;
  rejectedOrders: number;
  cancelledOrders: number;
  totalSourceVolume: number;
  completedTargetVolume: number;
  openTargetExposure: number;
  totalFees: number;
  completedFees: number;
  openTickets: number;
  totalTickets: number;
  kycPending: number;
  kycApproved: number;
  kycRejected: number;
  bankAccounts: number;
  activeSessions: number;
};
