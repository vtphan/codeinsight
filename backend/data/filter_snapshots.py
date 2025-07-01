#!/usr/bin/env python3
"""
Script to filter code snapshots based on timestamp criteria.
Filters snapshots to get the latest snapshot of each student at a specific minute mark.
"""

import json
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any
import os

def parse_timestamp(timestamp_str: str) -> datetime:
    """Parse timestamp string to datetime object."""
    return datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")

def filter_snapshots_by_time(data: Dict[str, Any], minutes: int) -> Dict[str, Any]:
    """
    Filter snapshots to include all snapshots at or before the specified minute mark.
    
    Args:
        data: The loaded JSON data containing codeSnapshots and problemDescription
        minutes: Number of minutes from the start time (2024-10-26 14:00:00)
    
    Returns:
        Dictionary containing problem description and filtered snapshots
    """
    # Problem start time
    start_time = datetime.strptime("2024-10-26 14:00:00", "%Y-%m-%d %H:%M:%S")
    
    # Target time (start_time + minutes)
    target_time = start_time + timedelta(minutes=minutes)
    
    # Get all snapshots
    snapshots = data.get("codeSnapshots", {}).get("entries", [])
    
    # Filter snapshots to include all at or before the target time
    filtered_snapshots = []
    for snapshot in snapshots:
        snapshot_time = parse_timestamp(snapshot["timestamp"])
        
        # Include snapshots at or before the target time
        if snapshot_time <= target_time:
            filtered_snapshots.append({
                "student_id": snapshot["student_id"],
                "content": snapshot["content"],
                "timestamp": snapshot["timestamp"],
                "snapshot_id": snapshot["snapshot_id"],
                "grade": snapshot.get("grade", "")
            })
    
    # Sort by timestamp for consistent output
    filtered_snapshots.sort(key=lambda x: x["timestamp"])
    
    # Get problem description
    problem_description = data.get("problemDescription", {})
    
    # Create the final result structure
    result = {
        "problem_description": problem_description.get("problem_description", ""),
        "problem_start_time": problem_description.get("timestamp", "2024-10-26 14:00:00"),
        "snapshots": filtered_snapshots,
        "target_timestamp": target_time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    return result

def main():
    """Main function to run the filtering script."""
    if len(sys.argv) != 2:
        print("Usage: python filter_snapshots.py <minutes>")
        print("Example: python filter_snapshots.py 2")
        sys.exit(1)
    
    try:
        minutes = int(sys.argv[1])
    except ValueError:
        print("Error: Minutes must be an integer")
        sys.exit(1)
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Input and output file paths
    input_file = os.path.join(script_dir, "data_final.json")
    output_file = os.path.join(script_dir, f"data_{minutes}min.json")
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found")
        sys.exit(1)
    
    try:
        # Load the data
        print(f"Loading data from {input_file}...")
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Filter the snapshots
        print(f"Filtering snapshots for {minutes} minute(s) mark...")
        filtered_result = filter_snapshots_by_time(data, minutes)
        
        # Save the results
        print(f"Saving filtered results to {output_file}...")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(filtered_result, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully filtered {len(filtered_result['snapshots'])} snapshots")
        print(f"Results saved to: {output_file}")
        
        # Print a summary of the results
        print(f"\nSummary:")
        print(f"Problem: {filtered_result['problem_description'][:100]}...")
        print(f"Target time: {filtered_result['target_timestamp']}")
        print(f"Total snapshots: {len(filtered_result['snapshots'])}")
        
        # Print a sample of the results
        if filtered_result['snapshots']:
            print(f"\nSample result (first snapshot):")
            sample = filtered_result['snapshots'][0]
            print(f"Student ID: {sample['student_id']}")
            print(f"Timestamp: {sample['timestamp']}")
            print(f"Snapshot ID: {sample['snapshot_id']}")
            print(f"Grade: {sample['grade'] if sample['grade'] else 'Not graded'}")
            print(f"Code content preview: {sample['content'][:100]}...")
    
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse JSON file - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 