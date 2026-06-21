// Dashboard layout — just pass through children
// The actual layout with sidebar is handled by each role's own layout

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
