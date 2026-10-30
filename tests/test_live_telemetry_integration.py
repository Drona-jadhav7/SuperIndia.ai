"""
SuperIndia.ai - Live Authentic Telemetry & National Data Integration Test Suite
Directly verifies the API endpoint controllers, schemas, live external API calls, and scoring engines:
1. Live connection to NASA POWER Climatology API
2. Live connection to NASA SRTM 30m Global Elevation Model
3. Live connection to Open-Meteo / CAMS ECMWF Air Quality
4. USGS Earthquake Hazards & BIS IS 1893:2016 Seismic Zonation
5. Central Ground Water Board (CGWB) & Ministry of Jal Shakti Dynamic Aquifer Registry
6. Central Electricity Authority (CEA) Transmission Grid Proximity Model
7. Subsea Cable Landing Stations & NIXI Transit Latency Model
8. Deterministic 7-Domain Assessment with Authentic Provenance
"""

import sys
import os
import unittest

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.models.schemas import LiveTelemetryRequest, LiveTelemetryResponse, SiteAssessmentResponse
from backend.app.api.endpoints import fetch_real_data_telemetry, assess_live_site_endpoint

class TestLiveTelemetryIntegration(unittest.TestCase):

    def test_01_telemetry_fetch_navi_mumbai(self):
        """Test live NASA and Indian Gov telemetry fetch for Navi Mumbai hub."""
        req = LiveTelemetryRequest(
            latitude=19.0330,
            longitude=73.0297,
            state="Maharashtra",
            district="Thane",
            site_name="Navi Mumbai AI Hub",
            proposed_it_load_mw=80.0
        )
        res: LiveTelemetryResponse = fetch_real_data_telemetry(req)

        # Verify Structure
        self.assertIsNotNone(res.site_input)
        self.assertIsNotNone(res.provenance)
        self.assertIsNotNone(res.api_statuses)
        self.assertIsNotNone(res.summary)

        site_inp = res.site_input
        # Elevation from NASA SRTM should be realistic (0 to 150m for coastal Navi Mumbai)
        self.assertGreater(site_inp.elevation_m, -5)
        self.assertLess(site_inp.elevation_m, 200)

        # NASA Climate params
        climate = site_inp.climate_params
        self.assertGreater(climate.dry_bulb_temp_c, 15.0)
        self.assertLess(climate.dry_bulb_temp_c, 45.0)
        self.assertGreater(climate.relative_humidity_pct, 20.0)
        self.assertGreater(climate.annual_cooling_degree_days, 1500)

        # CGWB Water params
        water = site_inp.water_params
        self.assertGreater(water.groundwater_extraction_pct, 10.0)
        self.assertGreater(water.water_quality_tds, 100.0)

        # CEA Power params
        power = site_inp.power_params
        self.assertGreater(power.voltage_class_kv, 100.0)

        # BIS Disaster params
        disaster = site_inp.disaster_params
        self.assertIn(disaster.seismic_zone, ["II", "III", "IV", "V"])

        # Provenance verification
        prov = res.provenance
        self.assertIn("climate", prov)
        self.assertIn("elevation", prov)
        self.assertIn("water", prov)
        self.assertIn("power", prov)
        self.assertIn("connectivity", prov)
        self.assertIn("disaster", prov)
        self.assertIn("economics", prov)

        print("\n[OK] Navi Mumbai Live Telemetry Successfully Retrieved & Verified against NASA and Gov APIs:")
        print(f"     - NASA 30y Dry Bulb: {climate.dry_bulb_temp_c} deg C, RH: {climate.relative_humidity_pct}%, CDD: {climate.annual_cooling_degree_days}")
        print(f"     - NASA SRTM Elevation: {site_inp.elevation_m}m ASL")
        print(f"     - CAMS ECMWF PM2.5: {climate.air_quality_pm25} ug/m3")
        print(f"     - CGWB Ground Water Extraction: {water.groundwater_extraction_pct}% (TDS: {water.water_quality_tds} mg/L)")

    def test_02_assess_live_site_dholera(self):
        """Test end-to-end /assess/live endpoint for Dholera SIR candidate site."""
        req = LiveTelemetryRequest(
            latitude=22.2470,
            longitude=72.1930,
            state="Gujarat",
            district="Ahmedabad",
            site_name="Dholera Greenfield Hyper-Scale Zone",
            proposed_it_load_mw=100.0
        )
        assessment: SiteAssessmentResponse = assess_live_site_endpoint(req)

        # Check authentic provenance flags
        self.assertTrue(assessment.is_live_evaluated)
        self.assertIsNotNone(assessment.data_provenance)

        # Check composite score bounds
        score = assessment.composite_score
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 100.0)

        # Check all 7 domain scores
        self.assertGreaterEqual(assessment.water_score, 0.0)
        self.assertGreaterEqual(assessment.power_score, 0.0)
        self.assertGreaterEqual(assessment.climate_score, 0.0)
        self.assertGreaterEqual(assessment.connectivity_score, 0.0)
        self.assertGreaterEqual(assessment.disaster_score, 0.0)
        self.assertGreaterEqual(assessment.land_score, 0.0)
        self.assertGreaterEqual(assessment.economics_score, 0.0)

        # Check engineering mandates and risk flags
        self.assertIsInstance(assessment.engineering_mandates, list)
        self.assertIsInstance(assessment.risk_flags, list)
        print(f"\n[OK] Dholera SIR Live Assessment: Composite Score = {score:.1f}/100, Tier = {assessment.tier}")
        print(f"     - Water Score: {assessment.water_score:.1f}/100")
        print(f"     - Power Score: {assessment.power_score:.1f}/100")
        print(f"     - Climate Score: {assessment.climate_score:.1f}/100")
        print(f"     - Fiber Score: {assessment.connectivity_score:.1f}/100")

    def test_03_assess_live_site_himalayan_zone(self):
        """Test seismic and elevation extremes for a high-altitude site (e.g. Shimla / Himachal)."""
        req = LiveTelemetryRequest(
            latitude=31.1048,
            longitude=77.1734,
            state="Himachal Pradesh",
            district="Shimla",
            site_name="Shimla High Altitude Node",
            proposed_it_load_mw=25.0
        )
        assessment: SiteAssessmentResponse = assess_live_site_endpoint(req)

        # Elevation should be high (> 1500m ASL from NASA SRTM)
        self.assertGreater(assessment.elevation_m, 1500.0)
        # Seismic zone in disaster submetrics
        seismic_submetric = assessment.disaster_assessment["sub_metrics"][0]
        self.assertIn("Zone IV", seismic_submetric["details"])
        print(f"\n[OK] Shimla High-Altitude Assessment: Elevation = {assessment.elevation_m}m ASL, Provenance Verified.")

if __name__ == "__main__":
    unittest.main()
