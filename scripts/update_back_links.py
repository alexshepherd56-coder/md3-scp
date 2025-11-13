#!/usr/bin/env python3
"""
Script to update all case HTML files to use smart back navigation.
"""

import os
import re
import glob

BASE_DIR = "/Users/alexshepherd/Desktop/SCPProject"

# Find all case HTML files
case_files = glob.glob(f"{BASE_DIR}/case*.html")

OLD_BACK_LINK = '<a href="SCP2.html" class="back-link">← Back to Cases</a>'

NEW_BACK_LINK = '''<a href="#" class="back-link" onclick="goBack(event)">← Back to Cases</a>
    <script>
      function goBack(event) {
        event.preventDefault();
        const lastFilter = localStorage.getItem('currentFilter') || 'all';
        window.location.href = 'SCP2.html?filter=' + lastFilter;
      }
    </script>'''

print(f"Updating {len(case_files)} case files...")
updated = 0
skipped = 0

for file_path in case_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if OLD_BACK_LINK in content:
            new_content = content.replace(OLD_BACK_LINK, NEW_BACK_LINK)

            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            updated += 1
            filename = os.path.basename(file_path)
            print(f"✓ Updated: {filename}")
        else:
            skipped += 1

    except Exception as e:
        print(f"✗ Error with {file_path}: {e}")

print(f"\n{'='*60}")
print(f"Updated: {updated} files")
print(f"Skipped: {skipped} files (already updated or different format)")
print(f"Total: {len(case_files)} files")
