/**
 * /api/sync-live-matches
 * 
 * Runs every 1 minute during match days
 * Updates: live scores, match status, in-game events
 * Fast operation - just FotMob matches page
 */

import { chromium } from 'playwright';
import Anthropic from '@anthropic-ai/sdk';
import { kv } from '@vercel/kv';

const client = new Anthropic();

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Check if it's a match day (optional - save calls on non-match days)
    const lastCheck = await kv.get('scout:last-match-check');
    const now = new Date();
    
    // Only run during typical match hours (Tue-Sun, 12:00-23:00 UTC)
    const dayOfWeek = now.getUTCDay();
    const hour = now.getUTCHours();
    
    if (dayOfWeek === 1 && hour < 17) {
      // Monday morning, skip
      return res.status(200).json({ status: 'skipped', reason: 'not-a-match-day' });
    }

    console.log('[live-matches] Starting sync...');

    // Browse FotMob matches page
    let browser;
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto('https://www.fotmob.com/matches', {
      waitUntil: 'networkidle',
      timeout: 20000
    });
    
    await page.waitForSelector('[class*="Match"], [class*="match"]', { timeout: 10000 });
    
    const rawMatches = await page.evaluate(() => {
      const matches = [];
      
      document.querySelectorAll('[class*="MatchCard"], [class*="match-card"]').forEach(el => {
        matches.push({
          homeTeam: el.querySelector('[class*="home"]')?.textContent?.trim() || '',
          awayTeam: el.querySelector('[class*="away"]')?.textContent?.trim() || '',
          homeScore: el.querySelector('[class*="homeScore"]')?.textContent?.trim() || '',
          awayScore: el.querySelector('[class*="awayScore"]')?.textContent?.trim() || '',
          matchTime: el.querySelector('[class*="time"], [class*="status"]')?.textContent?.trim() || '',
          league: el.querySelector('[class*="league"]')?.textContent?.trim() || '',
          status: el.textContent.includes('Live') ? 'live' : el.textContent.includes('FT') ? 'finished' : 'upcoming',
          link: el.querySelector('a')?.href || ''
        });
      });
      
      return {
        timestamp: new Date().toISOString(),
        matches,
        html: document.documentElement.outerHTML.substring(0, 50000)
      };
    });
    
    await browser.close();

    // Parse with Claude
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `Parse these live FotMob matches and return ONLY valid JSON:

${JSON.stringify(rawMatches, null, 2)}

Return:
{
  "timestamp": "ISO",
  "matches": [
    {
      "id": "HomeTeam_AwayTeam",
      "homeTeam": "name",
      "awayTeam": "name",
      "homeScore": number,
      "awayScore": number,
      "status": "live|finished|upcoming",
      "matchTime": "90+3",
      "league": "Premier League"
    }
  ]
}`
      }]
    });
    
    const parsed = JSON.parse(response.content[0].text);

    // Store in KV
    await kv.set('scout:live-matches', JSON.stringify(parsed), { ex: 300 }); // 5 min cache
    await kv.set('scout:last-match-check', Date.now());

    return res.status(200).json({
      success: true,
      matchCount: parsed.matches?.length || 0,
      timestamp: parsed.timestamp
    });

  } catch (error) {
    console.error('[live-matches] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}