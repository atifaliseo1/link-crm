import React, { useRef } from "react";
import { useCrmStore } from "@/store/useCrmStore";
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Server,
  Database,
  CloudLightning,
  ShieldCheck
} from "lucide-react";

export default function Settings() {
  const { sites, orders, outreach, contacts, importBackup, resetAll, seedMockData } = useCrmStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backup Export: creates a downloadable json file of all local state
  const handleExportBackup = () => {
    const backupData = {
      sites,
      orders,
      outreach,
      contacts,
      exportTimestamp: Date.now(),
      version: "1.0.0",
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `linkflow_crm_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Backup Import: reads client json backup file and restores it to zustand
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.sites || parsed.orders || parsed.outreach || parsed.contacts) {
          importBackup({
            sites: parsed.sites,
            orders: parsed.orders,
            outreach: parsed.outreach,
            contacts: parsed.contacts,
          });
          alert("Backup data restored successfully!");
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (
      confirm(
        "WARNING: This will delete ALL sites, orders, outreach logs, and contacts from your local workspace storage. Proceed?"
      )
    ) {
      resetAll();
      alert("Local database reset successfully.");
    }
  };

  const handleSeedData = () => {
    if (confirm("This will overwrite your current CRM dashboard data with premium dummy sample entries. Continue?")) {
      seedMockData();
      alert("Dummy metrics loaded!");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">CRM Settings</h2>
        <p className="text-slate-500 mt-1">Manage local databases, export backups, and view deployment instructions.</p>
      </div>

      {/* Database utilities */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database size={18} className="text-indigo-600" />
          <span>Local CRM Database Manager</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Storage Usage</h5>
            <ul className="text-xs text-slate-600 space-y-1 font-semibold">
              <li>&bull; Active Inventory Sites: {sites.length}</li>
              <li>&bull; Booked Placements: {orders.length}</li>
              <li>&bull; Outreach Logs: {outreach.length}</li>
              <li>&bull; CRM Contact Cards: {contacts.length}</li>
            </ul>
          </div>

          <div className="flex flex-col justify-center gap-2">
            <p className="text-xs text-slate-400 font-medium">
              Data is saved securely in your browser's <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">localStorage</code>. Clear your browser history with caution. Export regular backups to prevent loss.
            </p>
          </div>
        </div>

        {/* Action button panel */}
        <div className="flex flex-wrap gap-3 pt-2">
          {/* Export */}
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Download size={16} />
            <span>Export Database (.json)</span>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition"
          >
            <Upload size={16} />
            <span>Import Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />

          {/* Seed */}
          <button
            onClick={handleSeedData}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition"
          >
            <RefreshCw size={16} />
            <span>Load Demo Data</span>
          </button>

          {/* Wipe */}
          <button
            onClick={handleFactoryReset}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-semibold transition border border-rose-100"
          >
            <Trash2 size={16} />
            <span>Wipe Local Data</span>
          </button>
        </div>
      </div>

      {/* Free Hosting and Deployment Guide */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
          <CloudLightning size={18} className="text-amber-500" />
          <span>Free Hosting & Online Deployment Guide</span>
        </h4>

        <div className="space-y-4 text-sm text-slate-600">
          <p className="leading-relaxed">
            Because this application uses a <strong>fully client-side storage model</strong>, it does not require a backend server or a paid database subscription (such as PostgreSQL or MongoDB) to operate. You can publish this app live to the internet for free using any of these premium modern hosting environments:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Option A: Vercel */}
            <div className="border border-slate-150 p-5 rounded-xl space-y-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="bg-black text-white font-bold p-1 px-2.5 rounded text-xs">Vercel</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Recommended</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The fastest way to publish Next.js projects online. Free SSL, custom domain mapping, and automatic builds on commit.
              </p>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4 font-semibold">
                <li>Upload this project directory to a private GitHub repository.</li>
                <li>Sign up for a free Hobby account on <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">vercel.com</a>.</li>
                <li>Click <strong>Add New Project</strong> and import your GitHub repository.</li>
                <li>Leave build settings as default and click <strong>Deploy</strong>. It is live in under 2 minutes!</li>
              </ol>
            </div>

            {/* Option B: Netlify */}
            <div className="border border-slate-150 p-5 rounded-xl space-y-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-900 text-cyan-400 font-bold p-1 px-2.5 rounded text-xs">Netlify</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Another fantastic platform for deploying modern static and serverless web interfaces with full continuous integration.
              </p>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4 font-semibold">
                <li>Create a free developer account at <a href="https://netlify.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">netlify.com</a>.</li>
                <li>Connect your GitHub account or download the built directory.</li>
                <li>Under sites, click <strong>Import from Git</strong> and choose this repository.</li>
                <li>Set the build command to <code className="bg-slate-100 px-1 py-0.5 rounded">npm run build</code> and publish directory to <code className="bg-slate-100 px-1 py-0.5 rounded">.next</code> (or export if building statically).</li>
                <li>Your site will be hosted on a subdomain like <code className="text-slate-400">your-crm.netlify.app</code>.</li>
              </ol>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3 mt-4 text-emerald-950 text-xs leading-relaxed">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Security & Portability Advantage</p>
              <p className="mt-0.5 font-medium">
                Your data is stored 100% locally. None of your clients, target sites, cost prices, or live backlink order logs are sent to external databases or servers. To use this CRM across multiple devices, simply click <strong>Export Database</strong> on your primary device, and click <strong>Import Backup</strong> on the other device!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
