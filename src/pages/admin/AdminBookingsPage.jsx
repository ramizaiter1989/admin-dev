import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  Eye,
  Edit,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowUpDown,
  Calendar as CalendarIcon,
} from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

/* ================= CONFIG ================= */

const statusColor = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  rejected: "bg-gray-200 text-gray-700",
};

// End Tony Update
function truncate(text, max = 14) {
  if (!text) return "N/A";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}
// End Tony Update
/* ================= PAGE ================= */

export default function AdminBookingsPage() {
  /* ---------- DATA ---------- */
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(false);

  /* ---------- UI ---------- */
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortAsc, setSortAsc] = useState(false);

  /* ---------- VIEW ---------- */
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  /* ---------- EDIT ---------- */
  const [editOpen, setEditOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  // Start Tony Update
  /* ----------  MODAL STATES  ---------- */
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  // Tony Comment do not remove
  // /* ----------  CALENDER RANGE  ---------- */
  // const [dateRange, setDateRange] = useState({ from: null, to: null });
  // End Tony Update

  /* ================= FETCH ================= */

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page: 1, per_page: 50 };
      if (status !== "all") params.status = status;

      const { data } = await api.get("/admin/bookings", { params });
      const rows = data.bookings?.data || [];
      setBookings(rows);

      rows.forEach((b) => {
        if (!clients[b.client_id]) fetchClient(b.client_id);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClient = async (id) => {
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      const name =
        data.user?.first_name && data.user?.last_name
          ? `${data.user.first_name} ${data.user.last_name}`
          : data.user?.username || `User #${id}`;
      setClients((p) => ({ ...p, [id]: name }));
    } catch {
      setClients((p) => ({ ...p, [id]: `User #${id}` }));
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [status]);

  // Start Tony Update - Fetch booking details
  const fetchBookingDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/bookings/${id}`);
      return data.booking ?? data.data ?? data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch booking details",
        variant: "destructive",
      });
      return null;
    }
  };
  // End Tony Update

  /* ================= FILTER / SORT ================= */

  const filteredBookings = useMemo(() => {
    let data = [...bookings];

    // Tony Comment do not remove
    // if (dateRange?.from) {
    //   const from = new Date(dateRange.from);
    //   from.setHours(0, 0, 0, 0);

    //   const to = dateRange?.to
    //     ? new Date(dateRange.to)
    //     : new Date(dateRange.from);
    //   to.setHours(23, 59, 59, 999);

    //   data = data.filter((b) => {
    //     const d = new Date(b.start_datetime);
    //     if (Number.isNaN(d.getTime())) return false;
    //     return d >= from && d <= to;
    //   });
    // }

    if (search) {
      data = data.filter((b) =>
        `${b.id} ${clients[b.client_id] ?? ""} ${b.car_id}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }

    data.sort((a, b) =>
      sortAsc
        ? Number(a.total_booking_price) - Number(b.total_booking_price)
        : Number(b.total_booking_price) - Number(a.total_booking_price),
    );

    return data;
  }, [bookings, search, sortAsc, clients]);

  const totalBookingsAmount = useMemo(() => {
    return filteredBookings.reduce(
      (sum, b) => sum + Number(b.total_booking_price || 0),
      0,
    );
  }, [filteredBookings]);

  /* ================= ACTIONS ================= */

  const viewBooking = async (id) => {
    const { data } = await api.get(`/admin/bookings/${id}`);
    setSelectedBooking(data.booking);
    setViewOpen(true);
  };

  const openEditBooking = (booking) => {
    setEditingBooking({ ...booking });
    setEditOpen(true);
  };

  const updateBooking = async () => {
    try {
      const payload = {
        booking_request_status: editingBooking.booking_request_status,
        payment_status: editingBooking.payment_status,
        payment_method: editingBooking.payment_method,
        total_booking_price: editingBooking.total_booking_price,
        extra_charge: editingBooking.extra_charge,
        with_driver: editingBooking.with_driver,
        is_delivered: editingBooking.is_delivered,
        start_datetime: editingBooking.start_datetime,
        end_datetime: editingBooking.end_datetime,
        pickup_location: editingBooking.pickup_location,
        dropoff_location: editingBooking.dropoff_location,
        reason_of_booking: editingBooking.reason_of_booking,
      };

      await api.put(`/admin/bookings/${editingBooking.id}`, payload);
      toast.success("Booking updated successfully");
      setEditOpen(false);
      fetchBookings();
    } catch {
      toast.error("Failed to update booking");
    }
  };

  const forceComplete = async (id) => {
    await api.post(`/admin/bookings/${id}/force-complete`);
    fetchBookings();
  };

  /* ============================
     Fetch user Profile picture tony 
  ============================ */
  const DEFAULT_AVATAR = "/avatar.png";
  const ASSET_BASE = "https://rento-lb.com/api/storage/";
  const getProfileImg = (u) => {
    const p = u?.client.profile_picture;
    if (!p) return DEFAULT_AVATAR;

    if (p.startsWith("http")) return p;
    const cleaned = p.startsWith("/") ? p.slice(1) : p;

    return ASSET_BASE + cleaned;
  };

  //End Tony Update
  /* ================= RENDER ================= */

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bookings</h1>

        <div className="flex items-center gap-3">
          {/* Tony Comment please do not delete it  */}
          {/* <Input
            placeholder="Search…"
            className="h-8 w-44 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          /> */}
          {/* <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-8 text-xs gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange?.to ? (
                    <>
                      {format(dateRange.from, "yyyy-MM-dd")} →{" "}
                      {format(dateRange.to, "yyyy-MM-dd")}
                    </>
                  ) : (
                    format(dateRange.from, "yyyy-MM-dd")
                  )
                ) : (
                  "Date range"
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                numberOfMonths={1}
                selected={dateRange}
                onSelect={setDateRange}
              />

              <div className="p-2 flex justify-end gap-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateRange({ from: null, to: null })}
                >
                  Clear
                </Button>
              </div>
            </PopoverContent>
          </Popover> */}

          <div className="px-3 py-1.5 rounded-lg border bg-muted text-sm font-semibold">
            Total: ${totalBookingsAmount.toLocaleString()}
          </div>

          <Input
            placeholder="Search…"
            className="h-8 w-44 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "all",
                "pending",
                "confirmed",
                "cancelled",
                "completed",
                "rejected",
              ].map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="icon"
            variant="ghost"
            aria-label="Sort"
            onClick={() => setSortAsc(!sortAsc)}
          >
            <ArrowUpDown size={16} />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            aria-label="Refresh"
            onClick={fetchBookings}
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Car</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredBookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <span
                    className="item-name-hover inline-flex items-center gap-2 cursor-pointer"
                    title={bookingTooltip(b)}
                    onClick={() =>
                      openBookingView(
                        b.id,
                        fetchBookingDetails,
                        setSelectedItem,
                        setModalType,
                        setModalOpen,
                      )
                    }
                  >
                    {b.id}{" "}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="item-name-hover inline-flex items-center gap-2 cursor-pointer"
                    title={userBookingTooltip(b)}
                  >
                    <img
                      src={getProfileImg(b)}
                      alt={b.client.username || "User"}
                      className="h-7 w-7 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/avatar.png";
                      }}
                    />
                    {truncate(
                      clients[b.client_id] || `User #${b.client_id}`,
                      14,
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="item-name-hover inline-flex items-center gap-2 cursor-pointer"
                    title={carBookingTooltip(b)}
                  >
                    {b.car ? `${b.car.make} ${b.car.model}` : `#${b.car_id}`}
                  </span>
                </TableCell>

                <TableCell>
                  <span
                    className="item-name-hover inline-flex items-center gap-2 cursor-pointer"
                    title={clientBookingTooltip(b)}
                  >
                    {b.car?.agent?.username ?? "—"}
                  </span>
                </TableCell>

                <TableCell className="flex items-center gap-2">
                  <Badge className={statusColor[b.booking_request_status]}>
                    {b.booking_request_status}
                  </Badge>
                  {b.booking_request_status === "confirmed" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      b.payment_status === "paid" ? "default" : "secondary"
                    }
                  >
                    {b.payment_status}
                  </Badge>
                </TableCell>

                <TableCell>${b.total_booking_price}</TableCell>

                <TableCell className="flex justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="View"
                    // Start Tony Update
                    onClick={() =>
                      openBookingView(
                        b.id,
                        fetchBookingDetails,
                        setSelectedItem,
                        setModalType,
                        setModalOpen,
                      )
                    }
                    title="View Details"
                    // End Tony Update
                  >
                    <Eye size={16} />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit"
                    onClick={() => openEditBooking(b)}
                    title="Edit Details"
                  >
                    <Edit size={16} />
                  </Button>

                  {b.booking_request_status === "confirmed" ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Force complete"
                      onClick={() => forceComplete(b.id)}
                    >
                      <CheckCircle2 size={16} className="text-green-600" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Disabled"
                      disabled
                    >
                      <Minus size={16} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {!loading && filteredBookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete booking information (read-only).
            </DialogDescription>
          </DialogHeader>

          {modalType === "view-booking" && selectedItem && (
            <div className="space-y-6 text-sm">
              <BookingDetailsView
                booking={selectedItem}
                clients={clients}
                onClose={() => setModalOpen(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* End Tony Update */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>All fields below are editable</DialogDescription>
          </DialogHeader>

          {editingBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editingBooking.booking_request_status}
                    onValueChange={(v) =>
                      setEditingBooking({
                        ...editingBooking,
                        booking_request_status: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "pending",
                        "confirmed",
                        "cancelled",
                        "completed",
                        "rejected",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Payment Status</Label>
                  <Select
                    value={editingBooking.payment_status}
                    onValueChange={(v) =>
                      setEditingBooking({
                        ...editingBooking,
                        payment_status: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Total Price</Label>
                  <Input
                    type="number"
                    value={editingBooking.total_booking_price}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        total_booking_price: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Extra Charge</Label>
                  <Input
                    type="number"
                    value={editingBooking.extra_charge || 0}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        extra_charge: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Pickup Location</Label>
                  <Input
                    value={editingBooking.pickup_location || ""}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        pickup_location: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Dropoff Location</Label>
                  <Input
                    value={editingBooking.dropoff_location || ""}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        dropoff_location: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Start</Label>
                  <Input
                    type="datetime-local"
                    value={editingBooking.start_datetime?.slice(0, 16)}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        start_datetime: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>End</Label>
                  <Input
                    type="datetime-local"
                    value={editingBooking.end_datetime?.slice(0, 16)}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        end_datetime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Reason / Notes</Label>
                <textarea
                  className="w-full border rounded-md p-2"
                  rows={3}
                  value={editingBooking.reason_of_booking || ""}
                  onChange={(e) =>
                    setEditingBooking({
                      ...editingBooking,
                      reason_of_booking: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateBooking}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Start Tony Update
export async function openBookingView(
  id,
  fetchBookingDetails,
  setSelectedItem,
  setModalType,
  setModalOpen,
) {
  const fullDetails = await fetchBookingDetails(id);
  if (fullDetails) {
    setSelectedItem(fullDetails);
    setModalType("view-booking");
    setModalOpen(true);
  }
}

function userBookingTooltip(b) {
  if (!b) return "";

  return [
    `User ID : ${b.client.id ?? "N/A"}`,
    `username : ${b.client.username ?? "N/A"}`,
    `Phone Number : ${b.client.phone_number ?? "N/A"}`,
    `Email : ${b.client.email ?? "N/A"}`,
    `verified By Admin : ${b.client.verified_by_admin ?? "N/A"}`,
    `Gender : ${b.client.gender ?? "N/A"}`,
    `Birth Date : ${formatBirthDateTime(b.client.birth_date ?? "N/A")}`,
    `city : ${b.client.city ?? "N/A"}`,
    `bio : ${b.client.bio ?? "N/A"}`,
  ].join("\n");
}

function carBookingTooltip(b) {
  if (!b) return "";

  return [
    `Car ID : ${b.car.id ?? "N/A"}`,
    `Agent ID : ${b.car.agent_id ?? "N/A"}`,
    `Year : ${b.car.year ?? "N/A"}`,
    `Cylinder Number : ${b.car.cylinder_number ?? "N/A"}`,
    `License Plate : ${b.car.license_plate ?? "N/A"}`,
    `Color : ${b.car.color ?? "N/A"}`,
    `Mileage : ${b.car.mileage ?? "N/A"}`,
    `Transmission : ${b.car.transmission ?? "N/A"}`,
    `Wheels Drive : ${b.car.wheels_drive ?? "N/A"}`,
    `Category : ${b.car.car_category ?? "N/A"}`,
    `Seats : ${b.car.seats ?? "N/A"}`,
    `Doors : ${b.car.doors ?? "N/A"}`,
    `Daily_rate : ${b.car.daily_rate ?? "N/A"}`,
    `hHliday Rate : ${b.car.holiday_rate ?? "N/A"}`,
    `Status : ${b.car.status ?? "N/A"}`,
  ].join("\n");
}

function bookingTooltip(b) {
  if (!b) return "";

  return [
    `Client Id : ${b.client_id ?? "N/A"}`,
    `Car Id : ${b.car_id ?? "N/A"}`,
    `Reason Of Booking : ${b.reason_of_booking ?? "N/A"}`,
    `Total Booking Price : ${b.total_booking_price ?? "N/A"}`,
    `Is Paid Online : ${b.is_paid_online ?? "N/A"}`,
    `Is Delivered : ${b.is_delivered ?? "N/A"}`,
    `Pickup Location : ${b.pickup_location ?? "N/A"}`,
    `Dropoff Location : ${b.dropoff_location ?? "N/A"}`,
  ].join("\n");
}

function clientBookingTooltip(b) {
  if (!b) return "";

  return [
    `ID : ${b.car?.agent?.id ?? "N/A"}`,
    `Username : ${b.car?.agent?.username ?? "N/A"}`,
    `First Name : ${b.car?.agent?.first_name ?? "N/A"}`,
    `Last Name : ${b.car?.agent?.last_name ?? "N/A"}`,
    `Real User Id : ${b.car?.agent?.real_user_id ?? "N/A"}`,
    `Email : ${b.car?.agent?.email ?? "N/A"}`,
    `Verified_by_admin : ${b.car?.agent?.verified_by_admin ?? "N/A"}`,
    `Gender : ${b.car?.agent?.gender ?? "N/A"}`,
    `Birth date : ${formatBirthDateTime(b.car?.agent?.birth_date ?? "N/A")}`,
    `City : ${b.car?.agent?.city ?? "N/A"}`,
    `Bio : ${b.car?.agent?.bio ?? "N/A"}`,
  ].join("\n");
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

function formatBirthDateTime(value) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleString("en-US", {
    timeZone: "Asia/Beirut",
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}
function money(value) {
  if (value === null || value === undefined || value === "") return "N/A";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return `$${n.toLocaleString("en-US")}`;
}

function BookingDetailsView({ booking, clients, onClose }) {
  const client = booking?.client || {};
  const car = booking?.car || {};

  function FieldRow({ label, value }) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{label} :</span>
        <span className="text-foreground break-words">{value ?? "N/A"}</span>
      </div>
    );
  }

  const Chip = ({ label, value, tone = "neutral" }) => {
    const cls =
      tone === "teal"
        ? "bg-teal-600 text-white"
        : tone === "red"
          ? "bg-red-600 text-white"
          : tone === "yellow"
            ? "bg-yellow-500 text-white"
            : "bg-muted text-foreground";

    return (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={`inline-flex items-center justify-center px-2 h-5 rounded text-xs font-semibold leading-none ${cls}`}
        >
          {value ?? "N/A"}
        </span>
      </div>
    );
  };

  const status = booking?.booking_request_status ?? "N/A";
  const statusTone =
    status === "completed"
      ? "teal"
      : status === "pending"
        ? "yellow"
        : status === "cancelled" || status === "rejected"
          ? "red"
          : "neutral";

  const pay = booking?.payment_status ?? "N/A";
  const payTone =
    pay === "paid"
      ? "teal"
      : pay === "pending"
        ? "yellow"
        : pay === "failed"
          ? "red"
          : "neutral";

  const clientName =
    (client?.first_name && client?.last_name
      ? `${client.first_name} ${client.last_name}`
      : client?.username) ||
    clients?.[booking?.client_id] ||
    `User #${booking?.client_id ?? "N/A"}`;

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Booking</div>
      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <FieldRow label="Booking ID" value={booking?.id} />
        <FieldRow label="Car ID" value={booking?.car_id ?? car?.id} />

        <FieldRow
          label="Start"
          value={formatDateTime(booking?.start_datetime)}
        />
        <FieldRow label="End" value={formatDateTime(booking?.end_datetime)} />

        <div className="flex flex-wrap items-center gap-8 pt-1">
          <Chip label="Status:" value={status} tone={statusTone} />
        </div>
        <div className="flex flex-wrap items-center gap-8 pt-1">
          <Chip label="Payment:" value={pay} tone={payTone} />
        </div>

        <FieldRow label="Total" value={money(booking?.total_booking_price)} />
        <FieldRow
          label="Extra Charge"
          value={money(booking?.extra_charge ?? 0)}
        />

        <FieldRow label="Deposit" value={money(booking?.deposit ?? 0)} />
        <FieldRow
          label="Paid Online"
          value={booking?.is_paid_online ? "Yes" : "No"}
        />

        <FieldRow
          label="Payment Method"
          value={booking?.payment_method ?? "N/A"}
        />
        <FieldRow
          label="With Driver"
          value={booking?.with_driver ? "Yes" : "No"}
        />
      </div>

      <div className="border-t pt-3" />

      <div className="text-sm font-semibold">Client</div>
      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <FieldRow label="Client Name" value={clientName} />
        <FieldRow label="Client ID" value={booking?.client_id ?? client?.id} />

        <FieldRow label="Email" value={client?.email ?? "N/A"} />
        <FieldRow label="Phone" value={client?.phone_number ?? "N/A"} />
      </div>

      <div className="border-t pt-3" />

      {booking?.car && (
        <>
          <div className="text-sm font-semibold">Car</div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-3">
            <FieldRow label="Make" value={car?.make} />
            <FieldRow label="Model" value={car?.model} />

            <FieldRow label="Year" value={car?.year} />
            <FieldRow label="Plate" value={car?.license_plate} />

            <FieldRow label="Color" value={car?.color} />
            <FieldRow label="Transmission" value={car?.transmission} />

            <FieldRow label="Fuel" value={car?.fuel_type} />
          </div>

          <div className="border-t pt-3" />
        </>
      )}

      <div className="text-sm font-semibold">Locations</div>
      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <FieldRow label="Pickup" value={booking?.pickup_location ?? "N/A"} />
        <FieldRow label="Dropoff" value={booking?.dropoff_location ?? "N/A"} />

        <FieldRow
          label="Delivery Address"
          value={booking?.delivery_location?.address ?? "N/A"}
        />
        <FieldRow
          label="Return Address"
          value={booking?.return_location?.address ?? "N/A"}
        />
      </div>

      {booking?.reason_of_booking && (
        <>
          <div className="border-t pt-3" />
          <div className="text-sm font-semibold">Reason / Notes</div>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {booking?.reason_of_booking}
          </div>
        </>
      )}

      <div className="pt-3 flex gap-2 justify-end">
        <Button variant="outline" className="w-28" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

// End Tony Update
