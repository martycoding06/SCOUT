import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const config = { maxDuration: 300 };

const LEAGUES = [
  { id: 47, name: 'Premier League' },
  { id: 87, name: 'La Liga' },
  { id: 54, name: 'Bundesliga' },
  { id: 55, name: 'Serie A' },
  { id: 53, name: 'Ligue 1' },
  ];

const CLUB_NAME_OVERRIDES = {
  'Man City': 'Manchester City',
  'Man United': 'Manchester Utd',
  'Leeds': 'Leeds United',
  'Nottm Forest': 'Nottingham',
  'Atletico Madrid': 'Atlético Madrid',
  'Deportivo Alaves': 'Alavés',
  'Real Oviedo': 'Oviedo',
  'Bayern München': 'Bayern',
  'VfB Stuttgart': 'Stuttgart',
  "M'gladbach": 'Gladbach',
  'Hamburger SV': 'Hamburg',
  'FC Heidenheim': 'Heidenheim',
  'St. Pauli': 'St Pauli',
  'Mainz': 'Mainz 05',
};
const clubName = (n) => CLUB_NAME_OVERRIDES[n] || n;

const GROUP_POS = { keepers: 'GK', defenders: 'DF', midfielders: 'MF', attackers: 'FW' };

const FETCH_HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' };

