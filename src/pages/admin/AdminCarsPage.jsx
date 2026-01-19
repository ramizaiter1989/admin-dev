import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { Search } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const AdminCarsPage = () => {
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  /* ============================
     Fetch cars
  ============================ */
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await api.get("/admin/cars");
        setCars(res.data.cars.data);
        setTotal(res.data.cars.total);
      } catch (err) {
        console.error("Failed to load cars", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  /* ============================
     Filter + sort
  ============================ */
  const filteredCars = useMemo(() => {
    let data = [...cars];

    // search
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.make?.toLowerCase().includes(q) ||
          c.model?.toLowerCase().includes(q) ||
          c.license_plate?.toLowerCase().includes(q) ||
          c.agent?.username?.toLowerCase().includes(q)
      );
    }

    // category
    if (category !== "all") {
      data = data.filter((c) => c.car_category === category);
    }

    // status (reserved / available)
    if (status !== "all") {
      data = data.filter((c) => c.status === status);
    }

    // sort
    if (sort === "newest") {
      data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    if (sort === "price") {
      data.sort(
        (a, b) => Number(a.daily_rate) - Number(b.daily_rate)
      );
    }

    return data;
  }, [cars, search, category, status, sort]);

  /* ============================
     Render
  ============================ */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cars</h1>
        <Badge variant="secondary">Total cars: {total}</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search car / agent / plate..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
              <SelectItem value="sport">Sport</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price">Price (low → high)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <p className="text-muted-foreground">Loading cars...</p>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car</TableHead>
                  <TableHead>Plate</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price / day</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell className="font-medium">
                      {car.make} {car.model} ({car.year})
                    </TableCell>

                    <TableCell>{car.license_plate}</TableCell>

                    <TableCell>
                      <Badge variant="outline">
                        {car.car_category}
                      </Badge>
                    </TableCell>

                    <TableCell>${car.daily_rate}</TableCell>

                    <TableCell>
                      {car.agent?.username || "—"}
                    </TableCell>

                    <TableCell>
                      {car.status === "available" ? (
                        <Badge className="bg-green-500">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          Reserved
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>{car.views_count}</TableCell>
                  </TableRow>
                ))}

                {filteredCars.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-6"
                    >
                      No cars found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCarsPage;
