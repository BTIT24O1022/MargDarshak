import { useState, useCallback } from "react";
import { C, VEHICLES, VTYPES } from "../../constants";
import { LiveDot } from "../common";
import { useInterval } from "../../hooks/useInterval";

export default function LiveMapComponent({ selected, onSelect }) {
  const [prog, setProg] = useState(0);
  useInterval(useCallback(() => setProg(p => (p + 0.35) % 100), []), 80);

  return (
    <div style={{ position: "relative", height: "100%", background: "#050c1a", overflow: "hidden" }}>
      {/* Weather Alert Banner */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, background: `${C.amber}18`, borderBottom: `1px solid ${C.amber}40`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "6px 16px" }}>
        <span style={{ fontSize: 12 }}>🌧</span>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: C.amber, fontWeight: 700, letterSpacing: "0.07em" }}>HEAVY RAIN · Drone flights paused · Safety-First routing active</span>
        <LiveDot color={C.amber} size={6} />
      </div>

      {/* Grid Background */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }}>
        <defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.blue} strokeWidth="0.4" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#g)" />
      </svg>

      {/* Routes SVG */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><filter id="gf"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        {["M 20,95 L 20,5","M 40,95 L 40,5","M 60,95 L 60,5","M 80,95 L 80,5","M 5,75 L 95,75","M 5,50 L 95,50","M 5,25 L 95,25"].map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#1a3050" strokeWidth={i < 4 ? 2 : 1.5} />
        ))}
        {VEHICLES.map(v => {
          const vc = VTYPES[v.type].color;
          const path = `M ${v.x},${v.y} Q ${(v.x + v.destX) / 2 + 8},${(v.y + v.destY) / 2 - 12} ${v.destX},${v.destY}`;
          return (
            <g key={v.id}>
              <path d={path} fill="none" stroke={vc} strokeWidth="3" strokeOpacity="0.12" filter="url(#gf)" />
              <path d={path} fill="none" stroke={vc} strokeWidth="1.2" strokeOpacity="0.7" strokeDasharray="3 2" />
              <circle r="1" fill={vc}><animateMotion dur="4s" repeatCount="indefinite" begin={`${v.delay * 0.045}s`} path={path} /></circle>
            </g>
          );
        })}
      </svg>

      {/* City Blocks */}
      {[[15,14,9,11],[44,24,13,8],[54,55,10,12],[24,65,9,9],[75,34,14,10],[34,44,7,7],[63,19,9,11],[86,60,8,9]].map(([l,t,w,h], i) => (
        <div key={i} style={{ position: "absolute", left: `${l}%`, top: `${t}%`, width: `${w * 0.8}%`, height: `${h * 0.85}%`, background: "#0c1e35", border: "1px solid #182d45", borderRadius: 2 }} />
      ))}

      {/* Parking Zone */}
      <div style={{ position: "absolute", left: "62%", top: "20%", transform: "translate(-50%,-50%)" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", border: `2px solid ${C.emerald}`, background: `${C.emerald}15`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 22px ${C.emeraldGlow}`, animation: "pulse 2s infinite" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: 7, color: C.emerald, letterSpacing: "0.06em" }}>PARK</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: C.emerald }}>92%</div>
          </div>
        </div>
      </div>

      {/* Animated Vehicles */}
      {VEHICLES.map(v => {
        const p = ((prog + v.delay) % 100) / 100;
        const mx = v.x + (v.destX - v.x) * p;
        const my = v.y + (v.destY - v.y) * p;
        const vt = VTYPES[v.type];
        const isSel = selected === v.id;
        return (
          <div key={v.id} style={{ position: "absolute", left: `${mx}%`, top: `${my}%`, transform: "translate(-50%,-50%)", zIndex: 10, cursor: "pointer" }} onClick={() => onSelect(isSel ? null : v.id)}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${vt.color}22`, border: `2px solid ${vt.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, boxShadow: isSel ? `0 0 18px ${vt.color}` : `0 0 7px ${vt.color}55`, transition: "box-shadow 0.2s" }}>
              {vt.icon}
            </div>
            <div style={{ position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)", background: vt.color, color: "#000", fontFamily: "monospace", fontSize: 7, fontWeight: 800, padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap", marginBottom: 2 }}>{v.id}</div>
            {isSel && (
              <div style={{ position: "absolute", top: "115%", left: "50%", transform: "translateX(-50%)", background: C.card, border: `1px solid ${vt.color}60`, borderRadius: 9, padding: "9px 13px", zIndex: 30, minWidth: 130, boxShadow: `0 4px 20px ${vt.color}30` }}>
                <div style={{ fontFamily: "monospace", fontSize: 8, color: vt.color, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 4 }}>{vt.icon} {vt.label}</div>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: C.muted }}>Driver</div>
                <div style={{ fontFamily: "monospace", fontSize: 11, color: C.text, fontWeight: 700 }}>{v.driver}</div>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: C.muted, marginTop: 5 }}>ETA</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: vt.color, fontWeight: 800 }}>~{4 + Math.floor(v.delay / 12)}:3{v.delay % 10} min</div>
              </div>
            )}
          </div>
        );
      })}

      {/* Destination Pin */}
      <div style={{ position: "absolute", left: "72%", top: "20%", transform: "translate(-50%,-50%)" }}>
        <div style={{ width: 28, height: 32, background: "#0a1e3a", border: `1px solid ${C.blue}80`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 12px ${C.blueGlow}`, fontSize: 13 }}>📍</div>
        <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", background: C.blue, color: "#fff", fontFamily: "monospace", fontSize: 7, fontWeight: 700, padding: "2px 5px", borderRadius: 3, whiteSpace: "nowrap", marginBottom: 2, letterSpacing: "0.07em" }}>DEST</div>
      </div>

      {/* Fleet Legend */}
      <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(4,10,20,0.92)", border: `1px solid ${C.border}`, borderRadius: 9, padding: "7px 11px", backdropFilter: "blur(8px)" }}>
        <div style={{ fontFamily: "monospace", fontSize: 7, color: C.muted, letterSpacing: "0.08em", marginBottom: 5 }}>FLEET TYPES</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px" }}>
          {VEHICLES.map(v => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9 }}>{VTYPES[v.type].icon}</span>
              <span style={{ fontFamily: "monospace", fontSize: 7, color: VTYPES[v.type].color }}>{v.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ETA Box */}
      <div style={{ position: "absolute", top: 34, right: 10, background: "rgba(4,10,20,0.92)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 11px", textAlign: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: 7, color: C.muted }}>NEXT ETA</div>
        <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: C.amber }}>4:32</div>
        <div style={{ fontFamily: "monospace", fontSize: 7, color: C.muted }}>mins</div>
      </div>

      {/* Live Badge */}
      <div style={{ position: "absolute", top: 34, left: 10, background: "rgba(4,10,20,0.92)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
        <LiveDot color={C.emerald} size={6} />
        <span style={{ fontFamily: "monospace", fontSize: 8, color: C.mutedLight, fontWeight: 700, letterSpacing: "0.07em" }}>LIVE · {VEHICLES.length} VEHICLES</span>
      </div>
    </div>
  );
}