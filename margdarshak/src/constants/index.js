// ─── Colors ───────────────────────────────────────────────────────────────────
export const C = {
  bg: "#060d1a", card: "#0b1628", border: "#1a2d4a", borderHi: "#2a4a6a",
  amber: "#f59e0b", amberGlow: "rgba(245,158,11,0.4)",
  emerald: "#10b981", emeraldGlow: "rgba(16,185,129,0.4)",
  blue: "#3b82f6", blueGlow: "rgba(59,130,246,0.4)",
  red: "#ef4444", redGlow: "rgba(239,68,68,0.4)",
  cyan: "#22d3ee", purple: "#a78bfa",
  text: "#e2e8f0", muted: "#64748b", mutedLight: "#94a3b8",
};

// ─── Vehicle Types ────────────────────────────────────────────────────────────
export const VTYPES = {
  bike:    { icon: "🚲", label: "Bike",      color: C.emerald },
  scooter: { icon: "🛵", label: "Scooter",   color: C.cyan    },
  van:     { icon: "🚐", label: "Cargo Van", color: C.amber   },
  truck:   { icon: "🚚", label: "Truck",     color: C.blue    },
};

// ─── Navigation Tabs ──────────────────────────────────────────────────────────
export const TABS = ["Dashboard", "Fleet", "Analytics", "Driver", "Reports"];

// ─── AI Modules ───────────────────────────────────────────────────────────────
export const AI_MODULES = [
  { name: "PARKING AI",   status: "active", val: "85%",  label: "zone avail",   color: C.emerald, icon: "🅿️",  usp: "Predicts spot availability 15 min ahead"  },
  { name: "PRIORITY AI",  status: "active", val: "98",   label: "peak score",   color: C.amber,   icon: "⚡",  usp: "7-factor real-time dispatch ranking"      },
  { name: "WEATHER AI",   status: "active", val: "+4m",  label: "ETA adjusted", color: C.blue,    icon: "🌧",  usp: "Hyper-local route safety rerouting"       },
  { name: "ROUTE AI",     status: "active", val: "−18%", label: "fuel saved",   color: C.cyan,    icon: "🗺",  usp: "Live TSP optimisation across all vehicles" },
  { name: "RISK AI",      status: "active", val: "3",    label: "flagged",      color: "#f472b6", icon: "🛡",  usp: "Proactive failure & delay prediction"     },
];

// ─── Vehicles on Map ──────────────────────────────────────────────────────────
export const VEHICLES = [
  { id: "BK-012", type: "bike",    x: 18, y: 55, destX: 55, destY: 30, driver: "Suman Yadav",  delay: 0  },
  { id: "SC-031", type: "scooter", x: 70, y: 72, destX: 30, destY: 45, driver: "Priya Singh",  delay: 25 },
  { id: "CV-042", type: "van",     x: 25, y: 60, destX: 68, destY: 28, driver: "Arjun Kumar",  delay: 50 },
  { id: "TK-007", type: "truck",   x: 82, y: 40, destX: 20, destY: 70, driver: "Vikram Tomar", delay: 15 },
  { id: "BK-017", type: "bike",    x: 58, y: 22, destX: 22, destY: 68, driver: "Asha Mehta",   delay: 35 },
];

// ─── Stats Bar Data ───────────────────────────────────────────────────────────
export const STATS = [
  { icon: "🚗", label: "Active Vehicles", val: 18, sub: "of 24 fleet",   trend: "+3",   up: true, spark: [12,13,14,13,15,16,18],       color: C.blue    },
  { icon: "📦", label: "Deliveries Today", val: 312, sub: "41 remaining", trend: "+18%", up: true, spark: [220,240,265,258,280,298,312], color: C.emerald },
  { icon: "⏱",  label: "Avg. Delivery",   val: 16, sub: "minutes",       trend: "-14%", up: true, spark: [24,22,21,20,19,17,16],        color: C.amber   },
  { icon: "⭐", label: "Customer Rating", val: 4.9, sub: "this week",    trend: "+0.2", up: true, spark: [4.5,4.6,4.7,4.7,4.8,4.9,4.9], color: "#f472b6" },
];

