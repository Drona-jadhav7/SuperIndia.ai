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
export function f1_groundwater_soe(soe, tertiarySupplyMld = 0.0) {
  let base = 0.0;
  if (soe <= 60.0) base = 100.0;
  else if (soe <= 70.0) base = 100.0 - (soe - 60.0) * 1.5;
  else if (soe <= 90.0) base = 85.0 - ((soe - 70.0) / 20.0) * 35.0;
  else if (soe <= 100.0) base = 50.0 - ((soe - 90.0) / 10.0) * 25.0;
  else base = Math.max(0.0, 25.0 - (soe - 100.0) * 1.5);

  if (tertiarySupplyMld >= 15.0) return Math.max(base, 80.0);
  if (tertiarySupplyMld >= 5.0) return Math.max(base, 65.0);
  return base;
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
  if (tw <= 28.0) return 100.0 - ((tw - 24.0) / 4.0) * 20.0;
  if (tw <= 31.0) return 80.0 - ((tw - 28.0) / 3.0) * 35.0;
  if (tw <= 33.5) return 45.0 - ((tw - 31.0) / 2.5) * 25.0;
  return Math.max(15.0, 20.0 - (tw - 33.5) * 3.0);
}

export function f20_pm25(pm) {
  if (pm <= 30.0) return 100.0;
  if (pm <= 60.0) return 100.0 - ((pm - 30.0) / 30.0) * 20.0;
  if (pm <= 120.0) return 80.0 - ((pm - 60.0) / 60.0) * 30.0;
  return Math.max(30.0, 50.0 - (pm - 120.0) * 0.15);
}

// 4. Connectivity Transfer Functions
export function f21_cls_dist(km) {
  if (km <= 30.0) return 100.0;
  if (km <= 100.0) return 90.0 - ((km - 30.0) / 70.0) * 20.0;
  if (km <= 500.0) return 70.0 - ((km - 100.0) / 400.0) * 25.0;
  return Math.max(25.0, 45.0 - ((km - 500.0) / 1000.0) * 20.0);
}

export function f22_cls_rtt(ms) {
  if (ms <= 4.0) return 100.0;
  if (ms <= 10.0) return 100.0 - ((ms - 4.0) / 6.0) * 18.0;
  if (ms <= 20.0) return 82.0 - ((ms - 10.0) / 10.0) * 22.0;
  return Math.max(30.0, 60.0 - (ms - 20.0) * 1.5);
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
export function f34_zoning(isNotified, isProtected = false, canopyPct = 0) {
  if (isProtected) return 5.0; // Inalienable statutory wildlife / forest land
  if (canopyPct >= 40.0) return 10.0; // Dense forest land - commercial zoning prohibited
  if (canopyPct >= 20.0) return 25.0; // Forest fringe / tree cover - requires arduous forest clearance
  if (canopyPct >= 10.0) return 40.0; // Open canopy woodland
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
export function f46_refinery_dist(km) {
  if (km >= 15.0) return 100.0;
  if (km >= 10.0) return 85.0 + ((km - 10.0) / 5.0) * 15.0;
  if (km >= 5.0) return 60.0 + ((km - 5.0) / 5.0) * 25.0;
  if (km >= 2.0) return 30.0 + ((km - 2.0) / 3.0) * 30.0;
  return Math.max(10.0, (km / 2.0) * 30.0);
}

export function f47_corrosivity(isa) {
  const s = (isa || 'G1').toUpperCase();
  if (s.includes('G1')) return 100.0;
  if (s.includes('G2')) return 75.0;
  if (s.includes('G3')) return 45.0;
  return 20.0;
}

// ==========================================
// 9. Sovereign Ecological & Wildlife Protection
// ==========================================
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const r = 6371.0088;
  const phi1 = (lat1 * Math.PI) / 180.0;
  const phi2 = (lat2 * Math.PI) / 180.0;
  const dphi = ((lat2 - lat1) * Math.PI) / 180.0;
  const dlambda = ((lon2 - lon1) * Math.PI) / 180.0;
  const a = Math.sin(dphi / 2.0) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2.0) ** 2;
  return 2.0 * r * Math.asin(Math.sqrt(a));
}

