import { useState, useCallback } from "react";
import { C, DRIVER_STOPS, ACTIVE_ORDER, DRIVER_VEHICLES } from "../constants";
import { Card, LiveDot } from "../components/common";
import { useInterval } from "../hooks/useInterval";

// ─── RouteMap ─────────────────────────────────────────────────────────────────
function RouteMap({ onStopClick }) {
  const [tick, setTick] = useState(0);
  useInterval(useCallback(() => setTick(t => t + 1), []), 60);

  const s2 = DRIVER_STOPS[2];
  const s3 = DRIVER_STOPS[3];
  const progress = (Math.sin(tick * 0.04) + 1) / 2;
  const dotX = s2.x + (s3.x - s2.x) * progress * 0.55;
  const dotY = s2.y + (s3.y - s2.y) * progress * 0.55;
  const stopColor = { depot: C.muted, done: C.emerald, active: C.amber, next: C.blue };

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
      <rect width="100" height="100" fill="#030c18" />
      {[20,40,60,80].map(v => (
        <g key={v}>
          <line x1={v} y1="0" x2={v} y2="100" stroke="#0b1e32" strokeWidth="2.5" />
          <line x1="0" y1={v} x2="100" y2={v} stroke="#0b1e32" strokeWidth="2.5" />
        </g>
      ))}
      {[10,30,50,70,90].map(v => (
        <g key={"m"+v}>
          <line x1={v} y1="0" x2={v} y2="100" stroke="#071626" strokeWidth="1" />
          <line x1="0" y1={v} x2="100" y2={v} stroke="#071626" strokeWidth="1" />
        </g>
      ))}
      <polyline points={`${DRIVER_STOPS[0].x},${DRIVER_STOPS[0].y} ${DRIVER_STOPS[1].x},${DRIVER_STOPS[1].y} ${DRIVER_STOPS[2].x},${DRIVER_STOPS[2].y}`}
        fill="none" stroke={C.emerald} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 3px #10b981)" }} />
      <polyline points={`${DRIVER_STOPS[2].x},${DRIVER_STOPS[2].y} ${DRIVER_STOPS[3].x},${DRIVER_STOPS[3].y}`}
        fill="none" stroke={C.amber} strokeWidth="2.2" strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 4px #f59e0b)" }} />
      <polyline points={`${DRIVER_STOPS[3].x},${DRIVER_STOPS[3].y} ${DRIVER_STOPS[4].x},${DRIVER_STOPS[4].y}`}
        fill="none" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2.5" />
      {DRIVER_STOPS.map(stop => {
        const col = stopColor[stop.type];
        const isActive = stop.type === "active";
        return (
          <g key={stop.id} onClick={() => onStopClick(stop)} style={{ cursor: "pointer" }}>
            {isActive && (
              <circle cx={stop.x} cy={stop.y} r="5" fill={col} opacity="0.2">
                <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={stop.x} cy={stop.y} r={isActive ? 3.5 : 2.8}
              fill={stop.done ? col : "#030c18"} stroke={col} strokeWidth={isActive ? 1.6 : 1.2}
              style={{ filter: isActive ? "drop-shadow(0 0 3px "+col+")" : "none" }} />
            {stop.done && (
              <text x={stop.x} y={stop.y + 0.8} textAnchor="middle" fontSize="2.5" fill="#030c18" fontWeight="bold">✓</text>
            )}
            <rect x={stop.x + 4} y={stop.y - 4} width={stop.label.length * 1.9 + 4} height="5.5" rx="1.5" fill={col+"25"} stroke={col+"50"} strokeWidth="0.4" />
            <text x={stop.x + 6} y={stop.y - 0.5} fontSize="2.8" fill={col} fontWeight="700" fontFamily="monospace">{stop.label}</text>
          </g>
        );
      })}
      <circle cx={dotX} cy={dotY} r="2.8" fill={C.amber} style={{ filter: "drop-shadow(0 0 4px #f59e0b)" }} />
      <circle cx={dotX} cy={dotY} r="1.4" fill="#030c18" />
      <polygon points={`${dotX},${dotY-2} ${dotX-1.2},${dotY+1} ${dotX+1.2},${dotY+1}`} fill={C.amber} opacity="0.9" />
      <rect x="2" y="2" width="14" height="9" rx="2" fill="#0b1e32aa" stroke="#1a2d4a" strokeWidth="0.4" />
      <text x="9" y="7.5" textAnchor="middle" fontSize="4" fill="#e2e8f0" fontWeight="800" fontFamily="monospace">28</text>
      <text x="9" y="10.2" textAnchor="middle" fontSize="2.5" fill="#64748b" fontFamily="monospace">km/h</text>
      <rect x="70" y="2" width="28" height="9" rx="2" fill={C.amber+"20"} stroke={C.amber+"60"} strokeWidth="0.4" />
      <text x="84" y="7.8" textAnchor="middle" fontSize="3.5" fill={C.amber} fontWeight="800" fontFamily="monospace">ETA 12 min</text>
    </svg>
  );
}

// ─── DeliveryCard ─────────────────────────────────────────────────────────────
function DeliveryCard({ order, status, onConfirm }) {
  const isOnTrack = status === "ontrack";
  const diffColors = { Easy: C.emerald, Medium: C.amber, Hard: C.red };
  const diffCol = diffColors[order.difficulty] || C.amber;
  return (
    <div style={{ background: C.card+"ee", backdropFilter: "blur(20px)", border: "1px solid "+C.borderHi, borderRadius: 18, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 13 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: C.amber, letterSpacing: "0.06em" }}>{order.orderId}</div>
            <div style={{ padding: "2px 8px", borderRadius: 99, background: diffCol+"18", border: "1px solid "+diffCol+"45", fontFamily: "monospace", fontSize: 8, fontWeight: 700, color: diffCol, letterSpacing: "0.07em" }}>{order.difficulty.toUpperCase()}</div>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: C.text, fontWeight: 700 }}>{order.customer}</div>
          <div style={{ fontFamily: "monospace", fontSize: 8.5, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>{order.address}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, background: (isOnTrack ? C.emerald : C.red)+"15", border: "1px solid "+(isOnTrack ? C.emerald : C.red)+"45", flexShrink: 0 }}>
          <LiveDot color={isOnTrack ? C.emerald : C.red} size={6} />
          <span style={{ fontFamily: "monospace", fontSize: 8, fontWeight: 700, color: isOnTrack ? C.emerald : C.red, letterSpacing: "0.06em" }}>{isOnTrack ? "ON TRACK" : "DELAYED"}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { icon: "⏱", label: "ETA",      val: order.eta,      col: C.amber },
          { icon: "📍", label: "Distance", val: order.distance, col: C.blue  },
          { icon: "📦", label: "Stop",     val: order.stopNum+"/"+order.totalStops, col: C.cyan },
        ].map(({ icon, label, val, col }) => (
          <div key={label} style={{ background: col+"0f", border: "1px solid "+col+"25", borderRadius: 10, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: C.muted }}>{icon} {label}</div>
            <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: col }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.blue+"0d", border: "1px solid "+C.blue+"25", borderRadius: 9, padding: "8px 11px", display: "flex", alignItems: "flex-start", gap: 7 }}>
        <span style={{ fontSize: 13, flexShrink: 0 }}>📋</span>
        <div style={{ fontFamily: "monospace", fontSize: 8.5, color: C.muted, lineHeight: 1.6 }}>{order.notes}</div>
      </div>
      <button onClick={onConfirm} style={{ width: "100%", padding: "14px", borderRadius: 13, border: "none", cursor: "pointer", background: "linear-gradient(135deg,"+C.emerald+",#059669)", boxShadow: "0 0 22px "+C.emeraldGlow, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: "#000", letterSpacing: "0.06em" }}>
        <span style={{ fontSize: 16 }}>✅</span>
        CONFIRM ARRIVAL
      </button>
    </div>
  );
}