// ─── Deliveries ───────────────────────────────────────────────────────────────
export const DELIVERIES = [
  { id:"DEL-1042", addr:"428 Market St, Unit 5B",     customer:"Priya Sharma",  score:98, urgency:"CRITICAL", dist:"2.4 km", risk:"Low",  eta:"4:32",  riskC: C.emerald, type:"van",     sla:"Guaranteed", weight:"2.1 kg", attempts:1, profit:340 },
  { id:"DEL-1045", addr:"77 Sector-12, Near Metro",  customer:"Dev Choudhary", score:87, urgency:"HIGH",     dist:"3.2 km", risk:"Low",  eta:"8:10",  riskC: C.emerald, type:"bike",    sla:"Express",    weight:"1.5 kg", attempts:1, profit:220 },
  { id:"DEL-1043", addr:"92 Innovation Drive",        customer:"Rahul Verma",   score:76, urgency:"HIGH",     dist:"4.1 km", risk:"Med",  eta:"12:15", riskC: C.amber,   type:"scooter", sla:"Standard",   weight:"0.8 kg", attempts:1, profit:180 },
  { id:"DEL-1044", addr:"1500 Commerce Ave, Ste 300", customer:"Ananya Patel",  score:54, urgency:"MEDIUM",   dist:"6.8 km", risk:"High", eta:"18:40", riskC: C.red,     type:"bike",    sla:"Economy",    weight:"0.3 kg", attempts:2, profit:95  },
  { id:"DEL-1046", addr:"Industrial Zone, Block C",  customer:"Sunita Rawat",  score:41, urgency:"LOW",      dist:"9.1 km", risk:"High", eta:"26:00", riskC: C.red,     type:"truck",   sla:"Economy",    weight:"18 kg",  attempts:3, profit:450 },
];

export const URGENCY_COLOR = { CRITICAL: C.red, HIGH: C.amber, MEDIUM: C.blue, LOW: C.muted };

// ─── Fleet ────────────────────────────────────────────────────────────────────
export const FLEET_ALL = [
  { id:"BK-012", type:"bike",    driver:"Suman Yadav",  status:"active",  battery:88, load:30, deliveries:7,  route:"MG Rd → Old City"        },
  { id:"BK-017", type:"bike",    driver:"Asha Mehta",   status:"active",  battery:71, load:25, deliveries:9,  route:"College Rd → Civil Lines" },
  { id:"SC-031", type:"scooter", driver:"Priya Singh",  status:"active",  battery:62, load:55, deliveries:5,  route:"NH-44 → Sector 7"         },
  { id:"CV-042", type:"van",     driver:"Arjun Kumar",  status:"active",  battery:78, load:85, deliveries:8,  route:"Market St → Inno Dr"      },
  { id:"TK-007", type:"truck",   driver:"Vikram Tomar", status:"active",  battery:55, load:92, deliveries:3,  route:"Industrial Zone → NH-44"  },
];

// ─── Driver Data ──────────────────────────────────────────────────────────────
export const DRIVER_STOPS = [
  { id: 1, label: "Depot",   addr: "MargDarshak HQ, Gwalior",    x: 12, y: 72, done: true,  type: "depot"  },
  { id: 2, label: "Stop 1",  addr: "428 Market St, Unit 5B",      x: 30, y: 58, done: true,  type: "done"   },
  { id: 3, label: "Stop 2",  addr: "92 Innovation Drive",         x: 50, y: 40, done: false, type: "active" },
  { id: 4, label: "Stop 3",  addr: "77 Sector-12, Near Metro",    x: 68, y: 26, done: false, type: "next"   },
  { id: 5, label: "Stop 4",  addr: "1500 Commerce Ave, Ste 300",  x: 84, y: 14, done: false, type: "next"   },
];

export const ACTIVE_ORDER = {
  orderId: "DEL-1043", customer: "Rahul Verma",
  address: "92 Innovation Drive, Sector 7, Gwalior",
  eta: "12 min", etaTime: "3:47 PM", distance: "4.1 km",
  difficulty: "Medium", diffColor: C.amber,
  weight: "0.8 kg · Fragile", phone: "+91 98765 43100",
  notes: "Ring bell twice. Leave at door if no answer.",
  stopNum: 2, totalStops: 4, profit: 180, sla: "Express",
};

export const DRIVER_VEHICLES = [
  { id: "BK-012", type: "bike",    icon: "🚲", label: "Bike",      driver: "Suman Yadav",  color: C.emerald, gradient: "135deg,#10b981,#059669", earnings: "₹940",  deliveries: 7 },
  { id: "BK-017", type: "bike",    icon: "🚲", label: "Bike",      driver: "Asha Mehta",   color: C.emerald, gradient: "135deg,#10b981,#059669", earnings: "₹1,120",deliveries: 9 },
  { id: "SC-031", type: "scooter", icon: "🛵", label: "Scooter",   driver: "Priya Singh",  color: C.cyan,    gradient: "135deg,#22d3ee,#0891b2", earnings: "₹1,340",deliveries: 5 },
  { id: "CV-042", type: "van",     icon: "🚐", label: "Cargo Van", driver: "Arjun Kumar",  color: C.amber,   gradient: "135deg,#f59e0b,#d97706", earnings: "₹1,840",deliveries: 8 },
  { id: "TK-007", type: "truck",   icon: "🚚", label: "Truck",     driver: "Vikram Tomar", color: C.blue,    gradient: "135deg,#3b82f6,#1d4ed8", earnings: "₹2,100",deliveries: 3 },
];

export const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];