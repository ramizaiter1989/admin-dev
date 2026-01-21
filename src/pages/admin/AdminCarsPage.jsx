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
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Edit } from "lucide-react";
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
// Start Tony Update
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// End Tony Update
const AdminCarsPage = () => {
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  // Start Tony Update
  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  const { toast } = useToast();
  const [editingCar, setEditingCar] = useState(null);
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  // End Tony Update
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
  // Start tony Update
  // Fetch car details
  const fetchCarDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/cars/${id}`);
      return data?.car ?? null;
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
      return null;
    }
  };

  const ASSET_BASE = "https://rento-lb.com/api/storage/";
  const FALLBACK_IMG = "/car-avatar.png";

  const imgUrl = (path) => {
    if (!path) return FALLBACK_IMG;
    if (path.startsWith("http")) return path;
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return ASSET_BASE + clean;
  };

  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm,
    });
  };
  // Delete car
  const deleteCar = async (id) => {
    try {
      await api.delete(`/admin/cars/${id}`);
      toast.success("Car deleted successfully");
      fetchCars();
    } catch (error) {
      toast.error("Failed to delete car");
    }
  };
  // End tony Update
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
          c.agent?.username?.toLowerCase().includes(q),
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
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (sort === "price") {
      data.sort((a, b) => Number(a.daily_rate) - Number(b.daily_rate));
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
                  {/*  Start tony Update */}
                  <TableHead>Car</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Actions</TableHead>
                  {/*  End tony Update */}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell className="font-medium">
                      <span
                        className="item-name-hover inline-flex items-center gap-2 cursor-pointer"
                        title={carTooltip(car)}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          openCarView(
                            car.id,
                            fetchCarDetails,
                            setSelectedItem,
                            setModalType,
                            setModalOpen,
                          )
                        }
                      >
                        {car.make} {car.model}
                      </span>
                    </TableCell>
                    <TableCell>{car.year}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{car.car_category}</Badge>
                    </TableCell>

                    <TableCell>${car.daily_rate}</TableCell>

                    <TableCell>
                      <span
                        className="car-make-model-hover inline-flex items-center gap-2 cursor-pointer"
                        title={agentTooltip(car)}
                      >
                        {car.agent?.username || "—"}
                      </span>
                    </TableCell>

                    <TableCell>
                      {car.status === "available" ? (
                        <Badge className="bg-green-500">Available</Badge>
                      ) : (
                        <Badge variant="destructive">Reserved</Badge>
                      )}
                    </TableCell>

                    <TableCell>{car.views_count}</TableCell>
                    {/* Start tony Update */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            const fullDetails = await fetchCarDetails(car.id);
                            if (fullDetails) {
                              setSelectedItem(fullDetails);
                              setModalType("view-car");
                              setModalOpen(true);
                            }
                          }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            const fullDetails = await fetchCarDetails(car.id);
                            if (fullDetails) {
                              setSelectedItem(fullDetails);
                              setEditingCar({ ...fullDetails });
                              setModalType("edit-car");
                              setModalOpen(true);
                            }
                          }}
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            showConfirmDialog(
                              "Delete Car",
                              "Are you sure you want to delete this car?",
                              () => deleteCar(car.id),
                            )
                          }
                          title="Remove Car"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                    {/* End tony Update */}
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalType === "view-car" ? "Car Details" : "Edit Car"}
            </DialogTitle>
          </DialogHeader>

          {!selectedItem ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : modalType === "view-car" ? (
            <CarDetailsView
              car={selectedItem}
              imgUrl={imgUrl}
              onEdit={() => {
                setEditingCar({ ...selectedItem });
                setModalType("edit-car");
              }}
              onClose={() => setModalOpen(false)}
            />
          ) : (
            editingCar && (
              <EditCarView
                car={editingCar}
                setCar={setEditingCar}
                imgUrl={imgUrl}
                onClose={() => setModalType("view-car")}
                onSaved={(updated) => {
                  setSelectedItem(updated);
                  setEditingCar({ ...updated });
                  setModalType("view-car");
                }}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCarsPage;

// Start Tony Update
function carTooltip(car) {
  return [
    `Car ID: ${car.id ?? "N/A"}`,
    `Agent ID : ${car.agent_id ?? "N/A"}`,
    `Status: ${car.status ?? "N/A"}`,
    `year: ${car.year ?? "N/A"}`,
    `Car_category: ${car.car_category ?? "N/A"}`,
    `Color: ${car.color ?? "N/A"}`,
    `Seats: ${car.seats ?? "N/A"}`,
    `Doors: ${car.doors ?? "N/A"}`,
    `Cylinder number: ${car.cylinder_number ?? "N/A"}`,
    `Transmission: ${car.transmission ?? "N/A"}`,
    `wheels drive: ${car.wheels_drive ?? "N/A"}`,
    `Daily rate: ${car.daily_rate ?? "N/A"}`,
    `License plate: ${car.license_plate ?? "N/A"}`,
  ].join("\n");
}
export async function openCarView(
  id,
  fetchCarDetails,
  setSelectedItem,
  setModalType,
  setModalOpen,
) {
  const fullDetails = await fetchCarDetails(id);
  if (fullDetails) {
    setSelectedItem(fullDetails);
    setModalType("view-car");
    setModalOpen(true);
  }
}

function agentTooltip(car) {
  return [
    `ID : ${car.agent.id ?? "N/A"}`,
    `Phone number : ${car.agent.phone_number ?? "N/A"}`,
    `Email : ${car.agent.email ?? "N/A"}`,
    `Verified by admin : ${car.agent.verified_by_admin ?? "N/A"}`,
    `Gender : ${car.agent.gender ?? "N/A"}`,
    `Birth date : ${formatDateOnly(car.agent.birth_date ?? "N/A")}`,
    `City : ${car.agent.city ?? "N/A"}`,
    `Bio : ${car.agent.bio ?? "N/A"}`,
    `Created at : ${formatDateTime(car.agent.created_at ?? "N/A")}`,
    `Updated at : ${formatDateTime(car.agent.updated_at ?? "N/A")}`,
  ].join("\n");
}

function formatDateOnly(value) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleString("en-US", {
    timeZone: "Asia/Beirut",
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function CarDetailsView({ car, imgUrl, onEdit, onClose }) {
  const agent = car?.agent || null;

  function FieldRow({ label, value }) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{label} :</span>
        <span className="text-foreground">{value ?? "N/A"}</span>
      </div>
    );
  }

  const YesNoChip = ({ label, ok }) => (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-muted-foreground">{label}</span>
      <Badge
        className={ok ? "bg-green-600" : ""}
        variant={ok ? "default" : "destructive"}
      >
        {ok ? "Yes" : "No"}
      </Badge>
    </div>
  );

  const StatusChip = ({ status }) => {
    const isAvailable = String(status).toLowerCase() === "available";
    return (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="text-muted-foreground">Status</span>
        <Badge
          className={isAvailable ? "bg-green-600" : ""}
          variant={isAvailable ? "default" : "destructive"}
        >
          {status ?? "N/A"}
        </Badge>
      </div>
    );
  };

  const money = (v) => {
    if (v === null || v === undefined || v === "") return "N/A";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return `$${n.toFixed(2)}`;
  };

  const listToBadges = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0)
      return <div className="text-sm text-muted-foreground">N/A</div>;

    return (
      <div className="flex flex-wrap gap-2">
        {arr.map((x, idx) => (
          <Badge key={idx} variant="outline">
            {typeof x === "string" ? x : (x?.name ?? JSON.stringify(x))}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
        <FieldRow label="ID" value={car?.id} />
        <FieldRow label="Make" value={car?.make} />
        <FieldRow label="Model" value={car?.model} />
        <FieldRow label="Year" value={car?.year} />

        <FieldRow label="License Plate" value={car?.license_plate} />
        <FieldRow label="Color" value={car?.color} />

        <FieldRow label="Mileage" value={car?.mileage} />
        <FieldRow label="Fuel Type" value={car?.fuel_type} />

        <FieldRow label="Transmission" value={car?.transmission} />
        <FieldRow label="Wheels Drive" value={car?.wheels_drive} />

        <FieldRow label="Category" value={car?.car_category} />
        <FieldRow label="Seats" value={car?.seats} />

        <FieldRow label="Doors" value={car?.doors} />
        <FieldRow label="Daily Rate" value={money(car?.daily_rate)} />

        <FieldRow label="Holiday Rate" value={money(car?.holiday_rate)} />

        <div className="pt-1">
          <StatusChip status={car?.status} />
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          <YesNoChip label="Car Accepted" ok={!!car?.car_accepted} />
          <YesNoChip label="With Driver" ok={!!car?.with_driver} />
          <YesNoChip label="Is Delivered" ok={!!car?.is_delivered} />
        </div>

        <FieldRow label="Min Rental Days" value={car?.min_rental_days} />
        <FieldRow label="Views Count" value={car?.views_count} />
      </div>

      <div className="border-t pt-3" />

      <div className="space-y-2">
        <div className="text-sm font-semibold">Features</div>
        {listToBadges(car?.features)}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Add-ons</div>
        {listToBadges(car?.add_ons)}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Notes</div>
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {car?.notes ?? "N/A"}
        </div>
      </div>

      <div className="border-t pt-3" />

      <div className="space-y-3">
        <div className="text-sm font-semibold">Agent</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
          <FieldRow label="Username" value={agent?.username ?? "N/A"} />
          <FieldRow label="Phone Number" value={agent?.phone_number ?? "N/A"} />
          <FieldRow label="Email" value={agent?.email ?? "N/A"} />
          <FieldRow label="Gender" value={agent?.gender ?? "N/A"} />
          <FieldRow label="City" value={agent?.city ?? "N/A"} />
        </div>
      </div>

      <div className="border-t pt-3" />

      <div className="space-y-3">
        <div className="text-sm font-semibold">Car Images</div>

        <img
          src={imgUrl(car?.main_image_url)}
          alt="Main Car"
          className="w-full max-h-[260px] object-cover rounded-md border"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Front", key: "front_image_url" },
            { label: "Back", key: "back_image_url" },
            { label: "Left", key: "left_image_url" },
            { label: "Right", key: "right_image_url" },
          ].map(({ label, key }) => (
            <div key={key} className="space-y-1">
              <div className="text-muted-foreground">{label}</div>
              <img
                src={imgUrl(car?.[key])}
                alt={label}
                className="h-[120px] w-full object-cover rounded-md border"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 flex gap-2">
        <Button className="flex-1" onClick={onEdit}>
          Edit Car
        </Button>
        <Button variant="outline" className="w-28" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function EditCarView({ car, setCar, imgUrl, onClose, onSaved }) {
  const { toast } = useToast();

  const setVal = (key, value) => setCar((p) => ({ ...p, [key]: value }));

  const money = (v) => {
    if (v === null || v === undefined || v === "") return "";
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    return n;
  };

  const listToBadges = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0)
      return <div className="text-sm text-muted-foreground">N/A</div>;

    return (
      <div className="flex flex-wrap gap-2">
        {arr.map((x, idx) => (
          <Badge key={idx} variant="outline">
            {typeof x === "string" ? x : (x?.name ?? JSON.stringify(x))}
          </Badge>
        ))}
      </div>
    );
  };

  const ToggleRow = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="text-sm">{label}</div>

      <button
        type="button"
        role="switch"
        aria-checked={!!value}
        onClick={() => onChange(!value)}
        className={[
          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
          value ? "bg-teal-600" : "bg-muted",
          "focus:outline-none focus:ring-2 focus:ring-teal-500/40",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            value ? "translate-x-5" : "translate-x-1",
            "shadow",
          ].join(" ")}
        />
      </button>
    </div>
  );

  function InputRow({ label, field, type = "text" }) {
    return (
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <Input
          type={type}
          value={car?.[field] ?? ""}
          onChange={(e) => setVal(field, e.target.value)}
          disabled
        />
      </div>
    );
  }

  function SelectRow({ label, field, options }) {
    return (
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <Select
          value={String(car?.[field] ?? "")}
          onValueChange={(v) => setVal(field, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((op) => (
              <SelectItem key={op.value} value={String(op.value)}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  const save = async () => {
    try {
      const payload = {
        make: car.make,
        model: car.model,
        year: car.year,
        license_plate: car.license_plate,
        color: car.color,
        mileage: car.mileage,
        fuel_type: car.fuel_type,
        transmission: car.transmission,
        wheels_drive: car.wheels_drive,
        car_category: car.car_category,
        seats: car.seats,
        doors: car.doors,
        daily_rate: money(car.daily_rate),
        holiday_rate: money(car.holiday_rate),
        min_rental_days: car.min_rental_days,
        notes: car.notes,
        status: car.status,

        car_accepted: !!car.car_accepted,
        with_driver: !!car.with_driver,
        is_delivered: !!car.is_delivered,
      };

      const { data } = await api.put(`/admin/cars/${car.id}`, payload);
      const updated = data?.car ?? data?.data ?? car;

      toast({ title: "Saved", description: "Car updated successfully" });
      onSaved?.(updated);
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to update car",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
        <InputRow label="ID" field="id" />
        <InputRow label="Make" field="make" />
        <InputRow label="Model" field="model" />
        <InputRow label="Year" field="year" type="number" />

        <InputRow label="License Plate" field="license_plate" />
        <InputRow label="Color" field="color" />

        <InputRow label="Mileage" field="mileage" type="number" />
        <InputRow label="Fuel Type" field="fuel_type" />

        <InputRow label="Transmission" field="transmission" />
        <InputRow label="Wheels Drive" field="wheels_drive" />

        <InputRow label="Category" field="car_category" />

        <InputRow label="Seats" field="seats" type="number" />
        <InputRow label="Doors" field="doors" type="number" />

        <InputRow label="Daily Rate" field="daily_rate" type="number" />
        <InputRow label="Holiday Rate" field="holiday_rate" type="number" />

        <InputRow
          label="Min Rental Days"
          field="min_rental_days"
          type="number"
        />

        <InputRow label="Views Count" field="views_count" />
      </div>

      <div className="border-t pt-3" />

      <div className="space-y-2">
        <div className="text-sm font-semibold">Features</div>
        {listToBadges(car?.features)}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Add-ons</div>
        {listToBadges(car?.add_ons)}
      </div>

      <div className="border-t pt-3" />

      <div className="space-y-3">
        <div className="text-sm font-semibold">Car Images</div>

        <a href={imgUrl(car?.main_image_url)} target="_blank" rel="noreferrer">
          <img
            src={imgUrl(car?.main_image_url)}
            alt="Main Car"
            className="w-full max-h-[260px] object-cover rounded-md border"
          />
        </a>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Front", key: "front_image_url" },
            { label: "Back", key: "back_image_url" },
            { label: "Left", key: "left_image_url" },
            { label: "Right", key: "right_image_url" },
          ].map(({ label, key }) => (
            <a
              key={key}
              href={imgUrl(car?.[key])}
              target="_blank"
              rel="noreferrer"
              className="space-y-1"
            >
              <div className="text-muted-foreground">{label}</div>
              <img
                src={imgUrl(car?.[key])}
                alt={label}
                className="h-[120px] w-full object-cover rounded-md border"
              />
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <SelectRow
          label="Status"
          field="status"
          options={[
            { label: "Available", value: "available" },
            { label: "Reserved", value: "reserved" },
          ]}
        />

        <div className="text-sm font-semibold">Notes</div>
        <textarea
          className="w-full border rounded-md p-2 min-h-[90px]"
          value={car?.notes ?? ""}
          onChange={(e) => setVal("notes", e.target.value)}
        />
      </div>

      <ToggleRow
        label="Car Accepted"
        value={car?.car_accepted}
        onChange={(v) => setVal("car_accepted", v ? 1 : 0)}
      />

      <div className="pt-3 flex gap-2">
        <Button className="flex-1" onClick={save}>
          Update Car
        </Button>
        <Button variant="outline" className="w-28" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// End Tony Update
