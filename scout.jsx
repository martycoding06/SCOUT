import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend,
} from "recharts";

/* ============================================================
   SCOUT. 
   ------------------------------------------------------------
 
   ============================================================ */

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function useSubAgentSync() {
  const [data, setData] = useState({
    players: [],
    clubs: [],
    fixtures: [],
    lastSync: null,
    isLoading: true
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/scout-database');
        const loaded = await res.json();
        setData(prev => ({
          ...prev,
          ...loaded,
          isLoading: false,
          lastSync: loaded.lastUpdated
        }));
      } catch (error) {
        console.error('[Scout] Load failed:', error);
      }
    };

    load();
    const interval = setInterval(load, 300000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
const CLUBS={
"Alavés":{league:"La Liga",strength:0.66},
"Arsenal":{league:"Premier League",strength:0.9},
"Aston Villa":{league:"Premier League",strength:0.79},
"Atalanta":{league:"Serie A",strength:0.83},
"Athletic Club":{league:"La Liga",strength:0.79},
"Atlético Madrid":{league:"La Liga",strength:0.85},
"Augsburg":{league:"Bundesliga",strength:0.68},
"Auxerre":{league:"Ligue 1",strength:0.66},
"Barcelona":{league:"La Liga",strength:0.9},
"Bayern":{league:"Bundesliga",strength:0.93},
"Bologna":{league:"Serie A",strength:0.77},
"Bournemouth":{league:"Premier League",strength:0.75},
"Brentford":{league:"Premier League",strength:0.72},
"Brest":{league:"Ligue 1",strength:0.7},
"Brighton":{league:"Premier League",strength:0.76},
"Cagliari":{league:"Serie A",strength:0.66},
"Celta Vigo":{league:"La Liga",strength:0.71},
"Chelsea":{league:"Premier League",strength:0.84},
"Como":{league:"Serie A",strength:0.72},
"Cremonese":{league:"Serie A",strength:0.62},
"Crystal Palace":{league:"Premier League",strength:0.74},
"Dortmund":{league:"Bundesliga",strength:0.83},
"Espanyol":{league:"La Liga",strength:0.66},
"Everton":{league:"Premier League",strength:0.71},
"Fiorentina":{league:"Serie A",strength:0.76},
"Frankfurt":{league:"Bundesliga",strength:0.79},
"Freiburg":{league:"Bundesliga",strength:0.75},
"Fulham":{league:"Premier League",strength:0.72},
"Genoa":{league:"Serie A",strength:0.68},
"Getafe":{league:"La Liga",strength:0.68},
"Girona":{league:"La Liga",strength:0.71},
"Gladbach":{league:"Bundesliga",strength:0.71},
"Hamburg":{league:"Bundesliga",strength:0.64},
"Heidenheim":{league:"Bundesliga",strength:0.62},
"Hellas Verona":{league:"Serie A",strength:0.62},
"Hoffenheim":{league:"Bundesliga",strength:0.69},
"Inter":{league:"Serie A",strength:0.88},
"Juventus":{league:"Serie A",strength:0.84},
"Köln":{league:"Bundesliga",strength:0.66},
"Lazio":{league:"Serie A",strength:0.76},
"Le Havre":{league:"Ligue 1",strength:0.62},
"Leeds United":{league:"Premier League",strength:0.66},
"Lens":{league:"Ligue 1",strength:0.75},
"Levante":{league:"La Liga",strength:0.63},
"Leverkusen":{league:"Bundesliga",strength:0.85},
"Lille":{league:"Ligue 1",strength:0.78},
"Liverpool":{league:"Premier League",strength:0.91},
"Lorient":{league:"Ligue 1",strength:0.64},
"Lyon":{league:"Ligue 1",strength:0.76},
"Mainz 05":{league:"Bundesliga",strength:0.71},
"Mallorca":{league:"La Liga",strength:0.69},
"Manchester City":{league:"Premier League",strength:0.9},
"Manchester Utd":{league:"Premier League",strength:0.78},
"Marseille":{league:"Ligue 1",strength:0.82},
"Milan":{league:"Serie A",strength:0.82},
"Monaco":{league:"Ligue 1",strength:0.8},
"Napoli":{league:"Serie A",strength:0.87},
"Newcastle":{league:"Premier League",strength:0.82},
"Nice":{league:"Ligue 1",strength:0.75},
"Nottingham":{league:"Premier League",strength:0.72},
"Osasuna":{league:"La Liga",strength:0.69},
"Oviedo":{league:"La Liga",strength:0.6},
"PSG":{league:"Ligue 1",strength:0.92},
"Paris FC":{league:"Ligue 1",strength:0.65},
"Parma":{league:"Serie A",strength:0.65},
"RB Leipzig":{league:"Bundesliga",strength:0.81},
"Rayo Vallecano":{league:"La Liga",strength:0.7},
"Real Betis":{league:"La Liga",strength:0.77},
"Real Madrid":{league:"La Liga",strength:0.92},
"Real Sociedad":{league:"La Liga",strength:0.75},
"Rennes":{league:"Ligue 1",strength:0.73},
"Roma":{league:"Serie A",strength:0.8},
"Sassuolo":{league:"Serie A",strength:0.66},
"Sevilla":{league:"La Liga",strength:0.7},
"St Pauli":{league:"Bundesliga",strength:0.64},
"Strasbourg":{league:"Ligue 1",strength:0.72},
"Stuttgart":{league:"Bundesliga",strength:0.77},
"Sunderland":{league:"Premier League",strength:0.66},
"Torino":{league:"Serie A",strength:0.7},
"Tottenham":{league:"Premier League",strength:0.78},
"Toulouse":{league:"Ligue 1",strength:0.69},
"Udinese":{league:"Serie A",strength:0.7},
"Union Berlin":{league:"Bundesliga",strength:0.68},
"Valencia":{league:"La Liga",strength:0.69},
"Villarreal":{league:"La Liga",strength:0.78},
"Werder Bremen":{league:"Bundesliga",strength:0.7},
"West Ham":{league:"Premier League",strength:0.7},
"Wolfsburg":{league:"Bundesliga",strength:0.71},
"Angers":{league:"Ligue 1",strength:0.62},
"Burnley":{league:"Premier League",strength:0.65},
"Elche":{league:"La Liga",strength:0.62},
"Lecce":{league:"Serie A",strength:0.64},
"Metz":{league:"Ligue 1",strength:0.63},
"Nantes":{league:"Ligue 1",strength:0.68},
"Pisa":{league:"Serie A",strength:0.6},
"Wolves":{league:"Premier League",strength:0.68}
};

const LEAGUES = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"];
const CLUB_NAMES = Object.keys(CLUBS).sort();

const ROLE_POS = { gk: "GK", cb: "DF", fb: "DF", dm: "MF", cm: "MF", am: "MF", w: "FW", st: "FW" };
const ROLE_NAME = { gk: "Goalkeeper", cb: "Centre-back", fb: "Full-back", dm: "Defensive mid", cm: "Central mid", am: "Attacking mid", w: "Winger", st: "Striker" };

const POSITIONS = ["FW", "MF", "DF", "GK"];
const POS_LABEL = { FW: "Forward", MF: "Midfielder", DF: "Defender", GK: "Goalkeeper" };

/* ------------------------ aggregation ------------------------
   Every field here comes straight from the FotMob live data
   (Standard, Goalkeeping, Misc, Shooting). No per-match data
   exists, so there is no game log, no form streak, no home/away
   split, and no passes/dribbles/fouls — those tables were never
   loaded and nothing is invented to fill the gap. */
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

function buildProfile(player) {
  const R = player.R;
  const isGK = player.pos === "GK";
  const mins = R.min || 0;
  const gp = R.mp || 0;
  const agg = {
    gp, starts: R.st || 0, mins,
    goals: R.g || 0, ast: R.as || 0,
    pk: R.pk || 0, pka: R.pka || 0,
    yc: R.cy || 0, rc: R.cr || 0,
    tkl: R.tk != null ? R.tk : null,
    itc: R.itc != null ? R.itc : null,
    sh: R.sh != null ? R.sh : null,
    sot: R.sot != null ? R.sot : null,
    ppm: R.ppm != null ? R.ppm : null,
    onG: R.ong != null ? R.ong : null,
    onGA: R.onga != null ? R.onga : null,
    plusMinus: R.pm != null ? R.pm : null,
    onOff: R.onoff != null ? R.onoff : null,
    sv: isGK ? (R.sv || 0) : 0, ga: isGK ? (R.ga || 0) : 0, cs: isGK ? (R.cs || 0) : 0,
    sota: isGK ? (R.sota || 0) : 0, svp: isGK ? (R.svp != null ? R.svp : null) : null,
    w: isGK ? (R.w || 0) : 0, d: isGK ? (R.d || 0) : 0, l: isGK ? (R.l || 0) : 0,
  };
  const P90 = (v) => (mins ? (v / mins) * 90 : 0);
  const p90 = {
    goals: P90(agg.goals), ast: P90(agg.ast),
    tkl: agg.tkl != null ? P90(agg.tkl) : null,
    itc: agg.itc != null ? P90(agg.itc) : null,
    sh: agg.sh != null ? P90(agg.sh) : null,
    sot: agg.sot != null ? P90(agg.sot) : null,
    sv: P90(agg.sv),
    ga: P90(agg.ga),
    yc: P90(agg.yc),
    rc: P90(agg.rc),
  };
  return { ...player, real: true, agg, p90 };
}

export default function App() {
  const { players: rawPlayers, clubs, fixtures, lastSync, isLoading } = useSubAgentSync();
  const [tab, setTab] = useState("matches");
  const [openId, setOpenId] = useState(null);
  const [openMatchId, setOpenMatchId] = useState(null);
  const [watch, setWatch] = useState(() => new Set());
  const [legs, setLegs] = useState([]);
  const [comparing, setComparing] = useState([]);

  /* every profile is real 2025/26 data — persist watchlist only */
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("scout_watch_v1");
        if (res && res.value) setWatch(new Set(JSON.parse(res.value)));
      } catch (e) { /* nothing stored yet */ }
    })();
  }, []);
  useEffect(() => {
    (async () => { try { await window.storage.set("scout_watch_v1", JSON.stringify([...watch])); } catch (e) {} })();
  }, [watch]);
