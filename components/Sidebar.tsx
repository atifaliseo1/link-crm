import React from "react";
import { useCrmStore } from "@/store/useCrmStore";
import {
  LayoutDashboard,
  Database,
  GitPullRequest,
  Mail,
  Users,
  Settings as SettingsIcon,
  Link2
} from "lucide-react";

export default function Sidebar() {
  const { currentTab, setTab } = useCrmStore();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "database", label: "Site Database", icon: Database },
    { id: "orders", label: "Order Pipeline", icon: GitPullRequest },
    { id: "outreach", label: "Outreach Tracker", icon: Mail },
    { id: "contacts", label: "Contacts", icon: Users },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <Link2 size={20} />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white">LinkFlow CRM</h1>
          <p className="text-xs text-slate-400">Backlink Manager</p>
        </div>
      </div>

      {/* Menu Options */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-semibold text-white">
            U
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">Admin User</p>
            <p className="text-[10px] text-slate-400">Free Tier Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
