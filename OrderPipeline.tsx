import React, { useState } from "react";
import { useCrmStore, CrmOrder } from "@/store/useCrmStore";
import {
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  Trash2,
  Edit,
  X,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function OrderPipeline() {
  const { orders, sites, addOrder, updateOrder, deleteOrder } = useCrmStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [newOrder, setNewOrder] = useState<{
    siteId: string;
    clientName: string;
    targetUrl: string;
    anchorText: string;
    articleTitle: string;
    notes: string;
    status: CrmOrder["status"];
    liveUrl: string;
  }>({
    siteId: "",
    clientName: "",
    targetUrl: "",
    anchorText: "",
    articleTitle: "",
    notes: "",
    status: "Pending",
    liveUrl: ""
  });

  const [editOrder, setEditOrder] = useState<{
    siteId: string;
    clientName: string;
    targetUrl: string;
    anchorText: string;
    articleTitle: string;
    notes: string;
    status: CrmOrder["status"];
    liveUrl: string;
  }>({
    siteId: "",
    clientName: "",
    targetUrl: "",
    anchorText: "",
    articleTitle: "",
    notes: "",
    status: "Pending",
    liveUrl: ""
  });

  // Calculate pricing based on chosen site
  const handleSiteSelect = (siteId: string, isEdit: boolean) => {
    const chosenSite = sites.find((s) => s.id === siteId);
    if (!chosenSite) return;

    if (isEdit) {
      setEditOrder((prev) => ({
        ...prev,
        siteId,
      }));
    } else {
      setNewOrder((prev) => ({
        ...prev,
        siteId,
      }));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenSite = sites.find((s) => s.id === newOrder.siteId);
    if (!chosenSite) {
      alert("Please select a valid site from the database.");
      return;
    }

    addOrder({
      siteId: newOrder.siteId,
      siteName: chosenSite.siteName,
      clientName: newOrder.clientName,
      targetUrl: newOrder.targetUrl,
      anchorText: newOrder.anchorText,
      articleTitle: newOrder.articleTitle,
      cost: chosenSite.cost,
      retail: chosenSite.retail,
      status: newOrder.status,
      liveUrl: newOrder.liveUrl,
      notes: newOrder.notes,
    });

    setIsAddOpen(false);
    setNewOrder({
      siteId: "",
      clientName: "",
      targetUrl: "",
      anchorText: "",
      articleTitle: "",
      notes: "",
      status: "Pending",
      liveUrl: ""
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenSite = sites.find((s) => s.id === editOrder.siteId);
    if (!chosenSite) return;

    updateOrder(editingId, {
      siteId: editOrder.siteId,
      siteName: chosenSite.siteName,
      clientName: editOrder.clientName,
      targetUrl: editOrder.targetUrl,
      anchorText: editOrder.anchorText,
      articleTitle: editOrder.articleTitle,
      cost: chosenSite.cost,
      retail: chosenSite.retail,
      status: editOrder.status,
      liveUrl: editOrder.liveUrl,
      notes: editOrder.notes,
    });

    setIsEditOpen(false);
  };

  const openEditModal = (order: CrmOrder) => {
    setEditingId(order.id);
    setEditOrder({
      siteId: order.siteId,
      clientName: order.clientName,
      targetUrl: order.targetUrl,
      anchorText: order.anchorText,
      articleTitle: order.articleTitle,
      notes: order.notes,
      status: order.status,
      liveUrl: order.liveUrl,
    });
    setIsEditOpen(true);
  };

  const statuses: CrmOrder["status"][] = ["Pending", "Writing", "Submitted", "Live", "Cancelled"];

  const getStatusStyle = (status: CrmOrder["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Writing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Submitted":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Live":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Order Pipeline</h2>
          <p className="text-slate-500 mt-1">Track guest post workflow from booking to live publishing.</p>
        </div>
        <button
          onClick={() => {
            if (sites.length === 0) {
              alert("You must add at least one site to your inventory database first before ordering!");
              return;
            }
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus size={16} />
          <span>Place New Order</span>
        </button>
      </div>

      {/* Pipeline Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {statuses.map((status) => {
          const statusOrders = orders.filter((o) => o.status === status);
          return (
            <div key={status} className="bg-slate-100/70 p-4 rounded-xl border border-slate-200/60 flex flex-col min-h-[500px]">
              {/* Header */}
              <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(status)}`}>
                  {status}
                </span>
                <span className="text-xs font-bold text-slate-400">{statusOrders.length}</span>
              </div>

              {/* Order Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                {statusOrders.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs italic">
                    No orders
                  </div>
                ) : (
                  statusOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow transition space-y-3 relative group"
                    >
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm truncate" title={order.articleTitle}>
                          {order.articleTitle || "TBD Article Title"}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {order.siteName} &bull; Client: {order.clientName}
                        </p>
                      </div>

                      {/* Anchor Text / Target */}
                      <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-600 font-medium space-y-1">
                        <p className="truncate">
                          <span className="text-slate-400">Anchor:</span> "{order.anchorText}"
                        </p>
                        <p className="truncate text-indigo-600 flex items-center gap-0.5 hover:underline">
                          <span className="text-slate-400">Target:</span>
                          <a href={order.targetUrl} target="_blank" rel="noreferrer">
                            {order.targetUrl.replace("https://", "").replace("www.", "")}
                          </a>
                        </p>
                      </div>

                      {/* Financial Info */}
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-500">Retail: ${order.retail}</span>
                        <span className="text-emerald-600">Margin: ${order.retail - order.cost}</span>
                      </div>

                      {/* Live Link Button */}
                      {order.status === "Live" && order.liveUrl && (
                        <a
                          href={order.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center gap-1 py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs rounded border border-emerald-200 transition font-semibold"
                        >
                          <span>Go to published article</span>
                          <ExternalLink size={12} />
                        </a>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2">
                        <button
                          onClick={() => openEditModal(order)}
                          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                        >
                          <Edit size={12} />
                          <span>Update</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this order?")) {
                              deleteOrder(order.id);
                            }
                          }}
                          className="text-xs font-semibold text-rose-400 hover:text-rose-600 flex items-center gap-0.5"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Order Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Book Backlink Placement</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Target Website Domain *</label>
                <select
                  required
                  value={newOrder.siteId}
                  onChange={(e) => handleSiteSelect(e.target.value, false)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select inventory site...</option>
                  {sites
                    .filter((s) => s.status === "Active")
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.siteName} (DA {s.da} &bull; Retail ${s.retail})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Client / Purchaser Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={newOrder.clientName}
                  onChange={(e) => setNewOrder({ ...newOrder, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Destination Target URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://client-site.com/landing-page"
                  value={newOrder.targetUrl}
                  onChange={(e) => setNewOrder({ ...newOrder, targetUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Anchor Text *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. best project software"
                  value={newOrder.anchorText}
                  onChange={(e) => setNewOrder({ ...newOrder, anchorText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Article Title / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. How SaaS scaling works"
                  value={newOrder.articleTitle}
                  onChange={(e) => setNewOrder({ ...newOrder, articleTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Workflow Status</label>
                <select
                  value={newOrder.status}
                  onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {newOrder.status === "Live" && (
                <div className="space-y-1 bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-emerald-800">Live URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://site.com/published-guest-post"
                    value={newOrder.liveUrl}
                    onChange={(e) => setNewOrder({ ...newOrder, liveUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Internal Order Notes</label>
                <textarea
                  placeholder="Special client notes, submission rules..."
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  rows={2}
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
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Update Order Settings</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Target Website Domain *</label>
                <select
                  required
                  value={editOrder.siteId}
                  onChange={(e) => handleSiteSelect(e.target.value, true)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.siteName} (DA {s.da} &bull; Retail ${s.retail})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Client / Purchaser Name *</label>
                <input
                  type="text"
                  required
                  value={editOrder.clientName}
                  onChange={(e) => setEditOrder({ ...editOrder, clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Destination Target URL *</label>
                <input
                  type="url"
                  required
                  value={editOrder.targetUrl}
                  onChange={(e) => setEditOrder({ ...editOrder, targetUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Anchor Text *</label>
                <input
                  type="text"
                  required
                  value={editOrder.anchorText}
                  onChange={(e) => setEditOrder({ ...editOrder, anchorText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Article Title / Topic</label>
                <input
                  type="text"
                  value={editOrder.articleTitle}
                  onChange={(e) => setEditOrder({ ...editOrder, articleTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Workflow Status</label>
                <select
                  value={editOrder.status}
                  onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {editOrder.status === "Live" && (
                <div className="space-y-1 bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                  <label className="text-xs font-semibold text-emerald-800">Live URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://site.com/published-guest-post"
                    value={editOrder.liveUrl}
                    onChange={(e) => setEditOrder({ ...editOrder, liveUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Internal Order Notes</label>
                <textarea
                  value={editOrder.notes}
                  onChange={(e) => setEditOrder({ ...editOrder, notes: e.target.value })}
                  rows={2}
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
