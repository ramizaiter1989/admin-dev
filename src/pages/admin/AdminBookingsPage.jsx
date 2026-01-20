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
} from "lucide-react";

/* ================= CONFIG ================= */

const statusColor = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  rejected: "bg-gray-200 text-gray-700",
};

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

  /* ================= FILTER / SORT ================= */

  const filteredBookings = useMemo(() => {
    let data = [...bookings];

    if (search) {
      data = data.filter((b) =>
        `${b.id} ${clients[b.client_id] ?? ""} ${b.car_id}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    data.sort((a, b) =>
      sortAsc
        ? Number(a.total_booking_price) - Number(b.total_booking_price)
        : Number(b.total_booking_price) - Number(a.total_booking_price)
    );

    return data;
  }, [bookings, search, sortAsc, clients]);

  const totalBookingsAmount = useMemo(() => {
    return filteredBookings.reduce(
      (sum, b) => sum + Number(b.total_booking_price || 0),
      0
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

  /* ================= RENDER ================= */

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bookings</h1>

        <div className="flex items-center gap-3">
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
              {["all","pending","confirmed","cancelled","completed","rejected"].map(s=>(
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="icon" variant="ghost" aria-label="Sort" onClick={() => setSortAsc(!sortAsc)}>
            <ArrowUpDown size={16} />
          </Button>

          <Button size="icon" variant="ghost" aria-label="Refresh" onClick={fetchBookings}>
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
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredBookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.id}</TableCell>
                <TableCell>{clients[b.client_id] || `User #${b.client_id}`}</TableCell>
                <TableCell>{b.car_id}</TableCell>

                <TableCell className="flex items-center gap-2">
                  <Badge className={statusColor[b.booking_request_status]}>
                    {b.booking_request_status}
                  </Badge>
                  {b.booking_request_status === "confirmed"
                    ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                    : <AlertTriangle className="w-4 h-4 text-red-500" />
                  }
                </TableCell>

                <TableCell>
                  <Badge variant={b.payment_status === "paid" ? "default" : "secondary"}>
                    {b.payment_status}
                  </Badge>
                </TableCell>

                <TableCell>${b.total_booking_price}</TableCell>

                <TableCell className="flex justify-end gap-1">
                  <Button size="icon" variant="ghost" aria-label="View" onClick={() => viewBooking(b.id)}>
                    <Eye size={16} />
                  </Button>

                  <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => openEditBooking(b)}>
                    <Edit size={16} />
                  </Button>

                  {b.booking_request_status === "confirmed" ? (
                    <Button size="icon" variant="ghost" aria-label="Force complete" onClick={() => forceComplete(b.id)}>
                      <CheckCircle2 size={16} className="text-green-600" />
                    </Button>
                  ) : (
                    <Button size="icon" variant="ghost" aria-label="Disabled" disabled>
                      <Minus size={16} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {!loading && filteredBookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* VIEW MODAL */}
      {/* ================= VIEW BOOKING MODAL ================= */}
<Dialog open={viewOpen} onOpenChange={setViewOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Booking Details</DialogTitle>
      <DialogDescription>
        Complete booking information (read-only).
      </DialogDescription>
    </DialogHeader>

    {selectedBooking && (
      <div className="space-y-6 text-sm">

        {/* -------- BOOKING -------- */}
        <section>
          <h4 className="font-semibold mb-2">Booking</h4>
          <div className="grid grid-cols-2 gap-4">
            <div><b>ID:</b> {selectedBooking.id}</div>
            <div><b>Status:</b> {selectedBooking.booking_request_status}</div>
            <div><b>Payment Status:</b> {selectedBooking.payment_status}</div>
            <div><b>Total:</b> ${selectedBooking.total_booking_price}</div>
            <div><b>Start:</b> {new Date(selectedBooking.start_datetime).toLocaleString()}</div>
            <div><b>End:</b> {new Date(selectedBooking.end_datetime).toLocaleString()}</div>
          </div>
        </section>

        {/* -------- CLIENT -------- */}
        <section>
          <h4 className="font-semibold mb-2">Client</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <b>Name:</b>{" "}
              {selectedBooking.client
                ? `${selectedBooking.client.first_name} ${selectedBooking.client.last_name}`
                : clients[selectedBooking.client_id]}
            </div>
            <div><b>Client ID:</b> {selectedBooking.client_id}</div>
            <div><b>Email:</b> {selectedBooking.client?.email || "N/A"}</div>
            <div><b>Phone:</b> {selectedBooking.client?.phone_number || "N/A"}</div>
          </div>
        </section>

        {/* -------- CAR -------- */}
        {selectedBooking.car && (
          <section>
            <h4 className="font-semibold mb-2">Car</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><b>Car:</b> {selectedBooking.car.make} {selectedBooking.car.model}</div>
              <div><b>Year:</b> {selectedBooking.car.year}</div>
              <div><b>Plate:</b> {selectedBooking.car.license_plate}</div>
              <div><b>Color:</b> {selectedBooking.car.color}</div>
              <div><b>Transmission:</b> {selectedBooking.car.transmission}</div>
              <div><b>Fuel:</b> {selectedBooking.car.fuel_type}</div>
            </div>
          </section>
        )}

        {/* -------- LOCATIONS -------- */}
        <section>
          <h4 className="font-semibold mb-2">Locations</h4>
          <div className="grid grid-cols-2 gap-4">
            <div><b>Pickup:</b> {selectedBooking.pickup_location || "N/A"}</div>
            <div><b>Dropoff:</b> {selectedBooking.dropoff_location || "N/A"}</div>
            <div><b>Delivery Address:</b> {selectedBooking.delivery_location?.address || "N/A"}</div>
            <div><b>Return Address:</b> {selectedBooking.return_location?.address || "N/A"}</div>
          </div>
        </section>

        {/* -------- PAYMENT -------- */}
        <section>
          <h4 className="font-semibold mb-2">Payment</h4>
          <div className="grid grid-cols-2 gap-4">
            <div><b>Method:</b> {selectedBooking.payment_method || "N/A"}</div>
            <div><b>Paid Online:</b> {selectedBooking.is_paid_online ? "Yes" : "No"}</div>
            <div><b>Extra Charge:</b> ${selectedBooking.extra_charge || 0}</div>
            <div><b>Deposit:</b> ${selectedBooking.deposit || 0}</div>
          </div>
        </section>

        {/* -------- NOTES -------- */}
        {selectedBooking.reason_of_booking && (
          <section>
            <h4 className="font-semibold mb-2">Reason / Notes</h4>
            <p className="text-muted-foreground">
              {selectedBooking.reason_of_booking}
            </p>
          </section>
        )}
      </div>
    )}
  </DialogContent>
</Dialog>

      {/* EDIT MODAL */}
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
                      setEditingBooking({ ...editingBooking, booking_request_status: v })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["pending","confirmed","cancelled","completed","rejected"].map(s=>(
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Payment Status</Label>
                  <Select
                    value={editingBooking.payment_status}
                    onValueChange={(v) =>
                      setEditingBooking({ ...editingBooking, payment_status: v })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                      setEditingBooking({ ...editingBooking, total_booking_price: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Extra Charge</Label>
                  <Input
                    type="number"
                    value={editingBooking.extra_charge || 0}
                    onChange={(e) =>
                      setEditingBooking({ ...editingBooking, extra_charge: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Pickup Location</Label>
                  <Input
                    value={editingBooking.pickup_location || ""}
                    onChange={(e) =>
                      setEditingBooking({ ...editingBooking, pickup_location: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Dropoff Location</Label>
                  <Input
                    value={editingBooking.dropoff_location || ""}
                    onChange={(e) =>
                      setEditingBooking({ ...editingBooking, dropoff_location: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Start</Label>
                  <Input
                    type="datetime-local"
                    value={editingBooking.start_datetime?.slice(0, 16)}
                    onChange={(e) =>
                      setEditingBooking({ ...editingBooking, start_datetime: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>End</Label>
                  <Input
                    type="datetime-local"
                    value={editingBooking.end_datetime?.slice(0, 16)}
                    onChange={(e) =>
                      setEditingBooking({ ...editingBooking, end_datetime: e.target.value })
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
                    setEditingBooking({ ...editingBooking, reason_of_booking: e.target.value })
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
