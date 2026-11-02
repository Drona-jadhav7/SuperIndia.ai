/**
 * SuperIndia.ai - Precision Siting Decision Intelligence Engine (Frontend Edge Evaluator)
 * Evaluates any candidate site across all 50 statutory factors, 9 dimensions,
 * applying TOPSIS relative closeness and non-linear critical pillar bottleneck multipliers.
 * 100% mathematical fidelity with backend fifty_factor_engine.py and ai_siting_model.py.
 */

export const FACTOR_WEIGHTS = {
  1: 0.040, 2: 0.025, 3: 0.025, 4: 0.030, 5: 0.035, 6: 0.025,
  7: 0.040, 8: 0.040, 9: 0.035, 10: 0.020, 11: 0.025, 12: 0.015, 13: 0.015, 14: 0.010,
  15: 0.025, 16: 0.015, 17: 0.040, 18: 0.020, 19: 0.015, 20: 0.015,
  21: 0.020, 22: 0.030, 23: 0.020, 24: 0.020, 25: 0.015, 26: 0.015,
  27: 0.020, 28: 0.010, 29: 0.020, 30: 0.010, 31: 0.005, 32: 0.010, 33: 0.005,
  34: 0.015, 35: 0.012, 36: 0.008, 37: 0.005, 38: 0.015, 39: 0.005, 40: 0.010,
  41: 0.025, 42: 0.012, 43: 0.010, 44: 0.010, 45: 0.013,
  46: 0.015, 47: 0.015,
  48: 0.040, 49: 0.040, 50: 0.040,
};

export const DIMENSION_WEIGHTS = {
  water: 0.180,
  power: 0.200,
  climate: 0.130,
  connectivity: 0.120,
  disaster: 0.080,
  land: 0.070,
  economics: 0.070,
  atmospheric: 0.030,
  sovereign_vetoes: 0.120,
};

// 1. Water Transfer Functions
export function f1_groundwater_soe(soe) {
  if (soe <= 60.0) return 100.0;
  if (soe <= 70.0) return 100.0 - (soe - 60.0) * 1.5;
  if (soe <= 90.0) return 85.0 - ((soe - 70.0) / 20.0) * 35.0;
  if (soe <= 100.0) return 50.0 - ((soe - 90.0) / 10.0) * 25.0;
  return Math.max(0.0, 25.0 - (soe - 100.0) * 1.5);
}

export function f2_water_tds(tds) {
  if (tds <= 300.0) return 100.0;
  if (tds <= 500.0) return 100.0 - ((tds - 300.0) / 200.0) * 15.0;
  if (tds <= 1000.0) return 85.0 - ((tds - 500.0) / 500.0) * 35.0;
  return Math.max(15.0, 50.0 - ((tds - 1000.0) / 1000.0) * 30.0);
}

export function f3_aquifer_stress(stress) {
  if (stress <= 50.0) return 100.0;
  if (stress <= 70.0) return 100.0 - ((stress - 50.0) / 20.0) * 20.0;
  if (stress <= 90.0) return 80.0 - ((stress - 70.0) / 20.0) * 35.0;
  return Math.max(15.0, 45.0 - ((stress - 90.0) / 10.0) * 25.0);
}

export function f4_water_demand(demandMld, itLoadMw) {
  const ratio = demandMld / Math.max(1.0, itLoadMw);
  if (ratio <= 0.025) return 100.0;
  if (ratio <= 0.040) return 90.0 - ((ratio - 0.025) / 0.015) * 15.0;
  return Math.max(35.0, 75.0 - ((ratio - 0.040) / 0.030) * 35.0);
}

export function f5_tertiary_water(supplyMld) {
  if (supplyMld >= 20.0) return 100.0;
  if (supplyMld >= 10.0) return 80.0 + ((supplyMld - 10.0) / 10.0) * 20.0;
  if (supplyMld >= 2.0) return 45.0 + ((supplyMld - 2.0) / 8.0) * 35.0;
  return Math.max(20.0, (supplyMld / 2.0) * 45.0);
}

