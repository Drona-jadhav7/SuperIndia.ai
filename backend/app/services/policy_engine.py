"""
Government Policy & State AI/Data Center Incentives Intelligence for SuperIndia.ai
Catalogs state-wise data center policies, capital subsidies, stamp duty waivers,
power tariff rebates, and Green Energy Open Access provisions across India.
"""

from typing import List, Dict, Any
from pydantic import BaseModel, Field

STATE_POLICIES_DATABASE = [
    {
        "state": "Uttar Pradesh",
        "policy_name": "Uttar Pradesh Data Centre Policy 2021",
        "valid_until": "2026",
        "target_capacity_mw": 900.0,
        "capital_subsidy": "Up to 25% on capital investment (max ₹10 Cr for DC parks)",
        "stamp_duty_exemption": "100% exemption on purchase or lease of land",
        "electricity_duty": "100% exemption on electricity duty for 10 years",
        "dual_power_grid_mandate": "Direct dual-feed supply from two independent 220kV/132kV UPPTCL substations",
        "water_concessions": "Priority industrial water allocation with 25% subsidy on Effluent Treatment Plants (ETP)",
        "green_energy_incentive": "Permission for captive solar plants with zero transmission/wheeling charges within state",
        "key_clusters": ["Greater Noida Knowledge Park V", "Yamuna Expressway Sector 28", "Noida Sector 132"],
        "policy_score": 92.0,
    },
    {
        "state": "Gujarat",
        "policy_name": "Gujarat IT/ITeS Policy (2022-27) & Dholera SIR Special Regime",
        "valid_until": "2027",
        "target_capacity_mw": 1200.0,
        "capital_subsidy": "Up to 25% of Eligible Capital Expenditure (CapEx) up to ₹200 Cr for mega projects",
        "stamp_duty_exemption": "100% reimbursement of stamp duty and registration fees",
        "electricity_duty": "100% electricity duty waiver for 5 years; power tariff subsidy of ₹1/unit for 5 years",
        "dual_power_grid_mandate": "Single window clearance for 400kV dedicated GIS bays in Dholera SIR",
        "water_concessions": "Dedicated industrial water trunk line from Narmada canal at ₹18/kL subsidized rate",
        "green_energy_incentive": "Direct uncurtailed Green Energy Open Access from Khavda & Charanka Solar Parks",
        "key_clusters": ["Dholera Special Investment Region (SIR)", "GIFT City Gandhinagar", "Sanand"],
        "policy_score": 95.0,
    },
    {
        "state": "Maharashtra",
        "policy_name": "Maharashtra Integrated Data Centre Policy & IT/ITeS Policy",
        "valid_until": "2028",
        "target_capacity_mw": 1500.0,
        "capital_subsidy": "Additional FSI up to 100% beyond permissible limits; power tariff rebate of ₹1/unit for 3 years",
        "stamp_duty_exemption": "100% stamp duty exemption in Tier-II/III areas, 75% in Mumbai Metropolitan Region (MMR)",
        "electricity_duty": "Exemption from payment of electricity duty for a period of 10-15 years",
        "dual_power_grid_mandate": "MSEDCL + Tata Power dual-grid feeder connectivity permitted",
        "water_concessions": "MIDC priority supply from Barvi and Morbe reservoirs",
        "green_energy_incentive": "Exemption from cross-subsidy surcharge (CSS) for open access renewable energy",
        "key_clusters": ["Navi Mumbai (Airoli / Mahape / TTC)", "Panvel", "Pune Hinjewadi & Chakan"],
        "policy_score": 88.0,
    },
    {
        "state": "Telangana",
        "policy_name": "Telangana Data Centre Policy & AI City Framework",
        "valid_until": "2027",
        "target_capacity_mw": 800.0,
        "capital_subsidy": "Reimbursement of 20% of investment on computing hardware up to ₹10 Cr",
        "stamp_duty_exemption": "100% reimbursement of stamp duty, transfer duty, and registration charges",
        "electricity_duty": "Power supplied at industrial tariffs with 10-year electricity duty waiver",
        "dual_power_grid_mandate": "TSSPDCL dedicated express feeder lines from 400kV sub-stations",
        "water_concessions": "Industrial water supply guaranteed from Godavari & Krishna drinking water projects",
        "green_energy_incentive": "Discount on wheeling and transmission charges for intra-state solar/wind",
        "key_clusters": ["Fab City / Shamshabad", "Gachibowli / HITEC City", "Mucherla AI City"],
        "policy_score": 91.0,
    },
    {
        "state": "Tamil Nadu",
        "policy_name": "Tamil Nadu Data Centre Policy 2021",
        "valid_until": "2026",
        "target_capacity_mw": 1000.0,
        "capital_subsidy": "Structural capital subsidy of up to ₹15 Cr in 'A' districts, up to ₹25 Cr in 'B' districts",
        "stamp_duty_exemption": "50% to 100% concession on stamp duty for land purchased from SIPCOT",
        "electricity_duty": "100% electricity duty exemption for 5 years on purchased power",
        "dual_power_grid_mandate": "TANGEDCO dual power feeds from two independent 230kV substations",
        "water_concessions": "Dual water supply with mandatory on-site STP and CMWSSB tertiary treated water",
        "green_energy_incentive": "No banking charges for renewable energy fed into the state grid for 2 years",
        "key_clusters": ["Siruseri SIPCOT (OMR Corridor)", "Ambattur Industrial Estate", "Oragadam"],
        "policy_score": 89.0,
    },
    {
        "state": "Karnataka",
        "policy_name": "Karnataka Data Centre Policy (2022-2027)",
        "valid_until": "2027",
        "target_capacity_mw": 750.0,
        "capital_subsidy": "Capital subsidy of 7% on fixed assets (excluding land and buildings) up to ₹10 Cr",
        "stamp_duty_exemption": "100% reimbursement of stamp duty on land lease or purchase outside BBMP area",
        "electricity_duty": "100% exemption from electricity duty for 5 years outside Bengaluru Urban",
        "dual_power_grid_mandate": "BESCOM dual 66kV/220kV feeder connectivity with dedicated bays",
        "water_concessions": "BWSSB and KIADB industrial water quota with mandatory dual plumbing",
        "green_energy_incentive": "Open access renewable energy permissions facilitated through KREDL single window",
        "key_clusters": ["KIADB Aerospace Park (Devanahalli)", "Whitefield", "Davanagere / Hubballi"],
        "policy_score": 85.0,
    },
]

INDIA_AI_MISSION = {
    "program_name": "National IndiaAI Mission (Cabinet Approved)",
    "budget_outlay_inr_cr": 10372.0,
    "target_sovereign_gpus": 10000,
    "pillars": [
        "IndiaAI Compute Capacity: Public-Private Partnership (PPP) GPU supercomputing access",
        "IndiaAI Innovation Centre: Development and deployment of indigenous foundation models",
        "IndiaAI Datasets Platform: Unified access to non-personal governance and research datasets",
        "IndiaAI Application Development Initiative: Sectoral AI solutions in healthcare, agriculture, and governance",
        "IndiaAI FutureSkills: AI engineering curriculum expansion across universities and polytechnics",
        "IndiaAI Startup Financing: Direct compute vouchers providing up to 50% GPU cost subsidy for Indian startups",
        "Safe & Trusted AI: Native bias testing, watermarking, and security red-teaming",
    ],
}

def get_all_state_policies() -> List[Dict[str, Any]]:
    return STATE_POLICIES_DATABASE

def get_india_ai_mission_summary() -> Dict[str, Any]:
    return INDIA_AI_MISSION
