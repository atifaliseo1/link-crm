"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useCrmStore } from "@/store/useCrmStore";

// Dynamically import components to disable SSR and prevent hydration mismatches with Zustand local storage persist
const Sidebar = dynamic(() => import("@/components/Sidebar"), { ssr: false });
const Dashboard = dynamic(() => import("@/components/Dashboard"), { ssr: false });
const SiteDatabase = dynamic(() => import("@/components/SiteDatabase"), { ssr: false });
const OrderPipeline = dynamic(() => import("@/components/OrderPipeline"), { ssr: false });
const OutreachTracker = dynamic(() => import("@/components/OutreachTracker"), { ssr: false });
const ContactsManager = dynamic(() => import("@/components/ContactsManager"), { ssr: false });
const Settings = dynamic(() => import("@/components/Settings"), { ssr: false });

export default function Home() {
  const { currentTab } = useCrmStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-semibold text-slate-500 tracking-tight animate-pulse">
          Loading LinkFlow CRM...
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <Dashboard />;
      case "database":
        return <SiteDatabase />;
      case "orders":
        return <OrderPipeline />;
      case "outreach":
        return <OutreachTracker />;
      case "contacts":
        return <ContactsManager />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Screen */}
      <main className="flex-1 overflow-y-auto px-10 py-8 max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>
    </div>
  );
}