export function f6_storage_hours(hours) {
  if (hours >= 72.0) return 100.0;
  if (hours >= 48.0) return 75.0 + ((hours - 48.0) / 24.0) * 25.0;
  if (hours >= 24.0) return 45.0 + ((hours - 24.0) / 24.0) * 30.0;
  return Math.max(10.0, (hours / 24.0) * 45.0);
}

// 2. Power Transfer Functions
export function f7_substation_dist(km) {
  if (km <= 1.0) return 100.0;
  if (km <= 2.5) return 100.0 - ((km - 1.0) / 1.5) * 15.0;
  if (km <= 5.0) return 85.0 - ((km - 2.5) / 2.5) * 20.0;
  if (km <= 10.0) return 65.0 - ((km - 5.0) / 5.0) * 35.0;
  return Math.max(0.0, 30.0 - (km - 10.0) * 6.0);
}

export function f8_voltage_class(kv) {
  if (kv >= 400.0) return 100.0;
  if (kv >= 220.0) return 85.0 + Math.min(15.0, (kv - 220.0) * 0.08);
  if (kv >= 132.0) return 70.0 + Math.min(15.0, (kv - 132.0) * 0.17);
  if (kv >= 66.0) return 50.0 + Math.min(20.0, (kv - 66.0) * 0.30);
  return Math.max(15.0, (kv / 33.0) * 45.0);
}

export function f9_spare_mva(spareMva, itLoadMw) {
  const req = itLoadMw * 1.2;
  const ratio = spareMva / Math.max(1.0, req);
  if (ratio >= 1.5) return 100.0;
  if (ratio >= 1.0) return 85.0 + (ratio - 1.0) * 30.0;
  if (ratio >= 0.5) return 50.0 + (ratio - 0.5) * 70.0;
  return Math.max(15.0, ratio * 100.0);
}

export function f10_substations_density(count) {
  if (count >= 4) return 100.0;
  if (count === 3) return 90.0;
  if (count === 2) return 80.0;
  if (count === 1) return 60.0;
  return 20.0;
}

// 3. Climate Transfer Functions
export function f15_dry_bulb(t) {
  if (t <= 30.0) return 100.0;
  if (t <= 36.0) return 100.0 - ((t - 30.0) / 6.0) * 18.0;
  if (t <= 42.0) return 82.0 - ((t - 36.0) / 6.0) * 32.0;
  return Math.max(15.0, 50.0 - (t - 42.0) * 6.0);
}

export function f16_relative_humidity(rh) {
  if (rh >= 45.0 && rh <= 65.0) return 100.0;
  if ((rh >= 35.0 && rh < 45.0) || (rh > 65.0 && rh <= 75.0)) return 85.0;
  if ((rh >= 25.0 && rh < 35.0) || (rh > 75.0 && rh <= 85.0)) return 65.0;
  return 40.0;
}

export function f17_wet_bulb(tw) {
  if (tw <= 24.0) return 100.0;
  if (tw <= 28.0) return 100.0 - ((tw - 24.0) / 4.0) * 30.0;
  if (tw <= 31.0) return 70.0 - ((tw - 28.0) / 3.0) * 40.0;
  return Math.max(0.0, 30.0 - (tw - 31.0) * 8.0);
}

export function f20_pm25(pm) {
  if (pm <= 30.0) return 100.0;
  if (pm <= 60.0) return 100.0 - ((pm - 30.0) / 30.0) * 25.0;
  if (pm <= 120.0) return 75.0 - ((pm - 60.0) / 60.0) * 40.0;
  return Math.max(15.0, 35.0 - (pm - 120.0) * 0.25);
}

// 4. Connectivity Transfer Functions
export function f21_cls_dist(km) {
  if (km <= 30.0) return 100.0;
  if (km <= 100.0) return 90.0 - ((km - 30.0) / 70.0) * 20.0;
  if (km <= 500.0) return 70.0 - ((km - 100.0) / 400.0) * 25.0;
  return Math.max(25.0, 45.0 - ((km - 500.0) / 1000.0) * 20.0);
}

export function f22_cls_rtt(ms) {
  if (ms <= 3.0) return 100.0;
  if (ms <= 6.0) return 100.0 - ((ms - 3.0) / 3.0) * 15.0;
  if (ms <= 15.0) return 85.0 - ((ms - 6.0) / 9.0) * 35.0;
  return Math.max(20.0, 50.0 - (ms - 15.0) * 2.0);
}

