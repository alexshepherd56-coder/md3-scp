#!/usr/bin/env python3
"""
Script to create skeleton HTML files for all remaining paediatrics cases.
These will need to be filled in with verbatim content from PDFs.
"""

import os

# Cases already completed
completed = ["12.1", "12.2", "12.3", "12.4", "12.5", "12.6"]

# All paediatrics cases
all_cases = [
    ("12.1", "Febrile Seizures"),
    ("12.2", "Afebrile Seizures (Epilepsy)"),
    ("12.3", "Headache (Migraine)"),
    ("12.4", "Hydrocephalus"),
    ("12.5", "Neural Tube Defects"),
    ("12.6", "Developmental Delay (Cerebral Palsy)"),
    ("16.1", "Noonan Syndrome"),
    ("16.2", "Pyloric Stenosis"),
    ("16.3", "Acute Diarrhoea"),
    ("16.4", "Chronic Diarrhoea & Malabsorption"),
    ("16.5", "Febrile Child & Vaccination"),
    ("16.6", "Teething [SDL]"),
    ("20.1", "Child with Cough"),
    ("20.2", "Child with Wheeze"),
    ("20.3", "The Atopic Child"),
    ("20.4", "Asthma (Acute Exacerbation)"),
    ("20.5", "Child with Stridor"),
    ("20.6", "Pneumonia"),
    ("23.1", "Congenital Heart Disease (Acyanotic)"),
    ("23.2", "Congenital Heart Disease (Cyanotic)"),
    ("23.3", "Nasolacrimal Duct Blockage"),
    ("23.4", "Strabismus"),
    ("23.5", "Laryngomalacia"),
    ("28.1", "UTI"),
    ("28.2", "Glomerulonephritis"),
    ("28.3", "Nephrotic Syndrome"),
    ("28.4", "Anaemia (Nutritional)"),
    ("28.5", "Purpuric Rash"),
    ("28.6", "Acute Lymphoblastic Leukaemia"),
    ("6.1", "T1D (New Diagnosis)"),
    ("6.2", "T1D (Ongoing Management)"),
    ("6.3", "Cystic Fibrosis"),
    ("6.4", "Growth (Short Stature)"),
    ("9.1", "Asthma (ED)"),
    ("9.2", "Poisoning & Envenomation"),
    ("9.3", "DDH"),
    ("9.4", "Common Surgical Conditions in Kids"),
    ("9.6", "Neonatal Resuscitation"),
    ("9.7", "Infections at Birth"),
]

HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Case {case_num} - {title}</title>
  <style>
    body {{
      margin: 0;
      font-family: system-ui, sans-serif;
      background-color: #f7f9fb;
      padding: 20px;
      color: #333;
    }}

    .container {{
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }}

    .back-link {{
      display: inline-block;
      margin-bottom: 20px;
      color: #4a6cf7;
      text-decoration: none;
      font-weight: 500;
    }}

    .back-link:hover {{
      text-decoration: underline;
    }}

    h1 {{
      color: #1e1e2f;
      margin-bottom: 10px;
    }}

    .meta {{
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }}

    h2 {{
      color: #1e1e2f;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #4a6cf7;
      padding-bottom: 5px;
    }}

    .question {{
      margin-top: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #4a6cf7;
    }}

    button.toggle {{
      margin-top: 10px;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      background-color: #4a6cf7;
      color: white;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }}

    button.toggle:hover {{
      background-color: #3a5ce7;
    }}

    .answer {{
      display: none;
      background: #fff;
      margin-top: 10px;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }}

    table th, table td {{
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }}

    table th {{
      background-color: #f0f0f0;
      font-weight: 600;
    }}

    ul, ol {{
      padding-left: 25px;
      line-height: 1.8;
    }}

    li {{
      margin-bottom: 8px;
    }}

    p {{
      line-height: 1.6;
      margin-bottom: 15px;
    }}
  </style>
</head>
<body>
  <div class="container">
    <a href="SCP2.html" class="back-link">← Back to Cases</a>

    <h1>Case {case_num} – {title}</h1>
    <p class="meta"><strong>Category:</strong> Children & Young People | <strong>Discipline:</strong> Paediatrics Medicine</p>

    <h2>Case</h2>
    <p>[Case content to be added from PDF]</p>

    <h2>Questions</h2>
    <div class="question">
      <strong>[Question to be added from PDF]</strong><br>
      <button class="toggle">Show Answer</button>
      <div class="answer">
        <p>[Answer to be added from PDF]</p>
      </div>
    </div>

  </div>

  <script>
    // Toggle Answers
    document.querySelectorAll('.toggle').forEach(btn => {{
      btn.addEventListener('click', function () {{
        const ans = this.nextElementSibling;
        ans.style.display = ans.style.display === 'block' ? 'none' : 'block';
        this.textContent = ans.style.display === 'block' ? 'Hide Answer' : 'Show Answer';
      }});
    }});
  </script>
</body>
</html>
'''

def main():
    print("Creating skeleton HTML files for paediatrics cases...")
    print("=" * 70)

    created_count = 0
    skipped_count = 0

    for case_num, title in all_cases:
        output_path = f"/Users/alexshepherd/Desktop/SCPProject/case{case_num.replace('.', '_')}.html"

        # Skip if already exists (completed)
        if os.path.exists(output_path):
            print(f"SKIP: case{case_num.replace('.', '_')}.html (already exists)")
            skipped_count += 1
            continue

        html_content = HTML_TEMPLATE.format(
            case_num=case_num,
            title=title
        )

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"CREATE: case{case_num.replace('.', '_')}.html - {title}")
        created_count += 1

    print("=" * 70)
    print(f"Created: {created_count} new skeleton files")
    print(f"Skipped: {skipped_count} existing files")
    print(f"Total cases: {len(all_cases)}")
    print("\nNOTE: Skeleton files created. Content needs to be added from PDFs.")

if __name__ == "__main__":
    main()
