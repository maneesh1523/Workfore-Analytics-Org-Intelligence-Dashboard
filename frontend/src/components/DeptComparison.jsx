import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DeptComparison({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow">
        <h3 className="font-semibold">Department Comparison</h3>
        <p className="text-gray-400 text-sm mt-3">No department data</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <h3 className="font-semibold">Department Comparison</h3>

      <Bar
        data={{
          labels: Object.keys(data),
          datasets: [
            {
              label: "Employees",
              data: Object.values(data),
              backgroundColor: [
                "rgba(59,130,246,0.7)",
                "rgba(99,102,241,0.7)",
                "rgba(16,185,129,0.7)",
                "rgba(245,158,11,0.7)",
                "rgba(239,68,68,0.7)",
                "rgba(139,92,246,0.7)",
              ],
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
          scales: { y: { beginAtZero: true } },
        }}
      />
    </div>
  );
}