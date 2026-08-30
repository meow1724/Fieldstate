## Inspiration

Agriculture consumes **70% of the world's accessible freshwater**, yet up to **40% of irrigation water is wasted** due to fixed calendar scheduling, imprecise estimates, and dashboard fatigue. Existing agricultural technology floods farmers with dense telemetry - satellite reflectance layers, soil sensor graphs, and multi-model meteorological charts - forcing them to interpret raw data rather than taking clear action.

We were inspired to build **Fieldstate** by asking a simple question: What if instead of giving farmers 20 charts they don’t have time to analyze, we gave them a single, scientifically rigorous decision every morning: **WAIT**, **IRRIGATE**, or **INSPECT**?

By grounding live satellite remote sensing and numerical weather prediction in real agronomic physics (UN FAO-56 Penman-Monteith) and linking every millimeter of conserved water to direct diesel/electricity savings and verified carbon offsets, Fieldstate turns precision water management into a straightforward, high-ROI daily habit.

---

## What it does

Fieldstate is a 100% live precision agriculture decision engine that synthesizes live GPS location telemetry, real-time global weather radar, Sentinel-2 multispectral dynamics, and soil physics into an unambiguous daily operational command.

### Core Capabilities & Features:

1. **One-Click Live GPS Field Acquisition & Global Search:**
   - Detects the farmer's physical GPS coordinates via device browser geolocation (`navigator.geolocation`) or allows global search across any parcel on Earth.
   - Instantly estimates local USDA Hardiness Zones and connects to live satellite weather feeds for those exact coordinates in real-time.

2. **The Single Daily Action Engine (`/today`):**
   - Evaluates real-time field state and outputs one high-conviction command:
     - **WAIT:** Rain is imminent or the soil moisture buffer is sufficient; prevents over-irrigation, fertilizer leaching, and wasted pumping fuel.
     - **IRRIGATE:** Root-zone depletion has exceeded the crop's Managed Depletion Fraction (\\(p = 0.55\\)), prescribing the exact replenishment depth (\\(mm\\)).
     - **INSPECT:** Canopy vigor has deviated from the biological baseline, prompting a physical ground check.
   - Summarizes the decision with a triad of core signals: Crop Water Demand (\\(ET_c\\)), 24h Radar Precipitation Probability, and Available Root-Zone Water Capacity (\\(AWC\\)).

3. **Deterministic FAO-56 Agronomic Physics Engine:**
   - Calculates daily reference evapotranspiration (\\(ET_0\\)) in real-time from live solar irradiance, temperature, humidity, and wind vectors using the **FAO-56 Penman-Monteith equation**:
     $$ET_0 = \frac{0.408 \Delta (R_n - G) + \gamma \frac{900}{T + 273} u_2 (e_s - e_a)}{\Delta + \gamma (1 + 0.34 u_2)}$$
   - Derives actual crop water consumption (ET<sub>c</sub>) using dynamic crop growth stage coefficients (K<sub>c</sub>):
     $$ET_c = K_c \times ET_0$$
   - Executes a daily 24-hour root-zone water balance:
     $$S_t = S_{t-1} + R_{\text{eff}} + I - ET_c - RO - DP$$

4. **Sentinel-2 Multispectral Crop Health & Dynamic NDVI Engine (`/crop-health`):**
   - Computes continuous **Normalized Difference Vegetation Index (NDVI)** trajectories based on European Space Agency (ESA) Sentinel-2 optical bands (B4 Red @ 665nm and B8 Near-Infrared @ 842nm):
     $$\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$$
   - Continuously models crop phenological growth curves from the sowing date, dynamically factoring in live soil moisture and thermal stress responses.
   - **Atmospheric Cloud-Interference Protocol:** When optical passes are obscured (>65% cloud cover), Fieldstate transparently downgrades decision confidence and flags data provenance rather than hallucinating vegetation metrics.

5. **Resource Economics & Carbon Offset Calculator (`/economics`):**
   - Translates agronomic water savings directly into financial and climate impact:
     - **Volumetric Water Conserved (m<sup>3</sup>):** $$\text{Depth Saved (mm)} \times \text{Area (ha)} \times 10$$
     - **Pumping Energy Saved (kWh / Diesel Liters):** Evaluates total dynamic head (\\(m\\)), pump efficiency (\\(\eta \approx 65\%\\)), and energy density.
     - **Financial Cost Savings ($):** Computes diesel fuel and electrical grid utility savings based on real-time tariffs.
     - **Avoided Scope 1 & 2 Emissions (\\(kg\text{ }CO_2e\\)):** Standardized GHG accounting for avoided pumping combustion and grid consumption.

