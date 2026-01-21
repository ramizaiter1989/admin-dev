import { useEffect, useState } from "react";
import { getAppeals } from "@/lib/adminApi";

export function useAppeals(initialParams = {}) {
  const [appeals, setAppeals] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAppeals = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await getAppeals({
        per_page: 50,
        ...initialParams,
        ...params,
      });

      setAppeals(data.appeals.data);
      setMeta(data.appeals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  return {
    appeals,
    meta,
    loading,
    fetchAppeals,
  };
}
