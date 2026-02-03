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
    const res = await fetch("/api/getCrs");
    const data = await res.json();

    const allCRs = Object.values(data.systems || {}).flatMap(
      (s) => s.crs || []
    );

    let filtered = [];

    if (system === "NEW") {
      setCrs([]);
      return;
    }

    if (system === "SC2") {
      filtered = allCRs.filter(
        (cr) => ["SC", "SC2"].includes(normalize(cr.application))
      );
    } else if (system === "R-SYSTEM") {
      filtered = allCRs.filter(
        (cr) => normalize(cr.application) === "R-SYSTEM"
      );
    } else if (system === "OTHERS") {
      filtered = allCRs.filter(
        (cr) => normalize(cr.application) === "OTHERS"
      );
    } else {
      filtered = allCRs.filter(
        (cr) => normalize(cr.application) === normalize(system)
      );
    }

    setCrs(filtered);
  }, [system]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------------- ADD / EDIT ---------------- */

  const openAdd = () => {
    setEditMode(false);
    setForm({
      ...emptyCR,
      application: system === "NEW" ? "" : system,
    });
    setShowModal(true);
  };

  const openEdit = (cr) => {
    setEditMode(true);
    setForm(cr);
    setShowModal(true);
  };

  const saveCR = async () => {
    const url = editMode ? "/api/updateCrs" : "/api/addCrs";
    const payload = editMode
      ? { crId: form.crId, updates: form }
      : form;

    await fetch(url, {
      method: editMode ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setShowModal(false);
    await loadData();
  };

  const deleteCR = async (crId) => {
    await fetch("/api/deleteCrs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crId }),
    });
    await loadData();
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#2E2E2E] p-6 text-white">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">
          {system === "NEW" ? "Add New Application" : system}
        </h1>

        <div className="flex gap-2">
          <button
            onClick={openAdd}
            className="bg-green-600 px-4 py-2 rounded"
          >
            + Add CR
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-700 px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm border border-gray-700">
        <thead className="bg-[#2A2A2A]">
          <tr>
            <th className="p-2">CR ID</th>
            <th className="p-2">Title</th>
            <th className="p-2">Owner</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {crs.map((cr) => (
            <tr key={cr.crId} className="border-t border-gray-700">
              <td className="p-2">{cr.crId}</td>
              <td className="p-2">{cr.title}</td>
              <td className="p-2">{cr.owner}</td>
              <td className="p-2">{cr.status}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => openEdit(cr)}
                  className="text-yellow-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCR(cr.crId)}
                  className="text-red-400"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {crs.length === 0 && (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-400">
                No CRs yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#1F1F1F] p-6 rounded-xl w-96">
            <input
              placeholder="CR ID"
              value={form.crId}
              disabled={editMode}
              onChange={(e) => setForm({ ...form, crId: e.target.value })}
              className="w-full mb-2 p-2 bg-gray-900"
            />
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mb-2 p-2 bg-gray-900"
            />
            <input
              placeholder="Application"
              value={form.application}
              onChange={(e) =>
                setForm({ ...form, application: e.target.value })
              }
              className="w-full mb-4 p-2 bg-gray-900"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveCR}
                className="bg-green-600 px-4 py-2 rounded"
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