6. **Explainable AI Agronomist & Ground Scout Dispatch:**
   - Powered by Gemini with resilient multi-model fallbacks (`gemini-3.7-flash`, `gemini-2.5-flash`, `gemini-3.1-flash-lite`) and grounded in FAO-56 guidelines.
   - Farmers can ask natural language questions (e.g., *"Why shouldn't I irrigate today?"*, *"What happens if I pump anyway?"*) and receive concise, evidence-based agronomic rationale.
   - Generates and dispatches physical scout work orders with GPS coordinates when canopy vigor anomalies are detected.

---

## How we built it

- **Live Telemetry Layer:** High-resolution global Numerical Weather Prediction (NWP) feeds via the Open-Meteo REST API, delivering live hourly solar irradiance (\\(W/m^2\\)), 2m temperature (\\(^\circ C\\)), dew point, wind speed (\\(m/s\\)), and rain radar.
- **Frontend & Cartography:** React 18 with TypeScript, Vite, Tailwind CSS, Leaflet, and OpenStreetMap rendering interactive field parcel geometries, GPS pins, and multispectral color ramps.
- **Deterministic Math Engine:** Pure TypeScript implementation of the FAO-56 Penman-Monteith physical equations and soil-water depletion balance.
- **Backend & AI Architecture:** Node.js/Express REST endpoints (`/api/gemini/*`) integrating the Google Gen AI SDK (`@google/genai`) with deterministic temperature clamps and automated fallback trees.

---

## Challenges we ran into

1. **Eliminating Mock Data for Pure Live Execution:** Integrating live browser GPS detection and global numerical weather radar so that judges anywhere in the world get real-time meteorological calculations for their exact coordinates.
2. **Bridging Pure AI and Deterministic Agronomy:** Large Language Models are prone to hallucinating numerical values. We solved this by strictly calculating all evapotranspiration, soil moisture, and pumping economics via deterministic FAO-56 mathematical formulas in TypeScript, using Gemini strictly for contextual translation, synthesis, and natural language communication.
3. **Handling Cloud Gaps in Optical Satellites:** Optical satellites like Sentinel-2 cannot penetrate dense clouds. Rather than interpolating fake greenness, we engineered a dedicated cloud-masking protocol that lowers model confidence and flags the provenance ledger.

---

## Accomplishments that we're proud of

- **100% Live Data Pipeline:** Successfully built a system where any user can click "Use My Live GPS" and get instant FAO-56 physics calculations for their exact coordinate location.
- **Zero-Ambiguity UX:** Distilled millions of satellite pixels and meteorological vectors into one clear command that any farmer can act on in 3 seconds.
- **Scientific Integrity:** Implemented the full FAO-56 Penman-Monteith thermodynamic equation and water-balance modeling without taking scientific shortcuts.
- **Tangible ROI Connection:** Successfully linked sustainable water conservation to tangible dollar savings and carbon offsets, making environmental stewardship immediately profitable.

---

## What we learned

- **Less is More in Agriculture:** Farmers do not want complex dashboards with 50 telemetry toggles; they need trusted, defensible recommendations with clear explanations of *why*.
- **The Power of Provenance:** Clear data categorization (Measured vs. Calculated vs. Predicted vs. Estimated) builds long-term user trust and transparency.

---

## What's next for Fieldstate

- **IoT Pump Actuation & Smart Relays:** Integrating direct telemetry with smart irrigation solenoids and IoT relays (e.g., LoRaWAN / Shelly / Sonoff) for automated execution of the daily decision.
- **Offline SMS / WhatsApp Dispatch:** Implementing automated lightweight SMS and WhatsApp bots to deliver the daily single action to smallholder farmers with low smartphone connectivity.
- **Synthetic Aperture Radar (SAR / Sentinel-1):** Fusing cloud-penetrating radar backscatter data to track surface soil moisture continuously, even during monsoon seasons.
