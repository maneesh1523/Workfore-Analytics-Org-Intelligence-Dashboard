export default function AttritionTable({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow">
        <h3 className="font-semibold">Attrition Risk</h3>
        <p className="text-gray-400 text-sm mt-3">No attrition risk data available</p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.risk_score - a.risk_score);

  const getReason = (emp) => {
    if (emp.risk_score >= 0.7) return "High leave + low performance";
    if (emp.risk_score >= 0.4) return "Moderate risk";
    return "Stable";
  };

  const getBadgeClass = (level) => {
    if (level === "high") return "bg-red-100 text-red-700";
    if (level === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow overflow-x-auto">
      <h3 className="font-semibold mb-3">Attrition Risk</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-2 pr-4">Name</th>
            <th className="pb-2 pr-4">Department</th>
            <th className="pb-2 pr-4">Tenure</th>
            <th className="pb-2 pr-4">Score</th>
            <th className="pb-2 pr-4">Level</th>
            <th className="pb-2">Reason</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((emp) => (
            <tr key={emp.employee_id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-2 pr-4 font-medium">{emp.name}</td>
              <td className="py-2 pr-4 text-gray-500">{emp.department}</td>
              <td className="py-2 pr-4 text-gray-500">{emp.tenure_months}m</td>
              <td className="py-2 pr-4 font-mono">{emp.risk_score.toFixed(3)}</td>
              <td className="py-2 pr-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeClass(emp.risk_level)}`}>
                  {emp.risk_level}
                </span>
              </td>
              <td className="py-2 text-gray-500">{getReason(emp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}