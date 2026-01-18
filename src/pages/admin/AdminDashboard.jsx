import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Car, CalendarCheck, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    cars: 0,
    bookings: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // ======================
        // USERS (WORKING)
        // ======================
        const usersRes = await api.get("/admin/users");
        const totalUsers = usersRes.data?.users?.total ?? 0;

        // ======================
        // CARS
        // ======================
        const carsRes = await api.get("/cars");
        const totalCars =
          carsRes.data?.total ??
          carsRes.data?.cars?.total ??
          (Array.isArray(carsRes.data) ? carsRes.data.length : 0);

        // ======================
        // BOOKINGS
        // ======================
        let totalBookings = 0;
        try {
          const bookingsRes = await api.get("/admin/bookings");
          totalBookings =
            bookingsRes.data?.total ??
            bookingsRes.data?.bookings?.total ??
            (Array.isArray(bookingsRes.data) ? bookingsRes.data.length : 0);
        } catch {
          console.warn("Bookings API not available yet");
        }

        // ======================
        // REVENUE
        // ======================
        let totalRevenue = 0;
        try {
          const paymentsRes = await api.get("/admin/payments");
          totalRevenue =
            paymentsRes.data?.total_revenue ??
            paymentsRes.data?.revenue ??
            0;
        } catch {
          console.warn("Revenue API not available yet");
        }

        setStats({
          users: totalUsers,
          cars: totalCars,
          bookings: totalBookings,
          revenue: totalRevenue,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="text-2xl font-bold">
            {loading ? "—" : value}
          </h2>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.users} icon={Users} color="bg-blue-500" />
        <StatCard title="Total Cars" value={stats.cars} icon={Car} color="bg-[#00A19C]" />
        <StatCard title="Total Bookings" value={stats.bookings} icon={CalendarCheck} color="bg-purple-500" />
        <StatCard title="Total Revenue" value={`$${stats.revenue}`} icon={DollarSign} color="bg-green-500" />
      </div>
    </div>
  );
};

export default AdminDashboard;
