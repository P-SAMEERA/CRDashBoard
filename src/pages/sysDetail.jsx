import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

/* -------------------- HELPERS -------------------- */

const emptyCR = {
  crId: "",
  title: "",
  application: "",
  owner: "",
  priority: "Medium",
  status: "Not Started",
  startDate: "",
  endDate: "",
};

const normalize = (v) => v?.toString().trim().toUpperCase();

/* -------------------- COMPONENT -------------------- */

const SystemDetail = () => {
  const { system } = useParams();
  const navigate = useNavigate();

  const [crs, setCrs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyCR);

  /* ---------------- LOAD DATA ---------------- */

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/getCrs");
      if (!res.ok) throw new Error("API ERROR");

      const data = await res.json();

      const allCRs = Object.values(data.systems || {})
        .flatMap((s) => s.crs || []);

      let filteredCRs = [];

      if (system === "SC2") {
        filteredCRs = allCRs.filter(
          (cr) =>
            normalize(cr.application) === "SC" ||
            normalize(cr.application) === "SC2"
        );
      } else if (system === "R-SYSTEM") {
        filteredCRs = allCRs.filter(
          (cr) => normalize(cr.application) === "R-SYSTEM"
        );
      } else if (system === "OTHERS") {
        filteredCRs = allCRs.filter(
          (cr) => normalize(cr.application) === "OTHERS"
        );
      } else {
        filteredCRs = allCRs.filter(
          (cr) => normalize(cr.application) === system
        );
      }

      setCrs(filteredCRs);
    } catch (err) {
      console.error("loadData failed:", err);
      setCrs([]);
    }
  }, [system]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------------- ADD / EDIT ---------------- */

  const openAdd = () => {
    setEditMode(false);
    setForm({ ...emptyCR, application: system });
    setShowModal(true);
  };

  const openEdit = (cr) => {
    setEditMode(true);
    setForm(cr);
    setShowModal(true);
  };

  const saveCR = async () => {
  if (!form.crId || !form.title || !form.owner) {
    alert("CR ID, Title and Owner are mandatory");
    return;
  }

  const url = editMode ? "/api/updateCrs" : "/api/addCrs";
  const method = editMode ? "PATCH" : "POST";

  const payload = editMode
    ? { crId: form.crId, updates: form }
    : form;

  try {
    // 1️⃣ SAVE FIRST
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Save failed");

    // 2️⃣ CLOSE MODAL
    setShowModal(false);

    // 3️⃣ NOW FETCH FRESH DATA (AFTER SAVE COMPLETES)
    await loadData();
  } catch (err) {
    console.error("Save CR failed:", err);
    alert("Failed to save CR");
  }
  window.location.reload();

};
  /* ---------------- DELETE ---------------- */

  const deleteCR = async (crId) => {
  if (!window.confirm("Delete this CR?")) return;

  try {
    // 1️⃣ DELETE FIRST
    const res = await fetch("/api/deleteCrs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crId }),
    });

    if (!res.ok) throw new Error("Delete failed");

    // 2️⃣ FETCH UPDATED DATA
    await loadData();
  } catch (err) {
    console.error("Delete CR failed:", err);
    alert("Failed to delete CR");
  }
  window.location.reload();

};

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#2E2E2E] p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold tracking-wide">
          {system} · Change Requests
        </h1>

        <div className="flex gap-3">
          <button
            onClick={openAdd}
            className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add CR
          </button>

          <button
            onClick={() => navigate("/")}
            className="bg-gray-700 hover:bg-gray-600 transition px-4 py-2 rounded-lg text-sm"
          >
            Back
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#1F1F1F] rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-[#2A2A2A] sticky top-0">
              <tr className="text-gray-300">
                <th className="p-3 text-left">CR ID</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Owner</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left w-36">Start</th>
                <th className="p-3 text-left w-36">End</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {crs.map((cr) => (
                <tr
                  key={cr.crId}
                  className="border-t border-gray-700 hover:bg-[#2B2B2B]"
                >
                  <td className="p-3 font-medium">{cr.crId}</td>
                  <td className="p-3">{cr.title}</td>
                  <td className="p-3">{cr.owner}</td>

                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-xs bg-blue-900 text-blue-300">
                      {cr.priority}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-xs bg-purple-900 text-purple-300">
                      {cr.status}
                    </span>
                  </td>

   <td className="p-3 text-gray-400 whitespace-nowrap w-36">
  {cr.startDate || "-"}
</td>

<td className="p-3 text-gray-400 whitespace-nowrap w-36">
  {cr.endDate || "-"}
</td>

                  <td className="p-3">
  <div className="flex gap-2">
    <button
      onClick={() => openEdit(cr)}
      className="px-2 py-1 rounded-md text-xs font-medium
                 bg-yellow-500/10 text-yellow-400
                 hover:bg-yellow-500/20 transition"
      title="Edit CR"
    >
      ✏️ Edit
    </button>

    <button
      onClick={() => deleteCR(cr.crId)}
      className="px-2 py-1 rounded-md text-xs font-medium
                 bg-red-500/10 text-red-400
                 hover:bg-red-500/20 transition"
      title="Delete CR"
    >
      🗑 Delete
    </button>
  </div>
</td>

                </tr>
              ))}

              {crs.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="p-6 text-center text-gray-400"
                  >
                    No CRs found for this system
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#1F1F1F] p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              {editMode ? "Edit CR" : "Add New CR"}
            </h2>

            {["crId", "title", "owner"].map((f) => (
              <input
                key={f}
                value={form[f]}
                disabled={editMode && f === "crId"}
                onChange={(e) =>
                  setForm({ ...form, [f]: e.target.value })
                }
                placeholder={f.toUpperCase()}
                className="w-full mb-2 p-2 rounded bg-gray-900 border border-gray-700"
              />
            ))}

            <label className="text-xs text-gray-400">Start Date</label>
            <input
              type="date"
              value={form.startDate || ""}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
              className="w-full mb-2 p-2 rounded bg-gray-900 border border-gray-700"
            />

            <label className="text-xs text-gray-400">End Date</label>
            <input
              type="date"
              min={form.startDate || undefined}
              value={form.endDate || ""}
              onChange={(e) =>
                setForm({ ...form, endDate: e.target.value })
              }
              className="w-full mb-3 p-2 rounded bg-gray-900 border border-gray-700"
            />

            <select
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value })
              }
              className="w-full mb-2 p-2 rounded bg-gray-900 border border-gray-700"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
              className="w-full mb-4 p-2 rounded bg-gray-900 border border-gray-700"
            >
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Waiting for Go-Live</option>
              <option>Completed</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm bg-gray-700 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
  type="button"
  onClick={saveCR}
  className="px-4 py-2 text-sm bg-green-600 rounded hover:bg-green-700"
>
  Save
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemDetail;
