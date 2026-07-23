import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const config = { maxDuration: 30 };

const LEAGUE_IDS = new Set([47, 87, 54, 55, 53]);
const FETCH_HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' };

function todayStr() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

try {
  console.log('[live-matches] Starting sync...');

  const r = await fetch(`https://www.fotmob.com/api/data/matches?date=${todayStr()}`, { headers: FETCH_HEADERS });
  if (!r.ok) throw new Error(`FotMob matches request failed: ${r.status}`);
  const data = await r.json();

  const matches = (data.leagues || [])
  .filter((lg) => LEAGUE_IDS.has(lg.primaryId != null ? lg.primaryId : lg.id))
  .flatMap((lg) => (lg.matches || []).map((m) => ({
    id: `${m.home.name}_${m.away.name}`.replace(/\s+/g, '_'),
    homeTeam: m.home.name,
    awayTeam: m.away.name,
    homeScore: m.home.score,
    awayScore: m.away.score,
    status: m.status?.finished ? 'finished' : (m.status?.started ? 'live' : 'upcoming'),
    matchTime: (m.status?.reason?.short) || m.time,
    league: lg.name,
  })));

  const payload = { timestamp: new Date().toISOString(), matches };
  await redis.set('scout:live-matches', JSON.stringify(payload), 'EX', 300);
  await redis.set('scout:last-match-check', String(Date.now()));

  return res.status(200).json({ success: true, matchCount: matches.length, timestamp: payload.timestamp });
} catch (error) {
  console.error('[live-matches] Error:', error.message);
  return res.status(500).json({ error: error.message });
}
}
