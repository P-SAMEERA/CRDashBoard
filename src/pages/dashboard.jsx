import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* -------------------- FIXED CARD ORDER -------------------- */

const CARD_ORDER = [
  "RSCP",
  "RVHD",
  "PPMS",
  "RNQC",
  "SC2",
  "R-SYSTEM",
  "OTHERS",
  "TOTAL",
];

/* -------------------- COLORS -------------------- */

const SYSTEM_COLORS = {
  RSCP: { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-700" },
  RVHD: { bg: "bg-orange-100", border: "border-orange-500", text: "text-orange-700" },
  PPMS: { bg: "bg-purple-100", border: "border-purple-500", text: "text-purple-700" },
  RNQC: { bg: "bg-teal-100", border: "border-teal-500", text: "text-teal-700" },
  SC2: { bg: "bg-pink-100", border: "border-pink-500", text: "text-pink-700" },
  "R-SYSTEM": { bg: "bg-gray-200", border: "border-gray-500", text: "text-gray-700" },
  OTHERS: { bg: "bg-slate-200", border: "border-slate-500", text: "text-slate-700" },
  TOTAL: { bg: "bg-black", border: "border-yellow-400", text: "text-yellow-400" },
};

/* -------------------- DASHBOARD -------------------- */

const Dashboard = () => {
  const [cards, setCards] = useState([]);
  const [statusSummary, setStatusSummary] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
  const fetchStatusSummary = async () => {
    try {
      const res = await fetch("/api/getCrs");
      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      const allCRs = Object.values(data.systems || {})
        .flatMap((s) => s.crs || []);

      const counts = {};

      allCRs.forEach((cr) => {
        const status = cr.status || "Unknown";
        counts[status] = (counts[status] || 0) + 1;
      });

      setStatusSummary(counts);
    } catch (err) {
      console.error("Failed to load status summary", err);
      setStatusSummary({});
    }
  };

  fetchStatusSummary();
}, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetch("/api/getCrs");
        if (!res.ok) throw new Error("API failed");

        const data = await res.json();

        const normalize = (v) => v?.toString().trim().toUpperCase();

        const counts = {};
        let totalCRs = 0;

        Object.values(data.systems || {}).forEach((system) => {
          (system.crs || []).forEach((cr) => {
            let app = normalize(cr.application);

            // ✅ NORMALIZATION RULES (IMPORTANT)
            if (app === "SC") app = "SC2";
            if (app === "RSYSTEM") app = "R-SYSTEM";

            counts[app] = (counts[app] || 0) + 1;
            totalCRs++;
          });
        });

        const finalCards = CARD_ORDER.map((key) => {
          if (key === "TOTAL") {
            return { label: "TOTAL", value: totalCRs, clickable: false };
          }
          return {
            label: key,
            value: counts[key] || 0,
            clickable: true,
          };
        });

        setCards(finalCards);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      }
    };

    loadDashboard();
  }, []);

  const handleCardClick = (system) => {
    navigate(`/system/${system}`);
  };

  return (
    <div className="flex flex-col w-screen min-h-screen bg-[#2E2E2E]">
      {/* Header */}
      <div className="flex w-full h-14 bg-blue-600 justify-center items-center shadow-md">
        <h1 className="text-white text-xl font-bold">
          R-Systems Change Request Dashboard
        </h1>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-6xl mx-auto p-4">
        {cards.map((card) => {
          const color = SYSTEM_COLORS[card.label] || SYSTEM_COLORS.OTHERS;

          return (
            <div
              key={card.label}
              onClick={() => card.clickable && handleCardClick(card.label)}
              className={`flex flex-col items-center justify-center rounded-xl shadow-lg border-2
                transition-transform duration-300 ease-in-out
                ${card.clickable ? "hover:scale-105 hover:cursor-pointer" : "cursor-default"}
                ${color.bg} ${color.border} w-full h-40`}
            >
              <p className={`text-sm font-semibold uppercase tracking-wider ${color.text}`}>
                {card.label}
              </p>
              <p className={`text-4xl font-bold mt-2 ${color.text}`}>
                {card.value}
              </p>
              <p className="mt-1 text-xs text-gray-500">Total CRs</p>
            </div>
          );
        })}
      </div>
      {/* Status Summary Table */}
<div className="max-w-4xl mx-auto mt-6 bg-[#1F1F1F] rounded-xl shadow-lg overflow-hidden">
  <table className="w-full text-sm">
    <thead className="bg-[#2A2A2A]">
      <tr className="text-gray-300">
        <th className="p-3 text-left">Status</th>
        <th className="p-3 text-right">Count</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(statusSummary).map(([status, count]) => (
        <tr
          key={status}
          className="border-t border-gray-700 hover:bg-[#2B2B2B]"
        >
          <td className="p-3">{status}</td>
          <td className="p-3 text-right font-semibold">{count}</td>
        </tr>
      ))}

      {Object.keys(statusSummary).length === 0 && (
        <tr>
          <td colSpan="2" className="p-4 text-center text-gray-400">
            No status data available
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

    </div>
  );
};

export default Dashboard;