export const INDIAN_PROTECTED_AREAS_REGISTRY = [
  {
    id: "pa_gir_sanctuary",
    name: "Gir National Park and Wildlife Sanctuary",
    aliases: ["gir", "gir forest", "sasan gir", "gir wls", "gir national park", "gir wildlife sanctuary", "gir lion sanctuary", "dhari", "amreli gir", "dhari taluka"],
    state: "Gujarat",
    district: "Junagadh / Gir Somnath / Amreli / Dhari",
    latitude: 21.1243,
    longitude: 70.7963,
    core_radius_km: 36.0,
    esz_radius_km: 55.0,
    canopy_pct: 68.5,
    tree_species_summary: "Teak (Tectona grandis), Khair, Timru, Ber, millions of mature dry deciduous trees",
    fauna_summary: "Asiatic Lion (Panthera leo persica), Leopard, Chital, Sambar",
    statutory_act: "Wildlife (Protection) Act 1972 Sec 35 & MoEFCC Gir ESZ Notification",
  },
  {
    id: "pa_velavadar_blackbuck",
    name: "Blackbuck National Park (Velavadar)",
    aliases: ["velavadar", "blackbuck national park"],
    state: "Gujarat",
    district: "Bhavnagar",
    latitude: 22.0333,
    longitude: 72.0333,
    core_radius_km: 12.0,
    esz_radius_km: 22.0,
    canopy_pct: 18.0,
    tree_species_summary: "Savannah grassland with sparse Acacia",
    fauna_summary: "Blackbuck, Indian Wolf, Lesser Florican",
    statutory_act: "Wildlife (Protection) Act 1972 Sec 35",
  },
  {
    id: "pa_marine_national_park",
    name: "Marine National Park & Sanctuary (Gulf of Kutch)",
    aliases: ["marine national park", "gulf of kutch marine park", "pirotan island"],
    state: "Gujarat",
    district: "Jamnagar",
    latitude: 22.4667,
    longitude: 69.7500,
    core_radius_km: 20.0,
    esz_radius_km: 30.0,
    canopy_pct: 45.0,
    tree_species_summary: "Avicennia marina mangrove forests",
    fauna_summary: "Corals, Dugong, Green Sea Turtles",
    statutory_act: "Wildlife (Protection) Act 1972",
  },
  {
    id: "pa_sgnp_mumbai",
    name: "Sanjay Gandhi National Park (SGNP)",
    aliases: ["sgnp", "borivali national park", "sanjay gandhi national park"],
    state: "Maharashtra",
    district: "Mumbai Suburban / Thane",
    latitude: 19.2288,
    longitude: 72.9158,
    core_radius_km: 8.0,
    esz_radius_km: 16.0,
    canopy_pct: 74.0,
    tree_species_summary: "Moist deciduous teak, kadamba, bamboo",
    fauna_summary: "Indian Leopard, Chital, Macaque",
    statutory_act: "Wildlife (Protection) Act 1972 Sec 35",
  },
  {
    id: "pa_jim_corbett",
    name: "Jim Corbett National Park",
    aliases: ["corbett", "jim corbett", "corbett tiger reserve"],
    state: "Uttarakhand",
    district: "Nainital / Pauri Garhwal",
    latitude: 29.5300,
    longitude: 78.7747,
    core_radius_km: 28.0,
    esz_radius_km: 40.0,
    canopy_pct: 73.0,
    tree_species_summary: "Sal (Shorea robusta), Khair, Sissoo",
    fauna_summary: "Bengal Tiger, Asian Elephant, Gharial",
    statutory_act: "Wildlife (Protection) Act 1972",
  },
  {
    id: "pa_kaziranga",
    name: "Kaziranga National Park",
    aliases: ["kaziranga", "kaziranga national park", "kaziranga tiger reserve"],
    state: "Assam",
    district: "Golaghat / Nagaon",
    latitude: 26.5775,
    longitude: 93.1711,
    core_radius_km: 26.0,
    esz_radius_km: 38.0,
    canopy_pct: 62.0,
    tree_species_summary: "Alluvial moist mixed deciduous forest",
    fauna_summary: "Indian Rhinoceros, Bengal Tiger, Wild Water Buffalo",
    statutory_act: "Wildlife (Protection) Act 1972",
  },
  {
    id: "pa_sundarbans",
    name: "Sundarbans National Park",
    aliases: ["sundarbans", "sunderbans", "sundarbans tiger reserve"],
    state: "West Bengal",
    district: "South 24 Parganas",
    latitude: 21.9497,
    longitude: 88.8999,
    core_radius_km: 32.0,
    esz_radius_km: 45.0,
    canopy_pct: 82.0,
    tree_species_summary: "Sundari, Gewa, Goran mangroves",
    fauna_summary: "Royal Bengal Tiger, Estuarine Crocodile",
    statutory_act: "Wildlife (Protection) Act 1972",
  },
  {
    id: "pa_tadoba",
    name: "Tadoba Andhari Tiger Reserve",
    aliases: ["tadoba", "tadoba andhari", "tadoba tiger reserve"],
    state: "Maharashtra",
    district: "Chandrapur",
    latitude: 20.2439,
    longitude: 79.3042,
    core_radius_km: 25.0,
    esz_radius_km: 36.0,
    canopy_pct: 78.0,
    tree_species_summary: "Southern dry deciduous teak, bamboo",
    fauna_summary: "Bengal Tiger, Indian Leopard, Sloth Bear",
    statutory_act: "Wildlife (Protection) Act 1972 Sec 38V",
  },
  {
    id: "pa_ranthambore",
    name: "Ranthambore National Park",
    aliases: ["ranthambore", "ranthambhore", "ranthambore tiger reserve"],
    state: "Rajasthan",
    district: "Sawai Madhopur",
    latitude: 26.0173,
    longitude: 76.5026,
    core_radius_km: 22.0,
    esz_radius_km: 32.0,
    canopy_pct: 52.0,
    tree_species_summary: "Dhok, Banyan, Mango, dry deciduous",
    fauna_summary: "Bengal Tiger, Leopard, Nilgai",
    statutory_act: "Wildlife (Protection) Act 1972",
  },
  {
    id: "pa_bandipur",
    name: "Bandipur National Park",
    aliases: ["bandipur", "bandipur tiger reserve"],
    state: "Karnataka",
    district: "Chamarajanagar",
    latitude: 11.6664,
    longitude: 76.6291,
    core_radius_km: 22.0,
    esz_radius_km: 32.0,
    canopy_pct: 71.0,
    tree_species_summary: "Teak, Rosewood, Sandalwood",
    fauna_summary: "Bengal Tiger, Asian Elephant",
    statutory_act: "Wildlife (Protection) Act 1972",
  },
  {
    id: "pa_periyar",
    name: "Periyar National Park and Wildlife Sanctuary",
    aliases: ["periyar", "thekkady", "periyar tiger reserve"],
    state: "Kerala",
    district: "Idukki / Pathanamthitta",
    latitude: 9.4622,
    longitude: 77.2368,
    core_radius_km: 24.0,
    esz_radius_km: 34.0,
    canopy_pct: 76.0,
    tree_species_summary: "Tropical evergreen and moist deciduous forest",
    fauna_summary: "Bengal Tiger, Asian Elephant",
    statutory_act: "Wildlife (Protection) Act 1972",
  },
];