async function fetchJson(url) {
  const r = await fetch(url, { headers: FETCH_HEADERS });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      try {
        results[idx] = await worker(items[idx], idx);
      } catch (e) {
        results[idx] = null;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

const TOTAL_CATS = { g: 'goals', as: 'goal_assist', cs: 'clean_sheet', cy: 'yellow_card', cr: 'red_card' };
const RATE_CATS = { sh: 'total_scoring_att', sot: 'ontarget_scoring_att', tk: 'total_tackle', itc: 'interception', sv: 'saves', ga: 'goals_conceded' };
const DIRECT_CATS = { svp: '_save_percentage', rating: 'rating' };

async function syncLeague(league) {
  const clubs = [];
  const playersById = new Map();

let leaguePage = await fetchJson(`https://www.fotmob.com/api/data/leagues?id=${league.id}&season=2025/2026`);
  let table = leaguePage.table?.[0]?.data?.table?.all || [];

const seasons = leaguePage.allAvailableSeasons || [];
  let seasonIdx = seasons.indexOf('2025/2026');
  while (!table.some((t) => t.played > 0) && seasonIdx >= 0 && seasonIdx < seasons.length - 1) {
    seasonIdx += 1;
    leaguePage = await fetchJson(`https://www.fotmob.com/api/data/leagues?id=${league.id}&season=${encodeURIComponent(seasons[seasonIdx])}`);
    table = leaguePage.table?.[0]?.data?.table?.all || [];
  }

table.forEach((t) => {
  const parts = (t.scoresStr || '0-0').split('-').map(Number);
  const gf = parts[0]; const gaFor = parts[1];
  clubs.push({
    id: `${t.id}`,
    name: clubName(t.shortName || t.name),
    league: league.name,
    logo: `https://images.fotmob.com/image_resources/logo/teamlogo/${t.id}_small.png`,
    standings: { position: t.idx, played: t.played, wins: t.wins, draws: t.draws, losses: t.losses, goalsFor: gf, goalsAgainst: gaFor, points: t.pts },
  });
});

const meta = leaguePage.stats?.players || [];
  const urlFor = (slug) => meta.find((p) => p.fetchAllUrl && p.fetchAllUrl.endsWith(`/${slug}.json`))?.fetchAllUrl;

const catEntries = [
  ...Object.entries(TOTAL_CATS).map(([k, slug]) => [k, slug, 'total']),
  ...Object.entries(RATE_CATS).map(([k, slug]) => [k, slug, 'rate']),
  ...Object.entries(DIRECT_CATS).map(([k, slug]) => [k, slug, 'direct']),
  ].filter(([, slug]) => urlFor(slug));

const catResults = await pool(catEntries, 6, async ([key, slug, kind]) => {
  const json = await fetchJson(urlFor(slug));
  return { key, kind, list: json.TopLists?.[0]?.StatList || [] };
});

const upsert = (e) => {
  const id = e.ParticiantId;
  if (!playersById.has(id)) {
    playersById.set(id, { id, name: e.ParticipantName, teamId: e.TeamId, teamName: clubName(e.TeamName), nation: null, mins: e.MinutesPlayed || 0, mp: e.MatchesPlayed || 0 });
  }
  const p = playersById.get(id);
  p.mins = Math.max(p.mins, e.MinutesPlayed || 0);
  p.mp = Math.max(p.mp, e.MatchesPlayed || 0);
  return p;
};

catResults.filter(Boolean).forEach(({ key, kind, list }) => {
  list.forEach((e) => {
    const p = upsert(e);
    if (kind === 'total') {
      p[key] = e.StatValue;
      if (key === 'g') p.pk = e.SubStatValue || 0;
    } else if (kind === 'rate') {
      p[key] = Math.round(((e.StatValue || 0) * (e.MinutesPlayed || 0)) / 90);
    } else {
      p[key] = e.StatValue;
    }
  });
});

await pool(table, 8, async (t) => {
  const teamData = await fetchJson(`https://www.fotmob.com/api/data/teams?id=${t.id}`);
  const groups = teamData?.squad?.squad || [];
  groups.forEach((g) => {
    const pos = GROUP_POS[g.title];
    if (!pos) return;
    (g.members || []).forEach((m) => {
      const existing = playersById.get(m.id);
      if (existing) {
        existing.pos = pos;
        existing.age = m.age;
        existing.nation = m.cname;
        existing.number = m.shirtNumber;
        existing.teamName = clubName(t.shortName || t.name);
      } else {
        playersById.set(m.id, { id: m.id, name: m.name, teamId: t.id, teamName: clubName(t.shortName || t.name), nation: m.cname, age: m.age, pos, number: m.shirtNumber, mins: 0, mp: 0, g: 0, as: 0, pk: 0 });
      }
    });
  });
});

const players = Array.from(playersById.values())
  .filter((p) => p.pos)
  .map((p) => ({
    id: `${p.name}_${p.teamName}`.replace(/\s+/g, '_'),
    name: p.name,
    club: p.teamName,
    league: league.name,
    nation: p.nation || 'Unknown',
    pos: p.pos,
    number: p.number != null ? p.number : null,
    age: p.age != null ? p.age : null,
    rating: p.rating || 6.0,
    R: {
      min: p.mins || 0, mp: p.mp || 0,
      g: p.g || 0, as: p.as || 0, pk: p.pk || 0, pka: null,
      cy: p.cy || 0, cr: p.cr || 0,
      tk: p.tk != null ? p.tk : null,
      itc: p.itc != null ? p.itc : null,
      sh: p.sh != null ? p.sh : null,
      sot: p.sot != null ? p.sot : null,
      ppm: null, ong: null, onga: null, pm: null, onoff: null,
      sv: p.sv || 0, ga: p.ga || 0, cs: p.cs || 0,
      sota: null,
      svp: p.svp != null ? p.svp : null,
      w: null, d: null, l: null,
    },
  }));

return { clubs, players };
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

try {
  console.log('[full-database] Starting comprehensive sync...');

  const allClubs = [];
  const allPlayers = [];

  for (const league of LEAGUES) {
    try {
      const { clubs, players } = await syncLeague(league);
      allClubs.push(...clubs);
      allPlayers.push(...players);
      console.log(`[full-database] ${league.name}: ${clubs.length} clubs, ${players.length} players`);
    } catch (e) {
      console.error(`[full-database] ${league.name} failed:`, e.message);
    }
  }

  if (allPlayers.length === 0) {
    throw new Error('No player data was fetched from FotMob for any league');
  }

  const existingRaw = await redis.get('scout:database');
  const existing = existingRaw ? JSON.parse(existingRaw) : { fixtures: [] };

  const merged = {
    timestamp: new Date().toISOString(),
    clubs: allClubs,
    players: allPlayers,
    fixtures: existing.fixtures || [],
    lastUpdated: new Date().toISOString(),
    dataSource: 'FotMob',
  };

  await redis.set('scout:database', JSON.stringify(merged), 'EX', 86400);

  console.log(`[full-database] Synced: ${merged.players.length} players, ${merged.clubs.length} clubs`);

  return res.status(200).json({ success: true, players: merged.players.length, clubs: merged.clubs.length, fixtures: merged.fixtures.length, timestamp: merged.lastUpdated });
} catch (error) {
  console.error('[full-database] Error:', error.message);
  return res.status(500).json({ error: error.message });
}
}
