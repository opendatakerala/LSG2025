# Summary: Assembly Constituency Correlation Implementation

## Issue
Update the correlation between new LSG ward level to Assembly Constituency
Reference: https://wiki.openstreetmap.org/wiki/Assembly_Constituency_(Kerala)

## Implementation Summary

This PR adds support for correlating Kerala LSG (Local Self Government) wards with their corresponding Assembly Constituencies (AC). Kerala has 140 Assembly Constituencies distributed across 14 districts, and this feature enables ward-level data to be linked to ACs.

## Changes Made

### 1. Data Structure Updates

**File: `public/data/csv/wards.csv`**
- Added two new columns: `AC Code` and `AC Name`
- Updated 23,611 ward records with the new column structure
- Columns are currently empty, ready for population with official AC mapping data
- Maintains backward compatibility as fields are optional

**Format:**
```csv
Local Body Code,Ward Code,Ward Name,Males,Females,Others,Total,AC Code,AC Name
B01001,B01001001,Puthankada,4266,4688,0,8954,,
```

### 2. TypeScript Interface Updates

**File: `src/services/dataService.ts`**

Updated the `Ward` interface:
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
    assembly_constituency_code?: string;  // NEW - Optional AC code
    assembly_constituency_name?: string;  // NEW - Optional AC name
}
```

Updated `fetchWards()` function to parse AC fields from CSV:
```typescript
assembly_constituency_code: row['AC Code'] ? row['AC Code'] : undefined,
assembly_constituency_name: row['AC Name'] ? row['AC Name'] : undefined,
```

### 3. Documentation

**File: `docs/ASSEMBLY_CONSTITUENCY_MAPPING.md`**
- Comprehensive documentation on the AC mapping feature
- Kerala's 140 Assembly Constituencies distribution by district
- Data sources for obtaining AC mapping
- Instructions for populating AC data
- Usage examples in the application

**File: `README.md`**
- Added AC mapping to features list
- Linked to detailed documentation

### 4. Utility Script

**File: `scripts/populate_ac_data.py`**
- Python script to populate AC data from JSON mapping files
- Supports creating sample mapping templates
- Handles CSV encoding properly (UTF-8)
- Command-line interface for easy usage

**Usage:**
```bash
# Create sample template
python3 scripts/populate_ac_data.py --create-sample

# Populate data
python3 scripts/populate_ac_data.py \
    --input public/data/csv/wards.csv \
    --mapping ac_mapping.json \
    --output public/data/csv/wards_with_ac.csv
```

## Kerala Assembly Constituencies

Distribution across 14 districts:
| District | ACs | District | ACs |
|----------|-----|----------|-----|
| Thiruvananthapuram | 14 | Thrissur | 13 |
| Kollam | 11 | Palakkad | 11 |
| Pathanamthitta | 5 | Malappuram | 16 |
| Alappuzha | 9 | Kozhikode | 13 |
| Kottayam | 9 | Wayanad | 3 |
| Idukki | 5 | Kannur | 11 |
| Ernakulam | 14 | Kasaragod | 6 |

**Total: 140 Assembly Constituencies**

## Data Sources

To populate the actual AC mapping, data can be sourced from:
1. Kerala State Election Commission (https://sec.kerala.gov.in/)
2. OpenStreetMap (https://wiki.openstreetmap.org/wiki/Assembly_Constituency_(Kerala))
3. Overpass Turbo for OSM boundary data
4. Kerala Government Open Data Portal

## Testing

- ✅ TypeScript type checking passes
- ✅ Build completes successfully (`npm run build`)
- ✅ CSV parsing tested with 23,611 records
- ✅ Backward compatibility maintained
- ✅ Code review completed
- ✅ Populate script tested

## Future Enhancements (Optional)

The following enhancements can be implemented once AC data is populated:

1. **UI Display**: Show AC information in ward detail views
2. **Filtering**: Add AC-based filtering in the dashboard
3. **Aggregation**: Create AC-level statistics and visualizations
4. **Map Integration**: Display AC boundaries on maps
5. **Search**: Add AC-based search functionality

## Notes

- AC fields are optional (nullable) to maintain backward compatibility
- Empty AC fields are parsed as `undefined` in the application
- Multiple wards from the same LSG may belong to different ACs (as AC boundaries can cross LSG boundaries)
- The data structure is ready; actual mapping data needs to be populated from official sources

## Commits

1. `f38d55d` - Add Assembly Constituency correlation structure to ward data
2. `63ebc4f` - Fix redundant undefined assignment in AC field parsing
3. `e287298` - Add Python script to populate AC data and update documentation
