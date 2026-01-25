import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Car, CalendarCheck, DollarSign } from "lucide-react";

import BookingsOverviewChart from "@/components/admin/BookingsOverviewChart";
import CarsByModelBarChart from "@/components/admin/CarsByModelBarChart";

/* =====================================================
   HELPERS
===================================================== */
const formatDate = (date) => date.toISOString().split("T")[0];

const buildCarsByModelData = (cars) => {
  const map = {};

  cars.forEach((c) => {
    const key = `${c.make} ${c.model}`;
    if (!map[key]) {
      map[key] = {
        label: key,
        count: 0,
      };
    }
    map[key].count++;
  });

  return Object.values(map);
};

/* =====================================================
   COMPONENT
===================================================== */
const AdminDashboard = () => {
  /* =========================
     STATS
  ========================== */
  const [stats, setStats] = useState({
    users: 0,
    cars: 0,
    bookings: 0,
    revenue: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  /* =========================
     BOOKINGS CHART
  ========================== */
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);

  const [chartPeriod, setChartPeriod] = useState("day");
  const [dateRange, setDateRange] = useState({
    from: thirtyDaysAgo,
    to: today,
  });

  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  /* =========================
     CARS BAR CHART
  ========================== */
  const [cars, setCars] = useState([]);
  const [carsChartData, setCarsChartData] = useState([]);
  const [loadingCarsChart, setLoadingCarsChart] = useState(true);

  const [selectedMake, setSelectedMake] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");

  /* =========================
     FETCH STATS
  ========================== */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        const usersRes = await api.get("/admin/users");
        const carsRes = await api.get("/cars");
        const bookingsRes = await api.get("/admin/bookings");
        const paymentsRes = await api.get("/admin/payments");

        setStats({
          users: usersRes.data?.users?.total ?? 0,
          cars: carsRes.data?.cars?.total ?? carsRes.data?.total ?? 0,
          bookings:
            bookingsRes.data?.bookings?.total ??
            bookingsRes.data?.total ??
            0,
          revenue:
            paymentsRes.data?.total_revenue ??
            paymentsRes.data?.revenue ??
            0,
        });
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  /* =========================
     FETCH BOOKINGS CHART
  ========================== */
  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoadingChart(true);

        const res = await api.get("/admin/bookings");
        const bookings = res?.data?.bookings?.data || [];

        const map = {};
        const now = new Date();

        if (chartPeriod === "day") {
          const current = new Date(dateRange.from);
          const end = new Date(dateRange.to);

          while (current <= end) {
            const key = formatDate(current);
            map[key] = {
              label: current.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              total: 0,
            };
            current.setDate(current.getDate() + 1);
          }

          bookings.forEach((b) => {
            if (!b.start_datetime) return;
            const key = formatDate(new Date(b.start_datetime));
            if (map[key]) map[key].total++;
          });

          setChartData(Object.values(map));
          return;
        }

        if (chartPeriod === "week") {
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const key = formatDate(d);
            map[key] = {
              label: d.toLocaleDateString("en-US", { weekday: "short" }),
              total: 0,
            };
          }

          bookings.forEach((b) => {
            if (!b.start_datetime) return;
            const key = formatDate(new Date(b.start_datetime));
            if (map[key]) map[key].total++;
          });

          setChartData(Object.values(map));
          return;
        }

        setChartData([]);
      } catch (err) {
        console.error("Chart error:", err);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChart();
  }, [chartPeriod, dateRange]);

  /* =========================
     FETCH CARS CHART
  ========================== */
  useEffect(() => {
    const fetchCarsChart = async () => {
      try {
        setLoadingCarsChart(true);
        const res = await api.get("/admin/cars");
        const carsData = res?.data?.cars?.data || [];

        setCars(carsData);
        setCarsChartData(buildCarsByModelData(carsData));
      } catch (err) {
        console.error("Cars chart error:", err);
      } finally {
        setLoadingCarsChart(false);
      }
    };

    fetchCarsChart();
  }, []);

  /* =========================
     DROPDOWN OPTIONS
  ========================== */
  const makes = useMemo(() => {
    return ["all", ...new Set(cars.map((c) => c.make))];
  }, [cars]);

  const models = useMemo(() => {
    if (selectedMake === "all") return ["all"];
    return [
      "all",
      ...new Set(
        cars
          .filter((c) => c.make === selectedMake)
          .map((c) => c.model)
      ),
    ];
  }, [cars, selectedMake]);

  /* =========================
     FILTER BAR CHART
  ========================== */
  useEffect(() => {
    let filtered = [...cars];

    if (selectedMake !== "all") {
      filtered = filtered.filter((c) => c.make === selectedMake);
    }

    if (selectedModel !== "all") {
      filtered = filtered.filter((c) => c.model === selectedModel);
    }

    setCarsChartData(buildCarsByModelData(filtered));
  }, [cars, selectedMake, selectedModel]);

  /* =========================
     STAT CARD
  ========================== */
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
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.users} icon={Users} color="bg-blue-500" />
        <StatCard title="Total Cars" value={stats.cars} icon={Car} color="bg-teal-500" />
        <StatCard title="Total Bookings" value={stats.bookings} icon={CalendarCheck} color="bg-purple-500" />
        <StatCard title="Total Revenue" value={`$${stats.revenue}`} icon={DollarSign} color="bg-green-500" />
      </div>

      {/* BOOKINGS OVERVIEW */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Booking Overview</h2>
          <div className="h-[320px]">
            {loadingChart ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading chart...
              </div>
            ) : (
              <BookingsOverviewChart data={chartData} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* CARS BY MAKE / MODEL */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Cars by Make & Model</h2>

            <div className="flex gap-2">
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setSelectedModel("all");
                }}
                className="border rounded-md px-3 py-1 text-sm bg-background"
              >
                {makes.map((m) => (
                  <option key={m} value={m}>
                    {m === "all" ? "All Makes" : m}
                  </option>
                ))}
              </select>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={selectedMake === "all"}
                className="border rounded-md px-3 py-1 text-sm bg-background"
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m === "all" ? "All Models" : m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-[320px]">
            {loadingCarsChart ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading cars chart...
              </div>
            ) : carsChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No cars data
              </div>
            ) : (
              <CarsByModelBarChart data={carsChartData} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
