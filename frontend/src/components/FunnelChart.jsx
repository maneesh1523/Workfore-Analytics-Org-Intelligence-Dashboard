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

export default function FunnelChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow">
        <h3 className="font-semibold">Recruitment Funnel</h3>
        <p className="text-gray-400 text-sm mt-3">No funnel data</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <h3 className="font-semibold">Recruitment Funnel</h3>

      <Bar
        data={{
          labels: ["Applied", "Shortlisted", "Interviewed", "Offered", "Joined"],
          datasets: [
            {
              label: "Candidates",
              data,
              backgroundColor: [
                "rgba(59,130,246,0.8)",
                "rgba(99,102,241,0.8)",
                "rgba(16,185,129,0.8)",
                "rgba(245,158,11,0.8)",
                "rgba(239,68,68,0.8)",
              ],
            },
          ],
        }}
        options={{
          indexAxis: "y",
          responsive: true,
          plugins: { legend: { display: false }, tooltip: { enabled: true } },
          scales: { x: { beginAtZero: true } },
        }}
      />
    </div>
  );
}