/**
 * SuperIndia.ai - Automated Verification Test Suite for Recommended Site Switching
 * Tests matching, state switching, and parameter synthesis when adopting recommendations.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const benchmarkSites = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../data/benchmarkSites.json'), 'utf8')
);

import { findNearbyRecommendedSitesClient, evaluateCandidateSite } from '../services/scoringEngine.js';
import { fetchDirectSovereignTelemetry } from '../services/telemetryClient.js';

console.log('🧪 Starting SuperIndia.ai Recommended Site Switch Test Suite...\n');

// Replicate the exact matching function from App.jsx
const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const findMatchingSite = (rec, siteList) => {
  if (!rec || !siteList || !siteList.length) return null;
  
  // 1. Direct or prefixed ID match
  const direct = siteList.find(s => 
    s.site_id === rec.site_id ||
    s.site_id === `site_${rec.site_id}` ||
    `site_${s.site_id}` === rec.site_id
  );
  if (direct) return direct;

  const recId = norm(rec.site_id).replace(/^site/, '');
  const idMatch = siteList.find(s => {
    const sId = norm(s.site_id).replace(/^site/, '');
    return sId && recId && (sId === recId || sId.includes(recId) || recId.includes(sId));
  });
  if (idMatch) return idMatch;

  // 2. Distinct landmark token match
  const stopWords = new Set(['industrial', 'corridor', 'park', 'hub', 'area', 'region', 'special', 'investment', 'phase', 'city', 'zone', 'sector', 'tech', 'and']);
  const recTokens = (rec.site_name || '').toLowerCase().split(/[\s,()/-]+/).filter(t => t.length >= 3 && !stopWords.has(t));
  if (recTokens.length > 0) {
    const tokenMatch = siteList.find(s => {
      const sSearchable = `${s.site_name || ''} ${s.site_id || ''} ${s.district || ''}`.toLowerCase();
      return recTokens.some(tok => sSearchable.includes(tok));
    });
    if (tokenMatch) return tokenMatch;
  }

  // 3. Coordinate distance (< 25 km)
  if (rec.latitude && rec.longitude) {
    const coordMatch = siteList.find(s => {
      if (!s.latitude || !s.longitude) return false;
      const dLat = Math.abs(s.latitude - rec.latitude);
      const dLon = Math.abs(s.longitude - rec.longitude);
      return Math.sqrt(dLat * dLat + dLon * dLon) * 111.0 <= 25.0;
    });
    if (coordMatch) return coordMatch;
  }

  return null;
};

// ==========================================
// Test 1: Verify Matching for all verified hubs against benchmark catalog
// ==========================================
console.log('Test 1: Benchmark Catalog Matching Parity');

const expectations = [
  { recId: 'navi_mumbai_ttc', name: 'Navi Mumbai (Airoli / Mahape / TTC Industrial Area)', expected: 'site_mahape_midc' },
  { recId: 'dholera_sir', name: 'Dholera SIR (Special Investment Region)', expected: 'site_dholera_sir' },
  { recId: 'taloja_midc', name: 'Taloja MIDC Industrial Hub', expected: 'site_taloja_midc' },
  { recId: 'kiadb_aerospace_blr', name: 'KIADB Aerospace Park (Devanahalli, Bengaluru)', expected: 'site_bengaluru_aerospace' },
  { recId: 'fab_city_hyd', name: 'Fab City & Hardware Park (Maheshwaram, Hyderabad)', expected: 'site_hyderabad_fabcity' },
  { recId: 'siruseri_sipcot', name: 'Siruseri SIPCOT IT Park (Chennai)', expected: 'site_chennai_siruseri' },
  { recId: 'greater_noida_kp5', name: 'Greater Noida Knowledge Park V (UP Data Center Hub)', expected: 'site_noida_sec132' },
];

expectations.forEach(item => {
  const matched = findMatchingSite({ site_id: item.recId, site_name: item.name }, benchmarkSites);
  assert.ok(matched, `Expected match for ${item.recId}`);
  assert.strictEqual(matched.site_id, item.expected, `Expected ${item.recId} to map to ${item.expected}`);
  assert.ok(matched.composite_score >= 80.0, `Expected high score for ${item.expected}, got ${matched.composite_score}`);
  console.log(`  ✓ Recommendation '${item.recId}' correctly matched to '${matched.site_id}' (Score: ${matched.composite_score}/100)`);
});

// ==========================================
// Test 2: Low-Scoring / Vetoed Site Recommendation & Adoption
// ==========================================
console.log('\nTest 2: South Mumbai Vetoed Site Alternative Switch Simulation');

const southMumbai = benchmarkSites.find(s => s.site_id === 'site_south_mumbai_port');
assert.ok(southMumbai, 'South Mumbai benchmark site must exist');
assert.ok(southMumbai.composite_score < 50.0, 'South Mumbai should be low scoring (36.9)');

const nearbyRecs = findNearbyRecommendedSitesClient(
  southMumbai.latitude,
  southMumbai.longitude,
  southMumbai.composite_score,
  true,
  southMumbai.state
);

assert.ok(nearbyRecs.bestAlternative, 'Must find a recommended alternative for South Mumbai');
const bestAlt = nearbyRecs.bestAlternative;
console.log(`  ✓ Recommendation generated: ${bestAlt.site_name} (${bestAlt.distance_km} km away, Feasibility: ${bestAlt.composite_score}/100)`);

const adoptedSite = findMatchingSite(bestAlt, benchmarkSites);
assert.ok(adoptedSite, 'Adopted recommendation must resolve to a valid site in catalog');
assert.strictEqual(adoptedSite.site_id, 'site_mahape_midc');
assert.strictEqual(adoptedSite.tier, 'VIABLE / RECOMMENDED');
assert.ok(adoptedSite.composite_score >= 87.0, `Score should be >= 87.0, got ${adoptedSite.composite_score}`);
console.log(`  ✓ Successfully switched from South Mumbai (36.9) to ${adoptedSite.site_name} (${adoptedSite.composite_score}/100)`);

// ==========================================
// Test 3: Un-cached Greenfield Hub Evaluation (e.g. Sanand GIDC)
// ==========================================
console.log('\nTest 3: Greenfield Hub Dynamic Assessment');

const greenfieldPayload = {
  site_id: 'site_sanand_gidc',
  site_name: 'Sanand GIDC Industrial Park',
  state: 'Gujarat',
  district: 'Ahmedabad',
  latitude: 22.98,
  longitude: 72.37,
  elevation_m: 58.0,
  proposed_it_load_mw: 50.0,
  land_params: {
    notified_industrial_zone: true,
    is_notified_it_industrial_zone: true,
  },
  eco_params: {
    is_notified_non_forest: true,
    tree_canopy_cover_pct: 3.0,
    distance_to_wildlife_sanctuary_km: 35.0,
  }
};

const evaluation = evaluateCandidateSite(greenfieldPayload);
assert.ok(evaluation.composite_score >= 85.0, `Expected score >= 85.0, got ${evaluation.composite_score}`);
assert.strictEqual(evaluation.tier, 'VIABLE / RECOMMENDED');
assert.strictEqual(evaluation.tier_badge, 'VIABLE');
assert.strictEqual(evaluation.fifty_factor_telemetry?.is_vetoed, undefined);
console.log(`  ✓ Un-cached greenfield hub successfully evaluated with Viable Feasibility: ${evaluation.composite_score}/100 (${evaluation.tier_badge})`);

// ==========================================
// Test 4: Prevention of Self-Recommendation at 0 km
// ==========================================
console.log('\nTest 4: Prevention of Self-Recommendation at 0 km');

// Candidate site located at YEIDA Sector 28 coordinates (28.21, 77.58)
const yeidaRecs = findNearbyRecommendedSitesClient(
  28.21,
  77.58,
  22.0,
  true,
  'Uttar Pradesh'
);

assert.ok(yeidaRecs.bestAlternative, 'Must provide an alternative for low scoring YEIDA candidate');
assert.notStrictEqual(
  yeidaRecs.bestAlternative.site_id,
  'yeida_jewar',
  'Must NOT recommend itself (yeida_jewar) when already located at yeida_jewar!'
);
assert.ok(
  yeidaRecs.bestAlternative.distance_km >= 5.0,
  `Alternative distance must be >= 5 km, got ${yeidaRecs.bestAlternative.distance_km} km`
);
console.log(`  ✓ Self-recommendation prevented: Candidate at (28.21, 77.58) recommends '${yeidaRecs.bestAlternative.site_name}' (${yeidaRecs.bestAlternative.distance_km} km away, Score: ${yeidaRecs.bestAlternative.composite_score}/100)`);

// ==========================================
// Test 5: Clean Non-Forest Telemetry Ingestion (No Fictitious 73% Forest Cover)
// ==========================================
console.log('\nTest 5: Authentic Non-Forest Telemetry Ingestion for Industrial Zones');

const telRes = await fetchDirectSovereignTelemetry({
  latitude: 28.21,
  longitude: 77.58,
  site_name: 'YEIDA Sector 28',
  district: 'Gautam Buddha Nagar',
  state: 'Uttar Pradesh'
});

assert.ok(telRes.success, 'Telemetry fetch must succeed');
const ecoInp = telRes.site_input.eco_params;
assert.strictEqual(
  ecoInp.tree_canopy_cover_pct,
  2.8,
  `Non-protected industrial zone should have baseline 2.8% canopy, not sanctuary canopy. Got ${ecoInp.tree_canopy_cover_pct}%`
);
assert.strictEqual(ecoInp.is_notified_non_forest, true, 'Industrial zone must be certified non-forest');
assert.strictEqual(telRes.site_input.land_params.notified_industrial_zone, true, 'Industrial zone flag must be true');

const evaluatedCandidate = evaluateCandidateSite(telRes.site_input);
assert.ok(
  evaluatedCandidate.composite_score >= 85.0,
  `Candidate site must score >= 85.0 with real telemetry, got ${evaluatedCandidate.composite_score}/100`
);
assert.strictEqual(
  evaluatedCandidate.fifty_factor_telemetry?.is_vetoed,
  undefined,
  'Must have zero statutory rejection vetoes'
);
console.log(`  ✓ Telemetry verified: Canopy=${ecoInp.tree_canopy_cover_pct}%, Feasibility=${evaluatedCandidate.composite_score}/100 (${evaluatedCandidate.tier_badge}, 0 Vetoes)`);

console.log('\n🎉 ALL RECOMMENDED SITE SWITCH TESTS PASSED SUCCESSFULLY!\n');
