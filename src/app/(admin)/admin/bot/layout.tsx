import { requireAdminUser } from "@/lib/auth";

export default async function AdminBotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminUser();
  return <>{children}</>;
}
