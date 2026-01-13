# Assembly Constituency Mapping for LSG Wards

## Overview

This document describes the Assembly Constituency (AC) correlation feature added to the Kerala LSG Election Portal. Each ward in the LSG data can now be associated with its corresponding Kerala Legislative Assembly Constituency.

## Data Structure

### wards.csv

The `wards.csv` file has been updated with two new columns:

- **AC Code**: The unique code/number for the Assembly Constituency (e.g., "01", "02", ..., "140")
- **AC Name**: The name of the Assembly Constituency (e.g., "Kasaragod", "Manjeswaram", "Vattiyoorkavu")

### CSV Format

```csv
Local Body Code,Ward Code,Ward Name,Males,Females,Others,Total,AC Code,AC Name
B01001,B01001001,Puthankada,4266,4688,0,8954,01,Parassala
```

## Kerala Assembly Constituencies

Kerala has **140 Assembly Constituencies** distributed across 14 districts:

| District | Number of ACs |
|----------|---------------|
| Thiruvananthapuram | 14 |
| Kollam | 11 |
| Pathanamthitta | 5 |
| Alappuzha | 9 |
| Kottayam | 9 |
| Idukki | 5 |
| Ernakulam | 14 |
| Thrissur | 13 |
| Palakkad | 11 |
| Malappuram | 16 |
| Kozhikode | 13 |
| Wayanad | 3 |
| Kannur | 11 |
| Kasaragod | 6 |

## Data Sources

To populate the AC mapping data, you can use:

1. **OpenStreetMap**: [Assembly Constituency (Kerala)](https://wiki.openstreetmap.org/wiki/Assembly_Constituency_(Kerala))
2. **Kerala State Election Commission**: Official ward-to-AC mapping data
3. **Overpass Turbo**: Query OSM data for Kerala assembly constituency boundaries
4. **Kerala Government Open Data Portal**: Official administrative boundary data

## TypeScript Interface

The `Ward` interface in `src/services/dataService.ts` has been updated:

```typescript
export interface Ward {
    ward_code: string;
    ward_name_english: string;
    ward_no: number;
    lb_code: string;
    total_voters: number;
    male_voters: number;
    female_voters: number;
    other_voters: number;
    assembly_constituency_code?: string;  // NEW
    assembly_constituency_name?: string;  // NEW
}
```

## Populating the Data

To populate the AC data:

1. Obtain the official ward-to-AC mapping from Kerala SEC or OSM
2. Update the `wards.csv` file with the appropriate AC Code and AC Name for each ward
3. The data will automatically be parsed by the `fetchWards()` function in `dataService.ts`

### Using the Populate Script

A Python script is provided at `scripts/populate_ac_data.py` to help populate AC data:

```bash
# Create a sample mapping template
python3 scripts/populate_ac_data.py --create-sample

# Populate AC data using your mapping file
python3 scripts/populate_ac_data.py \
    --input public/data/csv/wards.csv \
    --mapping your_ac_mapping.json \
    --output public/data/csv/wards_with_ac.csv
```

### Mapping File Format

The mapping file should be a JSON file with ward codes as keys:

```json
{
  "B01001001": {"code": "01", "name": "Parassala"},
  "B01001002": {"code": "01", "name": "Parassala"},
  "G01001001": {"code": "01", "name": "Parassala"}
}
```

### Manual Update Example

```python
import csv

# Example mapping data (this should come from official sources)
ward_ac_mapping = {
    'B01001001': {'code': '01', 'name': 'Parassala'},
    'B01001002': {'code': '01', 'name': 'Parassala'},
    # ... more mappings
}

# Update wards.csv
input_file = 'public/data/csv/wards.csv'
output_file = 'public/data/csv/wards_updated.csv'

with open(input_file, 'r', encoding='utf-8') as infile, \
     open(output_file, 'w', encoding='utf-8', newline='') as outfile:
    
    reader = csv.DictReader(infile)
    writer = csv.DictWriter(outfile, fieldnames=reader.fieldnames)
    writer.writeheader()
    
    for row in reader:
        ward_code = row['Ward Code']
        if ward_code in ward_ac_mapping:
            row['AC Code'] = ward_ac_mapping[ward_code]['code']
            row['AC Name'] = ward_ac_mapping[ward_code]['name']
        writer.writerow(row)
```

## Usage in Application

Once populated, the AC data can be used to:

- Filter wards by Assembly Constituency
- Display AC information in ward detail views
- Aggregate statistics by Assembly Constituency
- Create AC-level visualizations and maps

## Notes

- The AC fields are optional (nullable) to maintain backward compatibility
- Empty AC fields will be parsed as `undefined` in the application
- Multiple wards from the same LSG may belong to different ACs (as AC boundaries can cross LSG boundaries)
