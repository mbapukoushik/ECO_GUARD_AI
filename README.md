# ECO GUARD AI - Industrial Safety Monitoring System

## Project Summary

ECO GUARD AI is a real-time Industrial IoT monitoring system designed to prevent catastrophic chemical facility incidents through early detection, predictive analytics, and human-in-the-loop safety protocols. The system addresses critical environmental challenges by preventing industrial disasters that cause massive environmental damage, soil contamination, and healthcare costs.

**Environmental Problem**: Chemical facility accidents like the 1984 Bhopal disaster and 2020 Vizag styrene leak cause billions in environmental remediation costs, soil contamination, and long-term health impacts. Traditional monitoring systems lack real-time predictive capabilities and fail to integrate human decision-making with automated safety protocols.

**Our Solution**: ECO GUARD AI provides a comprehensive digital twin of industrial facilities with:
- **Real-time sensor monitoring** (Temperature, Pressure, Inhibitor Levels) with physics-based predictive models
- **Early warning system** that detects thermal runaway and inhibitor depletion before critical thresholds
- **Environmental Damage Prevented (EDP) calculator** that quantifies prevented disasters ($12.16M+ for Vizag-scale incidents)
- **Human-in-the-loop authorization** ensuring compliance with ISO 10218 and OSHA PSM 2025 standards
- **Worker safety tracking** with proximity alerts and evacuation protocols
- **Historical trend visualization** showing the "hockey stick" curve of runaway incidents

**Target Users**: Industrial safety managers, facility operators, and environmental compliance officers at chemical processing plants.

**Anticipated Impact**: By preventing a single Vizag-scale incident, the system saves an estimated $12.16M in environmental remediation, prevents soil contamination affecting thousands of hectares, and eliminates healthcare costs for affected communities. The system's early detection capabilities can prevent disasters before they escalate, protecting both human lives and the environment.

---

## Tech Stack

### Core Technologies
- **React 19.2.0** - Frontend framework
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.2.4** - Build tool and dev server

### UI & Styling
- **TailwindCSS 4.1.18** - Utility-first CSS framework (dark industrial theme)
- **Lucide-React 0.562.0** - Icon library

### Data Visualization
- **Recharts 3.6.0** - Historical trend charts and data visualization

### Architecture
- **React Context API** - Single-file state management (`SafetyContext.jsx`)
- **React Hooks** - `useReducer`, `useEffect` for state and side effects
- **SVG** - Custom Digital Twin map with dynamic visualizations

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Data Sources
- **Simulated Sensor Data** - Physics-based models for Bhopal thermal runaway and Vizag inhibitor depletion
- **No External APIs** - All data is generated using mathematical models based on real-world incident data

---

## Setup Instructions

