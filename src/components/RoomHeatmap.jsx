import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building, ShieldAlert, User, Wrench, Utensils, Key, FileText } from "lucide-react";
import { Tilt } from "./InteractiveEffects";
function RoomHeatmap({ requests, onSelectRequest, onRoomSelect, currentRoom }) {
  const [activeWing, setActiveWing] = useState("B");
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const floors = [3, 2, 1];
  const roomIndices = [1, 2, 3, 4];
  const getCategoryColor = (cat) => {
    switch (cat) {
      case "maintenance":
        return "bg-amber-500 border-amber-600 shadow-amber-400/40 text-amber-950";
      case "permission":
        return "bg-indigo-500 border-indigo-600 shadow-indigo-400/40 text-indigo-950";
      case "mess":
        return "bg-emerald-500 border-emerald-600 shadow-emerald-400/40 text-emerald-950";
      default:
        return "bg-rose-500 border-rose-600 shadow-rose-400/40 text-rose-950";
    }
  };
  const getCategoryBgLight = (cat) => {
    switch (cat) {
      case "maintenance":
        return "bg-amber-50 text-amber-800 border-amber-100   ";
      case "permission":
        return "bg-indigo-50 text-indigo-800 border-indigo-100   ";
      case "mess":
        return "bg-emerald-50 text-emerald-800 border-emerald-100   ";
      default:
        return "bg-rose-50 text-rose-800 border-rose-100   ";
    }
  };
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "maintenance":
        return <Wrench className="w-3.5 h-3.5 text-amber-600 " />;
      case "permission":
        return <Key className="w-3.5 h-3.5 text-indigo-600 " />;
      case "mess":
        return <Utensils className="w-3.5 h-3.5 text-emerald-600 " />;
      default:
        return <FileText className="w-3.5 h-3.5 text-rose-600 " />;
    }
  };
  return <Tilt className="w-full">
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl h-full border border-white" id="room-heatmap-card">
        {
    /* Visual Accent */
  }
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-emerald-500" />
        
        {
    /* Header */
  }
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5">
              <Building className="w-4.5 h-4.5 text-indigo-600 " />
              <span>Interactive Live Occupancy Radar</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time status tracking & complaint hotspots</p>
          </div>
          
          {
    /* Wing Selector */
  }
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 " id="heatmap-wing-switch">
            {["A", "B"].map((wing) => <button
    key={wing}
    type="button"
    onClick={() => setActiveWing(wing)}
    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${activeWing === wing ? "bg-white text-slate-900 shadow-3xs" : "text-slate-400 hover:text-slate-700"}`}
  >
                Wing {wing}
              </button>)}
          </div>
        </div>

        {
    /* Floor Grid Layout */
  }
        <div className="space-y-3.5">
          {floors.map((floor) => <div key={floor} className="flex items-center gap-3">
              {
    /* Floor Label */
  }
              <div className="w-10 text-[10px] font-extrabold text-slate-400 tracking-wider font-mono">
                FLR 0{floor}
              </div>

              {
    /* Rooms Grid */
  }
              <div className="grid grid-cols-4 gap-2 flex-1">
                {roomIndices.map((idx) => {
    const roomNum = `${activeWing}-${floor}0${idx}`;
    const roomRequests = requests.filter(
      (r) => r.roomNumber?.trim().toLowerCase() === roomNum.toLowerCase()
    );
    const activeIssue = roomRequests.find((r) => r.status !== "resolved" && r.status !== "rejected");
    const isSelected = currentRoom?.toLowerCase() === roomNum.toLowerCase();
    return <div
      key={roomNum}
      className="relative"
      onMouseEnter={() => setHoveredRoom(roomNum)}
      onMouseLeave={() => setHoveredRoom(null)}
    >
                      <motion.button
      type="button"
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        if (activeIssue && onSelectRequest) {
          onSelectRequest(activeIssue);
        }
        if (onRoomSelect) {
          onRoomSelect(roomNum);
        }
      }}
      className={`w-full py-3.5 px-2 rounded-xl border text-center transition-all cursor-pointer relative flex flex-col items-center justify-center gap-1 shadow-sm ${isSelected ? "border-indigo-400 bg-indigo-50/80 text-indigo-900 ring-4 ring-indigo-500/20" : activeIssue ? "border-rose-300 bg-rose-50/80 text-rose-900 hover:bg-rose-100/50" : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"}`}
    >
                        {
      /* Room Code */
    }
                        <span className="font-mono text-[10px] font-extrabold text-slate-700 ">
                          {floor}0{idx}
                        </span>

                        {
      /* Issue status indicator dot */
    }
                        {activeIssue ? <div className="relative flex h-2 w-2 mt-0.5">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeIssue.category === "maintenance" ? "bg-amber-400" : "bg-rose-400"}`} />
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${activeIssue.category === "maintenance" ? "bg-amber-500" : "bg-rose-500"}`} />
                          </div> : <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                            VACANT
                          </span>}
                      </motion.button>

                      {
      /* Popover overlay for hovered room info */
    }
                      <AnimatePresence>
                        {hoveredRoom === roomNum && <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 5 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white/90 backdrop-blur-xl text-slate-800 rounded-xl p-3 shadow-2xl z-50 text-left pointer-events-none border border-slate-200"
    >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                              <span className="font-mono font-bold text-[10px] text-indigo-600">ROOM {roomNum}</span>
                              <span className="text-[9px] text-slate-500 ">Wing {activeWing}</span>
                            </div>
                            
                            {activeIssue ? <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500">
                                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                  <span className="uppercase">{activeIssue.category}</span>
                                </div>
                                <p className="text-[10px] text-slate-700 font-semibold line-clamp-2 leading-relaxed">
                                  {activeIssue.title}
                                </p>
                                <div className="text-[9px] text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-800/60 mt-1">
                                  <User className="w-2.5 h-2.5" />
                                  <span>{activeIssue.studentName}</span>
                                </div>
                              </div> : <p className="text-[10px] text-slate-400 italic">No active maintenance issues or pending gate passes recorded.</p>}
                          </motion.div>}
                      </AnimatePresence>
                    </div>;
  })}
              </div>
            </div>)}
        </div>

        {
    /* Legend Block */
  }
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-200 " />
            <span>Clear Room</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Maintenance Needed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Pass Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Complaints Registered</span>
          </div>
        </div>
      </div>
    </Tilt>;
}
export {
  RoomHeatmap as default
};
