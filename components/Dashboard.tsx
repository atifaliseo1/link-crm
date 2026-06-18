import React from "react";
import { useCrmStore } from "@/store/useCrmStore";
import {
  TrendingUp,
  DollarSign,
  Globe,
  Award,
  ShoppingCart,
  Send,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const { sites, orders, outreach, setTab } = useCrmStore();

  // Statistics calculations
  const totalSites = sites.length;
  const activeSites = sites.filter((s) => s.status === "Active").length;
  const liveOrders = orders.filter((o) => o.status === "Live");
  const pendingOrders = orders.filter((o) => o.status !== "Live" && o.status !== "Cancelled");
  
  const totalSpend = orders.reduce((sum, o) => sum + (o.status !== "Cancelled" ? o.cost : 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "Cancelled" ? o.retail : 0), 0);
  const grossProfit = totalRevenue - totalSpend;
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0";

  const avgDA = totalSites > 0 ? Math.round(sites.reduce((sum, s) => sum + s.da, 0) / totalSites) : 0;
  const avgTraffic = totalSites > 0 ? Math.round(sites.reduce((sum, s) => sum + s.traffic, 0) / totalSites) : 0;

  const formatTraffic = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return num;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">CRM Dashboard</h2>
        <p className="text-slate-500 mt-1">Real-time metrics for link inventory, publisher communication, and sales pipeline.</p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Profit Margin */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Profit / ROI</p>
            <h3 className="text-2xl font-bold text-slate-800">${grossProfit.toLocaleString()}</h3>
            <p className="text-xs text-emerald-600 font-medium">{profitMargin}% Avg Margin</p>
          </div>
        </div>

        {/* KPI 2: Site Count */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Site Inventory</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalSites} Domains</h3>
            <p className="text-xs text-indigo-600 font-medium">{activeSites} Active & Verified</p>
          </div>
        </div>

        {/* KPI 3: Financial Spend/Revenue */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales (Retail)</p>
            <h3 className="text-2xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-slate-500">Cost Basis: ${totalSpend.toLocaleString()}</p>
          </div>
        </div>

        {/* KPI 4: Averages */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-rose-100 p-3 rounded-lg text-rose-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average DA & Traffic</p>
            <h3 className="text-2xl font-bold text-slate-800">DA {avgDA}</h3>
            <p className="text-xs text-rose-600 font-medium">{formatTraffic(avgTraffic)} Monthly Traffic</p>
          </div>
        </div>
      </div>

      {/* Orders and Outreach Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Order Pipeline Progress */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h4 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
              <ShoppingCart size={18} className="text-indigo-600" />
              <span>Order Pipeline Status</span>
            </h4>
            <button
              onClick={() => setTab("orders")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View Pipeline
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Pending */}
            <div className="bg-slate-50 p-4 rounded-lg text-center space-y-1">
              <Clock size={18} className="mx-auto text-amber-500" />
              <p className="text-2xl font-bold text-slate-800">
                {orders.filter((o) => o.status === "Pending").length}
              </p>
              <p className="text-xs text-slate-500 font-medium">Pending</p>
            </div>
            {/* Writing */}
            <div className="bg-slate-50 p-4 rounded-lg text-center space-y-1">
              <Clock size={18} className="mx-auto text-blue-500 animate-pulse" />
              <p className="text-2xl font-bold text-slate-800">
                {orders.filter((o) => o.status === "Writing").length}
              </p>
              <p className="text-xs text-slate-500 font-medium">In Writing</p>
            </div>
            {/* Submitted */}
            <div className="bg-slate-50 p-4 rounded-lg text-center space-y-1">
              <Send size={18} className="mx-auto text-indigo-500" />
              <p className="text-2xl font-bold text-slate-800">
                {orders.filter((o) => o.status === "Submitted").length}
              </p>
              <p className="text-xs text-slate-500 font-medium">Submitted</p>
            </div>
            {/* Live */}
            <div className="bg-slate-50 p-4 rounded-lg text-center space-y-1">
              <CheckCircle2 size={18} className="mx-auto text-emerald-500" />
              <p className="text-2xl font-bold text-slate-800">
                {liveOrders.length}
              </p>
              <p className="text-xs text-slate-500 font-medium">Live & Published</p>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="space-y-3 pt-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Orders</h5>
            {orders.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No orders logged yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-slate-700">{order.articleTitle || "Untitled Placement"}</p>
                      <p className="text-xs text-slate-400">
                        {order.siteName} &bull; Client: {order.clientName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "Live"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.status === "Cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">${order.retail} Retail</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Outreach status & Quick inventory info */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h4 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
              <Send size={18} className="text-emerald-600" />
              <span>Outreach Status</span>
            </h4>
            <button
              onClick={() => setTab("outreach")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Outreach Log
            </button>
          </div>

          <div className="space-y-4">
            {["Sent", "Negotiating", "Followed Up", "Approved", "Rejected"].map((status) => {
              const count = outreach.filter((item) => item.status === status).length;
              return (
                <div key={status} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">{status}</span>
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === "Approved"
                            ? "bg-emerald-500"
                            : status === "Rejected"
                            ? "bg-rose-500"
                            : "bg-indigo-500"
                        }`}
                        style={{
                          width: `${outreach.length > 0 ? (count / outreach.length) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                    <span className="font-semibold text-slate-700 w-4 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Distribution</h4>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-xs text-slate-500">Categories</p>
                <p className="text-lg font-bold text-slate-700">
                  {Array.from(new Set(sites.map((s) => s.category))).length} Niches
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Global Reach</p>
                <p className="text-lg font-bold text-slate-700">
                  {Array.from(new Set(sites.map((s) => s.countryTraffic))).length} Regions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
