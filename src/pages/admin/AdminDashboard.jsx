import React, { useEffect, useState } from "react";
import api from "@/lib/axios";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Car, CalendarCheck, DollarSign } from "lucide-react";

import BookingsOverviewChart from "@/components/admin/BookingsOverviewChart";

/* =====================================
   BUILD BOOKINGS CHART DATA
===================================== */
const buildBookingsChartData = (bookings) => {
  const map = {};

  bookings.forEach((b) => {
    if (!b.start_datetime) return;

    const date = new Date(b.start_datetime);
    if (isNaN(date.getTime())) return;

    const month = date.toLocaleString("en-US", { month: "short" });

    if (!map[month]) {
      map[month] = {
        month,
        total: 0,
        completed: 0,
        cancelled: 0,
        pending: 0,
      };
    }

    map[month].total += 1;

    switch (b.booking_request_status) {
      case "completed":
        map[month].completed += 1;
        break;
      case "cancelled":
        map[month].cancelled += 1;
        break;
      default:
        map[month].pending += 1;
    }
  });

  return Object.values(map);
};


const AdminDashboard = () => {
  /* =====================================
     STATS
  ===================================== */
  const [stats, setStats] = useState({
    users: 0,
    cars: 0,
    bookings: 0,
    revenue: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  /* =====================================
     CHART
  ===================================== */
  const [chartPeriod, setChartPeriod] = useState("month");
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  /* =====================================
     FETCH STATS
  ===================================== */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        // USERS
        const usersRes = await api.get("/admin/users");
        const totalUsers = usersRes.data?.users?.total ?? 0;

        // CARS
        const carsRes = await api.get("/cars");
        const totalCars =
          carsRes.data?.total ??
          carsRes.data?.cars?.total ??
          (Array.isArray(carsRes.data) ? carsRes.data.length : 0);

        // BOOKINGS
        let totalBookings = 0;
        try {
          const bookingsRes = await api.get("/admin/bookings");
          totalBookings =
            bookingsRes.data?.bookings?.total ??
            bookingsRes.data?.total ??
            0;
        } catch {
          console.warn("Bookings API not available");
        }

        // REVENUE
        let totalRevenue = 0;
        try {
          const paymentsRes = await api.get("/admin/payments");
          totalRevenue =
            paymentsRes.data?.total_revenue ??
            paymentsRes.data?.revenue ??
            0;
        } catch {
          console.warn("Revenue API not available");
        }

        setStats({
          users: totalUsers,
          cars: totalCars,
          bookings: totalBookings,
          revenue: totalRevenue,
        });
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  /* =====================================
     FETCH CHART DATA
  ===================================== */
  useEffect(() => {
    const fetchBookingsChart = async () => {
      try {
        setLoadingChart(true);

        const res = await api.get("/admin/bookings");
        const rawBookings = res?.data?.bookings?.data || [];

        const chartReadyData = buildBookingsChartData(rawBookings);

        console.log("FINAL CHART DATA:", chartReadyData);

        setChartData(chartReadyData);
      } catch (err) {
        console.error("Chart error:", err);
        setChartData([]);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchBookingsChart();
  }, [chartPeriod]);

  /* =====================================
     STAT CARD
  ===================================== */
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="text-2xl font-bold">
            {loadingStats ? "—" : value}
          </h2>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* TITLE */}
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Cars"
          value={stats.cars}
          icon={Car}
          color="bg-[#00A19C]"
        />
        <StatCard
          title="Total Bookings"
          value={stats.bookings}
          icon={CalendarCheck}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue}`}
          icon={DollarSign}
          color="bg-green-500"
        />
      </div>

      {/* BOOKING OVERVIEW */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Booking Overview</h2>

            <select
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm bg-background"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>

          <div className="w-full h-[320px] min-h-[320px]">
            {loadingChart ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading chart data...
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No booking data
              </div>
            ) : (
              <BookingsOverviewChart data={chartData} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
