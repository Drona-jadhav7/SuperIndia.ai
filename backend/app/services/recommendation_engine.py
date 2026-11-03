"""
SuperIndia.ai - Geospatial Sovereign Alternative Recommendation Engine
Identifies high-viability, pre-verified Indian AI infrastructure clusters near a candidate site
when the user's selected location scores low or triggers statutory/ecological vetoes.
"""

import math
from typing import List, Tuple, Optional, Dict, Any
from backend.app.models.schemas import RecommendedAlternative

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Compute Great-Circle geodesic distance in kilometers via Haversine formula."""
    r = 6371.0 # Earth's mean radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c

# Catalog of verified, high-scoring master-planned industrial & data center corridors across India
# All sites are certified non-forest industrial land with proven 220kV/400kV EHV baseload and zero statutory vetoes.
VERIFIED_AI_HUBS_CATALOG: List[Dict[str, Any]] = [
    {
        "site_id": "dholera_sir",
        "site_name": "Dholera SIR (Special Investment Region)",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "latitude": 22.2500,
        "longitude": 72.2000,
        "elevation_m": 12.0,
        "composite_score": 89.4,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "5,000 MW Dedicated Solar Park & Green Energy Corridor",
            "400kV Dual-Grid Substation with > 250 MVA spare N-1 margin",
            "100% Certified Non-Forest Greenfield Industrial Land (0 trees cut)",
            "Gujarat Dedicated IT/ITeS Policy: 25% Capital Subsidy + 10-Yr Duty Exemption"
        ],
        "why_better": {
            "power": "400kV Dual-Grid Substation with 250 MVA headroom + 5GW solar park",
            "water": "Deep stormwater recycling & Narmada canal bulk industrial supply",
            "environment": "Master-planned smart industrial city; zero forest clearance required",
            "connectivity": "Direct expressway to Ahmedabad; sub-12ms RTT to Mumbai subsea cable landing",
            "policy": "Gujarat DC Policy: 25% Capex subsidy & 100% stamp duty exemption"
        }
    },
    {
        "site_id": "sanand_gidc",
        "site_name": "Sanand GIDC Industrial Park",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "latitude": 22.9800,
        "longitude": 72.3700,
        "elevation_m": 58.0,
        "composite_score": 88.5,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "Semiconductor & Advanced Computing Zone (Micron OSAT Anchor)",
            "Dual 220kV EHV Industrial Feeder with 120 MVA headroom",
            "100% Non-Forest Notified Industrial Land (WPA 1972 Safe)",
            "State CETP tertiary recycled water network"
        ],
        "why_better": {
            "power": "220kV dedicated sub-station with 120 MVA spare margin",
            "water": "CETP tertiary industrial water buffer; no groundwater withdrawal",
            "environment": "Certified GIDC industrial zone; > 150 km from Gir & protected sanctuaries",
            "connectivity": "Dense optical fiber ring along DMIC industrial corridor",
            "policy": "Gujarat Semiconductor & IT Policy single-window clearances"
        }
    },
    {
        "site_id": "gift_city",
        "site_name": "GIFT City (Gujarat International Finance Tec-City)",
        "state": "Gujarat",
        "district": "Gandhinagar",
        "latitude": 23.1610,
        "longitude": 72.6840,
        "elevation_m": 81.0,
        "composite_score": 87.2,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "India's Premier International Financial Services Centre (IFSC)",
            "Dual 400kV Substation with automated underground utility tunnel (Utility Tunnel)",
            "Dedicated District Cooling System (DCS) reducing cooling power by 30%",
            "Direct high-speed connectivity to NIXI Ahmedabad exchange"
        ],
        "why_better": {
            "power": "Dual 400kV redundant power feeds with 99.999% uptime track record",
            "water": "Centralized chilled water utility (District Cooling); zero cooling water evaporation",
            "environment": "100% Green building certified SEZ; zero deforestation penalty",
            "connectivity": "Sub-5ms optical latency to regional Tier-1 carrier interchanges",
            "policy": "Zero corporate tax window for 10 years + full GST duty waivers"
        }
    },
    {
        "site_id": "navi_mumbai_ttc",
        "site_name": "Navi Mumbai (Airoli / Mahape / TTC Industrial Area)",
        "state": "Maharashtra",
        "district": "Thane",
        "latitude": 19.1600,
        "longitude": 73.0000,
        "elevation_m": 18.0,
        "composite_score": 87.4,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "India's #1 Data Center Capital (Hosts > 50% of National AI/DC Capacity)",
            "Direct < 3ms RTT to Versova / Prabhadevi Subsea Cable Landing Stations",
            "MSEDCL & Tata Power Dual-Utility 220kV Grid Interconnects",
            "MIDC Certified Non-Forest Industrial Zone (Zero tree felling disputes)"
        ],
        "why_better": {
            "power": "Dual power utility supply (MSEDCL + Tata Power) with dedicated 220kV substation",
            "water": "MIDC industrial piped water supply + on-site CETP tertiary treated water",
            "environment": "Brownfield notified industrial estate; outside CRZ and SGNP eco-sensitive zone",
            "connectivity": "Lowest subsea cable landing latency in South Asia (< 3.5ms optical geodesic)",
            "policy": "Maharashtra DC Policy: Stamp duty waiver, green power open access concessions"
        }
    },
    {
        "site_id": "taloja_midc",
        "site_name": "Taloja MIDC Industrial Hub",
        "state": "Maharashtra",
        "district": "Raigad",
        "latitude": 19.0600,
        "longitude": 73.1200,
        "elevation_m": 22.0,
        "composite_score": 85.2,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "Heavy Industrial & High-Voltage Power Corridor",
            "Dedicated 220kV/400kV MSETCL Substation with 100+ MVA headroom",
            "Adjacent to Navi Mumbai International Airport (NMIA) logistics corridor",
            "Abundant contiguous industrial land parcels"
        ],
        "why_better": {
            "power": "Direct 220kV MSETCL transmission line access with 100 MVA spare margin",
            "water": "MIDC piped treated effluent water for cooling tower closed loops",
            "environment": "Designated chemical & engineering zone; zero tree cutting restrictions",
            "connectivity": "Tri-carrier diverse fiber backhaul along NH-48 / Mumbai-Pune expressway",
            "policy": "Eligible for Mega Project industrial incentives under Maharashtra Package Scheme"
        }
    },
    {
        "site_id": "chakan_midc_pune",
        "site_name": "Pune Industrial AI Park (Chakan MIDC)",
        "state": "Maharashtra",
        "district": "Pune",
        "latitude": 18.7520,
        "longitude": 73.8560,
        "elevation_m": 640.0,
        "composite_score": 84.8,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "High Elevation (640m ASL) with favorable dry-bulb psychrometrics",
            "220kV EHV Substation (1.5 km distance) with 75 MVA headroom",
            "Dense engineering talent pool from Pune / Pimpri-Chinchwad tech corridor",
            "Low seismic risk (Zone III) with hard Deccan basalt foundation"
        ],
        "why_better": {
            "power": "220kV EHV substation within 1.5 km; strong Western Grid renewable feed",
            "water": "Tertiary treated STP water supply (25 MLD capacity)",
            "environment": "Pre-zoned MIDC industrial land; hard rock foundation (SBC > 240 kPa)",
            "connectivity": "Dark fiber connection to Mumbai CLS (< 6ms) and NIXI Pune node",
            "policy": "Eligible for Maharashtra IT/ITES capital subsidies & electricity duty waiver"
        }
    },
    {
        "site_id": "hinjewadi_pune",
        "site_name": "Hinjewadi Phase 3 Infotech Park (Pune)",
        "state": "Maharashtra",
        "district": "Pune",
        "latitude": 18.5910,
        "longitude": 73.7080,
        "elevation_m": 580.0,
        "composite_score": 86.0,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "Premier Enterprise IT & AI Software Campus Hub",
            "Dedicated 132kV/220kV Substation with N-1 transformer redundancy",
            "Multiple carrier-neutral dark fiber conduits (Airtel, Jio, Tata, Vodafone)",
            "Low ambient wet-bulb temperature yielding high free-cooling hours"
        ],
        "why_better": {
            "power": "Dedicated IT park substation with guaranteed dual-circuit uptime",
            "water": "Municipal treated water + on-site closed loop recycling",
            "environment": "Certified IT SEZ zone; zero forest or environmental clearance bottlenecks",
            "connectivity": "Direct metro ring fiber to Mumbai CLS and National Internet Exchange",
            "policy": "100% stamp duty exemption & customized high-tech incentives"
        }
    },
    {
        "site_id": "kiadb_aerospace_blr",
        "site_name": "KIADB Aerospace Park (Devanahalli, Bengaluru)",
        "state": "Karnataka",
        "district": "Bengaluru Rural",
        "latitude": 13.2160,
        "longitude": 77.7120,
        "elevation_m": 918.0,
        "composite_score": 91.8,
        "tier": "OPTIMAL / STRATEGIC",
        "tier_badge": "OPTIMAL",
        "tier_color": "#059669",
        "key_advantages": [
            "High Altitude (918m ASL) with cool climate and low Wet-Bulb (22.5°C)",
            "220kV KPTCL Substation with 140 MVA spare N-1 margin",
            "100% Certified Non-Forest Industrial Park (Zero tree felling disputes)",
            "Karnataka DC Policy: 100% Stamp Duty Waiver + Power Concessions"
        ],
        "why_better": {
            "power": "Dedicated 220kV substation within 1.8 km; 140 MVA spare margin",
            "water": "Tertiary treated STP supply (18 MLD) ensuring zero groundwater depletion",
            "environment": "High-altitude plateau with 918m ASL; saves 35% mechanical chiller power",
            "connectivity": "5 Tier-1 carrier neutral telcos & direct NIXI Bengaluru peering",
            "policy": "Karnataka Data Center Policy 2022: Up to ₹100 Cr capital subsidy"
        }
    },
    {
        "site_id": "whitefield_blr",
        "site_name": "Whitefield Tech Corridor (EPIP Zone, Bengaluru)",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "latitude": 12.9698,
        "longitude": 77.7500,
        "elevation_m": 880.0,
        "composite_score": 84.5,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "Established Hyperscale Cloud & Enterprise Colocation Cluster",
            "Dense multi-carrier dark fiber backbones along ITPL corridor",
            "Cool plateau climate reducing annualized PUE to < 1.30",
            "Mature ecosystem of Tier-IV certified facilities"
        ],
        "why_better": {
            "power": "Dual BESCOM feeders with 66kV/220kV grid redundancy",
            "water": "BWSSB treated pipeline + high rainwater harvesting capacity",
            "environment": "EPIP industrial zone; zero natural forest cover on plot",
            "connectivity": "Host to major cloud interconnection nodes and peering exchanges",
            "policy": "Standard industrial IT power tariff with green energy open access"
        }
    },
    {
        "site_id": "hitec_city_hyd",
        "site_name": "HITEC City & Financial District (Hyderabad)",
        "state": "Telangana",
        "district": "Rangareddy",
        "latitude": 17.4435,
        "longitude": 78.3772,
        "elevation_m": 542.0,
        "composite_score": 88.1,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "AI Innovation Hub with India's most proactive Data Center Policy",
            "Lowest Seismic Hazard in India (Zone II Stable Deccan Shield)",
            "220kV/400kV Dual Substation with 120 MVA headroom",
            "100% Water Tariff Concessions & Fast-Track Single Window Approvals"
        ],
        "why_better": {
            "power": "400kV Gachibowli/Raidurg sub-station ring with high solar PPA share",
            "water": "Godavari & Krishna treated bulk supply + zero groundwater dependency",
            "environment": "Zone II lowest seismic activity; hard granite subgrade (SBC > 300 kPa)",
            "connectivity": "Central India optical gateway with < 10ms RTT to all metros",
            "policy": "Telangana ICT Policy: Subsidized power & 100% stamp duty exemption"
        }
    },
    {
        "site_id": "fab_city_hyd",
        "site_name": "Fab City & Hardware Park (Maheshwaram, Hyderabad)",
        "state": "Telangana",
        "district": "Rangareddy",
        "latitude": 17.2100,
        "longitude": 78.5200,
        "elevation_m": 590.0,
        "composite_score": 90.5,
        "tier": "OPTIMAL / STRATEGIC",
        "tier_badge": "OPTIMAL",
        "tier_color": "#059669",
        "key_advantages": [
            "Mega Sited Industrial Zone for High-Density GPU Hyperscale Clusters",
            "Dual 400kV Dedicated Substation with 200+ MVA spare capacity",
            "Over 1,000 Acres of Contiguous Industrial Land Bank (Zero litigation)",
            "Adjacent to Hyderabad International Airport (RGIA)"
        ],
        "why_better": {
            "power": "400kV mega-substation built for semiconductor manufacturing",
            "water": "HMWS&SB dedicated industrial supply reservoir on campus",
            "environment": "TSIIC pre-notified non-forest industrial land; zero tree felling issues",
            "connectivity": "Dual diverse fiber routes to Hyderabad IX and Chennai/Mumbai CLS",
            "policy": "Custom Mega-Project incentives with subsidized power tariff"
        }
    },
    {
        "site_id": "sriperumbudur_sipcot",
        "site_name": "SIPCOT Industrial Park (Sriperumbudur, Tamil Nadu)",
        "state": "Tamil Nadu",
        "district": "Kanchipuram",
        "latitude": 12.9800,
        "longitude": 79.9400,
        "elevation_m": 42.0,
        "composite_score": 88.0,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "Electronics & High-Density DC Zone (Foxconn, Hyundai, Dell corridor)",
            "Direct 220kV/400kV TANGEDCO Substation with 90 MVA spare margin",
            "Close Proximity to Chennai Subsea Cable Landing Stations (< 40 km, < 4ms RTT)",
            "Tamil Nadu Data Centre Policy: 100% Stamp Duty Exemption + Power Subsidy"
        ],
        "why_better": {
            "power": "220kV dedicated feeder with strong solar and wind power evacuation",
            "water": "SIPCOT treated industrial greywater & Nemmeli desalination pipeline",
            "environment": "100% Notified Non-Forest Industrial Land; zero environmental dispute",
            "connectivity": "Low optical latency (< 3.8ms) to Chennai international subsea cables",
            "policy": "Tamil Nadu DC Policy 2021: Fixed capital subsidies & electricity duty rebate"
        }
    },
    {
        "site_id": "siruseri_sipcot",
        "site_name": "Siruseri SIPCOT IT Park (Chennai)",
        "state": "Tamil Nadu",
        "district": "Chengalpattu",
        "latitude": 12.8250,
        "longitude": 80.2250,
        "elevation_m": 15.0,
        "composite_score": 86.8,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "East Coast Subsea Cable Landing Gateway (< 15 km to Santhome CLS)",
            "Ultra-Low International Egress Latency to Singapore (< 28ms)",
            "Dual 220kV Substation with underground dedicated power conduits",
            "Pre-notified IT SEZ zone with zero environmental delays"
        ],
        "why_better": {
            "power": "220kV dedicated IT substation with dual redundant feeder lines",
            "water": "Desalination plant supply + tertiary water recycling",
            "environment": "SIPCOT IT park; fully cleared land with zero tree felling mandates",
            "connectivity": "Shortest physical fiber run to East Coast subsea cables",
            "policy": "Subsidized industrial power and single-window MeitY approvals"
        }
    },
    {
        "site_id": "greater_noida_kp5",
        "site_name": "Greater Noida Knowledge Park V (UP Data Center Hub)",
        "state": "Uttar Pradesh",
        "district": "Gautam Buddha Nagar",
        "latitude": 28.4744,
        "longitude": 77.5040,
        "elevation_m": 204.0,
        "composite_score": 86.5,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "North India's Largest Sovereign AI & Cloud Data Center Hub",
            "Dual 220kV Substation with 100 MVA spare N-1 transformer margin",
            "UP Data Center Policy 2021: 100% Stamp Duty Exemption + ₹20 Cr Capital Subsidy",
            "Pre-notified non-forest industrial land with zero environmental disputes"
        ],
        "why_better": {
            "power": "220kV EHV substation within 2.2 km; dual-circuit independent feeders",
            "water": "Tertiary treated STP water network with 20 MLD capacity",
            "environment": "Certified industrial zone; zero natural forest cover on parcel",
            "connectivity": "Dense carrier neutral backbones connecting to NIXI Delhi (< 1.5ms)",
            "policy": "UP Data Centre Policy: Up to 25% capital subsidy and 100% stamp duty exemption"
        }
    },
    {
        "site_id": "yeida_jewar",
        "site_name": "YEIDA Sector 28 (Jewar Airport Corridor)",
        "state": "Uttar Pradesh",
        "district": "Gautam Buddha Nagar",
        "latitude": 28.2100,
        "longitude": 77.5800,
        "elevation_m": 198.0,
        "composite_score": 89.0,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "Noida International Airport Mega-Campus Corridor",
            "Brand New 400kV/220kV Substation with 180 MVA Headroom",
            "Yamuna Expressway high-speed transit with dedicated optical fiber conduits",
            "Custom Mega-Project incentives for AI & Semiconductor clusters"
        ],
        "why_better": {
            "power": "Brand new 400kV substation infrastructure engineered for airport city",
            "water": "Upper Ganga Canal bulk industrial water supply & dedicated STP",
            "environment": "Master-planned YEIDA industrial sectors with zero tree clearing issues",
            "connectivity": "State-of-the-art underground multi-duct fiber along Yamuna Expressway",
            "policy": "FDI & Sovereign Infrastructure priority zone under UP Government"
        }
    },
    {
        "site_id": "mohali_it_city",
        "site_name": "Mohali IT City (SAS Nagar, Punjab)",
        "state": "Punjab",
        "district": "SAS Nagar (Mohali)",
        "latitude": 30.6300,
        "longitude": 76.7700,
        "elevation_m": 310.0,
        "composite_score": 85.5,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "North Tech & Research Corridor (Adjacent to Chandigarh / IIT Ropar)",
            "220kV Substation with cheap hydro-dominated baseload power",
            "Safe distance from hostile borders (> 150 km) with all-weather highway access",
            "Moderate winter temperatures without snowbound cutoffs"
        ],
        "why_better": {
            "power": "Low-cost hydro power baseload from Bhakra grid with 220kV feeds",
            "water": "Canal-based treated surface water + high capacity local aquifers",
            "environment": "Pre-zoned GMADA IT City; outside sensitive hill ecology & borders",
            "connectivity": "Direct optical link to Delhi Internet Exchange and academic networks",
            "policy": "Invest Punjab single-window fast-track clearances"
        }
    },
    {
        "site_id": "rajarhat_kolkata",
        "site_name": "Rajarhat New Town IT Action Area II (Kolkata)",
        "state": "West Bengal",
        "district": "North 24 Parganas",
        "latitude": 22.5850,
        "longitude": 88.4800,
        "elevation_m": 10.0,
        "composite_score": 84.2,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "Eastern India Digital Gateway & Subsea Landing Terminal (Digha cable)",
            "132kV/220kV WBSETCL Dual Substation with 80 MVA headroom",
            "WB Data Center Policy: Green power concessions & stamp duty waiver",
            "Dense talent base from Kolkata universities & IIT Kharagpur"
        ],
        "why_better": {
            "power": "WBSETCL dual substation with robust eastern grid interconnect",
            "water": "Municipal treated surface water from Hooghly River treated works",
            "environment": "Master-planned WBHIDCO smart city; zero tree clearing mandates",
            "connectivity": "Lowest latency connection to East/Northeast India and ASEAN gateways",
            "policy": "West Bengal Silicon Valley Tech Hub incentives"
        }
    },
    {
        "site_id": "infovalley_bbsr",
        "site_name": "Info Valley & IDCO IT SEZ (Bhubaneswar)",
        "state": "Odisha",
        "district": "Khurda",
        "latitude": 20.2400,
        "longitude": 85.7500,
        "elevation_m": 45.0,
        "composite_score": 85.0,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "Low-Cost Clean Power & Disaster Resilient Siting",
            "Direct 220kV OPTCL Substation with high renewable hydro/thermal mix",
            "Lowest commercial electricity tariff in Eastern India (₹5.8/kWh)",
            "Odisha Data Centre Policy 2022: Capital subsidies & duty exemption"
        ],
        "why_better": {
            "power": "Highly reliable OPTCL grid with lowest industrial tariffs (₹5.8/kWh)",
            "water": "Mahanadi basin bulk water allocation for industrial campuses",
            "environment": "Notified IDCO industrial estate; safe 45m elevation above cyclone storm surges",
            "connectivity": "Dual fiber links to Chennai CLS and Kolkata national exchanges",
            "policy": "Odisha DC Policy: 20% capital subsidy + 10-year electricity duty waiver"
        }
    },
    {
        "site_id": "indore_crystal_it_park",
        "site_name": "Crystal IT Park & Super Corridor (Indore, MP)",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "latitude": 22.7500,
        "longitude": 75.8300,
        "elevation_m": 553.0,
        "composite_score": 85.4,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "Central India Low-Latency Sovereign Node (Equal RTT to North, West & South)",
            "Dual 220kV Substation with 100 MVA headroom (MPPTCL Grid)",
            "High Elevation (553m) with low humidity and zero flood risk",
            "Contiguous land banks with low acquisition costs (< ₹2.5 Cr/acre)"
        ],
        "why_better": {
            "power": "220kV MPPTCL substation fed by Rewa Solar & Western Grid",
            "water": "Narmada Phase-III treated municipal pipeline; 0 groundwater stress",
            "environment": "MPIDC notified tech corridor; zero forest impact (SBC > 220 kPa)",
            "connectivity": "Equidistant latency (< 15ms) to Mumbai, Delhi, and Hyderabad",
            "policy": "MP Industrial Promotion Policy: 40% capital investment subsidy"
        }
    },
    {
        "site_id": "kochi_infopark",
        "site_name": "Kochi Infopark Phase II (Kakkanad, Kerala)",
        "state": "Kerala",
        "district": "Ernakulam",
        "latitude": 10.0100,
        "longitude": 76.3600,
        "elevation_m": 25.0,
        "composite_score": 86.2,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "South-West Subsea Cable Terminal (Landing Station for SEA-ME-WE 3 & 4)",
            "Hydro-Dominant Clean Power Grid (KSEB) with low carbon intensity",
            "Direct international fiber routes to Middle East and Europe",
            "High-tech IT SEZ with dedicated 110kV/220kV substation"
        ],
        "why_better": {
            "power": "Clean hydro-electric power baseload from Idukki reservoir grid",
            "water": "Periyar river treated water with reliable year-round supply",
            "environment": "Notified Infopark IT campus; outside CRZ and forest buffers",
            "connectivity": "Ultra-low international latency to Dubai (< 28ms) via direct submarine cables",
            "policy": "Kerala IT Policy: Single-window clearance and stamp duty exemptions"
        }
    },
    {
        "site_id": "vizag_it_sez",
        "site_name": "Visakhapatnam IT SEZ (Madhurawada, AP)",
        "state": "Andhra Pradesh",
        "district": "Visakhapatnam",
        "latitude": 17.8100,
        "longitude": 83.3500,
        "elevation_m": 35.0,
        "composite_score": 85.6,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "Coastal East Gateway & Upcoming International Cable Landing Station",
            "220kV APTRANSCO Substation with 100 MVA spare capacity",
            "Andhra Pradesh Data Center Policy: Up to ₹100 Cr capital subsidies",
            "Elevated coastal terrace safe from storm surges and flood levels"
        ],
        "why_better": {
            "power": "220kV EHV substation; high solar and wind renewable portfolio",
            "water": "Godavari-Visakhapatnam bulk industrial pipeline",
            "environment": "APIIC designated IT layout; elevated terrace (> 35m ASL)",
            "connectivity": "Direct optical link along NH-16 connecting Chennai and Kolkata",
            "policy": "AP DC Policy: 100% stamp duty reimbursement & subsidized power"
        }
    },
    {
        "site_id": "jaipur_sitapura",
        "site_name": "Sitapura Industrial Area (Jaipur, Rajasthan)",
        "state": "Rajasthan",
        "district": "Jaipur",
        "latitude": 26.7800,
        "longitude": 75.8300,
        "elevation_m": 390.0,
        "composite_score": 83.5,
        "tier": "VIABLE / RECOMMENDED",
        "tier_badge": "VIABLE",
        "tier_color": "#10B981",
        "key_advantages": [
            "Abundant Solar Open Access (Bhadla & Thar Solar Corridors)",
            "Dual 220kV RRVPNL Substation with 85 MVA spare margin",
            "Low seismic risk (Zone II) with dry climate reducing humidity load",
            "Rajasthan Investment Promotion Scheme (RIPS): 75% Electricity Duty Waiver"
        ],
        "why_better": {
            "power": "Direct wheeling from Thar solar parks with lowest solar tariffs in India",
            "water": "Bisalpur dam treated surface water pipeline",
            "environment": "RIICO certified industrial park; zero forest clearance bottlenecks",
            "connectivity": "Direct expressway fiber to Delhi NCR (< 4ms RTT)",
            "policy": "RIPS 2022: Investment subsidy & 75% electricity duty exemption for 7 years"
        }
    }
]

def find_nearby_recommended_sites(
    current_lat: float,
    current_lon: float,
    current_score: float,
    is_vetoed: bool = False,
    current_state: Optional[str] = None,
    max_radius_km: float = 650.0,
    min_score_delta: float = 8.0,
) -> Tuple[Optional[RecommendedAlternative], List[RecommendedAlternative]]:
    """
    Scans verified sovereign AI clusters to identify the single best nearby alternative
    site and runner-up suggestions when the current candidate scores low or triggers a veto.
    
    Trigger rule:
      - Automatically triggers if current_score < 75.0 or is_vetoed is True.
      - Returns (best_alternative, nearby_alternatives).
      - If current site is already highly viable (>= 80.0) without vetoes, returns (None, []).
    """
    # If site is already highly viable and un-vetoed, no alternative recommendation is needed
    if current_score >= 80.0 and not is_vetoed:
        return None, []

    candidates = []

    for hub in VERIFIED_AI_HUBS_CATALOG:
        hub_lat = hub["latitude"]
        hub_lon = hub["longitude"]
        dist_km = haversine_distance_km(current_lat, current_lon, hub_lat, hub_lon)

        hub_score = hub["composite_score"]
        score_delta = hub_score - current_score

        # If not vetoed, ensure the alternative provides a meaningful feasibility improvement
        if not is_vetoed and score_delta < min_score_delta:
            continue

        # If site is vetoed, any viable hub (score >= 75) is a massive improvement
        if is_vetoed and hub_score < 75.0:
            continue

        # Utility Ranking Formula:
        # Heavily favors higher score and score delta; logarithmically penalizes distance.
        # Adds bonus if located within the same state (regulatory / single-window continuity).
        same_state_bonus = 0.30 if (current_state and current_state.lower() in hub["state"].lower()) else 0.0
        
        # Log distance penalty: 50km has small penalty, 500km has noticeable penalty
        dist_penalty = 0.40 * math.log(1.0 + (dist_km / 50.0))
        
        utility = (hub_score / 100.0) + (1.2 * max(0.0, score_delta / 100.0)) - dist_penalty + same_state_bonus

        candidates.append({
            "hub": hub,
            "dist_km": dist_km,
            "score_delta": score_delta,
            "utility": utility,
        })

    if not candidates:
        # Fallback: find the absolute closest viable hub in catalog regardless of distance
        for hub in VERIFIED_AI_HUBS_CATALOG:
            dist_km = haversine_distance_km(current_lat, current_lon, hub["latitude"], hub["longitude"])
            candidates.append({
                "hub": hub,
                "dist_km": dist_km,
                "score_delta": hub["composite_score"] - current_score,
                "utility": -dist_km,
            })

    # Sort candidates by utility descending (best first)
    candidates.sort(key=lambda x: x["utility"], reverse=True)

    recommended_list: List[RecommendedAlternative] = []

    for item in candidates[:3]: # Top 3 suggestions
        hub = item["hub"]
        dist_km = round(item["dist_km"], 1)
        score_delta = round(item["score_delta"], 1)

        rec = RecommendedAlternative(
            site_id=hub["site_id"],
            site_name=hub["site_name"],
            state=hub["state"],
            district=hub["district"],
            latitude=hub["latitude"],
            longitude=hub["longitude"],
            elevation_m=hub.get("elevation_m", 50.0),
            distance_km=dist_km,
            composite_score=hub["composite_score"],
            score_delta=score_delta,
            tier=hub["tier"],
            tier_badge=hub["tier_badge"],
            tier_color=hub["tier_color"],
            key_advantages=hub["key_advantages"],
            why_better=hub["why_better"],
        )
        recommended_list.append(rec)

    best_alternative = recommended_list[0] if recommended_list else None
    return best_alternative, recommended_list