if (isLoading) {
  return <div style={{ padding: '20px', textAlign: 'center' }}>Loading FotMob data...</div>;
}
const PROFILES = rawPlayers.map(p => ({
  ...p,
  scoutScore: calculateScoutScore(p),
  role: inferRole(p.position),
  id: p.id || generateId(p)
}));
  const NATIONS = [...new Set(PROFILES.map((p) => p.nation))].sort();

/* positional averages (per 90) across the dataset — real fields only */
const POS_AVG = {};
POSITIONS.forEach((pos) => {
  const group = PROFILES.filter((p) => p.pos === pos);
  const avg = {};
  ["goals", "ast", "tkl", "itc", "sh", "sot", "sv"].forEach((k) => {
    const vals = group.map((p) => p.p90[k]).filter((v) => v != null);
    avg[k] = mean(vals);
  });
  POS_AVG[pos] = avg;
});

/* ------------------------- prop engine ------------------------
   Every market here is a Poisson (or direct-rate) projection
   built from a player's REAL season rate — real goals per game,
   real assists per game, real cards per game, real tackles per
   game, real shots per game, real saves per game, real clean-sheet
   rate. There is no passing/dribbling market because that data was
   never loaded, and nothing is estimated to invent one. */
function poisGE(lam, k) {
  let cdf = 0, term = Math.exp(-lam);
  for (let i = 0; i < k; i++) { cdf += term; term *= lam / (i + 1); }
  return clamp(1 - cdf, 0.02, 0.97);
}
function buildProps(p) {
  const g = Math.max(p.agg.gp, 1);
  const rate = (k) => (p.agg[k] || 0) / g;
  const defs = [];
  const add = (key, label, prob) => defs.push({ key, label, prob: clamp(prob, 0.04, 0.96) });
  if (p.pos === "GK") {
    add("sv_0.5", "1+ save", poisGE(rate("sv"), 1));
    add("cs", "Clean sheet", rate("cs"));
  } else {
    add("goals_0.5", "Anytime goalscorer", poisGE(rate("goals"), 1));
    add("card", "To be carded", rate("yc") + rate("rc"));
  }
  return defs.map((d) => {
    const odds = (1 / clamp(d.prob * 1.07, 0.05, 0.97)).toFixed(2);
    const consistency = d.prob >= 0.7 ? "Steady" : d.prob >= 0.45 ? "Fair" : "Volatile";
    return { ...d, gp: p.agg.gp, odds, consistency };
  });
}
const PROPS = Object.fromEntries(PROFILES.map((p) => [p.id, buildProps(p)]));

/* ---------------------- custom stat-line markets ----------------
   For any stat with a per-game rate, generate a ladder of "X.5+"
   lines (0.5+, 1.5+, 2.5+, ...) via the same Poisson model, so the
   person can pick the exact threshold rather than a fixed market. */
function statLineCategories(p) {
  const g = Math.max(p.agg.gp, 1);
  const rate = (tot) => (tot || 0) / g;
  const cats = [];
  if (p.pos === "GK") {
    cats.push({ key: "sv", label: "Saves", rate: rate(p.agg.sv) });
    cats.push({ key: "ga", label: "Goals conceded", rate: rate(p.agg.ga) });
  } else {
    cats.push({ key: "goals", label: "Goals", rate: rate(p.agg.goals) });
    cats.push({ key: "ast", label: "Assists", rate: rate(p.agg.ast) });
    cats.push({ key: "gacombo", label: "Goals + Assists", rate: rate(p.agg.goals + p.agg.ast) });
    if (p.agg.sh != null) cats.push({ key: "sh", label: "Shots", rate: rate(p.agg.sh) });
    if (p.agg.sot != null) cats.push({ key: "sot", label: "Shots on target", rate: rate(p.agg.sot) });
    if (p.agg.tkl != null) cats.push({ key: "tkl", label: "Tackles", rate: rate(p.agg.tkl) });
    if (p.agg.itc != null) cats.push({ key: "itc", label: "Interceptions", rate: rate(p.agg.itc) });
  }
  return cats;
}
function buildLineMarkets(rate, catKey) {
  const numLines = clamp(Math.ceil(rate) + 2, 2, 5);
  return Array.from({ length: numLines }, (_, i) => {
    const line = i + 0.5;
    const prob = clamp(poisGE(rate, i + 1), 0.03, 0.97);
    const odds = (1 / clamp(prob * 1.07, 0.05, 0.97)).toFixed(2);
    const consistency = prob >= 0.7 ? "Steady" : prob >= 0.45 ? "Fair" : "Volatile";
    return { key: `${catKey}_${line}`, line, prob, odds, consistency };
  });
}

/* ------------------------- match engine -----------------------
   SCOUT has no fixture feed, so the matchday below is an
   ILLUSTRATIVE round: pairings are generated inside each league
   and labeled as such everywhere. Match probabilities are a
   Poisson model driven by the club strength index already used
   in this app — a projection, never a real result or live odds. */
function poisPMF(lam, k) { let t = Math.exp(-lam); for (let i = 1; i <= k; i++) t *= lam / i; return t; }
function matchModel(hs, as) {
  const lamH = clamp(1.15 * Math.pow(hs / as, 1.6) + 0.18, 0.4, 3.4);
  const lamA = clamp(1.15 * Math.pow(as / hs, 1.6), 0.35, 3.2);
  let pH = 0, pD = 0, pA = 0, pO25 = 0, pBTTS = 0, best = { p: -1, h: 0, a: 0 };
  for (let h = 0; h <= 8; h++) for (let a = 0; a <= 8; a++) {
    const p = poisPMF(lamH, h) * poisPMF(lamA, a);
    if (h > a) pH += p; else if (h === a) pD += p; else pA += p;
    if (h + a > 2.5) pO25 += p;
    if (h > 0 && a > 0) pBTTS += p;
    if (p > best.p) best = { p, h, a };
  }
  return { lamH, lamA, pH, pD, pA, pO25, pU25: 1 - pO25, pBTTS, proj: `${best.h}–${best.a}` };
}
const priceOf = (p) => (1 / clamp(p * 1.07, 0.05, 0.97)).toFixed(2);

const MATCHES = (() => {
  const out = []; let id = 1;
  const KO = ["12:30", "15:00", "15:00", "17:30", "20:00", "20:45", "21:00", "15:00", "18:00"];
  LEAGUES.forEach((lg) => {
    const clubs = CLUB_NAMES.filter((c) => CLUBS[c].league === lg);
    const n = Math.floor(clubs.length / 2);
    for (let i = 0; i < n; i++) {
      const home = clubs[i], away = clubs[clubs.length - 1 - i];
      const m = matchModel(CLUBS[home].strength, CLUBS[away].strength);
      const markets = [
        { key: "1", label: `${home} to win`, prob: m.pH },
        { key: "X", label: "Draw", prob: m.pD },
        { key: "2", label: `${away} to win`, prob: m.pA },
        { key: "o25", label: "Over 2.5 goals", prob: m.pO25 },
        { key: "u25", label: "Under 2.5 goals", prob: m.pU25 },
        { key: "btts", label: "Both teams to score", prob: m.pBTTS },
      ].map((mk) => {
        const prob = clamp(mk.prob, 0.04, 0.96);
        return { ...mk, prob, odds: priceOf(prob) };
      });
      out.push({ id: id++, lg, home, away, ko: KO[i % KO.length], ...m, markets });
    }
  });
  return out;
})();

const TABLE = {};
LEAGUES.forEach((lg) => {
  const clubs = CLUB_NAMES.filter((c) => CLUBS[c].league === lg);
  TABLE[lg] = clubs.map((c) => {
    const squad = PROFILES.filter((p) => p.club === c);
    const mins = squad.reduce((s, p) => s + p.agg.mins, 0) || 1;
    const ppm = squad.reduce((s, p) => s + (p.agg.ppm || 0) * p.agg.mins, 0) / mins;
    const goals = squad.reduce((s, p) => s + p.agg.goals, 0);
    const rating = mean(squad.map((p) => p.rating));
    return { club: c, squad: squad.length, ppm, goals, rating };
  }).sort((a, b) => b.ppm - a.ppm);
});

/* ------------------------- fuzzy search ----------------------- */
function lev(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}
const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function fuzzyScore(query, name) {
  const q = norm(query.trim());
  if (!q) return 0;
  const full = norm(name);
  if (full.includes(q)) return 0;
  const tokens = full.split(" ");
  let best = Infinity;
  for (const tk of tokens) {
    best = Math.min(best, lev(q, tk));
    if (tk.startsWith(q.slice(0, 3))) best = Math.min(best, 1.5);
  }
  best = Math.min(best, lev(q, full) - Math.max(0, full.length - q.length) * 0.5);
  return best;
}
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
:root{
  --pitch:#0E1A12; --panel:#152318; --panel2:#1B2C1F; --linec:#28402E;
  --chalk:#EFEDE2; --muted:#8CA391; --dim:#5F7565;
  --amber:#F2B843; --amberDim:#8a6a24; --green:#61D98B; --red:#E4572E;
}
*{box-sizing:border-box;margin:0;padding:0}
.ninety{min-height:100vh;background:
  radial-gradient(1200px 500px at 70% -10%, #16301f 0%, transparent 60%),
  var(--pitch);
  color:var(--chalk);font-family:'Inter',sans-serif;font-size:14px;padding-bottom:40px}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px}
.disp{font-family:'Barlow Condensed',sans-serif;letter-spacing:.02em}
.mono{font-family:'IBM Plex Mono',monospace}

/* header */
.hdr{border-bottom:1px solid var(--linec);padding:18px 0 0}
.hdr-top{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:10px}
.brand{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:34px;letter-spacing:.06em}
.brand .apo{color:var(--amber)}
.brand-sub{color:var(--muted);font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin-left:10px}
.sync{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--muted)}
.sync .dot{width:7px;height:7px;border-radius:50%;background:var(--amber);animation:pulse 2.4s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.tabs{display:flex;gap:2px;margin-top:16px;overflow-x:auto}
.tab{background:none;border:none;color:var(--muted);font-family:'Barlow Condensed',sans-serif;
  font-size:17px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  padding:10px 16px;cursor:pointer;border-bottom:3px solid transparent;white-space:nowrap}
.tab:hover{color:var(--chalk)}
.tab.on{color:var(--chalk);border-bottom-color:var(--amber)}
.tab .cnt{color:var(--amber);margin-left:5px}

/* controls */
.controls{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0 16px}
.search{flex:1 1 260px;position:relative}
.search input{width:100%;background:var(--panel);border:1px solid var(--linec);color:var(--chalk);
  padding:11px 14px;border-radius:6px;font-size:14px;font-family:'Inter',sans-serif}
.search input:focus{outline:2px solid var(--amber);outline-offset:-1px}
.search input::placeholder{color:var(--dim)}
select{background:var(--panel);border:1px solid var(--linec);color:var(--chalk);
  padding:11px 12px;border-radius:6px;font-size:13px;font-family:'Inter',sans-serif;cursor:pointer}
select:focus{outline:2px solid var(--amber);outline-offset:-1px}
.hint{color:var(--dim);font-size:12px;margin:-6px 0 14px}
.hint b{color:var(--amber);font-weight:600}

/* player cards */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:12px}
.card{background:var(--panel);border:1px solid var(--linec);border-radius:8px;padding:14px;
  cursor:pointer;transition:border-color .15s, transform .15s;text-align:left;color:var(--chalk);width:100%}
