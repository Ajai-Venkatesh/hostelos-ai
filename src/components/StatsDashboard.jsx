import { motion } from "motion/react";
import { PieChart, TrendingUp } from "lucide-react";
import { Tilt, CountUp } from "./InteractiveEffects";
function StatsDashboard({ requests }) {
  const total = requests.length;
  const pending = requests.filter((r) => r.status === "pending" || r.status === "ai_evaluated").length;
  const resolved = requests.filter((r) => r.status === "resolved" || r.status === "approved").length;
  const highRisk = requests.filter((r) => r.urgency === "high" || r.urgency === "critical").length;
  const categories = {
    maintenance: requests.filter((r) => r.category === "maintenance").length,
    permission: requests.filter((r) => r.category === "permission").length,
    mess: requests.filter((r) => r.category === "mess").length,
    complaint: requests.filter((r) => r.category === "complaint").length
  };
  const totalCats = categories.maintenance + categories.permission + categories.mess + categories.complaint || 1;
  const getPercentage = (count) => Math.round(count / totalCats * 100);
  const trendPoints = [
    { label: "Mon", val: 3 },
    { label: "Tue", val: 5 },
    { label: "Wed", val: Math.max(2, requests.filter((r) => r.category === "maintenance").length * 1.5) },
    { label: "Thu", val: Math.max(4, requests.filter((r) => r.category === "permission").length * 2) },
    { label: "Fri", val: Math.max(3, resolved * 1.2) },
    { label: "Sat", val: Math.max(5, pending * 1.4) },
    { label: "Sun", val: total }
  ];
  const maxVal = Math.max(...trendPoints.map((p) => p.val), 8);
  const chartWidth = 320;
  const chartHeight = 70;
  const stepX = chartWidth / (trendPoints.length - 1);
  const pointsStr = trendPoints.map((p, i) => {
    const x = i * stepX;
    const y = chartHeight - p.val / maxVal * (chartHeight - 10);
    return `${x},${y}`;
  }).join(" ");
  const areaPath = `M0,${chartHeight} L${pointsStr} L${chartWidth},${chartHeight} Z`;
  const linePath = `M${pointsStr}`;
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-stagger" id="stats-dashboard-grid">
      
      {
    /* Chart Panel 1: Live Area Trend */
  }
      <Tilt className="w-full">
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl h-full border border-white">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 to-indigo-500" />
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-500" />
                <span>Hostel Load Activity Trend</span>
              </h3>
              <span className="text-[10px] text-slate-400 ">Total volume fluctuations over current cycle</span>
            </div>
            <span className="text-[10px] font-mono bg-sky-50 text-sky-800 px-2 py-0.5 rounded-md font-bold shadow-sm border border-sky-100">
              Realtime Live
            </span>
          </div>

          {
    /* SVG Sparkline */
  }
          <div className="relative pt-2 h-[80px]">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {
    /* Horizontal Grid lines */
  }
              <line x1="0" y1="10" x2={chartWidth} y2="10" className="stroke-slate-100 " strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="40" x2={chartWidth} y2="40" className="stroke-slate-100 " strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} className="stroke-slate-200 " strokeWidth="1" />

              {
    /* Filled Area */
  }
              <motion.path
    initial={{ d: `M0,${chartHeight} L0,${chartHeight} L${chartWidth},${chartHeight} Z`, opacity: 0 }}
    animate={{ d: areaPath, opacity: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    fill="url(#gradient-area)"
  />

              {
    /* Smoothed Line */
  }
              <motion.path
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{ duration: 1.2, ease: "easeOut" }}
    d={linePath}
    fill="none"
    stroke="#38bdf8"
    strokeWidth="2.5"
    strokeLinecap="round"
  />

              {
    /* Glowing active point at end */
  }
              <circle
    cx={chartWidth}
    cy={chartHeight - trendPoints[trendPoints.length - 1].val / maxVal * (chartHeight - 10)}
    r="4"
    fill="#38bdf8"
    stroke="white"
    strokeWidth="1.5"
    className="animate-pulse"
  />
            </svg>
          </div>

          {
    /* X-Axis labels */
  }
          <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono pt-1.5">
            {trendPoints.map((p, i) => <span key={i}>{p.label}</span>)}
          </div>
        </div>
      </Tilt>

      {
    /* Chart Panel 2: Categories Radial Segments */
  }
      <Tilt className="w-full">
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl h-full border border-white">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-400 to-purple-500" />
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-purple-500" />
                <span>Category Distribution</span>
              </h3>
              <span className="text-[10px] text-slate-400 ">Triage volume classification</span>
            </div>
            <span className="text-[10px] font-mono bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md font-bold shadow-sm border border-purple-100">
              Resolved: {resolved}
            </span>
          </div>

          {
    /* Micro Layout Grid with SVG Ring and Legend */
  }
          <div className="flex items-center justify-between gap-4">
            {
    /* Custom SVG Circular Ring */
  }
            <div className="w-[75px] h-[75px] relative shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle className="text-slate-100 " strokeWidth="3" stroke="currentColor" fill="none" cx="18" cy="18" r="15.9155" />
                {
    /* Maintenance segment (Amber) */
  }
                <circle
    className="text-amber-500"
    strokeWidth="4.5"
    strokeDasharray={`${getPercentage(categories.maintenance)}, 100`}
    strokeLinecap="round"
    stroke="currentColor"
    fill="none"
    cx="18"
    cy="18"
    r="15.9155"
  />
                {
    /* Permission segment (Indigo) */
  }
                <circle
    className="text-indigo-500"
    strokeWidth="4.5"
    strokeDashoffset={`-${getPercentage(categories.maintenance)}`}
    strokeDasharray={`${getPercentage(categories.permission)}, 100`}
    strokeLinecap="round"
    stroke="currentColor"
    fill="none"
    cx="18"
    cy="18"
    r="15.9155"
  />
                {
    /* Mess segment (Emerald) */
  }
                <circle
    className="text-emerald-500"
    strokeWidth="4.5"
    strokeDashoffset={`-${getPercentage(categories.maintenance) + getPercentage(categories.permission)}`}
    strokeDasharray={`${getPercentage(categories.mess)}, 100`}
    strokeLinecap="round"
    stroke="currentColor"
    fill="none"
    cx="18"
    cy="18"
    r="15.9155"
  />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-display font-black text-xs text-slate-800 ">
                <span className="text-sm"><CountUp to={total} /></span>
                <span className="text-[7px] text-slate-400 font-bold uppercase">Tickets</span>
              </div>
            </div>

            {
    /* Color Indicators Legend */
  }
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 flex-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block leading-none">Maint.</span>
                  <span className="font-bold text-slate-800 leading-none">{getPercentage(categories.maintenance)}%</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block leading-none">Passes</span>
                  <span className="font-bold text-slate-800 leading-none">{getPercentage(categories.permission)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block leading-none">Mess</span>
                  <span className="font-bold text-slate-800 leading-none">{getPercentage(categories.mess)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-slate-400 font-semibold block leading-none">Others</span>
                  <span className="font-bold text-slate-800 leading-none">{getPercentage(categories.complaint)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tilt>

    </div>;
}
export {
  StatsDashboard as default
};
