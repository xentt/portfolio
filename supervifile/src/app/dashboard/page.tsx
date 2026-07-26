import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./client";

interface PageProps {
  searchParams: {
    carpeta?: string;
    papelera?: string;
    query?: string;
  };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return <DashboardClient searchParams={searchParams} />;
}