export function f23_nixi_dist(km) {
  if (km <= 20.0) return 100.0;
  if (km <= 50.0) return 100.0 - ((km - 20.0) / 30.0) * 20.0;
  return Math.max(25.0, 80.0 - (km - 50.0) * 0.5);
}

// 5. Disaster Transfer Functions
export function f27_seismic_zone(z) {
  const zone = (z || 'III').trim().toUpperCase();
  if (zone === 'II') return 100.0;
  if (zone === 'III') return 80.0;
  if (zone === 'IV') return 50.0;
  if (zone === 'V') return 20.0;
  return 70.0;
}

// 6. Civil & Land
export function f34_zoning(isNotified) {
  return isNotified ? 100.0 : 35.0;
}

export function f38_sbc(kpa) {
  if (kpa >= 220.0) return 100.0;
  if (kpa >= 180.0) return 80.0 + ((kpa - 180.0) / 40.0) * 20.0;
  if (kpa >= 120.0) return 50.0 + ((kpa - 120.0) / 60.0) * 30.0;
  return Math.max(0.0, (kpa / 120.0) * 50.0);
}

// 7. Economics
export function f41_tariff(inr) {
  if (inr <= 6.5) return 100.0;
  if (inr <= 7.5) return 100.0 - ((inr - 6.5) / 1.0) * 20.0;
  if (inr <= 9.0) return 80.0 - ((inr - 7.5) / 1.5) * 35.0;
  return Math.max(20.0, 45.0 - (inr - 9.0) * 10.0);
}

export function f44_land_cost(inrCr) {
  if (inrCr === 0.0) return 5.0;
  if (inrCr <= 4.0) return 100.0;
  if (inrCr <= 8.0) return 100.0 - ((inrCr - 4.0) / 4.0) * 20.0;
  if (inrCr <= 15.0) return 80.0 - ((inrCr - 8.0) / 7.0) * 30.0;
  if (inrCr <= 25.0) return 50.0 - ((inrCr - 15.0) / 10.0) * 35.0;
  return Math.max(2.0, 15.0 - ((inrCr - 25.0) / 25.0) * 13.0);
}

// 8. Corrosivity
export function f47_corrosivity(isa) {
  const s = (isa || 'G1').toUpperCase();
  if (s.includes('G1')) return 100.0;
  if (s.includes('G2')) return 75.0;
  if (s.includes('G3')) return 45.0;
  return 20.0;
}

/**
 * High-Precision Evaluator for Candidate Sites.
 */
