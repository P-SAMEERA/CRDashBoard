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
  "ADD_APP",
];

/* -------------------- STATUS ORDER -------------------- */

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
  ADD_APP: {
    bg: "bg-[#0B1220]",
    border: "border-dashed border-blue-400",
    text: "text-blue-400",
  },
};

/* -------------------- DASHBOARD -------------------- */

const Dashboard = () => {
  const [cards, setCards] = useState([]);
  const [statusSummary, setStatusSummary] = useState({});
  const [totalCRs, setTotalCRs] = useState(0);

  const navigate = useNavigate();

  const normalize = (v) => v?.toString().trim().toUpperCase();

  /* -------- LOAD ALL DATA -------- */

  useEffect(() => {
    const loadDashboard = async () => {
      const res = await fetch("/api/getCrs");
      const data = await res.json();

      const allCRs = Object.values(data.systems || {}).flatMap(
        (s) => s.crs || []
      );

      const appCounts = {};
      const statusCounts = {};

      allCRs.forEach((cr) => {
        let app = normalize(cr.application);
        if (app === "SC") app = "SC2";
        if (app === "RSYSTEM") app = "R-SYSTEM";

        appCounts[app] = (appCounts[app] || 0) + 1;
        statusCounts[cr.status] = (statusCounts[cr.status] || 0) + 1;
      });

      setTotalCRs(allCRs.length);
      setStatusSummary(statusCounts);

      const finalCards = CARD_ORDER.map((key) => {
        if (key === "ADD_APP") {
          return { label: "ADD_APP", value: null };
        }
        return {
          label: key,
          value: appCounts[key] || 0,
        };
      });

      setCards(finalCards);
    };

    loadDashboard();
  }, []);

  /* -------- NAVIGATION -------- */

  const handleCardClick = (system) => {
    if (system === "ADD_APP") {
      navigate("/system/NEW");
      return;
    }
    navigate(`/system/${system}`);
  };

  return (
    <div className="min-h-screen bg-[#2E2E2E] text-white">

      {/* Header */}
      <div className="h-14 bg-blue-600 flex items-center justify-center shadow-md">
        <h1 className="text-xl font-bold">
          R-Systems Change Request Dashboard
        </h1>
      </div>

      {/* TOTAL CR */}
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <div
          className="flex justify-between items-center px-6 py-4 rounded-xl
                     bg-black border-2 border-yellow-400"
          style={{ boxShadow: "0 0 18px rgba(250,204,21,0.6)" }}
        >
          <span className="text-yellow-300 font-semibold tracking-wide">
            TOTAL CHANGE REQUESTS
          </span>
          <span className="text-4xl font-bold text-yellow-400">
            {totalCRs}
          </span>
        </div>
      </div>

      {/* STATUS TABLE */}
      <div className="max-w-6xl mx-auto mt-6 bg-[#1F1F1F] rounded-xl border border-gray-700">
        <div className="px-5 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            CR Status Overview · All Systems
          </h2>
        </div>

        <table className="w-full text-center text-sm">
          <thead className="bg-[#2A2A2A]">
            <tr>
              <th className="p-4 text-left">Status</th>
              {STATUS_ORDER.map((s) => (
                <th key={s} className="p-4">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-700">
              <td className="p-4 text-left font-semibold">Count</td>
              {STATUS_ORDER.map((s) => (
                <td key={s} className="p-4">
                  <span
                    className="inline-block px-4 py-2 rounded-lg
                               bg-[#111827] font-bold"
                    style={{ boxShadow: "0 0 12px rgba(59,130,246,0.6)" }}
                  >
                    {statusSummary[s] || 0}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* SYSTEM CARDS */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                   gap-4 max-w-6xl mx-auto mt-8 px-4 pb-10"
      >
        {cards.map((card) => {
          if (card.label === "ADD_APP") {
            return (
              <div
                key="ADD_APP"
                onClick={() => handleCardClick("ADD_APP")}
                className="h-28 rounded-xl border-2 border-dashed border-blue-400
                           flex flex-col items-center justify-center
                           text-blue-400 hover:bg-[#111827]
                           transition hover:scale-105 cursor-pointer"
              >
                <span className="text-3xl font-bold">＋</span>
                <span className="text-xs font-semibold tracking-widest">
                  ADD APPLICATION
                </span>
              </div>
            );
          }

          const color = SYSTEM_COLORS[card.label];

          return (
            <div
              key={card.label}
              onClick={() => handleCardClick(card.label)}
              className={`h-28 rounded-xl border-2
                          flex flex-col items-center justify-center
                          transition hover:scale-105 cursor-pointer
                          ${color.bg} ${color.border}`}
            >
              <span className={`text-xs font-semibold ${color.text}`}>
                {card.label === "OTHERS" ? "FINANCE" : card.label}
              </span>
              <span className={`text-2xl font-bold ${color.text}`}>
                {card.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
