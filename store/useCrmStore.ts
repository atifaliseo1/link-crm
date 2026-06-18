import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SiteInventoryItem {
  id: string;
  siteName: string; // e.g. techcrunch.com
  da: number;       // Domain Authority
  traffic: number;  // Monthly Organic Traffic
  category: string; // e.g. Tech, SaaS, Finance
  countryTraffic: string; // e.g. US, UK, Global
  cost: number;     // Cost Price (USD)
  retail: number;   // Retail Price (USD)
  contactEmail: string;
  notes: string;
  status: "Active" | "Inactive" | "Blacklisted";
  createdAt: number;
}

export interface CrmOrder {
  id: string;
  siteId: string;
  siteName: string;
  clientName: string;
  targetUrl: string;
  anchorText: string;
  articleTitle: string;
  cost: number;
  retail: number;
  status: "Pending" | "Writing" | "Submitted" | "Live" | "Cancelled";
  liveUrl: string;
  notes: string;
  createdAt: number;
  publishedAt?: number;
}

export interface OutreachItem {
  id: string;
  siteName: string;
  contactName: string;
  email: string;
  status: "Sent" | "Negotiating" | "Followed Up" | "Approved" | "Rejected";
  lastContactDate: number;
  notes: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: "Client" | "Publisher" | "Writer";
  phone: string;
  company: string;
  notes: string;
}

export interface CrmStore {
  currentTab: string;
  sites: SiteInventoryItem[];
  orders: CrmOrder[];
  outreach: OutreachItem[];
  contacts: Contact[];

  // Actions
  setTab: (tab: string) => void;
  
  // Site Inventory Actions
  addSite: (site: Omit<SiteInventoryItem, "id" | "createdAt">) => void;
  updateSite: (id: string, site: Partial<SiteInventoryItem>) => void;
  deleteSite: (id: string) => void;
  bulkUploadSites: (sites: Omit<SiteInventoryItem, "id" | "createdAt">[]) => void;
  
  // Order Actions
  addOrder: (order: Omit<CrmOrder, "id" | "createdAt">) => void;
  updateOrder: (id: string, order: Partial<CrmOrder>) => void;
  deleteOrder: (id: string) => void;
  
  // Outreach Actions
  addOutreach: (item: Omit<OutreachItem, "id" | "lastContactDate">) => void;
  updateOutreach: (id: string, item: Partial<OutreachItem>) => void;
  deleteOutreach: (id: string) => void;

  // Contact Actions
  addContact: (contact: Omit<Contact, "id">) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Global Actions
  importBackup: (backup: {
    sites?: SiteInventoryItem[];
    orders?: CrmOrder[];
    outreach?: OutreachItem[];
    contacts?: Contact[];
  }) => void;
  resetAll: () => void;
  seedMockData: () => void;
}

