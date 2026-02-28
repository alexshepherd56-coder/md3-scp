#!/usr/bin/env python3
"""
Script to create skeleton HTML files for Medicine and Surgery cases.
"""

import os
import re

# Base directory
BASE_DIR = "/Users/alexshepherd/Desktop/SCPProject"

# Medicine cases with their metadata
medicine_cases = {
    # Neurology (Series 22)
    "22.1": ("Stroke & TIA", "Neurology"),
    "22.2": ("Multiple Sclerosis", "Neurology"),
    "22.3": ("Alzheimers", "Neurology"),
    "22.4": ("Parkinsons & MND", "Neurology"),
    "22.5": ("Meningitis [SDL]", "Neurology"),
    "22.6": ("Creutzfeldt-Jacob Disease [SDL]", "Neurology"),
    "22.7": ("Intracranial Tumours & Hydrocephalus [SDL]", "Neurology"),

    # Gastroenterology (Series 21)
    "21.1": ("Oesophageal Carcinoma", "Gastroenterology"),
    "21.2": ("Gastric Ulcers & Gastric Cancer", "Gastroenterology"),
    "21.3": ("Coeliac [SDL]", "Gastroenterology"),
    "21.4": ("Constipation [SDL]", "Gastroenterology"),
    "21.5": ("IBS", "Gastroenterology"),

    # Endocrinology (Series 17)
    "17.1": ("Primary Hypothyroidism", "Endocrinology"),
    "17.2": ("Graves Disease", "Endocrinology"),
    "17.3": ("Thyroid Mass [SDL]", "Endocrinology"),
    "17.4": ("Cushing's Disease [SDL]", "Endocrinology"),
    "17.5": ("Adrenal Insufficiency", "Endocrinology"),
    "17.6": ("Calcium Metabolism Disorders", "Endocrinology"),

    # O&G (Series 4, 13, 18, 24)
    "4.1": ("Pre-Conception Care", "Obstetrics & Gynaecology"),
    "4.2": ("Antenatal Care", "Obstetrics & Gynaecology"),
    "4.3": ("Bleeding in Early Pregnancy", "Obstetrics & Gynaecology"),
    "4.4": ("Ectopic Pregnancy", "Obstetrics & Gynaecology"),
    "4.5": ("Vulvovaginitis (Adolescence) [SDL]", "Obstetrics & Gynaecology"),
    "4.6": ("Dysmenorrhea & Menorrhagia (Adolescence)", "Obstetrics & Gynaecology"),
    "4.7": ("Contraception (Adolescence)", "Obstetrics & Gynaecology"),
    "13.1": ("Normal Vs Abnormal Labour", "Obstetrics & Gynaecology"),
    "13.2": ("Labour (Obstetric Emergencies)", "Obstetrics & Gynaecology"),
    "13.3": ("Analgesia in Birth & Cesarian", "Obstetrics & Gynaecology"),
    "13.4": ("Prematurity & Neonatal Resusitation", "Obstetrics & Gynaecology"),
    "18.1": ("Menorrhagia", "Obstetrics & Gynaecology"),
    "18.2": ("Post-Menopausal Bleeding", "Obstetrics & Gynaecology"),
    "18.3": ("Acute Pelvic Pain (Benign Ovarian Disease)", "Obstetrics & Gynaecology"),
    "18.4": ("Endometriosis", "Obstetrics & Gynaecology"),
    "18.5": ("Premalignant Disease of the Cervix", "Obstetrics & Gynaecology"),
    "24.2": ("Secondary Amenorrhoea", "Obstetrics & Gynaecology"),
    "24.3": ("PCOS", "Obstetrics & Gynaecology"),
    "24.4": ("Infertility", "Obstetrics & Gynaecology"),
    "24.5": ("Primary Amenorrhoea [SDL]", "Obstetrics & Gynaecology"),
    "24.6": ("Hirsutism [SDL]", "Obstetrics & Gynaecology"),
    "24.7": ("Pre-Menstrual Syndrome & Dysphoric Disorder", "Obstetrics & Gynaecology"),
}

