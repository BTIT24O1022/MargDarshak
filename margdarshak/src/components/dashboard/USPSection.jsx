import { useState } from "react";
import { C } from "../../constants";
import { LiveDot } from "../common";

const cards = [
  {
    key: "parking",
    icon: "🅿️",
    color: C.emerald,
    title: "Predictive Parking",
    desc: "Uses real-time parking availability to guide delivery routes and reduce search time.",
    stat: "85%", statLabel: "Zone availability",
    tag: "PARKING AI",
  },
  {
    key: "weather",
    icon: "🌧",
    color: C.blue,
    title: "Weather-Aware Adaptation",
    desc: "Adjusts delivery routes based on live weather conditions and traffic disruptions.",
    stat: "+4m", statLabel: "ETA auto-adjusted",
    tag: "WEATHER AI",
  },
  {
    key: "priority",
    icon: "⚡",
    color: C.amber,
    title: "Dynamic Priority Scoring",
    desc: "AI dynamically prioritises deliveries based on urgency, traffic and driver status.",
    stat: "98", statLabel: "Peak score today",
    tag: "PRIORITY AI",
  },
];

export default function USPSection() {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Section Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <div style={{ width: 3, height: 22, borderRadius: 2, background: `linear-gradient(180deg,${C.amber},${C.emerald})` }} />
            <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 800, color: C.amber, letterSpacing: "0.14em" }}>CORE INTELLIGENCE ENGINE</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: `${C.emerald}15`, border: `1px solid ${C.emerald}40`, borderRadius: 99, padding: "2px 9px" }}>
              <LiveDot color={C.emerald} size={5} />
              <span style={{ fontFamily: "monospace", fontSize: 7.5, fontWeight: 700, color: C.emerald, letterSpacing: "0.07em" }}>3 MODULES LIVE</span>
            </div>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "0.01em", lineHeight: 1.2 }}>
            Parking-First <span style={{ color: C.amber }}>Routing Intelligence</span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: C.muted, marginTop: 5, letterSpacing: "0.04em" }}>
            Revolutionizing Urban Delivery Efficiency · MargDarshak USP
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["−18%","Fuel saved",C.emerald],["−14%","Avg ETA",C.amber],["96.8%","On-time",C.blue]].map(([v,l,c]) => (
            <div key={l} style={{ background: `${c}0d`, border: `1px solid ${c}25`, borderRadius: 10, padding: "7px 13px", textAlign: "center" }}>
              <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
              <div style={{ fontFamily: "monospace", fontSize: 7.5, color: C.muted, marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {cards.map(card => {
          const isHov = hovered === card.key;
          return (
            <div
              key={card.key}
              onMouseEnter={() => setHovered(card.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: C.card,
                border: `1px solid ${isHov ? card.color + "70" : C.border}`,
                borderRadius: 16, padding: "22px 22px 20px",
                position: "relative", overflow: "hidden", cursor: "default",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxShadow: isHov ? `0 0 28px ${card.color}18, 0 4px 20px rgba(0,0,0,0.4)` : "0 2px 12px rgba(0,0,0,0.3)",
              }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "16px 16px 0 0", background: `linear-gradient(90deg, ${card.color}, ${card.color}44)`, opacity: isHov ? 1 : 0.4, transition: "opacity 0.2s" }} />
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `${card.color}08`, pointerEvents: "none", transition: "opacity 0.2s", opacity: isHov ? 1 : 0 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: `${card.color}15`, border: `1px solid ${card.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: isHov ? `0 0 14px ${card.color}35` : "none", transition: "box-shadow 0.2s" }}>
                  {card.icon}
                </div>
                <div style={{ padding: "3px 9px", borderRadius: 99, background: `${card.color}12`, border: `1px solid ${card.color}30`, fontFamily: "monospace", fontSize: 7.5, fontWeight: 800, color: card.color, letterSpacing: "0.09em" }}>
                  {card.tag}
                </div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 8, lineHeight: 1.3 }}>{card.title}</div>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: C.muted, lineHeight: 1.75, marginBottom: 18 }}>{card.desc}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.stat}</div>
                <div style={{ fontFamily: "monospace", fontSize: 8, color: C.muted }}>{card.statLabel}</div>
                <div style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: card.color, boxShadow: `0 0 7px ${card.color}` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}