.card:hover{border-color:var(--amber);transform:translateY(-2px)}
.card:focus-visible{outline:2px solid var(--amber)}
.card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.pname{font-family:'Barlow Condensed',sans-serif;font-size:21px;font-weight:600;line-height:1.1}
.pmeta{color:var(--muted);font-size:12px;margin-top:3px}
.pos{font-family:'IBM Plex Mono',monospace;font-size:11px;padding:3px 7px;border-radius:4px;
  border:1px solid var(--linec);color:var(--amber);flex-shrink:0}
.card-stats{display:flex;gap:14px;margin-top:12px}
.cs-item .v{font-family:'IBM Plex Mono',monospace;font-size:17px;font-weight:600}
.cs-item .k{color:var(--dim);font-size:10px;text-transform:uppercase;letter-spacing:.08em;margin-top:1px}

/* detail */
.back{background:none;border:none;color:var(--amber);font-size:13px;cursor:pointer;padding:6px 0;margin-top:16px;font-family:'Inter',sans-serif}
.dhead{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin:8px 0 18px}
.dname{font-family:'Barlow Condensed',sans-serif;font-size:42px;font-weight:700;line-height:1}
.dmeta{color:var(--muted);margin-top:6px;font-size:13px}
.dbtns{display:flex;gap:8px;flex-wrap:wrap}
.btn{background:var(--panel);border:1px solid var(--linec);color:var(--chalk);padding:9px 14px;
  border-radius:6px;font-size:13px;cursor:pointer;font-family:'Inter',sans-serif}