// ─── DriverPage ───────────────────────────────────────────────────────────────
export default function DriverPage() {
  const [status] = useState("ontrack");
  const [confirmed, setConfirmed] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [activeVehicleId, setActiveVehicleId] = useState("CV-042");

  const vehicle = DRIVER_VEHICLES.find(v => v.id === activeVehicleId) || DRIVER_VEHICLES[3];

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 2200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, height: "calc(100vh - 120px)", minHeight: 600 }}>
      {/* Vehicle Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
        <span style={{ fontFamily: "monospace", fontSize: 8, color: C.muted, letterSpacing: "0.07em", flexShrink: 0 }}>DRIVER VIEW:</span>
        {DRIVER_VEHICLES.map(v => {
          const isActive = v.id === activeVehicleId;
          return (
            <button key={v.id} onClick={() => setActiveVehicleId(v.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: isActive ? v.color+"22" : "transparent", border: `1px solid ${isActive ? v.color : C.border}`, cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}>
              <span style={{ fontSize: 13 }}>{v.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "monospace", fontSize: 8, fontWeight: 700, color: isActive ? v.color : C.muted, letterSpacing: "0.05em" }}>{v.id}</div>
                <div style={{ fontFamily: "monospace", fontSize: 7, color: isActive ? v.color+"cc" : C.muted+"88" }}>{v.driver.split(" ")[0]}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Driver Nav Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", background: C.card+"f0", backdropFilter: "blur(14px)", border: "1px solid "+C.border, borderRadius: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient("+vehicle.gradient+")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 10px "+vehicle.color+"66" }}>{vehicle.icon}</div>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: C.text }}>{vehicle.driver}</div>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: C.muted }}>{vehicle.id} · {vehicle.label} · On Duty</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {DRIVER_STOPS.filter(s => s.type !== "depot").map(stop => {
            const col = stop.done ? C.emerald : stop.type === "active" ? C.amber : C.muted;
            return (
              <div key={stop.id} style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: 9, fontWeight: 800, background: col+"20", border: "1.5px solid "+col, color: col }}>
                {stop.done ? "✓" : stop.id - 1}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, color: C.text }}>Stop {ACTIVE_ORDER.stopNum} of {ACTIVE_ORDER.totalStops}</div>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: C.muted }}>Shift: 6h 12m active</div>
          </div>
          <div style={{ padding: "4px 9px", borderRadius: 7, background: C.emerald+"15", border: "1px solid "+C.emerald+"35" }}>
            <div style={{ fontFamily: "monospace", fontSize: 8, fontWeight: 700, color: C.emerald, letterSpacing: "0.06em" }}>₹{ACTIVE_ORDER.profit} pending</div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 12, flex: 1, minHeight: 0 }}>
        {/* Map */}
        <Card style={{ padding: 0, overflow: "hidden", position: "relative" }} glow={C.amber}>
          <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, display: "flex", alignItems: "center", gap: 6, background: C.card+"dd", backdropFilter: "blur(10px)", border: "1px solid "+C.borderHi, borderRadius: 9, padding: "6px 12px" }}>
            <LiveDot color={C.amber} size={6} />
            <span style={{ fontFamily: "monospace", fontSize: 8.5, fontWeight: 700, color: C.amber, letterSpacing: "0.06em" }}>
              LIVE ROUTE · {DRIVER_STOPS.filter(s => s.done).length - 1} of {DRIVER_STOPS.length - 1} stops done
            </span>
          </div>
          <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 10, display: "flex", gap: 6, flexDirection: "column" }}>
            {[{col:C.emerald,label:"Completed"},{col:C.amber,label:"Active"},{col:C.blue,label:"Upcoming"}].map(({col,label}) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, background: C.card+"cc", backdropFilter: "blur(8px)", border: "1px solid "+C.border, borderRadius: 6, padding: "3px 8px" }}>
                <div style={{ width: 8, height: 3, borderRadius: 2, background: col }} />
                <span style={{ fontFamily: "monospace", fontSize: 7.5, color: C.muted }}>{label}</span>
              </div>
            ))}
          </div>
          {selectedStop && (
            <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, background: C.card+"ee", backdropFilter: "blur(12px)", border: "1px solid "+C.borderHi, borderRadius: 10, padding: "9px 12px", maxWidth: 180 }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 800, color: C.amber, marginBottom: 3 }}>{selectedStop.label}</div>
              <div style={{ fontFamily: "monospace", fontSize: 8, color: C.muted, lineHeight: 1.5 }}>{selectedStop.addr}</div>
              <button onClick={() => setSelectedStop(null)} style={{ marginTop: 6, fontFamily: "monospace", fontSize: 7.5, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕ dismiss</button>
            </div>
          )}
          <RouteMap onStopClick={setSelectedStop} />
        </Card>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
          {confirmed ? (
            <Card glow={C.emerald} style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: C.emerald, marginBottom: 6 }}>ARRIVAL CONFIRMED</div>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: C.muted }}>Loading next stop…</div>
            </Card>
          ) : (
            <DeliveryCard order={ACTIVE_ORDER} status={status} onConfirm={handleConfirm} />
          )}
          <Card style={{ padding: "13px 15px" }}>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: C.muted, letterSpacing: "0.07em", marginBottom: 10 }}>TODAY'S PROGRESS · {vehicle.driver.split(" ")[0].toUpperCase()}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Completed", val: String(vehicle.deliveries),      col: C.emerald },
                { label: "Remaining", val: String(12-vehicle.deliveries),   col: C.amber   },
                { label: "Avg Time",  val: "16 min",                        col: C.blue    },
                { label: "Earnings",  val: vehicle.earnings,                col: C.cyan    },
              ].map(({ label, val, col }) => (
                <div key={label} style={{ background: col+"0d", border: "1px solid "+col+"20", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 7.5, color: C.muted }}>{label}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: col, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}