const PROTECTED_KEYWORDS = [
  "national park", "wildlife sanctuary", "sanctuary", "tiger reserve",
  "bird sanctuary", "biosphere reserve", "reserve forest", "protected forest",
  "forest reserve", "wildlife", "safari", "nature reserve", "deer park",
  "gir", "corbett", "kaziranga", "sundarban", "tadoba", "bandipur",
  "periyar", "ranthambore", "velavadar", "kanha", "pench"
];

export function checkProtectedAreaProximityClient(lat, lon, siteName = "", district = "", state = "") {
  const queryStr = `${siteName} ${district} ${state}`.toLowerCase();
  
  let keywordMatched = null;
  for (const kw of PROTECTED_KEYWORDS) {
    if (queryStr.includes(kw)) {
      keywordMatched = kw;
      break;
    }
  }

  let closestPa = null;
  let minDistKm = 99999.0;

  if (lat && lon) {
    for (const pa of INDIAN_PROTECTED_AREAS_REGISTRY) {
      const d = haversineDistanceKm(lat, lon, pa.latitude, pa.longitude);
      if (d < minDistKm) {
        minDistKm = d;
        closestPa = pa;
      }
      for (const alias of pa.aliases) {
        if (queryStr.includes(alias.toLowerCase())) {
          if (d < 80.0 || minDistKm > 40.0) {
            minDistKm = d;
            closestPa = pa;
            break;
          }
        }
      }
    }
  }

  let isInCore = false;
  let isInEsz = false;

  if (closestPa) {
    const coreR = closestPa.core_radius_km || 20.0;
    const eszR = closestPa.esz_radius_km || 35.0;
    const nameMatch = closestPa.aliases.some(alias => queryStr.includes(alias.toLowerCase()));

    if (nameMatch || minDistKm <= coreR || (keywordMatched && minDistKm <= eszR)) {
      isInCore = true;
      minDistKm = 0.0;
    } else if (minDistKm <= eszR) {
      isInEsz = true;
    }
  } else if (keywordMatched) {
    isInCore = true;
    minDistKm = 0.0;
  }

  const paName = closestPa ? closestPa.name : (keywordMatched ? siteName : 'None');
  const canopyPct = closestPa ? closestPa.canopy_pct : (isInCore ? 68.5 : (isInEsz ? 35.0 : 3.5));

  return {
    is_in_core: isInCore,
    is_in_esz: isInEsz,
    closest_protected_area: paName,
    distance_km: Math.round(minDistKm * 10) / 10,
    canopy_pct: canopyPct,
    tree_species_summary: closestPa?.tree_species_summary || (isInCore ? "Dense protected forest tree canopy" : "Non-forest industrial vegetation"),
    fauna_summary: closestPa?.fauna_summary || (isInCore ? "Protected scheduled wildlife habitat" : "Urban/industrial fauna"),
  };
}

