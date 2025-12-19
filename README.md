# Kerala LSG Election Portal

**Experimental**

A web portal to visualize Kerala LSG election data, including an interactive map, KPIs, and detailed information for local bodies.

## Features

- **Interactive Map**: Visualize Kerala's local bodies on a map.
- **KPI Dashboard**: View key statistics like number of Corporations, Municipalities, Panchayats, Voters, etc.
- **Search**: Search for specific local bodies.
- **Detail View**: Click on a local body to see detailed information and its specific map.
- **Filtering**: Filter local bodies by type (Corporation, Municipality, etc.) by clicking on KPI cards.
- **Assembly Constituency Mapping**: Ward-level data structure supports correlation with Kerala's 140 Assembly Constituencies.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Map**: React Leaflet, Leaflet
- **Data Parsing**: PapaParse (CSV), Native JSON (GeoJSON)

## Setup

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open http://localhost:5173 in your browser.

## Data Sources

- Source Data from SEC Kerala
- Source Data from OpenStreetMaps

## Documentation

- [Assembly Constituency Mapping](docs/ASSEMBLY_CONSTITUENCY_MAPPING.md) - Details on the ward-to-AC correlation feature
