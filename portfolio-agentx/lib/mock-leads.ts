export interface Lead {
  id: string;
  createdAt: string;
  problem: string;
  workflow: string;
  timeline: string;
  budget: string;
  notes: string;
  complexity: string;
  delivery: string;
  stack: string;
  estimateLow: number;
  estimateHigh: number;
  userEmail: string;
  status: "pending" | "accepted" | "declined";
  ankitNote: string;
}

const STORAGE_KEY = "agentx-leads";

export function getLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLead(lead: Omit<Lead, "id" | "createdAt" | "status" | "ankitNote">): Lead {
  const newLead: Lead = {
    ...lead,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    ankitNote: "",
  };
  const leads = getLeads();
  leads.unshift(newLead);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  return newLead;
}

export function updateLeadStatus(
  id: string,
  status: "accepted" | "declined",
  note?: string
): Lead | null {
  const leads = getLeads();
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return null;
  leads[index].status = status;
  if (note) leads[index].ankitNote = note;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  return leads[index];
}

export function getLeadById(id: string): Lead | null {
  return getLeads().find((l) => l.id === id) ?? null;
}