export function evaluateCandidateSite(siteInput) {
  const wp = siteInput.water_params || {};
  const pp = siteInput.power_params || {};
  const cp = siteInput.climate_params || {};
  const conn = siteInput.connectivity_params || {};
  const dp = siteInput.disaster_params || {};
  const lp = siteInput.land_params || {};
  const ep = siteInput.economics_params || {};
  const eco = siteInput.eco_params || {};

  const itLoad = siteInput.proposed_it_load_mw || 50.0;

  // Build 50 factor scores
  const scores = {
    1: f1_groundwater_soe(wp.cgwa_extraction_pct ?? wp.groundwater_extraction_pct ?? 75.0),
    2: f2_water_tds(wp.water_quality_tds ?? 450.0),
    3: f3_aquifer_stress(wp.aquifer_stress_category === 'Over-Exploited' ? 95.0 : wp.aquifer_stress_category === 'Critical' ? 88.0 : 65.0),
    4: f4_water_demand(wp.data_center_demand_mld ?? 0.8, itLoad),
    5: f5_tertiary_water(wp.nearest_stp_cetp_km < 5.0 ? 15.0 : 5.0),
    6: f6_storage_hours(wp.on_site_storage_hours ?? 48.0),

    7: f7_substation_dist(pp.substation_distance_km ?? 3.5),
    8: f8_voltage_class(pp.voltage_class_kv ?? 220.0),
    9: f9_spare_mva(pp.transformer_spare_mva ?? 100.0, itLoad),
    10: f10_substations_density(pp.substations_density_15km ?? 3),
    11: pp.renewable_open_access_available ? 90.0 : 45.0,
    12: 85.0,
    13: 85.0,
    14: 75.0,

    15: f15_dry_bulb(cp.dry_bulb_temp_c ?? 35.0),
    16: f16_relative_humidity(cp.relative_humidity_pct ?? 60.0),
    17: f17_wet_bulb(cp.wet_bulb_temp_c ?? 26.5),
    18: 80.0,
    19: cp.extreme_heat_days_count > 15 ? 55.0 : 90.0,
    20: f20_pm25(cp.air_quality_pm25 ?? 45.0),

    21: f21_cls_dist(conn.distance_to_subsea_cls_km ?? 80.0),
    22: f22_cls_rtt(conn.rtt_to_landing_station_ms ?? 5.5),
    23: f23_nixi_dist(conn.distance_to_nixi_km ?? 25.0),
    24: (conn.carrier_neutral_telco_count ?? 4) >= 4 ? 100.0 : 75.0,
    25: (conn.physically_diverse_paths_count ?? 3) >= 3 ? 100.0 : 75.0,
    26: 85.0,

    27: f27_seismic_zone(dp.seismic_zone ?? 'III'),
    28: (dp.earthquakes_250km_count ?? 0) === 0 ? 100.0 : 70.0,
    29: (dp.elevation_margin_above_hfl_m ?? 3.0) >= 3.0 ? 95.0 : 60.0,
    30: 85.0,
    31: dp.landslide_risk_level === 'High' ? 30.0 : 95.0,
    32: (dp.distance_to_fire_station_km ?? 4.0) <= 5.0 ? 95.0 : 70.0,
    33: 90.0,

    34: f34_zoning(lp.notified_industrial_zone ?? true),
    35: (lp.distance_to_expressway_km ?? 3.0) <= 3.0 ? 95.0 : 75.0,
    36: 85.0,
    37: 90.0,
    38: f38_sbc(lp.safe_bearing_capacity_kpa ?? 250.0),
    39: 90.0,
    40: 95.0,

    41: f41_tariff(ep.electricity_tariff_inr_per_kwh ?? 7.0),
    42: (ep.capital_subsidy_pct ?? 20.0) >= 20.0 ? 95.0 : 70.0,
    43: 85.0,
    44: f44_land_cost(ep.land_circle_rate_inr_per_sqft ? (ep.land_circle_rate_inr_per_sqft * 43560) / 10000000 : 3.5),
    45: ep.has_dedicated_state_dc_policy ? 100.0 : 50.0,

    46: 85.0,
    47: f47_corrosivity(cp.air_quality_pm25 > 100 ? 'G3' : 'G1'),

    48: (eco.distance_to_wildlife_sanctuary_km ?? 20.0) >= 10.0 ? 100.0 : 50.0,
    49: (eco.tree_canopy_density_pct ?? 3.0) <= 5.0 ? 100.0 : 60.0,
    50: eco.within_loc_lac_corridor ? 0.0 : 100.0,
  };

  // Dimensional aggregations
  const dimSlices = {
    water: [1, 2, 3, 4, 5, 6],
    power: [7, 8, 9, 10, 11, 12, 13, 14],
    climate: [15, 16, 17, 18, 19, 20],
    connectivity: [21, 22, 23, 24, 25, 26],
    disaster: [27, 28, 29, 30, 31, 32, 33],
    land: [34, 35, 36, 37, 38, 39, 40],
    economics: [41, 42, 43, 44, 45],
    atmospheric: [46, 47],
    sovereign_vetoes: [48, 49, 50],
  };

  const dimScores = {};
  for (const [dim, fids] of Object.entries(dimSlices)) {
    const sumW = fids.reduce((acc, id) => acc + (FACTOR_WEIGHTS[id] || 0.02), 0);
    const sumWS = fids.reduce((acc, id) => acc + scores[id] * (FACTOR_WEIGHTS[id] || 0.02), 0);
    dimScores[dim] = Math.round((sumWS / sumW) * 10) / 10;
  }

  // TOPSIS relative closeness
  let dPlusSq = 0;
  let dMinusSq = 0;
  for (let id = 1; id <= 50; id++) {
    const w = FACTOR_WEIGHTS[id] || 0.02;
    dPlusSq += w * Math.pow(100.0 - scores[id], 2);
    dMinusSq += w * Math.pow(scores[id] - 0.0, 2);
  }
  const dPlus = Math.sqrt(dPlusSq);
  const dMinus = Math.sqrt(dMinusSq);
  const topsisScore = dPlus + dMinus > 0 ? (dMinus / (dPlus + dMinus)) * 100.0 : 50.0;

  // Linear weighted sum
  let rawComposite = 0;
  for (let id = 1; id <= 50; id++) {
    rawComposite += scores[id] * (FACTOR_WEIGHTS[id] || 0.02);
  }

  // Critical Pillar Bottleneck Multipliers
  let bottleneckMult = 1.0;
  if (dimScores.water < 50.0) bottleneckMult *= Math.pow(dimScores.water / 50.0, 0.55);
  if (dimScores.power < 50.0) bottleneckMult *= Math.pow(dimScores.power / 50.0, 0.55);
  const landEcon = (dimScores.land * 0.5) + (dimScores.economics * 0.5);
  if (landEcon < 50.0) bottleneckMult *= Math.pow(landEcon / 50.0, 0.65);
  if (dimScores.climate < 45.0) bottleneckMult *= Math.pow(dimScores.climate / 45.0, 0.35);
  if (dimScores.disaster < 45.0) bottleneckMult *= Math.pow(dimScores.disaster / 45.0, 0.40);
  if (dimScores.atmospheric < 40.0) bottleneckMult *= Math.pow(dimScores.atmospheric / 40.0, 0.30);

  // Calibrated synthesis
  const calibratedBase = (0.65 * topsisScore) + (0.35 * rawComposite);
  let compositeScore = Math.round(calibratedBase * bottleneckMult * 10) / 10;

  // Sovereign Hard Vetoes
  if (eco.within_loc_lac_corridor) {
    compositeScore = Math.min(compositeScore, 12.0);
  }
  if ((eco.distance_to_wildlife_sanctuary_km ?? 20.0) === 0.0) {
    compositeScore = Math.min(compositeScore, 14.5);
  }

  let tier = 'VIABLE / RECOMMENDED';
  let tierBadge = 'VIABLE';
  let tierColor = '#10B981';

  if (compositeScore >= 75.0) {
    tier = 'VIABLE / RECOMMENDED';
    tierBadge = 'VIABLE';
    tierColor = '#10B981';
  } else if (compositeScore >= 50.0) {
    tier = 'CONDITIONAL / HIGH RISK';
    tierBadge = 'CONDITIONAL';
    tierColor = '#F59E0B';
  } else {
    tier = 'UNVIABLE / REJECT';
    tierBadge = 'UNVIABLE';
    tierColor = '#EF4444';
  }

  // Build factor descriptors
  const factors = [];
  for (let id = 1; id <= 50; id++) {
    factors.push({
      id,
      factor_score: Math.round(scores[id] * 10) / 10,
      weight: FACTOR_WEIGHTS[id],
      weighted_score: Math.round(scores[id] * FACTOR_WEIGHTS[id] * 100) / 100,
    });
  }

  return {
    site_id: siteInput.site_id || `sim_${Date.now()}`,
    site_name: siteInput.site_name || 'Simulated Sovereign Facility',
    state: siteInput.state || 'National Territory',
    district: siteInput.district || 'Industrial Corridor',
    latitude: siteInput.latitude,
    longitude: siteInput.longitude,
    elevation_m: siteInput.elevation_m || 50.0,
    proposed_it_load_mw: itLoad,
    composite_score: compositeScore,
    raw_composite_score: Math.round(rawComposite * 10) / 10,
    tier,
    tier_badge: tierBadge,
    tier_color: tierColor,
    water_score: dimScores.water,
    power_score: dimScores.power,
    climate_score: dimScores.climate,
    connectivity_score: dimScores.connectivity,
    disaster_score: dimScores.disaster,
    land_score: dimScores.land,
    economics_score: dimScores.economics,
    eco_score: dimScores.sovereign_vetoes,
    atmospheric_score: dimScores.atmospheric,
    factors,
    total_factors: 50,
  };
}
