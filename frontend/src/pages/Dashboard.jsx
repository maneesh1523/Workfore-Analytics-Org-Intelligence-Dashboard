import { useEffect, useState } from "react";
import { getMetricByType, getAttrition } from "../api/api";
import MetricsCharts from "../components/MetricsCharts";
import AttritionTable from "../components/AttritionTable";
import FunnelChart from "../components/FunnelChart";
import DeptComparison from "../components/DeptComparison";

const DEPARTMENTS = ["engineering", "hr", "sales", "operations", "finance", "product"];

// Scans from the end and returns the first non-zero value.
// Prevents a trailing zero month from masking real data.
// Also coerces to Number in case DynamoDB returned a Decimal string.
const latest = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  for (let i = arr.length - 1; i >= 0; i--) {
    const v = Number(arr[i]?.value);
    if (v > 0) return v;
  }
  return 0;
};

export default function Dashboard() {
  const [department, setDepartment] = useState("engineering");
  const [headcount, setHeadcount]   = useState({ labels: [], values: [] });
  const [leave, setLeave]           = useState({ labels: [], values: [] });
  const [attrition, setAttrition]   = useState([]);
  const [funnel, setFunnel]         = useState(null);
  const [deptData, setDeptData]     = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function loadDept() {
      setLoading(true);

      const [head, leaveData, attr] = await Promise.all([
        getMetricByType(`headcount_${department}`),
        getMetricByType(`leave_util_${department}`),
        getAttrition(),
      ]);

      console.log(`[Dashboard] headcount_${department}:`, head);
      console.log(`[Dashboard] leave_util_${department}:`, leaveData);
      console.log("[Dashboard] attrition:", attr);

      setHeadcount({
        labels: head.map((d) => d.date),
        values: head.map((d) => Number(d.value)),
      });

      setLeave({
        labels: leaveData.map((d) => d.date),
        values: leaveData.map((d) => Number(d.value)),
      });

      setAttrition(attr);
      setLoading(false);
    }

    loadDept();
  }, [department]);

  useEffect(() => {
    async function loadExtra() {
      const [applied, shortlisted, interviewed, offered, joined] =
        await Promise.all([
          getMetricByType("funnel_applied"),
          getMetricByType("funnel_shortlisted"),
          getMetricByType("funnel_interviewed"),
          getMetricByType("funnel_offered"),
          getMetricByType("funnel_joined"),
        ]);

      console.log("[Dashboard] funnel raw:", { applied, shortlisted, interviewed, offered, joined });

      const funnelValues = [
        latest(applied),
        latest(shortlisted),
        latest(interviewed),
        latest(offered),
        latest(joined),
      ];

      console.log("[Dashboard] funnel values:", funnelValues);
      setFunnel(funnelValues);

      const results = await Promise.all(
        DEPARTMENTS.map((d) => getMetricByType(`headcount_${d}`))
      );

      const deptMap = {};
      DEPARTMENTS.forEach((name, i) => {
        const val = latest(results[i]);
        console.log(`[Dashboard] dept ${name}:`, val);
        if (val > 0) {
          deptMap[name.charAt(0).toUpperCase() + name.slice(1)] = val;
        }
      });

      console.log("[Dashboard] deptMap:", deptMap);
      setDeptData(deptMap);
    }

    loadExtra();
  }, []);

  return (
    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Workforce Dashboard</h2>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white shadow-sm"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <MetricsCharts headcount={headcount} leave={leave} />
      )}

      {deptData && <DeptComparison data={deptData} />}
      {funnel   && <FunnelChart data={funnel} />}

      <AttritionTable data={attrition} />

    </div>
  );
}