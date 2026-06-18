import React, { useState } from "react";
import { useCrmStore, Contact } from "@/store/useCrmStore";
import { Plus, Trash2, Edit, X, Search, Phone, Mail, Building } from "lucide-react";

export default function ContactsManager() {
  const { contacts, addContact, updateContact, deleteContact } = useCrmStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    role: "Client" as const,
    phone: "",
    company: "",
    notes: ""
  });

  const [editContact, setEditContact] = useState({
    name: "",
    email: "",
    role: "Client" as const,
    phone: "",
    company: "",
    notes: ""
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name) return;

    addContact(newContact);
    setIsAddOpen(false);
    setNewContact({
      name: "",
      email: "",
      role: "Client",
      phone: "",
      company: "",
      notes: ""
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContact(editingId, editContact);
    setIsEditOpen(false);
  };

  const openEditModal = (c: Contact) => {
    setEditingId(c.id);
    setEditContact({
      name: c.name,
      email: c.email,
      role: c.role,
      phone: c.phone,
      company: c.company,
      notes: c.notes,
    });
    setIsEditOpen(true);
  };

  const filteredContacts = contacts.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "All" || c.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getRoleStyle = (role: Contact["role"]) => {
    switch (role) {
      case "Client":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Publisher":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Writer":
        return "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">CRM Contacts</h2>
          <p className="text-slate-500 mt-1">Manage buyers (clients), sellers (publishers), and content creators.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus size={16} />
          <span>Add New Contact</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search contacts by name, email, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="All">All Roles</option>
            <option value="Client">Client (Buyer)</option>
            <option value="Publisher">Publisher (Seller)</option>
            <option value="Writer">Writer (Content)</option>
          </select>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center text-slate-400 italic">
            No contacts recorded. Click Add Contact to start.
          </div>
        ) : (
          filteredContacts.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{c.name}</h4>
                    {c.company && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building size={12} className="text-slate-400" />
                        <span>{c.company}</span>
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleStyle(c.role)}`}>
                    {c.role}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-slate-600 pt-2 border-t border-slate-50">
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <a href={`mailto:${c.email}`} className="hover:text-indigo-600 hover:underline">
                        {c.email}
                      </a>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                </div>

                {c.notes && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-500 mt-2 font-medium">
                    {c.notes}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => openEditModal(c)}
                  className="px-2.5 py-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-lg border border-slate-200 transition"
                >
                  Edit details
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete contact ${c.name}?`)) {
                      deleteContact(c.id);
                    }
                  }}
                  className="px-2.5 py-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Add New CRM Contact</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Contact Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael Scott"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Role / Designation</label>
                <select
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="Client">Client (Buyer)</option>
                  <option value="Publisher">Publisher (Seller)</option>
                  <option value="Writer">Writer (Content)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1-555-0199"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Company Name</label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Notes / Profile Log</label>
                <textarea
                  placeholder="Details of client requirements, publisher sites owned..."
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
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
                  Create Contact
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
              <h3 className="font-bold text-slate-800 text-lg">Edit Contact</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Contact Full Name *</label>
                <input
                  type="text"
                  required
                  value={editContact.name}
                  onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editContact.email}
                  onChange={(e) => setEditContact({ ...editContact, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Role / Designation</label>
                <select
                  value={editContact.role}
                  onChange={(e) => setEditContact({ ...editContact, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="Client">Client (Buyer)</option>
                  <option value="Publisher">Publisher (Seller)</option>
                  <option value="Writer">Writer (Content)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Phone Number</label>
                <input
                  type="text"
                  value={editContact.phone}
                  onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Company Name</label>
                <input
                  type="text"
                  value={editContact.company}
                  onChange={(e) => setEditContact({ ...editContact, company: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Notes / Profile Log</label>
                <textarea
                  value={editContact.notes}
                  onChange={(e) => setEditContact({ ...editContact, notes: e.target.value })}
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
