export type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingVerification: number;
  newUsersToday: number;
  newUsers7d: number;
  activeSessions: number;
  pendingKyc: number;
  kycApproved: number;
  kycRejected: number;
  openOrders: number;
  processingOrders: number;
  waitingPayment: number;
  paymentUploaded: number;
  underReview: number;
  openTickets: number;
  urgentTickets: number;
  completedOrders: number;
  rejectedOrders: number;
  cancelledOrders: number;
  totalOrders: number;
  ordersToday: number;
  completedVolume7d: number;
  feeVolume7d: number;
  platformCompletedVolume: number;
  platformCompletedFees: number;
  platformOpenExposure: number;
  platformTotalSourceVolume: number;
  ordersByStatus: Array<{ status: string; count: number }>;
  recentUsers: Array<{
    id: string;
    email: string;
    status: string;
    createdAt: string;
    profile: { firstName: string; lastName: string } | null;
    _count: { orders: number; sessions: number };
  }>;
  recentOrders: Array<{
    id: string;
    status: string;
    beneficiaryName: string;
    targetAmount: string;
    corridor: {
      sourceCurrency: { code: string };
      targetCurrency: { code: string };
    };
    createdAt: string;
    user: { email: string };
  }>;
  recentTickets: Array<{
    id: string;
    subject: string;
    status: string;
    priority: string;
    updatedAt: string;
    user: { email: string };
  }>;
  recentKyc: Array<{
    id: string;
    documentType: string;
    createdAt: string;
    user: { email: string };
  }>;
};
