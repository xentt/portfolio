import { prisma } from "./db";

export type ActivityAction =
  | "upload"
  | "create_folder"
  | "rename"
  | "trash"
  | "restore"
  | "delete";

export async function logActivity(params: {
  userId: number;
  userEmail: string;
  userName: string | null;
  action: ActivityAction;
  target: string;
  details?: string;
}) {
  return prisma.activityLog.create({ data: params });
}

export async function getActivityLogs(limit = 50) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export type ActivityLogEntry = Awaited<ReturnType<typeof getActivityLogs>>[number];
