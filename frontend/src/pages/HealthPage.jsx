import { useEffect, useState } from "react";
import { getHealth } from "../api/api";

export default function HealthPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    getHealth()
      .then((d) => {
        if (!d) {
          setError("Failed to load health data — check console for details.");
        } else {
          setData(d);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-gray-400">Loading...</p>;
  if (error)   return <p className="p-6 text-red-500">{error}</p>;

  const errorCount = data.lambda_errors_24h ?? 0;

  return (
    <div className="p-6">
      <h2 className="font-semibold text-lg mb-4">System Health (Last 24h)</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">API Requests</p>
          <h2 className="text-2xl font-bold mt-1">{data.api_requests_24h}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Lambda Errors</p>
          <h2 className={`text-2xl font-bold mt-1 ${errorCount > 0 ? "text-red-500" : "text-green-500"}`}>
            {errorCount}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Avg Latency</p>
          <h2 className="text-2xl font-bold mt-1">
            {data.avg_latency_ms} <span className="text-sm font-normal text-gray-400">ms</span>
          </h2>
        </div>

      </div>
    </div>
  );
}