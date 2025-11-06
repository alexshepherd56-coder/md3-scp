#!/usr/bin/env python3
"""
Script to create skeleton HTML files for all O&G cases.
"""

import os

# All O&G cases based on PDF files found
all_cases = [
    ("4.1", "Pre-Conception Care"),
    ("4.2", "Antenatal Care"),
    ("4.3", "Bleeding in Early Pregnancy"),
    ("4.4", "Ectopic Pregnancy"),
    ("4.5", "Vulvovaginitis (Adolescence) [SDL]"),
    ("4.6", "Dysmenorrhea & Menorrhagia (Adolescence)"),
    ("4.7", "Contraception (Adolescence)"),
    ("13.1", "Normal Vs Abnormal Labour"),
    ("13.2", "Labour (Obstetric Emergencies)"),
    ("13.3", "Analgesia in Birth & Cesarian"),
    ("13.4", "Prematurity & Neonatal Resusitation"),
    ("18.1", "Menorrhagia"),
    ("18.2", "Post-Menopausal Bleeding"),
    ("18.3", "Acute Pelvic Pain (Benign Ovarian Disease)"),
    ("18.4", "Endometriosis"),
    ("18.5", "Premalignant Disease of the Cervix"),
    ("24.2", "Secondary Amenorrhoea"),
    ("24.3", "PCOS"),
    ("24.4", "Infertility"),
    ("24.5", "Primary Amenorrhoea [SDL]"),
    ("24.6", "Hirsutism [SDL]"),
    ("24.7", "Pre-Menstrual Syndrome & Dysphoric Disorder"),
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
    <p class="meta"><strong>Category:</strong> O&G | <strong>Discipline:</strong> Obstetrics & Gynaecology</p>

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
    print("Creating skeleton HTML files for O&G cases...")
    print("=" * 70)

    created_count = 0
    skipped_count = 0

    for case_num, title in all_cases:
        output_path = f"/Users/alexshepherd/Desktop/SCPProject/case{case_num.replace('.', '_')}.html"

        # Skip if already exists
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

if __name__ == "__main__":
    main()
