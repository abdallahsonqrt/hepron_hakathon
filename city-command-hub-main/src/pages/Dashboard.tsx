import { motion } from "framer-motion";
import { Activity, AlertTriangle, Brain, DollarSign, Wifi, Server, Cpu, Database, ArrowUp, ArrowDown } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const kpis = [
  { label: "Active Complaints", value: "1,284", change: "+12%", up: true, icon: AlertTriangle, color: "text-warning" },
  { label: "System Health", value: "98.7%", change: "+0.3%", up: true, icon: Activity, color: "text-success" },
  { label: "AI Decisions/min", value: "342", change: "+28%", up: true, icon: Brain, color: "text-primary" },
  { label: "Budget Usage", value: "67.2%", change: "-2.1%", up: false, icon: DollarSign, color: "text-info" },
];

const systems = [
  { name: "IoT Network", status: "online", uptime: "99.98%", icon: Wifi },
  { name: "API Gateway", status: "online", uptime: "99.95%", icon: Server },
  { name: "AI Engine", status: "warning", uptime: "97.2%", icon: Cpu },
  { name: "Data Pipeline", status: "online", uptime: "99.99%", icon: Database },
];

const alerts = [
  { message: "High traffic detected in Zone 7 — IoT sensors rerouting", severity: "warning", time: "2m ago" },
  { message: "AI model v3.2 deployed successfully", severity: "success", time: "14m ago" },
  { message: "Water pressure anomaly flagged in District 4", severity: "error", time: "28m ago" },
  { message: "Scheduled maintenance for Data Pipeline at 02:00", severity: "info", time: "1h ago" },
  { message: "Budget threshold reached for Transportation dept", severity: "warning", time: "2h ago" },
];

const areaData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  complaints: Math.floor(30 + Math.random() * 50),
  resolved: Math.floor(25 + Math.random() * 45),
}));

const pieData = [
  { name: "Infrastructure", value: 35, color: "hsl(217, 91%, 60%)" },
  { name: "Utilities", value: 25, color: "hsl(160, 84%, 39%)" },
  { name: "Transport", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Public Safety", value: 12, color: "hsl(291, 64%, 42%)" },
  { name: "Other", value: 8, color: "hsl(199, 89%, 48%)" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function Dashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={item}
            className="rounded-xl border border-border bg-card p-5 hover:glow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground font-mono-code">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.up ? <ArrowUp className="h-3 w-3 text-success" /> : <ArrowDown className="h-3 w-3 text-destructive" />}
              <span className={`text-xs font-medium ${kpi.up ? "text-success" : "text-destructive"}`}>{kpi.change}</span>
              <span className="text-xs text-muted-foreground ml-1">vs last week</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div variants={item} className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Complaints Activity — 24h</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(215, 20%, 40%)" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(215, 20%, 40%)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(222, 41%, 9%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: "8px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="complaints" stroke="hsl(217, 91%, 60%)" fill="url(#gBlue)" strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" stroke="hsl(160, 84%, 39%)" fill="url(#gGreen)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Complaints by Department</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(222, 41%, 9%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium text-foreground font-mono-code">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">System Status</h3>
          <div className="space-y-3">
            {systems.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono-code">{s.uptime}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${s.status === "online" ? "status-online" : s.status === "warning" ? "status-warning" : "status-offline"}`} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Real-time Alerts</h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
                <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                  a.severity === "warning" ? "status-warning" : a.severity === "success" ? "status-online" : a.severity === "error" ? "status-offline" : "bg-info"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">{a.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