### Prerequisites
- **Node.js**: Version 18.0.0 or higher (check with `node --version`)
- **npm**: Version 9.0.0 or higher (check with `npm --version`)
- **Modern web browser**: Chrome, Firefox, Edge, Safari (latest versions recommended)
- **Git**: For cloning the repository (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ECO_GUARD_AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - The app will be available at `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

---

## User Guide

### Main Dashboard Features

#### 1. **Live Sensor Gauges**
- **Temperature Gauge**: Monitors tank temperature (°C)
  - Normal: 15-25°C (Green)
  - Warning: >25°C (Yellow)
  - Critical: >35°C (Red)
- **Pressure Gauge**: Monitors tank pressure (psi)
  - Normal: 2-25 psi (Green)
  - Warning: >25 psi (Yellow)
  - Critical: >55 psi (Red)
- **Inhibitor Level**: Tracks TBC (tert-butylcatechol) concentration (ppm)
  - Normal: 100-500 ppm (Green)
  - Alert: <50 ppm (Red)

#### 2. **Digital Twin Map**
- Visual representation of the EcoGuard Hub facility
- Three zones: Unit 610 (Zone A), Unit M6 (Zone B), Reactor Bay C (Zone C)
- **Dynamic State Visualization**:
  - Green: Normal operations
  - Yellow: Warning state
  - Red: Critical state (pulsing glow)
- **Evacuation Arrows**: Appear automatically during CRITICAL state, pointing to Safe Assembly Point
- **Worker Icons**: Show worker locations and safety status
  - Blue: Normal
  - Red: In danger zone (flashing SOS)
  - Green: Safe

#### 3. **Historical Trend Chart**
- Displays last 5 minutes of Pressure and Inhibitor Level data
- Shows the "hockey stick" curve when incidents escalate
- Updates in real-time

#### 4. **Scenario Simulations**
Select from dropdown:
- **Normal Ops**: Steady baseline sensor readings
- **Bhopal E610**: Simulates thermal runaway (pressure rises to 55+ psi)
- **Vizag M6**: Simulates inhibitor depletion (TBC drops, temperature rises)

Click **"Start Scenario"** to begin simulation.

#### 5. **Safety Consultant Panel (Human-in-the-Loop)**
- Appears automatically when system enters CRITICAL state
- **Recommended Actions**: Rule-based safety protocols based on sensor values
- **Field Instructions**: Specific evacuation commands for workers in each zone
- **AUTHORIZE & RESOLVE INCIDENT Button**: 
  - Stops simulation immediately
  - Resets all sensors to baseline
  - Marks all workers as safe
  - Adds resolution log entry
  - Updates EDP total

#### 6. **Worker Safety Tracking**
- Lists all 10 workers across three zones
- Shows workers in danger zones during CRITICAL state
- Individual "Mark Safe" buttons for manual tracking
- Counter showing "Workers in danger zone: X / 10"

#### 7. **Environmental Damage Prevented (EDP) Ticker**
- Header displays total EDP value
- Updates when incidents are resolved
- Based on formula: `EDP = Volume × Persistence × RemediationCost`
- Current baseline: $12.16M (prevented Vizag-scale incident)

#### 8. **Resolution Log**
- Shows successful incident resolutions
- Displays timestamp, action taken, and EDP impact
- Appears in Safety Consultant panel after authorization

### Demo Workflow

**Recommended Demo Flow (2-5 minutes):**

1. **Start**: Show Normal Ops state (green map, stable sensors)
2. **Trigger Scenario**: Select "Vizag M6" from dropdown, click "Start Scenario"
3. **Watch Escalation**: 
   - Inhibitor level drops below 50 ppm
   - Temperature rises above 35°C
   - Map turns RED
   - Evacuation arrows appear
   - Workers flash SOS
4. **Human Intervention**: Click "AUTHORIZE & RESOLVE INCIDENT"
5. **Resolution**: 
   - Sensors reset to baseline
   - Map returns to green
   - Workers turn green
   - Resolution log appears
   - EDP increases

---

## Assumptions & Limitations

### Assumptions
1. **Sensor Data**: All sensor readings are simulated using physics-based models. In production, this would connect to real IoT sensors.
2. **Worker Locations**: Worker positions are static for demo purposes. Real implementation would use RFID, GPS, or indoor positioning systems.
3. **EDP Calculation**: Based on historical incident data (Bhopal 1984, Vizag 2020). Actual EDP varies by facility size and incident type.
4. **Safety Protocols**: Recommendations are rule-based (not AI/ML). Real systems may use more complex decision trees.
5. **Network Latency**: Assumes real-time data transmission with no delay. Production systems must account for network latency.
6. **Single Facility**: Current implementation monitors one facility. Multi-facility monitoring would require architectural changes.

### Limitations
1. **No Real Hardware Integration**: Sensors are simulated. Production deployment requires IoT sensor integration.
2. **No Database Persistence**: Historical data is stored in memory. Production needs database for long-term storage.
3. **No Authentication**: Demo version has no user authentication. Production requires role-based access control.
4. **No Mobile App**: Web-only interface. Mobile app would improve remote monitoring capabilities.
5. **Limited Scenarios**: Only two incident scenarios (Bhopal, Vizag). Real systems must handle diverse incident types.
6. **No External APIs**: No integration with weather services, emergency services, or external data sources.
7. **Browser Compatibility**: Optimized for modern browsers. Older browsers may have limited functionality.

### Future Enhancements
- Real-time IoT sensor integration
- Multi-facility monitoring dashboard
- Mobile app for remote access
- Integration with weather APIs for wind direction
- Database persistence for historical data
- User authentication and role-based access
- Advanced analytics and predictive models
- Integration with emergency response systems

---

## Project Structure

```
ECO_GUARD_AI/
├── src/
│   ├── components/
│   │   └── MainDashboard.jsx          # Main UI component
│   ├── context/
│   │   └── SafetyContext.jsx          # Single-file state management
│   ├── App.tsx                        # Root component
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Global styles
├── public/                            # Static assets
├── package.json                       # Dependencies
├── vite.config.ts                     # Vite configuration
├── tailwind.config.js                 # TailwindCSS configuration
└── README.md                          # This file
```

---

## Compliance & Standards

ECO GUARD AI adheres to:
- **ISO 10218**: Human-in-the-loop AI requirements for industrial safety
- **OSHA PSM 2025**: Process Safety Management standards
- **Environmental Protection**: Aligns with EPA guidelines for chemical facility safety

---

## License

This project is created for educational and hackathon purposes.

---

## Contact & Support

For questions or issues, please refer to the project repository or contact the development team.

---

## Acknowledgments

- Physics models based on real-world incident data (Bhopal 1984, Vizag 2020)
- Design inspired by industrial SCADA systems and digital twin technologies
- Built for Green Tech Hackathon 2025
