import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppeals } from "@/hooks/useAppeals";

const statusStyles = {
  submitted: "bg-gray-100 text-gray-700",
  under_review: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  escalated: "bg-purple-100 text-purple-700",
};

export default function AdminAppealsPage() {
  const { appeals, meta, loading, fetchAppeals } = useAppeals();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const handleSearch = (value) => {
    setSearch(value);
    fetchAppeals({ search: value, status });
  };

  const handleStatusChange = (value) => {
    setStatus(value === "all" ? "" : value);
    fetchAppeals({ status: value === "all" ? "" : value, search });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Appeals</CardTitle>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative w-44">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>

          {/* Status Filter */}
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger className="w-36 h-9 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh */}
          <Button
            variant="outline"
            aria-label="refresh data"
            size="icon"
            onClick={() => fetchAppeals()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : appeals.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No appeals found
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {appeals.map((appeal) => (
                    <TableRow key={appeal.id}>
                      <TableCell>{appeal.id}</TableCell>
                      <TableCell>
                        {appeal.user?.name || "—"}
                      </TableCell>
                      <TableCell>
                        {appeal.type || "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            statusStyles[appeal.status]
                          }`}
                        >
                          {appeal.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {appeal.priority ?? "—"}
                      </TableCell>
                      <TableCell>
                        {new Date(
                          appeal.created_at
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" aria-label="View appeal details" variant="outline">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end gap-2 mt-4">
              {meta.prev_page_url && (
                <Button
                  variant="outline"
                  size="sm"
                  area-label="refresh data"
                  onClick={() =>
                    fetchAppeals({
                      page: meta.current_page - 1,
                      search,
                      status,
                    })
                  }
                >
                  Previous
                </Button>
              )}
              {meta.next_page_url && (
                <Button
                  size="sm"
                  area-label="refresh data"
                  onClick={() =>
                    fetchAppeals({
                      page: meta.current_page + 1,
                      search,
                      status,
                    })
                  }
                >
                  Next
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
