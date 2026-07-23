import Redis from 'ioredis';

let redis;
function getRedis() {
    if (!redis) {
          redis = new Redis(process.env.REDIS_URL);
    }
    return redis;
}

export default async function handler(req, res) {
    try {
          const client = getRedis();
          const data = await client.get('scout:database');

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

      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

      return res.status(200).json(parsed);

    } catch (error) {
          console.error('[scout-database] Error:', error.message);
          return res.status(500).json({ error: error.message });
    }
}
