/**
 * /api/sync-full-database
 * 
 * Runs every 30 minutes
 * Updates: all player data, club rosters, squad info, standings
 * Heavier operation - browses multiple FotMob pages
 */

import { chromium } from 'playwright';
import Anthropic from '@anthropic-ai/sdk';
import { kv } from '@vercel/kv';

const client = new Anthropic();

export const config = { maxDuration: 120 }; // 2 minutes

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[full-database] Starting comprehensive sync...');

    // Step 1: Browse all leagues & standings
    const leaguesData = await browseLeagues();
    
    // Step 2: Browse fixtures
    const fixturesData = await browseFixtures();
    
    // Combine and send to Claude for processing
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `Process this comprehensive FotMob data. Return ONLY valid JSON:

LEAGUES & CLUBS:
${JSON.stringify(leaguesData, null, 2).substring(0, 20000)}

FIXTURES:
${JSON.stringify(fixturesData, null, 2).substring(0, 20000)}

Return:
{
  "timestamp": "ISO",
  "clubs": [
    {
      "id": "club_name_league",
      "name": "Club Name",
      "league": "Premier League",
      "logo": "url",
      "standings": {
        "position": 1,
        "played": 10,
        "wins": 7,
        "draws": 2,
        "losses": 1,
        "goalsFor": 20,
        "goalsAgainst": 8,
        "points": 23
      }
    }
  ],
  "players": [
    {
      "id": "player_name_club",
      "name": "Player Name",
      "club": "Club Name",
      "nationality": "Country",
      "position": "ST",
      "number": 10,
      "age": 25,
      "appearances": 10,
      "goals": 5,
      "assists": 2,
      "marketValue": "€50M"
    }
  ],
  "fixtures": [
    {
      "id": "HomeTeam_AwayTeam_date",
      "homeTeam": "Team A",
      "awayTeam": "Team B",
      "homeScore": 2,
      "awayScore": 1,
      "kickoffTime": "2024-01-15T15:00Z",
      "league": "Premier League",
      "status": "finished"
    }
  ]
}`
      }]
    });

    const parsed = JSON.parse(response.content[0].text);

    // Load existing data to merge
    const existing = await kv.get('scout:database');
    const existingData = existing ? JSON.parse(existing) : { clubs: [], players: [], fixtures: [] };

    // Merge: new data from FotMob takes precedence
    const merged = {
      timestamp: parsed.timestamp,
      clubs: mergeBy(existingData.clubs || [], parsed.clubs || [], 'id'),
      players: mergeBy(existingData.players || [], parsed.players || [], 'id'),
      fixtures: mergeBy(existingData.fixtures || [], parsed.fixtures || [], 'id'),
      lastUpdated: new Date().toISOString(),
      dataSource: 'FotMob'
    };

    // Store in KV
    await kv.set('scout:database', JSON.stringify(merged), { ex: 86400 }); // 24hr cache

    console.log(`[full-database] Synced: ${merged.players?.length} players, ${merged.clubs?.length} clubs`);

    return res.status(200).json({
      success: true,
      players: merged.players?.length,
      clubs: merged.clubs?.length,
      fixtures: merged.fixtures?.length,
      timestamp: merged.lastUpdated
    });

  } catch (error) {
    console.error('[full-database] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}

// Helper to merge arrays by ID, keeping fresh data
function mergeBy(existing, fresh, idField) {
  const map = new Map();
  existing.forEach(item => map.set(item[idField], item));
  fresh.forEach(item => map.set(item[idField], item)); // Fresh overwrites
  return Array.from(map.values());
}

async function browseLeagues() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto('https://www.fotmob.com/leagues', {
      waitUntil: 'networkidle',
      timeout: 20000
    });
    
    await page.waitForSelector('[class*="Team"], [class*="club"]', { timeout: 10000 });
    
    const data = await page.evaluate(() => ({
      timestamp: new Date().toISOString(),
      html: document.documentElement.outerHTML.substring(0, 100000),
      clubs: Array.from(document.querySelectorAll('[class*="TeamCard"], [class*="club-card"]')).map(el => ({
        name: el.querySelector('[class*="name"]')?.textContent?.trim() || '',
        league: el.closest('[class*="League"], [class*="league"]')?.querySelector('[class*="league-name"]')?.textContent?.trim() || '',
        position: el.querySelector('[class*="position"]')?.textContent?.trim() || '',
        points: el.querySelector('[class*="points"]')?.textContent?.trim() || ''
      }))
    }));
    
    await browser.close();
    return data;
    
  } catch (error) {
    console.error('[browseLeagues] Error:', error.message);
    if (browser) await browser.close();
    return { html: '', clubs: [] };
  }
}

async function browseFixtures() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto('https://www.fotmob.com/matches', {
      waitUntil: 'networkidle',
      timeout: 20000
    });
    
    await page.waitForSelector('[class*="Match"], [class*="match"]', { timeout: 10000 });
    
    const data = await page.evaluate(() => ({
      timestamp: new Date().toISOString(),
      html: document.documentElement.outerHTML.substring(0, 100000),
      matches: Array.from(document.querySelectorAll('[class*="MatchCard"], [class*="match-card"]')).map(el => ({
        homeTeam: el.querySelector('[class*="home"]')?.textContent?.trim() || '',
        awayTeam: el.querySelector('[class*="away"]')?.textContent?.trim() || '',
        homeScore: el.querySelector('[class*="homeScore"]')?.textContent?.trim() || '',
        awayScore: el.querySelector('[class*="awayScore"]')?.textContent?.trim() || '',
        time: el.querySelector('[class*="time"]')?.textContent?.trim() || '',
        league: el.querySelector('[class*="league"]')?.textContent?.trim() || ''
      }))
    }));
    
    await browser.close();
    return data;
    
  } catch (error) {
    console.error('[browseFixtures] Error:', error.message);
    if (browser) await browser.close();
    return { html: '', matches: [] };
  }
}