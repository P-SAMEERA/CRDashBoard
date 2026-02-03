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
  "TKAP",
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
  TKAP: { bg: "bg-black", border: "border-yellow-400", text: "text-yellow-400" },
};

/* -------------------- DASHBOARD -------------------- */

const Dashboard = () => {
  const [cards, setCards] = useState([]);
  const [statusSummary, setStatusSummary] = useState({});
  const navigate = useNavigate();

  /* -------- STATUS SUMMARY -------- */

  useEffect(() => {
    const fetchStatusSummary = async () => {
      try {
        const res = await fetch("/api/getCrs");
        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        const allCRs = Object.values(data.systems || {}).flatMap(
          (s) => s.crs || []
        );

        const counts = {};
        allCRs.forEach((cr) => {
          const status = cr.status || "Unknown";
          counts[status] = (counts[status] || 0) + 1;
        });

        setStatusSummary(counts);
      } catch (err) {
        console.error("Failed to load status summary", err);
      }
    };

    fetchStatusSummary();
  }, []);

  /* -------- CARDS DATA -------- */

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
            if (app === "SC") app = "SC2";
            if (app === "RSYSTEM") app = "R-SYSTEM";

            counts[app] = (counts[app] || 0) + 1;
            totalCRs++;
          });
        });

        const finalCards = CARD_ORDER.map((key) =>
          key === "TKAP"
            ? { label: "TKAP", value: totalCRs, clickable: false }
            : { label: key, value: counts[key] || 0, clickable: true }
        );

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

  const totalCard = cards.find((c) => c.label === "TKAP");

  return (
    <div className="min-h-screen w-screen bg-[#2E2E2E] overflow-hidden flex flex-col">

      {/* Header */}
      <div className="flex h-14 bg-blue-600 justify-center items-center shadow-md shrink-0">
        <h1 className="text-white text-xl font-bold">
          R-Systems Change Request Dashboard
        </h1>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">

        {/* TOTAL CRs */}
        <div className="max-w-6xl mx-auto mt-5 px-4">
          <div
            className="flex items-center justify-between px-6 py-4 rounded-xl
                       bg-black border-2 border-yellow-400"
            style={{ boxShadow: "0 0 18px rgba(250,204,21,0.6)" }}
          >
            <p className="text-sm font-semibold text-yellow-300 tracking-widest">
              TOTAL CHANGE REQUESTS
            </p>
            <p className="text-4xl font-bold text-yellow-400">
              {totalCard?.value ?? 0}
            </p>
          </div>
        </div>

        {/* STATUS TABLE */}
        <div className="max-w-6xl mx-auto mt-6 px-4">
          <div className="bg-[#1F1F1F] rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-700">
              <h2 className="text-xs font-semibold tracking-widest text-white uppercase">
                CR Status Overview · All Systems
              </h2>
            </div>

            <table className="w-full table-fixed text-sm text-center">
              <thead className="bg-[#2A2A2A]">
                <tr>
                  <th className="p-3 text-left text-white w-32">Status</th>
                  {STATUS_ORDER.map((status) => (
                    <th key={status} className="p-3 text-white font-medium">
                      {status}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-700">
                  <td className="p-3 text-left text-white font-semibold">Count</td>
                  {STATUS_ORDER.map((status) => (
                    <td key={status} className="p-3">
                      <span
                        className="inline-flex items-center justify-center
                                   w-12 h-10 rounded-lg text-white font-bold
                                   bg-[#0B1220]"
                        style={{ boxShadow: "0 0 12px rgba(59,130,246,0.55)" }}
                      >
                        {statusSummary[status] || 0}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SYSTEM CARDS */}
        <div className="max-w-6xl mx-auto mt-6 px-4">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {cards
              .filter((c) => c.label !== "TKAP")
              .map((card) => {
                const color = SYSTEM_COLORS[card.label] || SYSTEM_COLORS.OTHERS;

                return (
                  <div
                    key={card.label}
                    onClick={() => card.clickable && handleCardClick(card.label)}
                    className={`aspect-square flex flex-col items-center justify-center
                                rounded-xl border-2 shadow-md
                                transition hover:scale-105 cursor-pointer
                                ${color.bg} ${color.border}`}
                    style={{ boxShadow: "0 0 12px rgba(59,130,246,0.45)" }}
                  >
                    <p className={`text-xs font-semibold tracking-wider ${color.text}`}>
                      {card.label === "OTHERS" ? "FINANCE" : card.label}
                    </p>
                    <p className={`text-2xl font-bold ${color.text}`}>
                      {card.value}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
