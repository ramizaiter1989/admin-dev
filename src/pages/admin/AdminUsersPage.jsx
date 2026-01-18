import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data?.users?.data || []);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading users...</p>
      ) : (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Total users: {users.length}
            </p>

            <ul className="mt-4 space-y-2">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="p-3 rounded-lg border flex justify-between"
                >
                  <span>{user.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.role}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUsersPage;
