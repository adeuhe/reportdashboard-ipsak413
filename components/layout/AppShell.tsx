import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* <Sidebar /> */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
