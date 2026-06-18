import React, { useState } from "react";
import { useCrmStore, OutreachItem } from "@/store/useCrmStore";
import { Plus, Mail, Trash2, Edit, X, Search, Calendar } from "lucide-react";

export default function OutreachTracker() {
  const { outreach, addOutreach, updateOutreach, deleteOutreach } = useCrmStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [newOutreach, setNewOutreach] = useState<{
    siteName: string;
    contactName: string;
    email: string;
    status: OutreachItem["status"];
    notes: string;
  }>({
    siteName: "",
    contactName: "",
    email: "",
    status: "Sent",
    notes: ""
  });

  const [editOutreach, setEditOutreach] = useState<{
    siteName: string;
    contactName: string;
    email: string;
    status: OutreachItem["status"];
    notes: string;
  }>({
    siteName: "",
    contactName: "",
    email: "",
    status: "Sent",
    notes: ""
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutreach.siteName) return;

    addOutreach(newOutreach);
    setIsAddOpen(false);
    setNewOutreach({
      siteName: "",
      contactName: "",
      email: "",
      status: "Sent",
      notes: ""
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOutreach(editingId, editOutreach);
    setIsEditOpen(false);
  };

  const openEditModal = (item: OutreachItem) => {
    setEditingId(item.id);
    setEditOutreach({
      siteName: item.siteName,
      contactName: item.contactName,
      email: item.email,
      status: item.status,
      notes: item.notes,
    });
    setIsEditOpen(true);
  };

  const filteredOutreach = outreach.filter((item) => {
    const matchSearch =
      item.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "All" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: OutreachItem["status"]) => {
    switch (status) {
      case "Sent":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Negotiating":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Followed Up":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Rejected":
        return "bg-rose-100 text-rose-800 border-rose-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Outreach Tracker</h2>
          <p className="text-slate-500 mt-1">Track emails, guest pitch status, and editor responses.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus size={16} />
          <span>New Outreach Pitch</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search outreach by domain, editor name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Sent">Sent</option>
            <option value="Negotiating">Negotiating</option>
            <option value="Followed Up">Followed Up</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Website Niche</th>
                <th className="px-6 py-4">Publisher Contact</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Last Contact Date</th>
                <th className="px-6 py-4">Outreach Notes / Log</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOutreach.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic bg-white">
                    No active outreach pitches cataloged.
                  </td>
                </tr>
              ) : (
                filteredOutreach.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.siteName}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium">{item.contactName || "Webmaster"}</div>
                      {item.email && (
                        <a href={`mailto:${item.email}`} className="text-xs text-indigo-500 hover:underline flex items-center gap-0.5 mt-0.5">
                          <Mail size={12} />
                          <span>{item.email}</span>
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{new Date(item.lastContactDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={item.notes}>
                      {item.notes || <span className="text-slate-300 italic">No notes</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete outreach log entry?")) {
                              deleteOutreach(item.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-md transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Log New Outreach</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Website URL / Domain Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mashable.com"
                  value={newOutreach.siteName}
                  onChange={(e) => setNewOutreach({ ...newOutreach, siteName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Editor / Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Editor"
                  value={newOutreach.contactName}
                  onChange={(e) => setNewOutreach({ ...newOutreach, contactName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Contact Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. content@domain.com"
                  value={newOutreach.email}
                  onChange={(e) => setNewOutreach({ ...newOutreach, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Pitch Status</label>
                <select
                  value={newOutreach.status}
                  onChange={(e) => setNewOutreach({ ...newOutreach, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="Sent">Sent</option>
                  <option value="Negotiating">Negotiating</option>
                  <option value="Followed Up">Followed Up</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Outreach Log / Notes</label>
                <textarea
                  placeholder="Details of the pitch, negotiations, cost quotes..."
                  value={newOutreach.notes}
                  onChange={(e) => setNewOutreach({ ...newOutreach, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition"
                >
                  Log Pitch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Update Outreach Entry</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Website URL / Domain Name *</label>
                <input
                  type="text"
                  required
                  value={editOutreach.siteName}
                  onChange={(e) => setEditOutreach({ ...editOutreach, siteName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Editor / Contact Person Name</label>
                <input
                  type="text"
                  value={editOutreach.contactName}
                  onChange={(e) => setEditOutreach({ ...editOutreach, contactName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Contact Email Address</label>
                <input
                  type="email"
                  value={editOutreach.email}
                  onChange={(e) => setEditOutreach({ ...editOutreach, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Pitch Status</label>
                <select
                  value={editOutreach.status}
                  onChange={(e) => setEditOutreach({ ...editOutreach, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="Sent">Sent</option>
                  <option value="Negotiating">Negotiating</option>
                  <option value="Followed Up">Followed Up</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Outreach Log / Notes</label>
                <textarea
                  value={editOutreach.notes}
                  onChange={(e) => setEditOutreach({ ...editOutreach, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