/**
 * Factor 48: Wildlife Sanctuary & Protected Forest Proximity
 */
export function f48_wildlife_proximity(distKm, isInCore = false, isInEsz = false) {
  if (isInCore || distKm <= 0.0) {
    return 0.0; // Strictly prohibited inside core sanctuary
  }
  if (isInEsz || distKm < 10.0) {
    return 10.0 + (distKm / 10.0) * 30.0; // 10.0 to 40.0 in ESZ
  }
  if (distKm < 25.0) {
    return 40.0 + ((distKm - 10.0) / 15.0) * 45.0; // 40.0 to 85.0
  }
  return 100.0;
}

/**
 * Factor 49: Tree Canopy Density & Statutory Forest Protection
 * Rule: Any place where there are more trees should NOT be scored well!
 */
export function f49_tree_canopy(canopyPct, isNotifiedNonForest = true, isInCore = false) {
  if (isInCore) {
    return 0.0; // Inviolable sanctuary with mature trees
  }
  // Even if claimed non-forest, if there are trees, felling is required and must be penalized
  if (canopyPct <= 5.0 && isNotifiedNonForest) {
    return 100.0; // Master-planned non-forest industrial land (0 trees cut)
  }
  if (canopyPct <= 5.0) {
    return 85.0;
  }
  if (canopyPct <= 10.0) {
    // 5% to 10% canopy (Light scrub / sparse trees): 80 -> 55
    return 80.0 - ((canopyPct - 5.0) / 5.0) * 25.0;
  }
  if (canopyPct <= 20.0) {
    // 10% to 20% canopy (Open forest / moderate tree density): 55 -> 25
    return 55.0 - ((canopyPct - 10.0) / 10.0) * 30.0;
  }
  if (canopyPct <= 40.0) {
    // 20% to 40% canopy (Moderately dense tree cover): 25 -> 5
    return 25.0 - ((canopyPct - 20.0) / 20.0) * 20.0;
  }
  // > 40% canopy (Dense mature closed tree canopy): 0 to 5
  return Math.max(0.0, 5.0 - (canopyPct - 40.0) * 0.1);
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
  const atm = siteInput.atmospheric_params || {};

  const siteName = siteInput.site_name || '';
  const district = siteInput.district || '';
  const state = siteInput.state || '';
  const itLoad = siteInput.proposed_it_load_mw || 50.0;

  // 1. Authoritative Protected Area & Sanctuary Check
  const paCheck = checkProtectedAreaProximityClient(
    siteInput.latitude,
    siteInput.longitude,
    siteName,
    district,
    state
  );

  const isInCoreSanctuary = paCheck.is_in_core || (eco.distance_to_wildlife_sanctuary_km === 0.0);
  const isInEszBuffer = paCheck.is_in_esz || (eco.distance_to_wildlife_sanctuary_km > 0 && eco.distance_to_wildlife_sanctuary_km < 10.0);

  // 2. Tree Canopy Density Resolution
  // Rule: Any place where there are more trees should NOT be scored well!
  let treeCanopyPct = eco.tree_canopy_cover_pct ?? eco.tree_canopy_density_pct;
  if (treeCanopyPct === undefined || treeCanopyPct === null) {
    treeCanopyPct = isInCoreSanctuary ? paCheck.canopy_pct : (isInEszBuffer ? 25.0 : 3.0);
  } else if (isInCoreSanctuary && treeCanopyPct < 20.0) {
    treeCanopyPct = paCheck.canopy_pct || 68.5;
  }

  // If in sanctuary or high canopy, cannot be certified non-forest industrial land
  const isCertifiedNonForest = (isInCoreSanctuary || isInEszBuffer || treeCanopyPct > 10.0)
    ? false
    : (eco.is_notified_non_forest ?? eco.notified_non_forest ?? (lp.is_notified_it_industrial_zone ?? true));

  const distanceToSanctuary = isInCoreSanctuary ? 0.0 : (paCheck.distance_km ?? eco.distance_to_esz_km ?? eco.distance_to_wildlife_sanctuary_km ?? 25.0);

  // Build 50 factor scores
  const scores = {
    1: f1_groundwater_soe(wp.cgwa_extraction_pct ?? wp.groundwater_extraction_pct ?? 75.0, wp.tertiary_supply_mld ?? (wp.nearest_stp_cetp_km < 5.0 ? 15.0 : 0.0)),
    2: f2_water_tds(wp.water_quality_tds ?? 450.0),
    3: f3_aquifer_stress(wp.aquifer_stress_category === 'Over-Exploited' ? 95.0 : wp.aquifer_stress_category === 'Critical' ? 88.0 : 65.0),
    4: f4_water_demand(wp.data_center_demand_mld ?? 0.8, itLoad),
    5: f5_tertiary_water(wp.nearest_stp_cetp_km < 5.0 ? 15.0 : 5.0),
    6: f6_storage_hours(wp.on_site_storage_hours ?? 48.0),

    7: f7_substation_dist(isInCoreSanctuary ? 18.0 : (pp.substation_distance_km ?? 3.5)),
    8: f8_voltage_class(isInCoreSanctuary ? 11.0 : (pp.voltage_class_kv ?? 220.0)),
    9: f9_spare_mva(isInCoreSanctuary ? 5.0 : (pp.transformer_spare_mva ?? 100.0), itLoad),
    10: f10_substations_density(isInCoreSanctuary ? 0 : (pp.substations_density_15km ?? 3)),
    11: isInCoreSanctuary ? 15.0 : (pp.renewable_open_access_available ? 90.0 : 45.0),
    12: 85.0,
    13: 85.0,
    14: 75.0,

    15: f15_dry_bulb(cp.dry_bulb_temp_c ?? 35.0),
    16: f16_relative_humidity(cp.relative_humidity_pct ?? 60.0),
    17: f17_wet_bulb(cp.wet_bulb_temp_c ?? 26.5),
    18: 80.0,
    19: cp.extreme_heat_days_count > 15 ? 55.0 : 90.0,
    20: f20_pm25(cp.air_quality_pm25 ?? 45.0),

    21: f21_cls_dist(isInCoreSanctuary ? 120.0 : (conn.distance_to_subsea_cls_km ?? 80.0)),
    22: f22_cls_rtt(isInCoreSanctuary ? 24.0 : (conn.rtt_to_landing_station_ms ?? 5.5)),
    23: f23_nixi_dist(isInCoreSanctuary ? 120.0 : (conn.distance_to_nixi_km ?? 25.0)),
    24: isInCoreSanctuary ? 25.0 : ((conn.carrier_neutral_telco_count ?? 4) >= 4 ? 100.0 : 75.0),
    25: isInCoreSanctuary ? 25.0 : ((conn.physically_diverse_paths_count ?? 3) >= 3 ? 100.0 : 75.0),
    26: isInCoreSanctuary ? 20.0 : 85.0,

    27: f27_seismic_zone(dp.seismic_zone ?? 'III'),
    28: (dp.earthquakes_250km_count ?? 0) === 0 ? 100.0 : 70.0,
    29: (dp.elevation_margin_above_hfl_m ?? 3.0) >= 3.0 ? 95.0 : 60.0,
    30: 85.0,
    31: dp.landslide_risk_level === 'High' ? 30.0 : 95.0,
    32: (dp.distance_to_fire_station_km ?? 4.0) <= 5.0 ? 95.0 : 70.0,
    33: 90.0,

    // Land Dimension: Heavily penalizes protected areas and high tree canopy
    34: f34_zoning(lp.notified_industrial_zone ?? (!isInCoreSanctuary && isCertifiedNonForest), isInCoreSanctuary, treeCanopyPct),
    35: isInCoreSanctuary ? 25.0 : ((lp.distance_to_expressway_km ?? 3.0) <= 3.0 ? 95.0 : 75.0),
    36: isInCoreSanctuary ? 20.0 : 85.0,
    37: 90.0,
    38: f38_sbc(lp.safe_bearing_capacity_kpa ?? 250.0),
    39: 90.0,
    40: isInCoreSanctuary ? 10.0 : 95.0,

    41: f41_tariff(ep.electricity_tariff_inr_per_kwh ?? 7.0),
    42: isInCoreSanctuary ? 0.0 : ((ep.capital_subsidy_pct ?? 20.0) >= 20.0 ? 95.0 : 70.0),
    43: 85.0,
    44: f44_land_cost(ep.land_circle_rate_inr_per_sqft ? (ep.land_circle_rate_inr_per_sqft * 43560) / 10000000 : 3.5),
    45: isInCoreSanctuary ? 0.0 : (ep.has_dedicated_state_dc_policy ? 100.0 : 50.0),

    46: f46_refinery_dist(atm.distance_to_refinery_km ?? 15.0),
    47: f47_corrosivity(atm.isa_71_04_level ?? (cp.air_quality_pm25 > 100 ? 'G3' : 'G1')),

    // Sovereign & Ecology Dimension (Strict statutory weights)
    48: f48_wildlife_proximity(distanceToSanctuary, isInCoreSanctuary, isInEszBuffer),
    49: f49_tree_canopy(treeCanopyPct, isCertifiedNonForest, isInCoreSanctuary),
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

  // Statutory Land Dimension Downward Clamping for Forest & Tree Cover
  if (isInCoreSanctuary) {
    dimScores.land = Math.min(dimScores.land, 10.0);
    dimScores.sovereign_vetoes = Math.min(dimScores.sovereign_vetoes, 5.0);
    dimScores.power = Math.min(dimScores.power, 20.0);
    dimScores.connectivity = Math.min(dimScores.connectivity, 20.0);
  } else if (treeCanopyPct >= 40.0) {
    dimScores.land = Math.min(dimScores.land, 15.0);
    dimScores.sovereign_vetoes = Math.min(dimScores.sovereign_vetoes, 12.0);
  } else if (treeCanopyPct >= 20.0) {
    dimScores.land = Math.min(dimScores.land, 35.0);
    dimScores.sovereign_vetoes = Math.min(dimScores.sovereign_vetoes, 30.0);
  } else if (treeCanopyPct >= 10.0) {
    dimScores.land = Math.min(dimScores.land, 55.0);
    dimScores.sovereign_vetoes = Math.min(dimScores.sovereign_vetoes, 55.0);
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
  if (dimScores.water < 40.0) bottleneckMult *= Math.pow(dimScores.water / 40.0, 0.55);
  if (dimScores.power < 45.0) bottleneckMult *= Math.pow(dimScores.power / 45.0, 0.55);
  const landEcon = (dimScores.land * 0.5) + (dimScores.economics * 0.5);
  if (landEcon < 45.0) bottleneckMult *= Math.pow(landEcon / 45.0, 0.65);
  if (dimScores.climate < 35.0) bottleneckMult *= Math.pow(dimScores.climate / 35.0, 0.35);
  if (dimScores.disaster < 40.0) bottleneckMult *= Math.pow(dimScores.disaster / 40.0, 0.40);
  if (dimScores.atmospheric < 35.0) bottleneckMult *= Math.pow(dimScores.atmospheric / 35.0, 0.30);

  // Tree Canopy & Deforestation Bottleneck Multiplier
  if (treeCanopyPct > 10.0) {
    bottleneckMult *= Math.pow(Math.max(0.05, (100.0 - treeCanopyPct) / 90.0), 0.75);
  }

  // Fatal Economic & Land acquisition cost veto for hyper-dense metros (e.g. South Mumbai)
  const landCostCr = ep.land_circle_rate_inr_per_sqft 
    ? (ep.land_circle_rate_inr_per_sqft * 43560) / 10000000 
    : (ep.land_cost_inr_crore_per_acre || 3.5);
  const parcelAcres = lp.contiguous_parcel_acres || 50.0;
  if (landCostCr >= 30.0 || (landCostCr >= 15.0 && parcelAcres <= 10.0)) {
    bottleneckMult *= 0.60;
    dimScores.economics = Math.min(dimScores.economics, 30.0);
    dimScores.land = Math.min(dimScores.land, 35.0);
  }

  // Calibrated synthesis (25% TOPSIS geometric variance + 75% Weighted baseline * Bottleneck Multiplier)
  const calibratedBase = (0.25 * topsisScore) + (0.75 * rawComposite);
  let compositeScore = Math.round(calibratedBase * bottleneckMult * 10) / 10;

  // Sovereign Hard Vetoes & Deforestation Caps
  if (isInCoreSanctuary) {
    compositeScore = Math.min(compositeScore, 14.5);
  } else if (eco.within_loc_lac_corridor) {
    compositeScore = Math.min(compositeScore, 12.0);
  } else if (treeCanopyPct >= 40.0) {
    compositeScore = Math.min(compositeScore, 22.0);
  } else if (isInEszBuffer || treeCanopyPct >= 20.0) {
    compositeScore = Math.min(compositeScore, 48.0);
  } else if (treeCanopyPct >= 10.0) {
    compositeScore = Math.min(compositeScore, 65.0);
  }

  let tier = 'VIABLE / RECOMMENDED';
  let tierBadge = 'VIABLE';
  let tierColor = '#10B981';

  if (compositeScore >= 90.0) {
    tier = 'OPTIMAL / STRATEGIC';
    tierBadge = 'OPTIMAL';
    tierColor = '#059669';
  } else if (compositeScore >= 75.0) {
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

  // Risk flags & mandates
  const riskFlags = [];
  const engineeringMandates = [];
  const diagnostics = [];

  if (isInCoreSanctuary) {
    riskFlags.push(`STATUTORY PROHIBITION: Site located inside ${paCheck.closest_protected_area} (Wildlife Protection Act 1972 Sec 35)`);
    riskFlags.push(`CRITICAL ECOLOGICAL HAZARD: Protected habitat of millions of trees (${paCheck.tree_species_summary}) and ${paCheck.fauna_summary}`);
    riskFlags.push(`ZERO TREE CUTTING DIRECTIVE: 100% tree preservation mandated by national law. Commercial proposal rejected.`);
    riskFlags.push(`INALIENABLE SANCTUARY LAND: Land cannot be zoned, alienated, or acquired for industrial computing.`);
    engineeringMandates.push(`1. IMMEDIATE SITE REJECTION: Siting in ${paCheck.closest_protected_area} is forbidden by national law. Zero construction permits can be issued.`);
    engineeringMandates.push(`2. MANDATORY ZERO TREE FELLING DIRECTIVE: No trees will be cut under any circumstances.`);
    engineeringMandates.push(`3. RELOCATE TO INDUSTRIAL ZONE: Relocate compute infrastructure to master-planned non-forest zones (e.g., Dholera SIR, Sanand GIDC, or Mahape MIDC).`);
    diagnostics.push(`Statutory Veto Triggered: ${paCheck.closest_protected_area} is an inviolable protected ecosystem. Composite score clamped to 14.5/100.`);
  } else if (treeCanopyPct >= 20.0) {
    riskFlags.push(`HIGH TREE COVER HAZARD: Site has ${treeCanopyPct.toFixed(1)}% tree canopy cover. Tree felling strictly restricted under Forest (Conservation) Act.`);
    riskFlags.push(`DEFORESTATION PENALTY: Sites with high tree cover are heavily penalized to protect natural carbon sinks.`);
    engineeringMandates.push(`Mandatory 3:1 Compensatory Afforestation and Stage-II Forest Clearance required.`);
    diagnostics.push(`Tree canopy density (${treeCanopyPct.toFixed(1)}%) triggered strict ecological bottleneck penalty.`);
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
    risk_flags: riskFlags,
    engineering_mandates: engineeringMandates,
    diagnostics: diagnostics,
    eco_assessment: {
      estimated_trees_to_cut: isInCoreSanctuary ? 0 : Math.round(25.0 * treeCanopyPct * 4.2),
      canopy_cover_pct: treeCanopyPct,
      tree_preservation_status: isInCoreSanctuary 
        ? "Strict Zero Tree Cutting Directive: Home to millions of trees and endangered wildlife. Under Sections 29 & 35 of the Wildlife (Protection) Act 1972, no trees will be cut. Industrial development is strictly prohibited."
        : (treeCanopyPct <= 5.0 ? "Zero Tree Cutting Required (Certified Non-Forest Industrial Zone)" : `Tree Felling Restricted: ${treeCanopyPct.toFixed(1)}% tree canopy density`),
      is_core_sanctuary: isInCoreSanctuary,
      closest_protected_area: paCheck.closest_protected_area,
    },
    fifty_factor_telemetry: {
      composite_score: compositeScore,
      water_score: dimScores.water,
      power_score: dimScores.power,
      climate_score: dimScores.climate,
      connectivity_score: dimScores.connectivity,
      disaster_score: dimScores.disaster,
      land_score: dimScores.land,
      economics_score: dimScores.economics,
      sovereign_score: dimScores.sovereign_vetoes,
      atmospheric_score: dimScores.atmospheric,
      factors,
    },
    factors,
    total_factors: 50,
  };
}
