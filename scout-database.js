/**
 * /api/scout-database
 * 
 * Scout calls this to fetch the full synced database
 * Returns: players, clubs, fixtures from FotMob
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    // Get latest database from KV
    const data = await kv.get('scout:database');
    
    if (!data) {
      return res.status(200).json({
        timestamp: new Date().toISOString(),
        players: [],
        clubs: [],
        fixtures: [],
        message: 'Database not yet synced. First sync will complete in next cron run.'
      });
    }

    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    
    // Cache aggressively - data updates every 30 mins anyway
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return res.status(200).json(parsed);
    
  } catch (error) {
    console.error('[scout-database] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}