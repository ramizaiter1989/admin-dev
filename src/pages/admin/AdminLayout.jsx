import { Outlet, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export const AdminLayout = () => {
  const linkClass = ({ isActive }) =>
    cn(
      "block rounded-xl px-4 py-3 transition",
      isActive
        ? "bg-primary text-white"
        : "text-muted-foreground hover:bg-muted"
    );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r p-4 space-y-2 sticky top-0 h-screen">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>

        <NavLink to="/admin" end className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/admin/cars" className={linkClass}>
          Cars
        </NavLink>

        <NavLink to="/admin/payments" className={linkClass}>
          Payments
        </NavLink>

        <NavLink to="/admin/ads" className={linkClass}>
          Ads
        </NavLink>

        <NavLink to="/admin/featured" className={linkClass}>
          Featured Cars
        </NavLink>
      </aside>

      {/* Page content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};
