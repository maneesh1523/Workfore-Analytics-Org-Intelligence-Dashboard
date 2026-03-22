import { useEffect, useState } from "react";
import { getOrg } from "../api/api";
import OrgChartD3 from "../components/OrgChartD3";

export default function OrgPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getOrg()
      .then((d) => {
        if (!d) {
          setError("Failed to load org chart — check console for details.");
        } else {
          setData(d);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-gray-400">Loading...</p>;
  if (error)   return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="font-semibold text-lg mb-4">Organisation Structure</h2>
      <div className="bg-white p-5 rounded-2xl shadow">
        <OrgChartD3 data={data} />
      </div>
    </div>
  );
}