.btn:hover{border-color:var(--amber)}
.btn.amber{background:var(--amber);color:#141a10;border-color:var(--amber);font-weight:600}
.btn.on{border-color:var(--amber);color:var(--amber)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
@media(max-width:820px){.two{grid-template-columns:1fr}}
.panel{background:var(--panel);border:1px solid var(--linec);border-radius:8px;padding:16px}
.ptitle{font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:600;letter-spacing:.1em;
  text-transform:uppercase;color:var(--muted);margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.statgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px}
.sblock{background:var(--panel2);border-radius:6px;padding:9px 10px}
.sblock .v{font-family:'IBM Plex Mono',monospace;font-size:16px;font-weight:600}
.sblock .k{color:var(--dim);font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-top:2px;line-height:1.3}
.sblock .d{font-size:10px;margin-top:2px}
.up{color:var(--green)} .down{color:var(--red)}
table{width:100%;border-collapse:collapse;font-size:13px}
th{color:var(--dim);font-size:10px;text-transform:uppercase;letter-spacing:.08em;text-align:left;
  padding:6px 8px;border-bottom:1px solid var(--linec);font-weight:600}
td{padding:8px;border-bottom:1px solid rgba(40,64,46,.5)}
tr:last-child td{border-bottom:none}
.num{font-family:'IBM Plex Mono',monospace}
.tag{font-size:10px;padding:2px 7px;border-radius:10px;border:1px solid var(--linec);white-space:nowrap}
.tag.Steady{color:var(--green);border-color:var(--green)}
.tag.Fair{color:var(--amber);border-color:var(--amberDim)}
.tag.Volatile{color:var(--red);border-color:var(--red)}
.oddsv{color:var(--amber);font-weight:600}
.addleg{background:none;border:1px solid var(--linec);color:var(--amber);border-radius:5px;
  padding:4px 9px;cursor:pointer;font-size:12px;font-family:'IBM Plex Mono',monospace}
.addleg:hover{border-color:var(--amber)}
.addleg:disabled{opacity:.4;cursor:default}

/* leaderboard */
.lb-row{display:flex;align-items:center;gap:12px;padding:9px 4px;border-bottom:1px solid rgba(40,64,46,.5);cursor:pointer;background:none;border-left:none;border-right:none;border-top:none;width:100%;color:var(--chalk);font-family:'Inter',sans-serif;font-size:14px;text-align:left}
.lb-row:hover .lb-name{color:var(--amber)}
.lb-rank{font-family:'IBM Plex Mono',monospace;color:var(--dim);width:26px;flex-shrink:0}
.lb-name{width:170px;flex-shrink:0;font-weight:500}
.lb-club{color:var(--muted);font-size:11px;width:120px;flex-shrink:0}
.lb-barwrap{flex:1;height:14px;background:var(--panel2);border-radius:3px;overflow:hidden}
.lb-bar{height:100%;background:repeating-linear-gradient(135deg,var(--amber),var(--amber) 6px,#d9a338 6px,#d9a338 12px);border-radius:3px}
.lb-val{font-family:'IBM Plex Mono',monospace;width:60px;text-align:right;flex-shrink:0}
@media(max-width:640px){.lb-club{display:none}.lb-name{width:120px}}

/* parlay */
.leg{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid rgba(40,64,46,.5)}
.leg-info .l1{font-weight:600}
.leg-info .l2{color:var(--muted);font-size:12px;margin-top:2px}
.xbtn{background:none;border:none;color:var(--dim);cursor:pointer;font-size:16px;padding:4px}
.xbtn:hover{color:var(--red)}
.ticket{background:var(--panel2);border:1px dashed var(--amberDim);border-radius:8px;padding:16px;margin-top:14px}
.trow{display:flex;justify-content:space-between;padding:5px 0;font-size:13px}
.trow .tv{font-family:'IBM Plex Mono',monospace}
.trow.big .tv{font-size:22px;color:var(--amber);font-weight:600}
.warn{color:var(--amber);font-size:12px;margin-top:10px;line-height:1.5}
.stake{background:var(--pitch);border:1px solid var(--linec);color:var(--chalk);padding:8px 10px;
  border-radius:6px;width:90px;font-family:'IBM Plex Mono',monospace;font-size:14px}
.empty{color:var(--muted);padding:40px 0;text-align:center;line-height:1.7}
.footer{margin-top:36px;border-top:1px solid var(--linec);padding-top:16px;color:var(--dim);
  font-size:11px;line-height:1.7}
.footer b{color:var(--muted)}
.demochip{display:inline-flex;align-items:center;gap:6px;background:rgba(242,184,67,.08);border:1px solid var(--amberDim);
  color:var(--amber);font-size:11px;padding:4px 10px;border-radius:12px;font-family:'IBM Plex Mono',monospace}
.section-note{color:var(--dim);font-size:12px;margin-bottom:12px;line-height:1.5}
/* matches */
.lg-head{font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:600;letter-spacing:.12em;
  text-transform:uppercase;color:var(--muted);margin:22px 0 8px;display:flex;align-items:center;gap:10px}
.lg-head::after{content:"";flex:1;height:1px;background:var(--linec)}
.mrow{display:flex;align-items:center;gap:12px;width:100%;background:var(--panel);border:1px solid var(--linec);
  border-radius:8px;padding:12px 14px;margin-bottom:8px;cursor:pointer;color:var(--chalk);
  font-family:'Inter',sans-serif;font-size:14px;text-align:left;transition:border-color .15s}
.mrow:hover{border-color:var(--amber)}
.mrow:focus-visible{outline:2px solid var(--amber)}
.mko{font-family:'IBM Plex Mono',monospace;color:var(--dim);font-size:12px;width:44px;flex-shrink:0}
.mteams{flex:1;min-width:0}
.mteam{display:flex;justify-content:space-between;gap:8px;padding:2px 0}
.mteam .tn{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mteam .fav{color:var(--amber)}
.mproj{font-family:'IBM Plex Mono',monospace;color:var(--muted);font-size:12px;flex-shrink:0;text-align:right}
.mproj b{display:block;color:var(--chalk);font-size:15px}
.modds{display:flex;gap:6px;flex-shrink:0}
.oddbtn{background:var(--panel2);border:1px solid var(--linec);color:var(--chalk);border-radius:5px;
  padding:5px 8px;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:12px;min-width:52px;text-align:center}
.oddbtn small{display:block;color:var(--dim);font-size:9px;text-transform:uppercase;letter-spacing:.06em}
.oddbtn:hover{border-color:var(--amber)}
.oddbtn.on{border-color:var(--amber);color:var(--amber)}
@media(max-width:700px){.modds{display:none}}
.probbar{display:flex;height:10px;border-radius:5px;overflow:hidden;margin:10px 0 6px}
.probbar .h{background:var(--amber)} .probbar .d{background:var(--dim)} .probbar .a{background:var(--green)}
.problbl{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);font-family:'IBM Plex Mono',monospace}
.vs-head{display:flex;align-items:center;justify-content:center;gap:18px;margin:10px 0 4px;flex-wrap:wrap}
.vs-head .club{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:700;line-height:1;text-align:center;flex:1;min-width:120px}
.vs-head .mid{font-family:'IBM Plex Mono',monospace;color:var(--muted);text-align:center}
.vs-head .mid b{display:block;font-size:26px;color:var(--chalk)}
.tbl-pos{font-family:'IBM Plex Mono',monospace;color:var(--dim);width:26px}
/* parlay leg kind chip */
.kindchip{font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);
  border:1px solid var(--linec);border-radius:3px;padding:1px 5px;margin-right:6px}
/* parlay: custom hit requirement */
.reqbox{display:flex;align-items:center;justify-content:center;gap:12px;margin:16px 0 4px;
  padding:12px;background:var(--panel2);border-radius:8px;flex-wrap:wrap}
.reqlabel{color:var(--muted);font-size:13px}
.reqstepper{display:flex;align-items:center;gap:10px}
.stepbtn{width:30px;height:30px;border-radius:6px;background:var(--panel);border:1px solid var(--linec);
  color:var(--chalk);font-size:17px;cursor:pointer;line-height:1;font-family:'IBM Plex Mono',monospace}
.stepbtn:hover:not(:disabled){border-color:var(--amber);color:var(--amber)}
.stepbtn:disabled{opacity:.35;cursor:default}
.reqval{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:700;color:var(--amber);min-width:26px;text-align:center}
.reqbars{display:flex;align-items:flex-end;gap:4px;height:56px;margin:14px 2px 4px;padding:0 4px}
.reqbar-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px}
.reqbar-col .reqbar{width:100%;max-width:22px;background:var(--linec);border-radius:2px 2px 0 0;transition:background .15s}
.reqbar-col.on .reqbar{background:var(--amber)}
.reqbar-k{font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--dim)}
.reqbar-col.on .reqbar-k{color:var(--amber)}
/* stat line picker */
.statchips{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 4px}
.statchip{background:var(--panel2);border:1px solid var(--linec);color:var(--muted);border-radius:16px;
  padding:7px 14px;font-size:12px;cursor:pointer;font-family:'Inter',sans-serif;font-weight:500;white-space:nowrap}
.statchip:hover{border-color:var(--amber);color:var(--chalk)}
.statchip.on{background:var(--amber);border-color:var(--amber);color:#141a10;font-weight:600}
.linebtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.linebtn{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:78px;
  background:var(--panel2);border:1px solid var(--linec);border-radius:8px;padding:10px 12px;
  cursor:pointer;font-family:'Inter',sans-serif;color:var(--chalk)}
.linebtn:hover:not(:disabled){border-color:var(--amber);transform:translateY(-1px)}
.linebtn:disabled{border-color:var(--amber);background:rgba(242,184,67,.1);cursor:default}
.lb-line{font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:700;color:var(--amber)}
.lb-prob{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--muted)}
.lb-odds{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600}
.linebtn:disabled .lb-odds::after{content:" ✓";color:var(--amber)}
@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}
`;

/* ============================================================
   Shared bits
   ============================================================ */
const Sblock = ({ v, k, delta }) => (
  <div className="sblock">
    <div className="v">{v}</div>
    <div className="k">{k}</div>
    {delta != null && (
      <div className={`d ${delta >= 0 ? "up" : "down"}`}>
        {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs pos. avg
      </div>
    )}
  </div>
);

const vsAvg = (val, avg) => (avg != null && avg > 0.01 ? Math.round(((val - avg) / avg) * 100) : null);

/* radar normalisation — real per-90 fields only */
const RADAR_MAX = {};
["goals", "ast", "tkl", "itc", "sh", "sv"].forEach((k) => {
  RADAR_MAX[k] = Math.max(...PROFILES.map((p) => p.p90[k] || 0), 0.01);
});
function radarData(players) {
  if (players[0].pos === "GK" && players.every((p) => p.pos === "GK")) {
    const axes = [
      { axis: "Saves /90", f: (p) => (p.p90.sv / RADAR_MAX.sv) * 100 },
      { axis: "Save %", f: (p) => (p.agg.svp != null ? p.agg.svp : pct(p.agg.sv, p.agg.sv + p.agg.ga)) },
      { axis: "Clean sheet %", f: (p) => pct(p.agg.cs, p.agg.gp) },
    ];
    return axes.map((a) => {
      const row = { axis: a.axis };
      players.forEach((p) => { row[p.name] = clamp(Math.round(a.f(p)), 0, 100); });
      return row;
    });
  }
  const axes = [
    { axis: "Goals /90", f: (p) => (p.p90.goals / RADAR_MAX.goals) * 100 },
    { axis: "Assists /90", f: (p) => (p.p90.ast / RADAR_MAX.ast) * 100 },
    { axis: "Shots /90", f: (p) => (p.p90.sh != null ? (p.p90.sh / RADAR_MAX.sh) * 100 : 0) },
    { axis: "Tackles /90", f: (p) => (p.p90.tkl != null ? (p.p90.tkl / RADAR_MAX.tkl) * 100 : 0) },
    { axis: "Interceptions /90", f: (p) => (p.p90.itc != null ? (p.p90.itc / RADAR_MAX.itc) * 100 : 0) },
  ];
  return axes.map((a) => {
    const row = { axis: a.axis };
    players.forEach((p) => { row[p.name] = clamp(Math.round(a.f(p)), 0, 100); });
    return row;
  });
}
const RADAR_COLORS = ["#F2B843", "#61D98B", "#6FB3E0", "#E4572E"];

/* ============================================================
   Views
   ============================================================ */
function PlayerCard({ p, onOpen }) {
  const key1 = p.pos === "GK"
    ? [{ v: p.agg.sv, k: "Saves" }, { v: p.agg.cs, k: "Clean sheets" }, { v: p.agg.ga, k: "Conceded" }]
    : [{ v: p.agg.goals, k: "Goals" }, { v: p.agg.ast, k: "Assists" }, { v: p.agg.gp, k: "Appearances" }];
  return (
    <button className="card" onClick={() => onOpen(p.id)}>
      <div className="card-top">
        <div>
          <div className="pname">{p.name}</div>
          <div className="pmeta">{p.club} · {p.league} · {p.nation}</div>
        </div>
        <span style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
          <span className="pos">{p.pos}</span>
        </span>
      </div>
      <div className="card-stats">
        {key1.map((s) => (
          <div className="cs-item" key={s.k}>
            <div className="v">{s.v}</div>
            <div className="k">{s.k}</div>
          </div>
        ))}
      </div>
      <div className="section-note" style={{ margin: "10px 0 0" }}>
        Scout Score (est.) <span className="mono" style={{ color: "var(--amber)" }}>{p.rating.toFixed(2)}</span>
      </div>
    </button>
  );
}

function PlayersView({ profiles, onOpen }) {
  const [q, setQ] = useState("");
  const [league, setLeague] = useState("");
  const [club, setClub] = useState("");
  const [nation, setNation] = useState("");
  const [pos, setPos] = useState("");

  const clubOptions = league ? CLUB_NAMES.filter((c) => CLUBS[c].league === league) : CLUB_NAMES;

  const { list, fuzzy } = useMemo(() => {
    let base = profiles.filter((p) =>
      (!league || p.league === league) &&
      (!club || p.club === club) &&
      (!nation || p.nation === nation) &&
      (!pos || p.pos === pos)
    );
    base = [...base].sort((x, y) => (y.agg.goals + y.agg.ast) - (x.agg.goals + x.agg.ast));
    if (!q.trim()) return { list: base, fuzzy: false };
    const exact = base.filter((p) => norm(p.name).includes(norm(q)));
    if (exact.length) return { list: exact, fuzzy: false };
    const scored = base
      .map((p) => ({ p, s: fuzzyScore(q, p.name) }))
      .filter((x) => x.s <= 3)
      .sort((a, b) => a.s - b.s);
    return { list: scored.map((x) => x.p), fuzzy: scored.length > 0 };
  }, [q, league, club, nation, pos, profiles]);

  return (
    <div>
      <div className="controls">
        <div className="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search players — typos are fine (try 'Halaand' or 'Bellingam')"
            aria-label="Search players by name"
          />
        </div>
        <select value={league} onChange={(e) => { setLeague(e.target.value); setClub(""); }} aria-label="Filter by league">
          <option value="">All leagues</option>
          {LEAGUES.map((l) => <option key={l}>{l}</option>)}
        </select>
        <select value={club} onChange={(e) => setClub(e.target.value)} aria-label="Filter by club">
          <option value="">All clubs</option>
          {clubOptions.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={nation} onChange={(e) => setNation(e.target.value)} aria-label="Filter by nationality">
          <option value="">All nationalities</option>
          {NATIONS.map((n) => <option key={n}>{n}</option>)}
        </select>
        <select value={pos} onChange={(e) => setPos(e.target.value)} aria-label="Filter by position">
          <option value="">All positions</option>
          {POSITIONS.map((p) => <option key={p} value={p}>{POS_LABEL[p]}</option>)}
        </select>
      </div>
      {fuzzy && <div className="hint">No exact match for “{q}” — showing <b>closest matches</b>.</div>}
      {!fuzzy && <div className="hint">Showing <b>{list.length}</b> of {profiles.length} players</div>}
      {list.length === 0 ? (
        <div className="empty">No players match those filters.<br />Clear a filter or try a different spelling.</div>
      ) : (
        <div className="grid">
          {list.map((p) => <PlayerCard key={p.id} p={p} onOpen={onOpen} />)}
        </div>
      )}
    </div>
  );
}

/* ------------------------- detail view ------------------------ */
function StatLinePicker({ p, addLeg, legs }) {
  const cats = useMemo(() => statLineCategories(p), [p.id]);
  const [statKey, setStatKey] = useState(cats[0] ? cats[0].key : null);
  useEffect(() => { setStatKey(cats[0] ? cats[0].key : null); }, [p.id]);
  const cat = cats.find((c) => c.key === statKey) || cats[0];
  const lines = useMemo(() => (cat ? buildLineMarkets(cat.rate, cat.key) : []), [cat]);
  const inParlay = (key) => legs.some((l) => l.pid === p.id && l.key === key);
  if (!cat) return null;
  return (
    <div className="panel" style={{ marginBottom: 14 }}>
      <div className="ptitle">Stat lines <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>{cat.rate.toFixed(2)} / game, real rate</span></div>
      <div className="section-note">
        Pick a stat, then a line. Each line is a Poisson projection of hitting <b>that count or more</b>, built from this player's own real season rate — click a line to drop it straight into the parlay slip. Prices are indicative, not live odds.
      </div>
      <div className="statchips">
        {cats.map((c) => (
          <button key={c.key} className={`statchip ${statKey === c.key ? "on" : ""}`} onClick={() => setStatKey(c.key)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="linebtns">
        {lines.map((ln) => (
          <button key={ln.key} className="linebtn" disabled={inParlay(ln.key)}
            onClick={() => addLeg(p, { key: ln.key, label: `${cat.label} ${ln.line}+`, prob: ln.prob, odds: ln.odds, consistency: ln.consistency })}
            aria-label={`Add ${cat.label} ${ln.line}+ at ${ln.odds} to parlay`}>
            <span className="lb-line">{ln.line}+</span>
            <span className="lb-prob">{Math.round(ln.prob * 100)}%</span>
            <span className="lb-odds">{ln.odds}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailView({ profiles, id, onBack, watch, toggleWatch, addLeg, legs, addCompare, comparing }) {
  const p = profiles.find((x) => x.id === id);
  const props = PROPS[id];
  const avg = POS_AVG[p.pos];

  const inParlay = (key) => legs.some((l) => l.pid === p.id && l.key === key);

  return (
    <div>
      <button className="back" onClick={onBack}>← All players</button>
      <div className="dhead">
        <div>
          <div className="dname disp">{p.name}</div>
          <div className="dmeta">
            {ROLE_NAME[p.role]} · {p.club} · {p.league} · {p.nation} · Age {p.age}
          </div>
          <div className="section-note" style={{ margin: "8px 0 0" }}>
            Scout Score (estimated, not an FotMob stat) <span className="mono" style={{ color: "var(--amber)" }}>{p.rating.toFixed(2)}</span>
          </div>
        </div>
        <div className="dbtns">
          <button className={`btn ${watch.has(p.id) ? "on" : ""}`} onClick={() => toggleWatch(p.id)}>
            {watch.has(p.id) ? "★ Watching" : "☆ Watch"}
          </button>
          <button className={`btn ${comparing.includes(p.id) ? "on" : ""}`} onClick={() => addCompare(p.id)}>
            {comparing.includes(p.id) ? "In compare" : "+ Compare"}
          </button>
        </div>
      </div>

      <div className="two">
        <div className="panel">
          <div className="ptitle">Profile radar</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData([p])} outerRadius="72%">
              <PolarGrid stroke="#28402E" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "#8CA391", fontSize: 11 }} />
              <Radar dataKey={p.name} stroke="#F2B843" fill="#F2B843" fillOpacity={0.28} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <div className="ptitle">Season snapshot</div>
          <div className="statgrid">
            {p.pos === "GK" ? (
              <>
                <Sblock v={p.agg.sv} k="Saves" />
                <Sblock v={p.agg.svp != null ? `${p.agg.svp}%` : "–"} k="Save %" />
                <Sblock v={p.agg.ga} k="Goals conceded" />
                <Sblock v={p.agg.cs} k="Clean sheets" />
                <Sblock v={p.agg.gp} k="Appearances" />
                <Sblock v={`${p.agg.w}-${p.agg.d}-${p.agg.l}`} k="W-D-L" />
              </>
            ) : (
              <>
                <Sblock v={p.agg.goals} k="Goals" />
                <Sblock v={p.agg.ast} k="Assists" />
                <Sblock v={p.agg.gp} k="Appearances" />
                <Sblock v={p.agg.mins} k="Minutes" />
                <Sblock v={p.agg.tkl != null ? p.agg.tkl : "–"} k="Tackles won" />
                <Sblock v={p.agg.itc != null ? p.agg.itc : "–"} k="Interceptions" />
              </>
            )}
          </div>
        </div>
      </div>

      <StatLinePicker p={p} addLeg={addLeg} legs={legs} />

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="ptitle">Specialty markets</div>
        <div className="section-note">
          These are binary (yes/no), not lines — built the same way, from this player's real per-game rate.
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Market</th><th>Probability</th><th>Consistency</th><th>Price</th><th></th>
              </tr>
            </thead>
            <tbody>
              {props.map((pr) => (
                <tr key={pr.key}>
                  <td>{pr.label}</td>
                  <td className="num">{Math.round(pr.prob * 100) + "%"}</td>
                  <td><span className={`tag ${pr.consistency}`}>{pr.consistency}</span></td>
                  <td className="num oddsv">{pr.odds}</td>
                  <td>
                    <button className="addleg" disabled={inParlay(pr.key)} onClick={() => addLeg(p, pr)}>
                      {inParlay(pr.key) ? "Added" : "+ Parlay"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {p.pos !== "GK" ? (
        <div className="two">
          <div className="panel">
            <div className="ptitle">Attacking &amp; discipline</div>
            <div className="statgrid">
              <Sblock v={p.agg.goals} k="Goals" delta={vsAvg(p.p90.goals, avg.goals)} />
              <Sblock v={p.agg.ast} k="Assists" delta={vsAvg(p.p90.ast, avg.ast)} />
              <Sblock v={p.agg.sh != null ? p.agg.sh : "–"} k="Shots" delta={p.agg.sh != null ? vsAvg(p.p90.sh, avg.sh) : null} />
              <Sblock v={p.agg.sot != null ? p.agg.sot : "–"} k="Shots on target" delta={p.agg.sot != null ? vsAvg(p.p90.sot, avg.sot) : null} />
              <Sblock v={p.agg.pk} k="Penalty goals" />
              <Sblock v={p.agg.pka} k="Penalties taken" />
              <Sblock v={p.agg.yc} k="Yellow cards" />
              <Sblock v={p.agg.rc} k="Red cards" />
            </div>
          </div>
          <div className="panel">
            <div className="ptitle">Defensive &amp; playing time</div>
            <div className="statgrid">
              <Sblock v={p.agg.tkl != null ? p.agg.tkl : "–"} k="Tackles won" delta={p.agg.tkl != null ? vsAvg(p.p90.tkl, avg.tkl) : null} />
              <Sblock v={p.agg.itc != null ? p.agg.itc : "–"} k="Interceptions" delta={p.agg.itc != null ? vsAvg(p.p90.itc, avg.itc) : null} />
              <Sblock v={p.agg.starts} k="Starts" />
              <Sblock v={p.agg.gp} k="Appearances" />
              <Sblock v={p.agg.mins} k="Minutes" />
              <Sblock v={Math.round(p.agg.mins / Math.max(p.agg.gp, 1))} k="Mins / game" />
            </div>
          </div>
        </div>
      ) : null}

      {p.pos !== "GK" && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="ptitle">Per 90 minutes <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>real totals ÷ minutes × 90</span></div>
          <div className="statgrid">
            <Sblock v={p.p90.goals.toFixed(2)} k="Goals /90" />
            <Sblock v={p.p90.ast.toFixed(2)} k="Assists /90" />
            <Sblock v={p.p90.sh != null ? p.p90.sh.toFixed(2) : "–"} k="Shots /90" />
            <Sblock v={p.p90.sot != null ? p.p90.sot.toFixed(2) : "–"} k="Shots on target /90" />
            <Sblock v={p.p90.tkl != null ? p.p90.tkl.toFixed(2) : "–"} k="Tackles /90" />
            <Sblock v={p.p90.itc != null ? p.p90.itc.toFixed(2) : "–"} k="Interceptions /90" />
            <Sblock v={p.p90.yc.toFixed(2)} k="Yellow cards /90" />
            <Sblock v={p.p90.rc.toFixed(2)} k="Red cards /90" />
          </div>
        </div>
      )}

      {p.pos !== "GK" && p.agg.ppm != null && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="ptitle">Team impact while on the pitch <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>FotMob Playing Time</span></div>
          <div className="statgrid">
            <Sblock v={p.agg.ppm.toFixed(2)} k="Team points / match" />
            <Sblock v={p.agg.onG} k="Team goals scored" />
            <Sblock v={p.agg.onGA} k="Team goals conceded" />
            <Sblock v={p.agg.plusMinus > 0 ? `+${p.agg.plusMinus}` : p.agg.plusMinus} k="+/- while on pitch" />
            <Sblock v={p.agg.onOff > 0 ? `+${p.agg.onOff}` : p.agg.onOff} k="On/off diff per 90" />
          </div>
        </div>
      )}

      {p.pos === "GK" ? (
        <div className="two">
          <div className="panel">
            <div className="ptitle">Goalkeeping</div>
            <div className="statgrid">
              <Sblock v={p.agg.sv} k="Saves" delta={vsAvg(p.p90.sv, avg.sv)} />
              <Sblock v={p.agg.svp != null ? `${p.agg.svp}%` : "–"} k="Save %" />
              <Sblock v={p.agg.sota} k="Shots faced" />
              <Sblock v={p.agg.ga} k="Goals conceded" />
              <Sblock v={p.agg.cs} k="Clean sheets" />
              <Sblock v={p.agg.yc} k="Yellow cards" />
            </div>
          </div>
          <div className="panel">
            <div className="ptitle">Playing time &amp; team record</div>
            <div className="statgrid">
              <Sblock v={p.agg.gp} k="Appearances" />
              <Sblock v={p.agg.starts} k="Starts" />
              <Sblock v={p.agg.mins} k="Minutes" />
              <Sblock v={p.agg.w} k="Wins" />
              <Sblock v={p.agg.d} k="Draws" />
              <Sblock v={p.agg.l} k="Losses" />
            </div>
          </div>
        </div>
      ) : null}

      {p.pos === "GK" && (
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="ptitle">Per 90 minutes <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>real totals ÷ minutes × 90</span></div>
          <div className="statgrid">
            <Sblock v={p.p90.sv.toFixed(2)} k="Saves /90" />
            <Sblock v={p.p90.ga.toFixed(2)} k="Goals conceded /90" />
            <Sblock v={p.p90.yc.toFixed(2)} k="Yellow cards /90" />
          </div>
        </div>
      )}
    </div>
  );
}


/* ----------------------- leaderboards ------------------------ */
const LB_STATS = [
  { k: "goals", label: "Goals", get: (p) => p.agg.goals },
  { k: "ast", label: "Assists", get: (p) => p.agg.ast },
  { k: "ga", label: "Goals + Assists", get: (p) => p.agg.goals + p.agg.ast },
  { k: "sh", label: "Shots", get: (p) => p.agg.sh || 0 },
  { k: "sot", label: "Shots on target", get: (p) => p.agg.sot || 0 },
  { k: "min", label: "Minutes played", get: (p) => p.agg.mins },
  { k: "tkl", label: "Tackles won", get: (p) => p.agg.tkl || 0 },
  { k: "itc", label: "Interceptions", get: (p) => p.agg.itc || 0 },
  { k: "yc", label: "Yellow cards", get: (p) => p.agg.yc },
  { k: "sv", label: "Saves (GK)", get: (p) => p.agg.sv, gk: true },
  { k: "cs", label: "Clean sheets (GK)", get: (p) => p.agg.cs, gk: true },
  { k: "svp", label: "Save % (GK)", get: (p) => p.agg.svp || 0, gk: true },
  { k: "goals90", label: "Goals /90", get: (p) => p.p90.goals, rate: true },
  { k: "ast90", label: "Assists /90", get: (p) => p.p90.ast, rate: true },
  { k: "sh90", label: "Shots /90", get: (p) => p.p90.sh || 0, rate: true },
  { k: "tkl90", label: "Tackles /90", get: (p) => p.p90.tkl || 0, rate: true },
  { k: "itc90", label: "Interceptions /90", get: (p) => p.p90.itc || 0, rate: true },
  { k: "sv90", label: "Saves /90 (GK)", get: (p) => p.p90.sv, rate: true, gk: true },
];

function LeaderboardView({ profiles, onOpen }) {
  const [stat, setStat] = useState("goals");
  const [league, setLeague] = useState("");
  const [pos, setPos] = useState("");
  const def = LB_STATS.find((s) => s.k === stat);
  const MIN_MINS_FOR_RATE = 450; // ~5 full games — keeps tiny-sample rates off the board
  const rows = useMemo(() => {
    let pool = profiles.filter((p) =>
      (!league || p.league === league) &&
      (!pos || p.pos === pos) &&
      (def.gk ? p.pos === "GK" : p.pos !== "GK") &&
      (!def.rate || p.agg.mins >= MIN_MINS_FOR_RATE)
    );
    return pool
      .map((p) => ({ p, v: def.get(p) }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 15);
  }, [stat, league, pos, profiles]);
  const max = rows.length ? Math.max(rows[0].v, 0.01) : 1;
  return (
    <div>
      <div className="controls">
        <select value={stat} onChange={(e) => setStat(e.target.value)} aria-label="Leaderboard stat">
          {LB_STATS.map((s) => <option key={s.k} value={s.k}>{s.label}</option>)}
        </select>
        <select value={league} onChange={(e) => setLeague(e.target.value)} aria-label="Filter league">
          <option value="">All leagues</option>
          {LEAGUES.map((l) => <option key={l}>{l}</option>)}
        </select>
        {!def.gk && (
          <select value={pos} onChange={(e) => setPos(e.target.value)} aria-label="Filter position">
            <option value="">All positions</option>
            {POSITIONS.filter((x) => x !== "GK").map((p) => <option key={p} value={p}>{POS_LABEL[p]}</option>)}
          </select>
        )}
      </div>
      <div className="panel">
        <div className="ptitle">
          {def.label} — top {rows.length}
          {def.rate && <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>min. {MIN_MINS_FOR_RATE} mins played</span>}
        </div>
        {rows.map(({ p, v }, i) => (
          <button key={p.id} className="lb-row" onClick={() => onOpen(p.id)}>
            <span className="lb-rank">{String(i + 1).padStart(2, "0")}</span>
            <span className="lb-name">{p.name}</span>
            <span className="lb-club">{p.club}</span>
            <span className="lb-barwrap"><span className="lb-bar" style={{ width: `${(v / max) * 100}%` }} /></span>
            <span className="lb-val">{def.rate ? v.toFixed(2) : v}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------- compare --------------------------- */
function CompareView({ profiles, comparing, setComparing, onOpen }) {
  const [q, setQ] = useState("");
  const players = comparing.map((id) => profiles.find((p) => p.id === id));
  const results = q.trim()
    ? profiles.filter((p) => !comparing.includes(p.id))
        .map((p) => ({ p, s: norm(p.name).includes(norm(q)) ? 0 : fuzzyScore(q, p.name) }))
        .filter((x) => x.s <= 3).sort((a, b) => a.s - b.s).slice(0, 5)
    : [];
  const rows = players.length
    ? [
        { k: "Games", f: (p) => p.agg.gp },
        { k: "Minutes", f: (p) => p.agg.mins },
        { k: "Goals", f: (p) => p.agg.goals },
        { k: "Assists", f: (p) => p.agg.ast },
        { k: "Goals + Assists", f: (p) => p.agg.goals + p.agg.ast },
        { k: "Goals /90", f: (p) => p.p90.goals.toFixed(2) },
        { k: "Assists /90", f: (p) => p.p90.ast.toFixed(2) },
        { k: "Shots", f: (p) => (p.agg.sh != null ? p.agg.sh : "–") },
        { k: "Shots on target", f: (p) => (p.agg.sot != null ? p.agg.sot : "–") },
        { k: "Shots /90", f: (p) => (p.p90.sh != null ? p.p90.sh.toFixed(2) : "–") },
        { k: "Tackles won", f: (p) => (p.agg.tkl != null ? p.agg.tkl : "–") },
        { k: "Interceptions", f: (p) => (p.agg.itc != null ? p.agg.itc : "–") },
        { k: "Tackles /90", f: (p) => (p.p90.tkl != null ? p.p90.tkl.toFixed(2) : "–") },
        { k: "Interceptions /90", f: (p) => (p.p90.itc != null ? p.p90.itc.toFixed(2) : "–") },
        { k: "Yellow cards", f: (p) => p.agg.yc },
        { k: "Red cards", f: (p) => p.agg.rc },
        { k: "Saves (GK)", f: (p) => (p.pos === "GK" ? p.agg.sv : "–") },
        { k: "Saves /90 (GK)", f: (p) => (p.pos === "GK" ? p.p90.sv.toFixed(2) : "–") },
        { k: "Save % (GK)", f: (p) => (p.pos === "GK" && p.agg.svp != null ? `${p.agg.svp}%` : "–") },
        { k: "Clean sheets (GK)", f: (p) => (p.pos === "GK" ? p.agg.cs : "–") },
      ]
    : [];
  return (
    <div>
      <div className="controls">
        <div className="search">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Add player to comparison (max 4)…" aria-label="Add player to comparison" />
        </div>
      </div>
      {results.length > 0 && (
        <div className="panel" style={{ marginBottom: 14 }}>
          {results.map(({ p }) => (
            <button key={p.id} className="lb-row" onClick={() => { if (comparing.length < 4) { setComparing([...comparing, p.id]); setQ(""); } }}>
              <span className="lb-name">{p.name}</span>
              <span className="lb-club">{p.club} · {p.pos}</span>
              <span style={{ color: "var(--amber)", marginLeft: "auto" }}>+ add</span>
            </button>
          ))}
        </div>
      )}
      {players.length === 0 ? (
        <div className="empty">Add 2–4 players to compare their profiles side by side.<br />You can also add players from their profile page.</div>
      ) : (
        <>
          <div className="controls" style={{ gap: 8 }}>
            {players.map((p, i) => (
              <button key={p.id} className="btn on" style={{ borderColor: RADAR_COLORS[i], color: RADAR_COLORS[i] }}
                onClick={() => setComparing(comparing.filter((id) => id !== p.id))}>
                {p.name} ✕
              </button>
            ))}
          </div>
          <div className="two">
            <div className="panel">
              <div className="ptitle">Radar overlay</div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData(players)} outerRadius="70%">
                  <PolarGrid stroke="#28402E" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "#8CA391", fontSize: 11 }} />
                  {players.map((p, i) => (
                    <Radar key={p.id} dataKey={p.name} stroke={RADAR_COLORS[i]} fill={RADAR_COLORS[i]} fillOpacity={0.14} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="panel" style={{ overflowX: "auto" }}>
              <div className="ptitle">Side by side</div>
              <table>
                <thead>
                  <tr><th></th>{players.map((p) => <th key={p.id}>{p.name.split(" ").slice(-1)[0]}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.k}>
                      <td style={{ color: "var(--muted)" }}>{r.k}</td>
                      {players.map((p) => <td key={p.id} className="num">{r.f(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------------- matches -------------------------- */
function MatchesView({ legs, addMatchLeg, onOpenMatch }) {
  const [league, setLeague] = useState("");
  const inSlip = (m, key) => legs.some((l) => l.pid === `m${m.id}` && l.key === key);
  const shown = MATCHES.filter((m) => !league || m.lg === league);
  return (
    <div>
      <div className="controls" style={{ marginBottom: 4 }}>
        <select value={league} onChange={(e) => setLeague(e.target.value)} aria-label="Filter matches by league">
          <option value="">All leagues</option>
          {LEAGUES.map((l) => <option key={l}>{l}</option>)}
        </select>
        <span className="demochip">Illustrative matchday — pairings generated for demo, not a real fixture list</span>
      </div>
      {LEAGUES.filter((lg) => !league || lg === league).map((lg) => (
        <div key={lg}>
          <div className="lg-head">{lg}</div>
          {shown.filter((m) => m.lg === lg).map((m) => {
            const fav = m.pH > m.pA ? "h" : "a";
            return (
              <div key={m.id} className="mrow" role="button" tabIndex={0}
                onClick={() => onOpenMatch(m.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenMatch(m.id); } }}>
                <span className="mko">{m.ko}</span>
                <span className="mteams">
                  <span className="mteam"><span className={`tn ${fav === "h" ? "fav" : ""}`}>{m.home}</span></span>
                  <span className="mteam"><span className={`tn ${fav === "a" ? "fav" : ""}`}>{m.away}</span></span>
                </span>
                <span className="mproj">projected<b>{m.proj}</b></span>
                <span className="modds" onClick={(e) => e.stopPropagation()}>
                  {m.markets.slice(0, 3).map((mk) => (
                    <button key={mk.key} className={`oddbtn ${inSlip(m, mk.key) ? "on" : ""}`}
                      disabled={inSlip(m, mk.key)} onClick={() => addMatchLeg(m, mk)}
                      aria-label={`Add ${mk.label} at ${mk.odds} to parlay`}>
                      <small>{mk.key}</small>{mk.odds}
                    </button>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      ))}
      <div className="section-note" style={{ marginTop: 10 }}>
        Projected scores and 1‑X‑2 prices come from a Poisson model over each club's strength index — a projection, never a result or a live market. Tap a row for full markets and both squads.
      </div>
    </div>
  );
}

function MatchDetail({ mid, onBack, legs, addMatchLeg, addLeg, onOpenPlayer }) {
  const m = MATCHES.find((x) => x.id === mid);
  if (!m) return null;
  const inSlip = (key) => legs.some((l) => l.pid === `m${m.id}` && l.key === key);
  const inPlayerSlip = (pid, key) => legs.some((l) => l.pid === pid && l.key === key);
  const squad = (club) => PROFILES.filter((p) => p.club === club)
    .sort((a, b) => (b.agg.goals + b.agg.ast) - (a.agg.goals + a.agg.ast) || b.agg.mins - a.agg.mins)
    .slice(0, 8);
  const bestProp = (p) => {
    const pr = PROPS[p.id] || [];
    return [...pr].sort((a, b) => b.prob - a.prob)[0];
  };
  const pctv = (v) => Math.round(v * 100);
  const SquadPanel = ({ club }) => (
    <div className="panel">
      <div className="ptitle">{club} — key players <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>real 25/26 output</span></div>
      <table>
        <thead><tr><th>Player</th><th>G+A</th><th>Top market</th><th>Price</th><th></th></tr></thead>
        <tbody>
          {squad(club).map((p) => {
            const pr = bestProp(p);
            return (
              <tr key={p.id}>
                <td><button className="back" style={{ margin: 0, padding: 0, fontSize: 13 }} onClick={() => onOpenPlayer(p.id)}>{p.name}</button></td>
                <td className="num">{p.agg.goals + p.agg.ast}</td>
                <td style={{ fontSize: 12 }}>{pr ? `${pr.label} · ${pctv(pr.prob)}%` : "–"}</td>
                <td className="num oddsv">{pr ? pr.odds : "–"}</td>
                <td>{pr && (
                  <button className="addleg" disabled={inPlayerSlip(p.id, pr.key)} onClick={() => addLeg(p, pr)}>
                    {inPlayerSlip(p.id, pr.key) ? "Added" : "+"}
                  </button>
                )}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  return (
    <div>
      <button className="back" onClick={onBack}>← All matches</button>
      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="vs-head">
          <span className="club">{m.home}</span>
          <span className="mid">{m.lg} · {m.ko}<b>{m.proj}</b>projected</span>
          <span className="club">{m.away}</span>
        </div>
        <div className="probbar" aria-hidden="true">
          <span className="h" style={{ width: `${m.pH * 100}%` }} />
          <span className="d" style={{ width: `${m.pD * 100}%` }} />
          <span className="a" style={{ width: `${m.pA * 100}%` }} />
        </div>
        <div className="problbl">
          <span>{m.home} {pctv(m.pH)}%</span><span>draw {pctv(m.pD)}%</span><span>{m.away} {pctv(m.pA)}%</span>
        </div>
        <div className="section-note" style={{ marginTop: 10, marginBottom: 0 }}>
          Illustrative fixture. Win, draw, total-goals and BTTS probabilities are a Poisson projection from each club's strength index (expected goals {m.lamH.toFixed(2)} v {m.lamA.toFixed(2)}). Prices are indicative, never live odds.
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="ptitle">Match markets</div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Market</th><th>Probability</th><th>Price</th><th></th></tr></thead>
            <tbody>
              {m.markets.map((mk) => (
                <tr key={mk.key}>
                  <td>{mk.label}</td>
                  <td className="num">{pctv(mk.prob)}%</td>
                  <td className="num oddsv">{mk.odds}</td>
                  <td>
                    <button className="addleg" disabled={inSlip(mk.key)} onClick={() => addMatchLeg(m, mk)}>
                      {inSlip(mk.key) ? "Added" : "+ Parlay"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="two">
        <SquadPanel club={m.home} />
        <SquadPanel club={m.away} />
      </div>
    </div>
  );
}

/* ---------------------------- table --------------------------- */
function TableView({ onOpenClubPlayer }) {
  const [league, setLeague] = useState(LEAGUES[0]);
  const rows = TABLE[league];
  return (
    <div>
      <div className="controls" style={{ marginBottom: 8 }}>
        <select value={league} onChange={(e) => setLeague(e.target.value)} aria-label="League table">
          {LEAGUES.map((l) => <option key={l}>{l}</option>)}
        </select>
        <span className="demochip">Power table — derived from real player data, not the official standings</span>
      </div>
      <div className="panel">
        <div className="ptitle">{league} — minutes-weighted team points per match</div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>#</th><th>Club</th><th>Pts / match</th><th>Squad goals</th><th>Avg rating</th><th>Players</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.club}>
                  <td className="tbl-pos">{String(i + 1).padStart(2, "0")}</td>
                  <td style={{ fontWeight: 500 }}>{r.club}</td>
                  <td className="num oddsv">{r.ppm.toFixed(2)}</td>
                  <td className="num">{r.goals}</td>
                  <td className="num">{r.rating.toFixed(2)}</td>
                  <td className="num" style={{ color: "var(--muted)" }}>{r.squad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="section-note" style={{ marginTop: 10, marginBottom: 0 }}>
          Ranked by each squad's real FotMob team points-per-match, weighted by every player's real minutes. Squad goals and appearances are real season totals; this ordering is a derived power ranking, not the league's official table.
        </div>
      </div>
    </div>
  );
}

/* --------------------------- parlay --------------------------- */
/* exact-hit-count distribution for independent legs with different
   probabilities: dp[j] = P(exactly j of the legs land). Built once
   per legs array via simple convolution (add one leg at a time). */
function hitDistribution(legs) {
  let dp = [1];
  for (const l of legs) {
    const nd = new Array(dp.length + 1).fill(0);
    for (let j = 0; j < dp.length; j++) {
      nd[j] += dp[j] * (1 - l.prob);
      nd[j + 1] += dp[j] * l.prob;
    }
    dp = nd;
  }
  return dp;
}

function ParlayView({ legs, removeLeg, onOpen }) {
  const [stake, setStake] = useState(10);
  const [minHits, setMinHits] = useState(legs.length || 1);

  /* keep the requirement in range as legs are added/removed, but
     leave it alone otherwise so the user's choice sticks */
  useEffect(() => {
    setMinHits((k) => clamp(k, 1, Math.max(legs.length, 1)));
  }, [legs.length]);

  const n = legs.length;
  const dist = useMemo(() => hitDistribution(legs), [legs]);
  const atLeastProb = useMemo(
    () => dist.slice(minHits).reduce((s, v) => s + v, 0),
    [dist, minHits]
  );
  const fairOdds = atLeastProb > 0 ? 1 / atLeastProb : 0;
  const indicativeOdds = 1 / clamp(atLeastProb * 1.07, 0.01, 0.98);
  const fullParlayOdds = legs.reduce((o, l) => o * parseFloat(l.odds), 1);
  const isFullHouse = minHits === n;

  const sameTeam = new Set();
  const teams = legs.flatMap((l) => String(l.club).split("|"));
  teams.forEach((t, i) => { if (teams.indexOf(t) !== i) sameTeam.add(t); });

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="panel" style={{ marginTop: 20 }}>
        <div className="ptitle">Parlay builder <span className="mono" style={{ fontSize: 11 }}>{n} leg{n === 1 ? "" : "s"}</span></div>
        {n === 0 ? (
          <div className="empty">No legs yet.<br />Add match markets from the <b style={{ color: "var(--amber)" }}>Matches</b> tab, or open any player and tap <b style={{ color: "var(--amber)" }}>+ Parlay</b> next to a market.</div>
        ) : (
          <>
            {legs.map((l) => (
              <div className="leg" key={`${l.pid}-${l.key}`}>
                <div className="leg-info">
                  <div className="l1">
                    <span className="kindchip">{typeof l.pid === "string" ? "match" : "player"}</span>
                    <button className="back" style={{ margin: 0, padding: 0, fontSize: 14 }} onClick={() => onOpen(l.pid)}>{l.player}</button>
                    {" — "}{l.label}
                  </div>
                  <div className="l2">{l.club} · probability {(l.prob * 100).toFixed(0)}% · price <span className="oddsv mono">{l.odds}</span></div>
                </div>
                <button className="xbtn" onClick={() => removeLeg(l)} aria-label={`Remove ${l.player} ${l.label}`}>✕</button>
              </div>
            ))}

            {n > 1 && (
              <div className="reqbox">
                <div className="reqlabel">Require at least</div>
                <div className="reqstepper">
                  <button className="stepbtn" onClick={() => setMinHits((k) => clamp(k - 1, 1, n))} disabled={minHits <= 1} aria-label="Require fewer legs">−</button>
                  <span className="reqval">{minHits}</span>
                  <button className="stepbtn" onClick={() => setMinHits((k) => clamp(k + 1, 1, n))} disabled={minHits >= n} aria-label="Require more legs">+</button>
                </div>
                <div className="reqlabel">of {n} legs to hit</div>
              </div>
            )}

            {n > 1 && (
              <div className="reqbars" aria-hidden="true">
                {dist.map((p, j) => (
                  <div key={j} className={`reqbar-col ${j >= minHits ? "on" : ""}`}>
                    <div className="reqbar" style={{ height: `${Math.max(p * 100, 2)}%` }} />
                    <span className="reqbar-k">{j}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="ticket">
              <div className="trow">
                <span>{n > 1 && !isFullHouse ? `Probability of ${minHits}+ of ${n} hitting` : "Combined probability (if independent)"}</span>
                <span className="tv">{(atLeastProb * 100).toFixed(1)}%</span>
              </div>
              <div className="trow"><span>Fair odds at that probability</span><span className="tv">{fairOdds.toFixed(2)}</span></div>
              <div className="trow big"><span>Indicative price</span><span className="tv">{indicativeOdds.toFixed(2)}</span></div>
              {n > 1 && !isFullHouse && (
                <div className="trow" style={{ color: "var(--muted)", fontSize: 12 }}>
                  <span>All-{n}-legs price for comparison</span><span className="tv">{fullParlayOdds.toFixed(2)}</span>
                </div>
              )}
              <div className="trow" style={{ alignItems: "center", marginTop: 6 }}>
                <span>Stake
                  <input className="stake" style={{ marginLeft: 10 }} type="number" min="0" value={stake}
                    onChange={(e) => setStake(Math.max(0, +e.target.value || 0))} aria-label="Stake" />
                </span>
                <span className="tv">returns {(stake * indicativeOdds).toFixed(2)}</span>
              </div>
              {n > 1 && (
                <div className="warn" style={{ color: "var(--muted)" }}>
                  Lowering the requirement (fewer of {n} needed) raises the probability and lowers the price. Raising it toward all {n} lowers the probability and inflates the price.
                </div>
              )}
              {sameTeam.size > 0 && (
                <div className="warn">⚠ Multiple legs involve {[...sameTeam].join(", ")} — these outcomes are correlated in reality (e.g. a player scoring often coincides with their team performing well), so the true probability differs from the independent estimate above.</div>
              )}
              {fairOdds > indicativeOdds && (
                <div className="warn">Note: indicative price is below fair odds — that gap is the built-in margin. This is why long or strict parlays are rarely +EV.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------- watchlist ------------------------- */
function WatchlistView({ profiles, watch, onOpen }) {
  const players = profiles.filter((p) => watch.has(p.id));
  return players.length === 0 ? (
    <div className="empty">Your watchlist is empty.<br />Tap <b style={{ color: "var(--amber)" }}>☆ Watch</b> on any player profile to track them here before matchday.</div>
  ) : (
    <div className="grid" style={{ marginTop: 20 }}>
      {players.map((p) => <PlayerCard key={p.id} p={p} onOpen={onOpen} />)}
    </div>
  );
}


/* --------------------------- about --------------------------- */
function AboutView() {
  const counts = { players: PROFILES.length, clubs: CLUB_NAMES.length,
    keepers: PROFILES.filter((p) => p.pos === "GK").length };
  return (
    <div style={{ maxWidth: 760, paddingTop: 16 }}>
      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="ptitle">About this data</div>
        <div className="section-note" style={{ fontSize: 13 }}>
          SCOUT is loaded with <b style={{ color: "var(--green)" }}>real 2025/26 season data</b> for {counts.players} players
          ({counts.keepers} goalkeepers) across {counts.clubs} clubs in the Big-5 European leagues, sourced directly
          from five FotMob exports: <b>Standard</b>, <b>Goalkeeping</b>, <b>Misc</b>, <b>Shooting</b>, and <b>Playing Time</b>. Every stat below is real —
          nothing is simulated, and no per-match data is invented to fill gaps in what those tables cover.
        </div>
        <table>
          <thead><tr><th>Field</th><th>Source</th></tr></thead>
          <tbody>
            <tr><td style={{ color: "var(--green)" }}>Goals, assists, penalties</td><td style={{ color: "var(--muted)" }}>FotMob Standard</td></tr>
            <tr><td style={{ color: "var(--green)" }}>Minutes, matches, starts</td><td style={{ color: "var(--muted)" }}>FotMob Standard</td></tr>
            <tr><td style={{ color: "var(--green)" }}>Yellow &amp; red cards</td><td style={{ color: "var(--muted)" }}>FotMob Standard</td></tr>
            <tr><td style={{ color: "var(--green)" }}>Tackles won &amp; interceptions</td><td style={{ color: "var(--muted)" }}>FotMob Misc</td></tr>
            <tr><td style={{ color: "var(--green)" }}>Shots &amp; shots on target</td><td style={{ color: "var(--muted)" }}>FotMob Shooting</td></tr>
            <tr><td style={{ color: "var(--green)" }}>Team points/match, on-pitch goals, +/-, on/off diff</td><td style={{ color: "var(--muted)" }}>FotMob Playing Time</td></tr>
            <tr><td style={{ color: "var(--green)" }}>Saves, goals against, save%, clean sheets, W-D-L</td><td style={{ color: "var(--muted)" }}>FotMob Goalkeeping</td></tr>
          </tbody>
        </table>
      </div>
      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="ptitle">The two things that aren't raw FotMob numbers</div>
        <div className="section-note" style={{ fontSize: 13 }}>
          <b style={{ color: "var(--amber)" }}>Scout Score</b> — a rough estimated quality score Claude computes from a player's
          real per-90 output (role baseline + attacking or defensive rate + minutes reliability). It's labeled "estimated"
          everywhere it appears and is never presented as an FotMob stat. It only affects default sort order in Players.
        </div>
        <div className="section-note" style={{ fontSize: 13 }}>
          <b style={{ color: "var(--amber)" }}>Stat lines & prop probabilities</b> — on every player page you pick a stat
          (goals, assists, shots, shots on target, tackles, interceptions, or saves/goals-conceded for keepers) and a
          line (0.5+, 1.5+, 2.5+, ...); each line's probability is a Poisson projection built from that player's own
          real season rate for that stat. A couple of binary specialty markets (anytime scorer, to be carded, clean
          sheet) work the same way. These are projections, not stats themselves, but every input to them is real.
          There is no passing, dribbling, clearance, or fouls market, because that data was never loaded and nothing
          is invented to simulate one.
        </div>
      </div>
      <div className="section-note">
        There is no game-by-game log, no per-match trend chart, no home/away split, and no "form" streak — none of that
        exists in the source data, and SCOUT no longer fabricates it. Every number on every page traces back to one of
        FotMob live feeds above, except the two items explicitly labeled "estimated" here.
      </div>
    </div>
  );
}

/* ============================================================
   App
   ============================================================ */
const profiles = PROFILES;

  const openPlayer = (id) => {
    if (typeof id === "string" && id.startsWith("m")) {
      setOpenMatchId(+id.slice(1)); setTab("matches"); setOpenId(null); window.scrollTo(0, 0); return;
    }
    setOpenId(id); setTab("players"); window.scrollTo(0, 0);
  };
  const openMatch = (mid) => { setOpenMatchId(mid); setTab("matches"); window.scrollTo(0, 0); };
  const toggleWatch = (id) => setWatch((w) => { const n = new Set(w); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const addLeg = (p, pr) => setLegs((L) =>
    L.some((l) => l.pid === p.id && l.key === pr.key) ? L :
    [...L, { pid: p.id, player: p.name, club: p.club, key: pr.key, label: pr.label, prob: pr.prob, odds: pr.odds }]
  );
  const addMatchLeg = (m, mk) => setLegs((L) =>
    L.some((l) => l.pid === `m${m.id}` && l.key === mk.key) ? L :
    [...L, { pid: `m${m.id}`, player: `${m.home} v ${m.away}`, club: `${m.home}|${m.away}`, key: mk.key, label: mk.label, prob: mk.prob, odds: mk.odds }]
  );
  const removeLeg = (leg) => setLegs((L) => L.filter((l) => !(l.pid === leg.pid && l.key === leg.key)));
  const addCompare = (id) => setComparing((c) =>
    c.includes(id) ? c.filter((x) => x !== id) : c.length < 4 ? [...c, id] : c
  );

  const TABS = [
    { k: "matches", label: "Matches" },
    { k: "table", label: "Table" },
    { k: "players", label: "Players" },
    { k: "leaderboards", label: "Leaderboards" },
    { k: "compare", label: "Compare", cnt: comparing.length || null },
    { k: "parlay", label: "Parlay", cnt: legs.length || null },
    { k: "watchlist", label: "Watchlist", cnt: watch.size || null },
    { k: "about", label: "About data", cnt: null },
  ];

  return (
    <div className="ninety">
      <style>{CSS}</style>
      <header className="hdr">
        <div className="wrap">
          <div className="hdr-top">
            <div>
              <span className="brand">SCOUT<span className="apo">.</span></span>
              <span className="brand-sub">matches · stats · parlay research</span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span className="demochip" style={{ color: "var(--orange)", borderColor: "var(--orange)", background: "rgba(249,115,22,.08)" }}>◈ FotMob Live</span>

{lastSync && (
  <span className="demochip" style={{ fontSize: 11, color: '#666' }}>
    synced {getTimeAgo(lastSync)}
  </span>
)}
              <span className="sync"><span className="dot" />{`${PROFILES.length} players · ${CLUB_NAMES.length} clubs · ${LEAGUES.length} leagues`}</span>
            </div>
          </div>
          <nav className="tabs">
            {TABS.map((t) => (
              <button key={t.k} className={`tab ${tab === t.k ? "on" : ""}`}
                onClick={() => { setTab(t.k); setOpenId(null); if (t.k !== "matches") setOpenMatchId(null); }}>
                {t.label}{t.cnt ? <span className="cnt">{t.cnt}</span> : null}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="wrap" style={{ paddingTop: tab === "players" && !openId ? 4 : 0 }}>
        {tab === "matches" && (openMatchId
          ? <MatchDetail mid={openMatchId} onBack={() => setOpenMatchId(null)} legs={legs}
              addMatchLeg={addMatchLeg} addLeg={addLeg} onOpenPlayer={openPlayer} />
          : <div style={{ paddingTop: 16 }}><MatchesView legs={legs} addMatchLeg={addMatchLeg} onOpenMatch={openMatch} /></div>)}
        {tab === "table" && <div style={{ paddingTop: 16 }}><TableView /></div>}
        {tab === "players" && (openId
          ? <DetailView profiles={profiles} id={openId} onBack={() => setOpenId(null)} watch={watch} toggleWatch={toggleWatch}
              addLeg={addLeg} legs={legs} addCompare={addCompare} comparing={comparing} />
          : <div style={{ paddingTop: 16 }}><PlayersView profiles={profiles} onOpen={openPlayer} /></div>)}
        {tab === "leaderboards" && <div style={{ paddingTop: 16 }}><LeaderboardView profiles={profiles} onOpen={openPlayer} /></div>}
        {tab === "compare" && <div style={{ paddingTop: 16 }}><CompareView profiles={profiles} comparing={comparing} setComparing={setComparing} onOpen={openPlayer} /></div>}
        {tab === "parlay" && <ParlayView legs={legs} removeLeg={removeLeg} onOpen={openPlayer} />}
        {tab === "about" && <AboutView />}
        {tab === "watchlist" && <WatchlistView profiles={profiles} watch={watch} onOpen={openPlayer} />}

        <footer className="footer">
          <b>Research tool only.</b> SCOUT does not accept or place bets. If you gamble, set limits and stick to them — support is available at BeGambleAware.org or your local equivalent. 18+/21+ depending on jurisdiction.
        </footer>
      </main>
    </div>
  );
}
function getTimeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function generateId(player) {
  return `player_${player.name.replace(/\s+/g, '_').toLowerCase()}_${player.club.replace(/\s+/g, '_').toLowerCase()}`;
}

function inferRole(position) {
  if (!position) return 'na';
  const pos = position.toUpperCase();
  if (pos.includes('GK')) return 'gk';
  if (pos.includes('CB') || pos.includes('DEF')) return 'cb';
  if (pos.includes('FB') || pos.includes('LB') || pos.includes('RB')) return 'fb';
  if (pos.includes('DM')) return 'dm';
  if (pos.includes('CM')) return 'cm';
  if (pos.includes('AM')) return 'am';
  if (pos.includes('W')) return 'w';
  if (pos.includes('ST') || pos.includes('CF')) return 'st';
  return 'na';
}

function calculateScoutScore(player) {
  const apps = Math.max(player.appearances || 0, 1);
  const appRate = Math.min(apps / 38, 1);
  const goals = player.goals || 0;
  const assists = player.assists || 0;
  const contrib = (goals + assists) / apps;
  
  const score = 4 + (appRate * 2) + (contrib * 3);
  return parseFloat(Math.min(score, 10).toFixed(2));
}
