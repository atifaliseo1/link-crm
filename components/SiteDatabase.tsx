import React, { useState } from "react";
import { useCrmStore, SiteInventoryItem } from "@/store/useCrmStore";
import {
  Search,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  X,
  Copy,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function SiteDatabase() {
  const { sites, addSite, updateSite, deleteSite, bulkUploadSites } = useCrmStore();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [minDA, setMinDA] = useState("");
  const [sortBy, setSortBy] = useState<keyof SiteInventoryItem>("da");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSite, setNewSite] = useState({
    siteName: "",
    da: 30,
    traffic: 10000,
    category: "",
    countryTraffic: "US",
    cost: 50,
    retail: 120,
    contactEmail: "",
    notes: "",
    status: "Active" as const
  });

  // Manual Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState("");
  const [editingSite, setEditingSite] = useState<Omit<SiteInventoryItem, "id" | "createdAt">>({
    siteName: "",
    da: 30,
    traffic: 10000,
    category: "",
    countryTraffic: "US",
    cost: 50,
    retail: 120,
    contactEmail: "",
    notes: "",
    status: "Active"
  });

  // Bulk Upload Modal State
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);

  // CSV template header schema
  const templateHeader = "Site Name,DA,Traffic,Category,Country Traffic,Cost,Retail,Contact Email,Notes";
  const templateSampleRow = "example.com,45,25000,Technology,US,60,150,editor@example.com,Prefers content-heavy topics";

  const handleSort = (field: keyof SiteInventoryItem) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const categories = Array.from(new Set(sites.map((s) => s.category))).filter(Boolean);
  const countries = Array.from(new Set(sites.map((s) => s.countryTraffic))).filter(Boolean);

  // Filter & Sort Logic
  const filteredSites = sites
    .filter((site) => {
      const matchSearch =
        site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "All" || site.category === categoryFilter;
      const matchCountry = countryFilter === "All" || site.countryTraffic === countryFilter;
      const matchStatus = statusFilter === "All" || site.status === statusFilter;
      const matchDA = !minDA || site.da >= parseInt(minDA);
      return matchSearch && matchCategory && matchCountry && matchStatus && matchDA;
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }

      return 0;
    });

  // Copy CSV template
  const copyTemplate = () => {
    navigator.clipboard.writeText(`${templateHeader}\n${templateSampleRow}`);
    alert("CSV template structure copied to clipboard!");
  };

  // Download CSV template file
  const downloadTemplateFile = () => {
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(`${templateHeader}\n${templateSampleRow}`);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", "linkflow_template.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Parse pasted/uploaded CSV content
  const handleParseCsv = (text: string) => {
    setBulkError("");
    setBulkPreview([]);
    if (!text.trim()) {
      setBulkError("CSV content is empty.");
      return;
    }

    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 2) {
      setBulkError("CSV must include a header row and at least one data row.");
      return;
    }

    // Parse header row
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const expectedHeaders = ["site name", "da", "traffic", "category", "country traffic", "cost", "retail"];

    // Make sure we have the required header fields
    const missing = expectedHeaders.filter((req) => !headers.some((h) => h.includes(req)));
    if (missing.length > 0) {
      setBulkError(`Missing required columns: ${missing.join(", ")}`);
      return;
    }

    const parsedItems: any[] = [];
    const indexMap = {
      siteName: headers.findIndex((h) => h.includes("site name")),
      da: headers.findIndex((h) => h.includes("da")),
      traffic: headers.findIndex((h) => h.includes("traffic")),
      category: headers.findIndex((h) => h.includes("category")),
      countryTraffic: headers.findIndex((h) => h.includes("country traffic")),
      cost: headers.findIndex((h) => h.includes("cost")),
      retail: headers.findIndex((h) => h.includes("retail")),
      contactEmail: headers.findIndex((h) => h.includes("email")),
      notes: headers.findIndex((h) => h.includes("note")),
    };

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < expectedHeaders.length) continue;

      const item = {
        siteName: cols[indexMap.siteName] || "",
        da: parseInt(cols[indexMap.da]) || 0,
        traffic: parseInt(cols[indexMap.traffic]) || 0,
        category: cols[indexMap.category] || "General",
        countryTraffic: cols[indexMap.countryTraffic] || "Global",
        cost: parseFloat(cols[indexMap.cost]) || 0,
        retail: parseFloat(cols[indexMap.retail]) || 0,
        contactEmail: indexMap.contactEmail >= 0 ? cols[indexMap.contactEmail] || "" : "",
        notes: indexMap.notes >= 0 ? cols[indexMap.notes] || "" : "",
        status: "Active" as const,
      };

      if (!item.siteName) {
        setBulkError(`Row ${i + 1} has an empty Site Name.`);
        return;
      }
      parsedItems.push(item);
    }

    setBulkPreview(parsedItems);
  };

  const handleBulkSubmit = () => {
    if (bulkPreview.length === 0) return;
    bulkUploadSites(bulkPreview);
    setIsBulkOpen(false);
    setBulkCsvText("");
    setBulkPreview([]);
    alert(`Successfully uploaded ${bulkPreview.length} sites!`);
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.siteName) return;
    addSite(newSite);
    setIsAddModalOpen(false);
    setNewSite({
      siteName: "",
      da: 30,
      traffic: 10000,
      category: "",
      countryTraffic: "US",
      cost: 50,
      retail: 120,
      contactEmail: "",
      notes: "",
      status: "Active"
    });
  };

  const handleManualEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite.siteName) return;
    updateSite(editingSiteId, editingSite);
    setIsEditModalOpen(false);
  };

  const openEditModal = (site: SiteInventoryItem) => {
    setEditingSiteId(site.id);
    setEditingSite({
      siteName: site.siteName,
      da: site.da,
      traffic: site.traffic,
      category: site.category,
      countryTraffic: site.countryTraffic,
      cost: site.cost,
      retail: site.retail,
      contactEmail: site.contactEmail,
      notes: site.notes,
      status: site.status,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* DB Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Site Inventory</h2>
          <p className="text-slate-500 mt-1">Manage and filter guest posting domain database.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition"
          >
            <Upload size={16} />
            <span>Bulk Upload CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus size={16} />
            <span>Add Single Site</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by site URL or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Niche */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Min DA */}
        <div>
          <input
            type="number"
            placeholder="Min Domain Authority (DA)"
            value={minDA}
            onChange={(e) => setMinDA(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                <th onClick={() => handleSort("siteName")} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none">
                  <div className="flex items-center gap-1">
                    <span>Site URL</span>
                    {sortBy === "siteName" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort("da")} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span>DA</span>
                    {sortBy === "da" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort("traffic")} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>Traffic</span>
                    {sortBy === "traffic" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort("category")} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none">
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    {sortBy === "category" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="px-6 py-4">Country</th>
                <th onClick={() => handleSort("cost")} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost</span>
                    {sortBy === "cost" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort("retail")} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span>Retail</span>
                    {sortBy === "retail" && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Margin</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSites.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-slate-400 italic bg-white">
                    No domains found matching search query and filters.
                  </td>
                </tr>
              ) : (
                filteredSites.map((site) => {
                  const margin = site.retail - site.cost;
                  const marginPercent = site.retail > 0 ? Math.round((margin / site.retail) * 100) : 0;
                  return (
                    <tr key={site.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <a
                          href={`https://${site.siteName}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-indigo-600 underline decoration-indigo-200 underline-offset-4"
                        >
                          {site.siteName}
                        </a>
                        {site.notes && (
                          <p className="text-xs font-normal text-slate-400 truncate max-w-xs mt-0.5" title={site.notes}>
                            {site.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center font-bold bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-md">
                          {site.da}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">
                        {site.traffic >= 1000000
                          ? (site.traffic / 1000000).toFixed(1) + "M"
                          : site.traffic.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {site.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">{site.countryTraffic}</td>
                      <td className="px-6 py-4 text-right font-semibold text-rose-500">${site.cost}</td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">${site.retail}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-800">${margin}</span>
                        <span className="block text-[10px] text-slate-400 font-medium">{marginPercent}% margin</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            site.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : site.status === "Blacklisted"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {site.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(site)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md transition"
                            title="Edit Site Details"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${site.siteName}?`)) {
                                deleteSite(site.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-md transition"
                            title="Delete Domain"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <FileSpreadsheet className="text-indigo-600" size={20} />
                <span>Bulk CSV Upload</span>
              </h3>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-950 text-xs leading-relaxed space-y-2">
                <p className="font-semibold">CSV Column Requirements (Exact Order Not Required):</p>
                <p>Ensure your CSV headers match: <code className="bg-indigo-100/80 px-1 py-0.5 rounded font-mono font-bold">Site Name, DA, Traffic, Category, Country Traffic, Cost, Retail</code>. Optionals: <code className="bg-indigo-100/80 px-1 py-0.5 rounded font-mono font-bold">Email, Notes</code>.</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={copyTemplate}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-indigo-600 font-semibold border border-indigo-200 rounded"
                  >
                    <Copy size={12} />
                    Copy Template
                  </button>
                  <button
                    onClick={downloadTemplateFile}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-indigo-600 font-semibold border border-indigo-200 rounded"
                  >
                    <Download size={12} />
                    Download CSV Template
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Paste CSV Plaintext</label>
                <textarea
                  placeholder="Paste CSV contents here..."
                  rows={6}
                  value={bulkCsvText}
                  onChange={(e) => {
                    setBulkCsvText(e.target.value);
                    handleParseCsv(e.target.value);
                  }}
                  className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                ></textarea>
              </div>

              {/* Or Select CSV File */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Or Upload CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const text = evt.target?.result as string;
                        setBulkCsvText(text);
                        handleParseCsv(text);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {/* Error Warning */}
              {bulkError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{bulkError}</span>
                </div>
              )}

              {/* Parse Preview */}
              {bulkPreview.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="text-emerald-500" size={14} />
                    <span>Parsed Preview ({bulkPreview.length} items found)</span>
                  </p>
                  <div className="border border-slate-100 rounded-lg max-h-36 overflow-y-auto text-xs divide-y divide-slate-100">
                    {bulkPreview.slice(0, 5).map((p, idx) => (
                      <div key={idx} className="p-2 flex justify-between text-slate-600 bg-slate-50/50">
                        <span>{p.siteName} (DA {p.da})</span>
                        <span>
                          {p.category} &bull; Cost: ${p.cost} / Retail: ${p.retail}
                        </span>
                      </div>
                    ))}
                    {bulkPreview.length > 5 && (
                      <div className="p-2 text-center text-slate-400 bg-slate-50 font-medium">
                        ...and {bulkPreview.length - 5} more items.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsBulkOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={bulkPreview.length === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition shadow-sm"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Add Domain to Inventory</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Domain URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hackernoon.com"
                    value={newSite.siteName}
                    onChange={(e) => setNewSite({ ...newSite, siteName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Domain Authority (DA) *</label>
                  <input
                    type="number"
                    required
                    value={newSite.da}
                    onChange={(e) => setNewSite({ ...newSite, da: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Monthly Traffic *</label>
                  <input
                    type="number"
                    required
                    value={newSite.traffic}
                    onChange={(e) => setNewSite({ ...newSite, traffic: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Category/Niche *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marketing, Tech"
                    value={newSite.category}
                    onChange={(e) => setNewSite({ ...newSite, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Country Traffic *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. US, UK, Global"
                    value={newSite.countryTraffic}
                    onChange={(e) => setNewSite({ ...newSite, countryTraffic: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Cost Price ($) *</label>
                  <input
                    type="number"
                    required
                    value={newSite.cost}
                    onChange={(e) => setNewSite({ ...newSite, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Retail Selling Price ($) *</label>
                  <input
                    type="number"
                    required
                    value={newSite.retail}
                    onChange={(e) => setNewSite({ ...newSite, retail: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Publisher Contact Email</label>
                  <input
                    type="email"
                    placeholder="editor@domain.com"
                    value={newSite.contactEmail}
                    onChange={(e) => setNewSite({ ...newSite, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Notes / Requirements</label>
                  <textarea
                    placeholder="Provide guest post requirements, word count rules..."
                    value={newSite.notes}
                    onChange={(e) => setNewSite({ ...newSite, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select
                    value={newSite.status}
                    onChange={(e) => setNewSite({ ...newSite, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition"
                >
                  Create Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Edit Domain Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualEditSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Domain URL *</label>
                  <input
                    type="text"
                    required
                    value={editingSite.siteName}
                    onChange={(e) => setEditingSite({ ...editingSite, siteName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Domain Authority (DA) *</label>
                  <input
                    type="number"
                    required
                    value={editingSite.da}
                    onChange={(e) => setEditingSite({ ...editingSite, da: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Monthly Traffic *</label>
                  <input
                    type="number"
                    required
                    value={editingSite.traffic}
                    onChange={(e) => setEditingSite({ ...editingSite, traffic: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Category/Niche *</label>
                  <input
                    type="text"
                    required
                    value={editingSite.category}
                    onChange={(e) => setEditingSite({ ...editingSite, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Country Traffic *</label>
                  <input
                    type="text"
                    required
                    value={editingSite.countryTraffic}
                    onChange={(e) => setEditingSite({ ...editingSite, countryTraffic: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Cost Price ($) *</label>
                  <input
                    type="number"
                    required
                    value={editingSite.cost}
                    onChange={(e) => setEditingSite({ ...editingSite, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Retail Selling Price ($) *</label>
                  <input
                    type="number"
                    required
                    value={editingSite.retail}
                    onChange={(e) => setEditingSite({ ...editingSite, retail: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Publisher Contact Email</label>
                  <input
                    type="email"
                    value={editingSite.contactEmail}
                    onChange={(e) => setEditingSite({ ...editingSite, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Notes / Requirements</label>
                  <textarea
                    value={editingSite.notes}
                    onChange={(e) => setEditingSite({ ...editingSite, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select
                    value={editingSite.status}
                    onChange={(e) => setEditingSite({ ...editingSite, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
