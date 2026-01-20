import { useEffect, useState } from "react";
import {
  getAnnouncements,
  deleteAnnouncement,
} from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";

export default function useAnnouncements() {
  const { toast } = useToast();

  const [announcements, setAnnouncements] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    target_audience: "",
    sort: "latest",
    page: 1,
    per_page: 50,
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const res = await getAnnouncements(filters);

      // ✅ CORRECT mapping
      const announcementsData = res.data?.announcements;

      setAnnouncements(announcementsData?.data || []);
      setMeta(announcementsData || null);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeAnnouncement = async (id) => {
    try {
      await deleteAnnouncement(id);
      toast({ title: "Announcement deleted successfully" });
      fetchAnnouncements();
    } catch {
      toast({
        title: "Delete failed",
        description: "Could not delete announcement",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [filters]);

  return {
    announcements,
    meta,              // 👈 pagination info
    loading,
    filters,
    setFilters,
    refresh: fetchAnnouncements,
    removeAnnouncement,
  };
}