const mockSites: SiteInventoryItem[] = [
  {
    id: "site-1",
    siteName: "techradar.com",
    da: 89,
    traffic: 1250000,
    category: "Tech",
    countryTraffic: "US",
    cost: 120,
    retail: 299,
    contactEmail: "editor@techradar.com",
    notes: "Requires high-quality technical content, minimum 1000 words.",
    status: "Active",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: "site-2",
    siteName: "financebuzz.com",
    da: 74,
    traffic: 680000,
    category: "Finance",
    countryTraffic: "US",
    cost: 85,
    retail: 199,
    contactEmail: "outreach@financebuzz.com",
    notes: "Quick turnaround, no casino links permitted.",
    status: "Active",
    createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
  },
  {
    id: "site-3",
    siteName: "healthline.com",
    da: 92,
    traffic: 4500000,
    category: "Health & Wellness",
    countryTraffic: "Global",
    cost: 350,
    retail: 799,
    contactEmail: "guestpost@healthline.com",
    notes: "Medical review mandatory for all health advice guest posts.",
    status: "Active",
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
  {
    id: "site-4",
    siteName: "travelpulse.com",
    da: 68,
    traffic: 340000,
    category: "Travel",
    countryTraffic: "UK",
    cost: 50,
    retail: 125,
    contactEmail: "press@travelpulse.com",
    notes: "Accepts travel and tourism-related placements only.",
    status: "Active",
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
  },
  {
    id: "site-5",
    siteName: "marketingprofs.com",
    da: 78,
    traffic: 820000,
    category: "Marketing",
    countryTraffic: "US",
    cost: 150,
    retail: 350,
    contactEmail: "editor@marketingprofs.com",
    notes: "Case studies and action-driven insights perform best.",
    status: "Active",
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  }
];

const mockOrders: CrmOrder[] = [
  {
    id: "order-1",
    siteId: "site-1",
    siteName: "techradar.com",
    clientName: "SaaSify Inc.",
    targetUrl: "https://saasify.io/blog/scaling-infra",
    anchorText: "scaling infrastructure",
    articleTitle: "5 Best Practices for Cloud Scaling in 2026",
    cost: 120,
    retail: 299,
    status: "Live",
    liveUrl: "https://techradar.com/news/best-practices-cloud-scaling-2026",
    notes: "Order processed successfully, link indexed.",
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    publishedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },
  {
    id: "order-2",
    siteId: "site-2",
    siteName: "financebuzz.com",
    clientName: "WealthFlow Ltd.",
    targetUrl: "https://wealthflow.co/retirement-planner",
    anchorText: "retirement savings calculator",
    articleTitle: "Maximizing Your Retirement Savings in Modern Times",
    cost: 85,
    retail: 199,
    status: "Writing",
    liveUrl: "",
    notes: "Writer is currently drafting the piece.",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "order-3",
    siteId: "site-5",
    siteName: "marketingprofs.com",
    clientName: "GrowthNinja Agency",
    targetUrl: "https://growthninja.agency/seo-audit",
    anchorText: "expert SEO audit services",
    articleTitle: "How to Build a Backlink Strategy from Scratch",
    cost: 150,
    retail: 350,
    status: "Submitted",
    liveUrl: "",
    notes: "Submitted to editor. Awaiting publication review.",
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  }
];

const mockOutreach: OutreachItem[] = [
  {
    id: "out-1",
    siteName: "readwrite.com",
    contactName: "Sarah Connor",
    email: "sarah@readwrite.com",
    status: "Negotiating",
    lastContactDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    notes: "Quoted $180, we countered with $140. Awaiting response.",
  },
  {
    id: "out-2",
    siteName: "venturebeat.com",
    contactName: "John Doe",
    email: "john@venturebeat.com",
    status: "Sent",
    lastContactDate: Date.now() - 4 * 24 * 60 * 60 * 1000,
    notes: "Initial outreach sent pitching AI topics.",
  }
];

const mockContacts: Contact[] = [
  {
    id: "con-1",
    name: "Michael Scott",
    email: "michael@saasify.io",
    role: "Client",
    phone: "+1-555-0199",
    company: "SaaSify Inc.",
    notes: "Bulk buyer. Focuses heavily on high DA tech sites.",
  },
  {
    id: "con-2",
    name: "Sarah Connor",
    email: "sarah@readwrite.com",
    role: "Publisher",
    phone: "",
    company: "ReadWrite Media",
    notes: "Editor contact for Tech/SaaS blogs.",
  },
  {
    id: "con-3",
    name: "Emma Watson",
    email: "emma.writer@gmail.com",
    role: "Writer",
    phone: "+44-7911-123456",
    company: "Freelance",
    notes: "Excellent tech and marketing copywriter. Rate: $0.05/word.",
  }
];

export const useCrmStore = create<CrmStore>()(
  persist(
    (set) => ({
      currentTab: "dashboard",
      sites: mockSites,
      orders: mockOrders,
      outreach: mockOutreach,
      contacts: mockContacts,

      setTab: (tab) => set({ currentTab: tab }),

      // Sites
      addSite: (site) =>
        set((state) => ({
          sites: [
            ...state.sites,
            { ...site, id: `site-${Date.now()}`, createdAt: Date.now() },
          ],
        })),
      updateSite: (id, updatedSite) =>
        set((state) => ({
          sites: state.sites.map((s) => (s.id === id ? { ...s, ...updatedSite } : s)),
        })),
      deleteSite: (id) =>
        set((state) => ({
          sites: state.sites.filter((s) => s.id !== id),
        })),
      bulkUploadSites: (newSites) =>
        set((state) => {
          const formatted = newSites.map((site, index) => ({
            ...site,
            id: `site-${Date.now()}-${index}`,
            createdAt: Date.now(),
          }));
          return { sites: [...state.sites, ...formatted] };
        }),

      // Orders
      addOrder: (order) =>
        set((state) => ({
          orders: [
            ...state.orders,
            { ...order, id: `order-${Date.now()}`, createdAt: Date.now() },
          ],
        })),
      updateOrder: (id, updatedOrder) =>
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id === id) {
              const res = { ...o, ...updatedOrder };
              if (updatedOrder.status === "Live" && o.status !== "Live") {
                res.publishedAt = Date.now();
              }
              return res;
            }
            return o;
          }),
        })),
      deleteOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        })),

      // Outreach
      addOutreach: (item) =>
        set((state) => ({
          outreach: [
            ...state.outreach,
            { ...item, id: `out-${Date.now()}`, lastContactDate: Date.now() },
          ],
        })),
      updateOutreach: (id, updatedItem) =>
        set((state) => ({
          outreach: state.outreach.map((o) =>
            o.id === id ? { ...o, ...updatedItem, lastContactDate: Date.now() } : o
          ),
        })),
      deleteOutreach: (id) =>
        set((state) => ({
          outreach: state.outreach.filter((o) => o.id !== id),
        })),

      // Contacts
      addContact: (contact) =>
        set((state) => ({
          contacts: [...state.contacts, { ...contact, id: `con-${Date.now()}` }],
        })),
      updateContact: (id, updatedContact) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updatedContact } : c
          ),
        })),
      deleteContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),

      // Backups & Admin
      importBackup: (backup) =>
        set((state) => ({
          sites: backup.sites || state.sites,
          orders: backup.orders || state.orders,
          outreach: backup.outreach || state.outreach,
          contacts: backup.contacts || state.contacts,
        })),
      resetAll: () =>
        set({
          sites: [],
          orders: [],
          outreach: [],
          contacts: [],
        }),
      seedMockData: () =>
        set({
          sites: mockSites,
          orders: mockOrders,
          outreach: mockOutreach,
          contacts: mockContacts,
        }),
    }),
    {
      name: "guest-posting-crm-storage",
    }
  )
);
