#!/usr/bin/env python3
"""
Example script to populate Assembly Constituency data in wards.csv

This script demonstrates how to update the wards.csv file with Assembly Constituency
information once you have the ward-to-AC mapping data.

Data sources for AC mapping:
1. Kerala State Election Commission (https://sec.kerala.gov.in/)
2. OpenStreetMap (https://wiki.openstreetmap.org/wiki/Assembly_Constituency_(Kerala))
3. Kerala Government Open Data Portal

Usage:
    python3 populate_ac_data.py --input wards.csv --mapping ac_mapping.json --output wards_with_ac.csv
"""

import csv
import json
import argparse
from typing import Dict, Any


def load_ac_mapping(mapping_file: str) -> Dict[str, Dict[str, str]]:
    """
    Load AC mapping from JSON file.
    
    Expected format:
    {
        "B01001001": {"code": "01", "name": "Parassala"},
        "B01001002": {"code": "01", "name": "Parassala"},
        ...
    }
    """
    with open(mapping_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def populate_ac_data(input_file: str, mapping: Dict[str, Dict[str, str]], output_file: str) -> None:
    """
    Update wards.csv with AC data from mapping.
    """
    updated_count = 0
    total_count = 0
    
    with open(input_file, 'r', encoding='utf-8') as infile, \
         open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        
        reader = csv.DictReader(infile)
        writer = csv.DictWriter(outfile, fieldnames=reader.fieldnames)
        writer.writeheader()
        
        for row in reader:
            ward_code = row['Ward Code']
            total_count += 1
            
            if ward_code in mapping:
                row['AC Code'] = mapping[ward_code]['code']
                row['AC Name'] = mapping[ward_code]['name']
                updated_count += 1
            
            writer.writerow(row)
    
    print(f"Updated {updated_count} of {total_count} wards with AC data")
    print(f"Output written to: {output_file}")


def create_sample_mapping() -> Dict[str, Dict[str, str]]:
    """
    Create a sample mapping for demonstration.
    This should be replaced with actual data from official sources.
    """
    # Sample mapping for Thiruvananthapuram district (first few wards)
    # This is SAMPLE DATA ONLY - use official sources for production
    return {
        # Block Panchayat wards (example)
        "B01001001": {"code": "01", "name": "Parassala"},
        "B01001002": {"code": "01", "name": "Parassala"},
        "B01001003": {"code": "01", "name": "Parassala"},
        # More mappings should be added from official sources
    }


def main():
    parser = argparse.ArgumentParser(description='Populate AC data in wards.csv')
    parser.add_argument('--input', default='wards.csv', help='Input wards CSV file')
    parser.add_argument('--mapping', default=None, help='AC mapping JSON file')
    parser.add_argument('--output', default='wards_with_ac.csv', help='Output CSV file')
    parser.add_argument('--create-sample', action='store_true', 
                       help='Create sample mapping file for reference')
    
    args = parser.parse_args()
    
    if args.create_sample:
        sample = create_sample_mapping()
        with open('sample_ac_mapping.json', 'w', encoding='utf-8') as f:
            json.dump(sample, f, indent=2, ensure_ascii=False)
        print("Created sample_ac_mapping.json")
        print("This is SAMPLE DATA. Replace with official AC mapping data.")
        return
    
    if not args.mapping:
        print("Error: --mapping is required (or use --create-sample to create a template)")
        return
    
    mapping = load_ac_mapping(args.mapping)
    populate_ac_data(args.input, mapping, args.output)


if __name__ == '__main__':
    main()
