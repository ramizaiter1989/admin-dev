import AdminProfile from "@/components/admin/AdminProfile";

const AgentLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e5f7a] text-white p-4 flex flex-col gap-6">
        
        {/* ✅ PROFILE */}
        <AdminProfile />

        {/* Divider */}
        <div className="h-px bg-white/20" />

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {/* your sidebar links */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
};

export default AgentLayout;
