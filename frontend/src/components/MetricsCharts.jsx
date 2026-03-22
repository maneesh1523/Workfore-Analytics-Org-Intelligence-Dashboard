import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function MetricsCharts({ headcount, leave }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">

      <div className="bg-white p-5 rounded-2xl shadow">
        <h3 className="font-semibold">Headcount Trend</h3>

        {headcount?.values?.length > 0 ? (
          <Line
            data={{
              labels: headcount.labels,
              datasets: [
                {
                  label: "Employees",
                  data: headcount.values,
                  tension: 0.3,
                  borderColor: "#3b82f6",
                  backgroundColor: "rgba(59,130,246,0.1)",
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: true }, tooltip: { enabled: true } },
            }}
          />
        ) : (
          <p className="text-gray-400 text-sm mt-3">No headcount data</p>
        )}
      </div>

      <div className="bg-white p-5 rounded-2xl shadow">
        <h3 className="font-semibold">Leave Utilisation</h3>

        {leave?.values?.length > 0 ? (
          <Bar
            data={{
              labels: leave.labels,
              datasets: [
                {
                  label: "Leave %",
                  data: leave.values,
                  backgroundColor: "rgba(99,102,241,0.7)",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: true }, tooltip: { enabled: true } },
              scales: {
                y: { beginAtZero: true, max: 100 },
              },
            }}
          />
        ) : (
          <p className="text-gray-400 text-sm mt-3">No leave data</p>
        )}
      </div>

    </div>
  );
}