# Surgery cases
surgery_cases = {
    # GIT (Series 8)
    "8.1": ("Diverticular Disease", "Surgery - GIT"),
    "8.2": ("Colorectal Polyps & Cancer", "Surgery - GIT"),
    "8.3": ("IBD (UC & Chrons)", "Surgery - GIT"),
    "8.4": ("LBO [SDL]", "Surgery - GIT"),
    "8.5": ("Internal & External Haemorrhoids", "Surgery - GIT"),
    "8.6": ("Perianal Access & Fistula", "Surgery - GIT"),
    "8.7": ("Anal Fissures, Cancers and STIs [SDL]", "Surgery - GIT"),

    # General (Series 3, 11)
    "3.1": ("Peri-Operative Management", "Surgery - General"),
    "3.2": ("Appendicitis", "Surgery - General"),
    "3.3": ("Surgical Wound Management [SDL]", "Surgery - General"),
    "3.4": ("Post Operative Fever [SDL]", "Surgery - General"),
    "3.5": ("Pancreatitis", "Surgery - General"),
    "3.6": ("Cholecystitis & Biliary Colic", "Surgery - General"),
    "3.7": ("Choledocolethiasis & Cholecystectomy [SDL]", "Surgery - General"),
    "11.1": ("Inguinal Hernias", "Surgery - General"),
    "11.2": ("Umbilical Hernias", "Surgery - General"),
    "11.7": ("Electrolyte Management [SDL]", "Surgery - General"),

    # Breast & Endocrine (Series 11)
    "11.3": ("Breast Cancers [SDL]", "Surgery - Breast & Endocrine"),
    "11.4": ("Benign Breast Conditions", "Surgery - Breast & Endocrine"),
    "11.5": ("Breast Cancer (new diagnosis)", "Surgery - Breast & Endocrine"),
    "11.6": ("Breast Cancer (Terminal)", "Surgery - Breast & Endocrine"),

    # Ortho (Series 19)
    "19.1": ("Osteoarthritis", "Surgery - Orthopaedics"),
    "19.2": ("Septic Arthritis", "Surgery - Orthopaedics"),
    "19.3": ("Bony Lumps", "Surgery - Orthopaedics"),
    "19.4": ("Gout", "Surgery - Orthopaedics"),
    "19.5": ("Knee Injuries", "Surgery - Orthopaedics"),
    "19.6": ("Paediatric Fractures", "Surgery - Orthopaedics"),
}

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

    h3 {{
      color: #1e1e2f;
      margin-top: 20px;
      margin-bottom: 10px;
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
    <p class="meta"><strong>Category:</strong> {category} | <strong>Discipline:</strong> {discipline}</p>

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
    print("Creating skeleton HTML files...")
    print("=" * 70)

    created_count = 0
    skipped_count = 0

    # Combine all cases
    all_cases = {**medicine_cases, **surgery_cases}

    for case_num, (title, discipline) in all_cases.items():
        # Determine category based on discipline
        if "Surgery" in discipline:
            category = "Surgery"
        else:
            category = "Medicine"

        output_path = f"{BASE_DIR}/case{case_num.replace('.', '_')}.html"

        # Skip if already exists
        if os.path.exists(output_path):
            print(f"SKIP: case{case_num.replace('.', '_')}.html (already exists)")
            skipped_count += 1
            continue

        html_content = HTML_TEMPLATE.format(
            case_num=case_num,
            title=title,
            category=category,
            discipline=discipline
        )

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"CREATE: case{case_num.replace('.', '_')}.html - {title} ({discipline})")
        created_count += 1

    print("=" * 70)
    print(f"Created: {created_count} new skeleton files")
    print(f"Skipped: {skipped_count} existing files")
    print(f"Total cases: {len(all_cases)}")

if __name__ == "__main__":
    main()
