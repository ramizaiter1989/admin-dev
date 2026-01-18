import React, { useEffect, useState } from "react";
import { CarCard } from "@/components/CarCard";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";

/**
 * AdminCarsPage
 * - Uses REAL backend API
 * - Safe rendering
 * - No white screen
 */
const AdminCarsPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================
  // Fetch Cars
  // ============================
  useEffect(() => {
  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ CORRECT — DO NOT ADD /api
      const res = await api.get("/cars");

      setCars(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load cars:", err);
      setError("Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  fetchCars();
}, []);

  // ============================
  // States
  // ============================
  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Cars Management</h1>
        <p className="text-muted-foreground">Loading cars...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Cars Management</h1>
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // ============================
  // Render
  // ============================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cars Management</h1>

        <Button className="bg-[#00A19C] hover:bg-[#008c88]">
          + Add New Car
        </Button>
      </div>

      {cars.length === 0 ? (
        <div className="text-muted-foreground text-center py-10">
          No cars found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCarsPage;
