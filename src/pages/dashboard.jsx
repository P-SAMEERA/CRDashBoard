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
const STATUS_ORDER = [
  "In Progress",
  "Completed",
  "Not Started",
  "Waiting for Go-Live",
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
     {/* Status Overview – Transposed */}
<div className="max-w-6xl mx-auto mt-8 rounded-xl shadow-xl
                bg-[#1F1F1F] border border-gray-700">

  {/* Header */}
  <div className="px-5 py-3 border-b border-gray-700">
    <h2 className="text-sm font-semibold tracking-wider text-white uppercase">
      CR Status Overview · All Systems
    </h2>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-sm table-fixed text-center">
      <thead className="bg-[#2A2A2A]">
        <tr>
          <th className="p-4 text-left text-white w-32">Status</th>

          {STATUS_ORDER.map((status) => (
            <th
              key={status}
              className="p-4 text-white font-medium"
            >
              {status}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        <tr className="border-t border-gray-700">
          <td className="p-4 text-left text-white font-semibold">
            Count
          </td>

          {STATUS_ORDER.map((status) => {
            const count = statusSummary[status] || 0;

            return (
              <td
                key={status}
                className="p-4"
              >
                <span
                  className="inline-block min-w-[56px] px-4 py-2 rounded-lg
                             text-white text-lg font-bold bg-[#111827]"
                  style={{
                    boxShadow: "0 0 14px rgba(59,130,246,0.55)",
                  }}
                >
                  {count}
                </span>
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  </div>
</div>


    </div>
  );
};

export default Dashboard;
