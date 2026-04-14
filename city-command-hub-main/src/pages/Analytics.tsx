import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const complaintsOverTime = months.map((m, i) => ({
  month: m,
  received: Math.floor(200 + Math.sin(i * 0.5) * 80 + Math.random() * 40),
  resolved: Math.floor(180 + Math.sin(i * 0.5) * 70 + Math.random() * 40),
  aiResolved: Math.floor(80 + Math.cos(i * 0.7) * 30 + Math.random() * 20),
}));

const aiAccuracy = months.map((m, i) => ({
  month: m,
  accuracy: Math.min(99, 85 + i * 1.2 + Math.random() * 2).toFixed(1),
  confidence: Math.min(98, 80 + i * 1.5 + Math.random() * 3).toFixed(1),
}));

const deptPerformance = [
  { dept: "Infrastructure", resolved: 89, avgTime: 4.2, satisfaction: 87 },
  { dept: "Utilities", resolved: 76, avgTime: 6.1, satisfaction: 72 },
  { dept: "Transport", resolved: 92, avgTime: 3.1, satisfaction: 91 },
  { dept: "Public Safety", resolved: 85, avgTime: 2.8, satisfaction: 88 },
  { dept: "Environment", resolved: 68, avgTime: 7.4, satisfaction: 65 },
];

const budgetData = [
  { dept: "Infrastructure", budget: 450, impact: 380 },
  { dept: "Utilities", budget: 320, impact: 290 },
  { dept: "Transport", budget: 280, impact: 310 },
  { dept: "Safety", budget: 200, impact: 240 },
  { dept: "Environment", budget: 150, impact: 120 },
];

const categoryPie = [
  { name: "Road & Traffic", value: 32, color: "hsl(217, 91%, 60%)" },
  { name: "Water & Sewage", value: 24, color: "hsl(160, 84%, 39%)" },
  { name: "Electricity", value: 18, color: "hsl(38, 92%, 50%)" },
  { name: "Waste Mgmt", value: 14, color: "hsl(291, 64%, 42%)" },
  { name: "Public Safety", value: 12, color: "hsl(199, 89%, 48%)" },
];

const tooltipStyle = {
  background: "hsl(222, 41%, 9%)", border: "1px solid hsl(222, 30%, 16%)",
  borderRadius: "8px", fontSize: "12px", color: "#ccc",
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function Analytics() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">City-wide performance metrics and insights</p>
      </div>

      {/* Complaints Trends */}
      <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Complaints Trends — 12 Months</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={complaintsOverTime}>
            <defs>
              <linearGradient id="aBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(215, 20%, 40%)" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 20%, 40%)" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Area type="monotone" dataKey="received" stroke="hsl(217, 91%, 60%)" fill="url(#aBlue)" strokeWidth={2} name="Received" />
            <Area type="monotone" dataKey="resolved" stroke="hsl(160, 84%, 39%)" fill="transparent" strokeWidth={2} name="Resolved" />
            <Area type="monotone" dataKey="aiResolved" stroke="hsl(291, 64%, 42%)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" name="AI Resolved" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Accuracy */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">AI Prediction Accuracy</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={aiAccuracy}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(215, 20%, 40%)" />
              <YAxis domain={[75, 100]} tick={{ fontSize: 11 }} stroke="hsl(215, 20%, 40%)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="accuracy" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={{ r: 3 }} name="Accuracy %" />
              <Line type="monotone" dataKey="confidence" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 3 }} name="Confidence %" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Pie */}
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Complaint Categories</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {categoryPie.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-muted-foreground truncate">{d.name}</span>
                <span className="font-medium text-foreground font-mono-code ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Department Performance */}
      <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Department Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs text-muted-foreground font-medium">Department</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Resolution Rate</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Avg Time (hrs)</th>
                <th className="text-right py-2 text-xs text-muted-foreground font-medium">Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {deptPerformance.map((d) => (
                <tr key={d.dept} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-medium text-foreground">{d.dept}</td>
                  <td className="py-3 text-right font-mono-code">
                    <span className={d.resolved >= 85 ? "text-success" : d.resolved >= 75 ? "text-warning" : "text-destructive"}>
                      {d.resolved}%
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono-code text-muted-foreground">{d.avgTime}h</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${d.satisfaction}%` }} />
                      </div>
                      <span className="font-mono-code text-xs text-foreground">{d.satisfaction}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Budget vs Impact */}
      <motion.div variants={item} className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Budget vs Impact Analysis (in $K)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={budgetData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
            <XAxis dataKey="dept" tick={{ fontSize: 11 }} stroke="hsl(215, 20%, 40%)" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 20%, 40%)" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="budget" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name="Budget" />
            <Bar dataKey="impact" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="Impact Score" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
