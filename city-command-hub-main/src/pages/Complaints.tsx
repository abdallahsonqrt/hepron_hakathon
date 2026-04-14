import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Filter, X, MapPin, Clock, User, ChevronDown } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  department: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high" | "critical";
  citizen: string;
  location: string;
  date: string;
  description: string;
}

const complaints: Complaint[] = [
  { id: "CMP-2024-001", title: "Pothole on Main Street causing traffic delays", department: "Infrastructure", status: "open", priority: "high", citizen: "Ahmed Al-Rashid", location: "Zone 4, Main St", date: "2024-03-14", description: "Large pothole approximately 2ft wide near the intersection of Main St and 5th Ave. Multiple vehicles have reported tire damage." },
  { id: "CMP-2024-002", title: "Streetlight outage in residential area", department: "Utilities", status: "in_progress", priority: "medium", citizen: "Fatima Hassan", location: "Zone 2, Palm District", date: "2024-03-13", description: "Three consecutive streetlights are not functioning on Palm Ave between blocks 12-14. Residents report safety concerns during nighttime." },
  { id: "CMP-2024-003", title: "Water supply interruption — Building 7", department: "Utilities", status: "resolved", priority: "critical", citizen: "Omar Khalid", location: "Zone 1, Downtown", date: "2024-03-12", description: "Complete water supply cut off to residential building with 45 units. Emergency tanker service was deployed within 2 hours." },
  { id: "CMP-2024-004", title: "Noise complaint from construction site", department: "Environment", status: "open", priority: "low", citizen: "Sara Mahmoud", location: "Zone 5, Industrial", date: "2024-03-14", description: "Construction activity continuing past 10pm in violation of noise ordinance. Affecting residents in adjacent residential zone." },
  { id: "CMP-2024-005", title: "Bus route #12 consistently late by 20min", department: "Transport", status: "in_progress", priority: "medium", citizen: "Yousef Ali", location: "Zone 3, Central Hub", date: "2024-03-11", description: "Route #12 has been consistently delayed by 15-20 minutes during morning rush hour for the past two weeks." },
  { id: "CMP-2024-006", title: "Illegal parking blocking emergency access", department: "Public Safety", status: "open", priority: "critical", citizen: "Mona Qasim", location: "Zone 1, Hospital Rd", date: "2024-03-14", description: "Vehicles consistently parked illegally blocking the emergency vehicle access lane near City Hospital." },
  { id: "CMP-2024-007", title: "Waste collection missed for 3 days", department: "Environment", status: "in_progress", priority: "high", citizen: "Khalid Ibrahim", location: "Zone 6, Sunset Hills", date: "2024-03-10", description: "Scheduled waste collection has been missed for three consecutive days. Overflow causing sanitation concerns." },
  { id: "CMP-2024-008", title: "Traffic signal malfunction at intersection", department: "Transport", status: "resolved", priority: "high", citizen: "Nadia Hamed", location: "Zone 4, Ring Road", date: "2024-03-09", description: "Traffic signal stuck on red for all directions at the Ring Road/Highway 7 intersection. Traffic police deployed manually." },
];

const statusColors: Record<string, string> = {
  open: "bg-warning/10 text-warning border-warning/20",
  in_progress: "bg-info/10 text-info border-info/20",
  resolved: "bg-success/10 text-success border-success/20",
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function Complaints() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Complaint | null>(null);

  const filtered = complaints.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
    if (deptFilter !== "all" && c.department !== deptFilter) return false;
    return true;
  });

  const departments = [...new Set(complaints.map((c) => c.department))];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Complaints</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} of {complaints.length} complaints</p>
        </div>
      </div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2 flex-1 min-w-[200px] max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints..."
            className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
        {[
          { value: statusFilter, set: setStatusFilter, options: ["all", "open", "in_progress", "resolved"], label: "Status" },
          { value: priorityFilter, set: setPriorityFilter, options: ["all", "low", "medium", "high", "critical"], label: "Priority" },
          { value: deptFilter, set: setDeptFilter, options: ["all", ...departments], label: "Department" },
        ].map((f) => (
          <div key={f.label} className="relative">
            <select
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
            >
              {f.options.map((o) => (
                <option key={o} value={o}>{o === "all" ? `All ${f.label}` : o.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">ID</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Title</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Department</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Priority</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono-code text-xs text-primary">{c.id}</td>
                  <td className="px-4 py-3 text-foreground max-w-[300px] truncate">{c.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.department}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[c.priority]}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[c.status]}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono-code">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-mono-code text-primary mb-1">{selected.id}</p>
                <h3 className="text-lg font-semibold text-foreground">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-medium ${statusColors[selected.status]}`}>
                {selected.status.replace("_", " ")}
              </span>
              <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${priorityColors[selected.priority]}`}>
                {selected.priority}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{selected.description}</p>

            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Citizen:</span>
                <span className="text-foreground">{selected.citizen}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="text-foreground">{selected.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Filed:</span>
                <span className="text-foreground">{selected.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Department:</span>
                <span className="text-foreground">{selected.department}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
