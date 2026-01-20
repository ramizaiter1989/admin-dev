import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Eye, Pencil, Trash2, Search } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";

// Start Tony Update
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function truncate(text, max = 14) {
  if (!text) return "N/A";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}
// End Tony Update
const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  //Start tony update
  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  //End tony update

  /* filters */
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState("newest");

  /* ============================
     Fetch users
  ============================ */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data?.users?.data || []);
        setTotal(res.data?.users?.total || 0);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  /* ============================
     Fetch user details tony 
  ============================ */
  const fetchUserDetails = async (id) => {
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      return data.user;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
      return null;
    }
  };
  /* ============================
     Fetch user Profile picture tony 
  ============================ */
  const DEFAULT_AVATAR = "/avatar.png";
  const ASSET_BASE = "https://rento-lb.com/api/storage/";
  const getProfileImg = (u) => {
    const p = u?.profile_picture;
    if (!p) return DEFAULT_AVATAR;

    if (p.startsWith("http")) return p;
    const cleaned = p.startsWith("/") ? p.slice(1) : p;

    return ASSET_BASE + cleaned;
  };

  //End Tony Update
  /* ============================
     Filter + sort
  ============================ */
  const filteredUsers = useMemo(() => {
    let data = [...users];

    // search
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.phone_number?.includes(q) ||
          u.role?.toLowerCase().includes(q),
      );
    }

    // role filter
    if (role !== "all") {
      data = data.filter((u) => u.role === role);
    }

    // sort
    if (sort === "az") {
      data.sort((a, b) => a.username.localeCompare(b.username));
    }
    if (sort === "za") {
      data.sort((a, b) => b.username.localeCompare(a.username));
    }
    if (sort === "newest") {
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return data;
  }, [users, search, role, sort]);

  /* ============================
     Actions
  ============================ */
  const handleViewUser = (user) => {
    navigate(`/admin/users/${user.id}`);
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast({ title: "User deleted" });
    } catch {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    }
  };

  /* ============================
     Render
  ============================ */
  return (
    <div className="space-y-6">
      {/* Start Tony Update  */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          {modalType === "view-user" && selectedItem && (
            <UserDetailsView
              user={selectedItem}
              onEdit={() => setModalType("edit-user")}
              onClose={() => setModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* End Tony Update */}
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>

        <Badge variant="secondary" className="text-sm">
          Total users: {total}
        </Badge>
      </div>

      {/* FILTER BAR */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Role */}
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="az">A–Z</SelectItem>
              <SelectItem value="za">Z–A</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-muted-foreground">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {/* Start Tony Update  */}
                      <span
                        className="user-name-hover inline-flex items-center gap-2 cursor-pointer"
                        title={userTooltip(user)}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          openUserView(
                            user.id,
                            fetchUserDetails,
                            setSelectedItem,
                            setModalType,
                            setModalOpen,
                          )
                        }
                      >
                        <img
                          src={getProfileImg(user)}
                          alt={user.username || "User"}
                          className="h-7 w-7 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/avatar.png";
                          }}
                        />

                        {truncate(
                          user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.username,
                          14,
                        )}
                      </span>
                      {/* End Tony Update */}
                    </TableCell>

                    <TableCell>{user.phone_number}</TableCell>

                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>

                    <TableCell>
                      {user.update_access ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Blocked</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            const fullDetails = await fetchUserDetails(user.id);
                            if (fullDetails) {
                              setSelectedItem(fullDetails);
                              setModalType("view-user");
                              setModalOpen(true);
                            }
                          }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Delete user"
                          className="text-red-500"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-6"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
// Start Tony Update
function userTooltip(user) {
  if (!user) return "";

  const client = user.client || {};
  const qc = client.qualification_code || {};

  return [
    `User ID: ${user.id ?? "N/A"}`,
    `Age: ${qc.age ?? "N/A"}`,
    `Gender: ${user.gender ?? "N/A"}`,
    `City: ${user.city ?? "N/A"}`,
    `Bio: ${user.bio ?? "N/A"}`,
    `Profession: ${client.profession ?? "N/A"}`,
    `Email: ${user.email ?? "N/A"}`,
    `License number: ${client.license_number ?? "N/A"}`,
    `Average rating: ${client.average_rating ?? "N/A"}`,
    `OTP verification: ${user.otp_verification ?? "N/A"}`,
  ].join("\n");
}

export async function openUserView(
  id,
  fetchUserDetails,
  SelectItem,
  setModalType,
  setModalOpen,
) {
  const fullDetails = await fetchUserDetails(id);
  if (fullDetails) {
    SelectItem(fullDetails);
    setModalType("view-user");
    setModalOpen(true);
  }
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
const ASSET_BASE = "https://rento-lb.com/api/storage/";
const DEFAULT_AVATAR = "/avatar.png";

function fileUrl(path, fallback = null) {
  if (!path) return fallback;
  if (path.startsWith("http")) return path;
  const cleaned = path.startsWith("/") ? path.slice(1) : path;
  return ASSET_BASE + cleaned;
}

function UserDetailsView({ user, onEdit, onClose }) {
  const client = user?.client || {};
  const qc = client?.qualification_code || {};

  const Field = ({ label, value }) => (
    <div className="py-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">{value ?? "N/A"}</div>
    </div>
  );

  const Chip = ({ label, value, tone = "neutral" }) => {
    const cls =
      tone === "teal"
        ? "bg-teal-600 text-white"
        : tone === "red"
          ? "bg-red-600 text-white"
          : "bg-muted text-foreground";

    return (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="text-sm text-muted-foreground">{label}</span>

        <span
          className={`inline-flex items-center justify-center px-2 h-5 rounded text-xs font-semibold leading-none ${cls}`}
        >
          {value}
        </span>
      </div>
    );
  };

  const statusText = user?.status ? "Active" : "Inactive";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <Field label="ID" value={user?.id} />
        <Field label="Username" value={user?.username} />

        <Field label="Email" value={user?.email} />
        <Field label="Phone Number" value={user?.phone_number} />

        <Field label="First Name" value={user?.first_name} />
        <Field label="Last Name" value={user?.last_name} />

        <Field label="Gender" value={user?.gender} />
        <Field label="Birth Date" value={formatDateOnly(user?.birth_date)} />

        <Field label="City" value={user?.city} />
        <Field label="Role" value={user?.role} />

        <div className="flex flex-wrap items-center gap-8 pt-1">
          <Chip
            label="Status:"
            value={statusText}
            tone={user?.status ? "teal" : "red"}
          />
        </div>

        <div className="flex flex-wrap items-center gap-8 pt-1">
          <Chip
            label="Verified by Admin:"
            value={user?.verified_by_admin ? "Yes" : "No"}
            tone={user?.verified_by_admin ? "teal" : "red"}
          />
        </div>

        <div className="flex flex-wrap items-center gap-8 pt-1">
          <Chip
            label="Is Locked:"
            value={user?.is_locked ? "Locked" : "Unlocked"}
            tone={user?.is_locked ? "red" : "teal"}
          />
        </div>

        <Field label="Created At" value={formatDateTime(user?.created_at)} />
        <Field label="Updated At" value={formatDateTime(user?.updated_at)} />
      </div>

      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <Field label="Bio" value={user?.bio} />
        <Field label="" value="" />
      </div>

      <div className="border-t pt-3" />

      <div className="text-sm font-semibold">Client Details</div>

      <div className="grid grid-cols-2 gap-x-10 gap-y-3">
        <Field label="License Number" value={client?.license_number} />
        <Field label="Profession" value={client?.profession} />

        <Field label="Average Salary" value={client?.avg_salary} />
        <Field label="Promo Code" value={client?.promo_code} />
      </div>

      <div className="border-t pt-3" />

      <div className="border-t pt-4 space-y-3">
        <div className="text-sm font-semibold">Documents</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile Picture */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">
              Profile Picture
            </div>
            <a
              href={fileUrl(user?.id_card_front)}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={fileUrl(user?.profile_picture, DEFAULT_AVATAR)}
                alt="Profile"
                className="w-full max-w-[260px] h-[180px] object-cover rounded-md border"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
            </a>
          </div>

          {/* Driver License (inside client) */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">
              Driver License
            </div>
            {client?.driver_license ? (
              <a
                href={fileUrl(user?.id_card_front)}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={fileUrl(client?.driver_license)}
                  alt="Driver License"
                  className="w-full max-w-[260px] h-[180px] object-cover rounded-md border"
                />
              </a>
            ) : (
              <div className="text-sm text-muted-foreground">N/A</div>
            )}
          </div>

          {/* ID Card Front */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">
              ID Card Front
            </div>
            {user?.id_card_front ? (
              <a
                href={fileUrl(user?.id_card_front)}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={fileUrl(user?.id_card_front)}
                  alt="ID Card Front"
                  className="w-full max-w-[260px] h-[180px] object-cover rounded-md border"
                />
              </a>
            ) : (
              <div className="text-sm text-muted-foreground">N/A</div>
            )}
          </div>

          {/* ID Card Back */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">
              ID Card Back
            </div>
            {user?.id_card_back ? (
              <a
                href={fileUrl(user?.id_card_front)}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={fileUrl(user?.id_card_back)}
                  alt="ID Card Back"
                  className="w-full max-w-[260px] h-[180px] object-cover rounded-md border"
                />
              </a>
            ) : (
              <div className="text-sm text-muted-foreground">N/A</div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-3 flex gap-2">
        <Button className="flex-1" onClick={onEdit}>
          Edit User
        </Button>

        <Button variant="outline" className="w-28" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

// End Tony Update
