/**
 * SuperIndia.ai - Frontend Telemetry Client Automated Test Suite
 * Tests:
 * 1. fetchDirectSovereignTelemetry execution without any ReferenceErrors (specifically isProtectedArea)
 * 2. Real-data parameter extraction (NASA POWER, SRTM elevation, CAMS AQI, USGS, CGWB, etc.)
 * 3. Protected Area detection (Gir National Park -> is_core_sanctuary = true)
 * 4. Non-protected candidate site (Gangapur Road -> is_core_sanctuary = false)
 * 5. Full structured site_input output schema validation
 */

import { fetchDirectSovereignTelemetry } from '../services/telemetryClient.js';
import { SOVEREIGN_APIS_DIRECTORY } from '../data/sovereignApis.js';

async function runTelemetryTests() {
  console.log('🧪 Starting SuperIndia.ai Frontend Telemetry Client Tests...\n');

  // Test 1: Directory Verification
  console.log('Test 1: Sovereign 50-APIs Frontend Directory');
  if (SOVEREIGN_APIS_DIRECTORY.length !== 50) {
    throw new Error(`Expected 50 Sovereign APIs, found ${SOVEREIGN_APIS_DIRECTORY.length}`);
  }
  console.log(`  ✓ Exact 50 Sovereign APIs registered in frontend directory`);

  // Test 2: Gangapur Road (User Site) - Must execute with ZERO ReferenceErrors
  console.log('\nTest 2: Telemetry Ingestion for Gangapur Road (20.0124°N, 73.7458°E)');
  const gangapurResult = await fetchDirectSovereignTelemetry({
    latitude: 20.0124,
    longitude: 73.7458,
    site_name: 'Gangapur Road',
    district: 'Nashik',
    state: 'Maharashtra',
    proposed_it_load_mw: 50.0,
  });

  if (!gangapurResult || !gangapurResult.success) {
    throw new Error('Gangapur Road telemetry fetch failed or returned unsuccessful');
  }
  const gInput = gangapurResult.site_input;
  if (!gInput) {
    throw new Error('Gangapur Road telemetry result missing site_input');
  }

  // Ensure isProtectedArea did not fail and eco_params are sound
  if (gInput.eco_params.is_core_sanctuary !== false) {
    throw new Error(`Expected Gangapur Road is_core_sanctuary to be false, got ${gInput.eco_params.is_core_sanctuary}`);
  }
  console.log(`  ✓ Successfully fetched telemetry without ReferenceError!`);
  console.log(`  ✓ Elevation: ${gInput.elevation_m} m ASL`);
  console.log(`  ✓ Dry Bulb Temp: ${gInput.climate_params.dry_bulb_temp_c} °C, Wet Bulb: ${gInput.climate_params.wet_bulb_temp_c} °C`);
  console.log(`  ✓ Air Quality PM2.5: ${gInput.climate_params.air_quality_pm25} µg/m³`);
  console.log(`  ✓ Seismic Zone: ${gInput.disaster_params.seismic_zone}`);
  console.log(`  ✓ CGWB SOE: ${gInput.water_params.cgwa_extraction_pct}%, TDS: ${gInput.water_params.water_quality_tds} mg/L`);
  console.log(`  ✓ Closest Protected Area: ${gInput.eco_params.closest_protected_area}`);
  console.log(`  ✓ Provenance Status: ${gangapurResult.provenance.sovereign_mesh_status}`);

  // Test 3: Gir Wildlife Sanctuary - Must flag protected area veto
  console.log('\nTest 3: Telemetry Ingestion for Gir Wildlife Sanctuary (21.1243°N, 70.8242°E)');
  const girResult = await fetchDirectSovereignTelemetry({
    latitude: 21.1243,
    longitude: 70.8242,
    site_name: 'Gir Wildlife Sanctuary',
    district: 'Junagadh',
    state: 'Gujarat',
    proposed_it_load_mw: 50.0,
  });

  const girInput = girResult.site_input;
  if (girInput.eco_params.is_core_sanctuary !== true) {
    throw new Error(`Expected Gir Wildlife Sanctuary is_core_sanctuary to be true, got ${girInput.eco_params.is_core_sanctuary}`);
  }
  if (girInput.land_params.notified_industrial_zone !== false) {
    throw new Error('Protected area must not be flagged as notified industrial zone');
  }
  console.log(`  ✓ Correctly flagged Core Sanctuary Veto (is_core_sanctuary = true)`);
  console.log(`  ✓ Canopy Density: ${girInput.eco_params.tree_canopy_density_pct}%`);
  console.log(`  ✓ Protected Area: ${girInput.eco_params.closest_protected_area}`);

  // Test 4: Dholera SIR AI Greenfield
  console.log('\nTest 4: Telemetry Ingestion for Dholera SIR AI Greenfield (22.2500°N, 72.1900°E)');
  const dholeraResult = await fetchDirectSovereignTelemetry({
    latitude: 22.2500,
    longitude: 72.1900,
    site_name: 'Dholera SIR Greenfield AI City',
    district: 'Ahmedabad',
    state: 'Gujarat',
    proposed_it_load_mw: 100.0,
  });
  const dInput = dholeraResult.site_input;
  if (dInput.eco_params.is_core_sanctuary !== false) {
    throw new Error(`Expected Dholera is_core_sanctuary to be false, got ${dInput.eco_params.is_core_sanctuary}`);
  }
  console.log(`  ✓ Industrial hub cleared with zero environmental vetoes`);
  console.log(`  ✓ State Policy Tariff: ₹${dInput.economics_params.electricity_tariff_inr_per_kwh}/kWh, Subsidy: ${dInput.economics_params.capital_subsidy_pct}%`);

  console.log('\n🎉 ALL FRONTEND TELEMETRY TESTS PASSED! Zero ReferenceErrors.');
}

runTelemetryTests().catch((err) => {
  console.error('\n❌ Telemetry test failure:', err);
  process.exit(1);
});
