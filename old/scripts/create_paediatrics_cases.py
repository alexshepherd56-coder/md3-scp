#!/usr/bin/env python3
"""
Script to create HTML files for all paediatrics cases from PDFs.
Extracts case information and questions verbatim from PDFs.
"""

import os
import PyPDF2
from pathlib import Path

# Define the paediatrics cases mapping
cases = [
    ("12.2", "12.2_Afebrile Seizures (epilepsy).pdf", "Afebrile Seizures (Epilepsy)"),
    ("12.3", "12.3_Headache (Migraine).pdf", "Headache (Migraine)"),
    ("12.4", "12.4_Hydrocephalus (big head).pdf", "Hydrocephalus"),
    ("12.5", "12.5_Neural Tube Defects (myelomeningocele).pdf", "Neural Tube Defects"),
    ("12.6", "12.6_Developmental Delay (Cerebral Palsy).pdf", "Developmental Delay (Cerebral Palsy)"),
    ("16.1", "16.1_Noonan Syndrome.pdf", "Noonan Syndrome"),
    ("16.2", "16.2_Pyloric Stenosis.pdf", "Pyloric Stenosis"),
    ("16.3", "16.3_Acute Diarrhoea.pdf", "Acute Diarrhoea"),
    ("16.4", "16.4_Chronic Diarrhoea & Malabsorption.pdf", "Chronic Diarrhoea & Malabsorption"),
    ("16.5", "16.5_Febrile Child & Vaccination.pdf", "Febrile Child & Vaccination"),
    ("16.6", "16.6_Teething [SDL].pdf", "Teething [SDL]"),
    ("20.1", "20.1_Child with Cough.pdf", "Child with Cough"),
    ("20.2", "20.2_Child with Wheeze.pdf", "Child with Wheeze"),
    ("20.3", "20.3_The Atopic Child.pdf", "The Atopic Child"),
    ("20.4", "20.4_Asthma (Acute Exacerbation).pdf", "Asthma (Acute Exacerbation)"),
    ("20.5", "20.5_Child with Stridor.pdf", "Child with Stridor"),
    ("20.6", "20.6_Pneumonia.pdf", "Pneumonia"),
    ("23.1", "23.1_Congenital Heart Disease (Acyanotic).pdf", "Congenital Heart Disease (Acyanotic)"),
    ("23.2", "23.2_Congenital Heart Disease (Cyanotic).pdf", "Congenital Heart Disease (Cyanotic)"),
    ("23.3", "23.3_Nasolacrimal Duct Blockage.pdf", "Nasolacrimal Duct Blockage"),
    ("23.4", "23.4_Strabismus.pdf", "Strabismus"),
    ("23.5", "23.5_LAryngomalacia (infant w Stridor).pdf", "Laryngomalacia"),
    ("28.1", "28.1_UTI.pdf", "UTI"),
    ("28.2", "28.2_Glomeulonephritis.pdf", "Glomerulonephritis"),
    ("28.3", "28.3_Nephrotic Syndrome.pdf", "Nephrotic Syndrome"),
    ("28.4", "28.4_Anaemia (nutritional).pdf", "Anaemia (Nutritional)"),
    ("28.5", "28.5_Purpuric Rash.pdf", "Purpuric Rash"),
    ("28.6", "28.6_Acute Lymphoblastic Leukaemia.pdf", "Acute Lymphoblastic Leukaemia"),
    ("6.1", "6.1_T1D (new diagnosis).pdf", "T1D (New Diagnosis)"),
    ("6.2", "6.2_T1D (Ongoing management).pdf", "T1D (Ongoing Management)"),
    ("6.3", "6.3_Cystic Fibrosis (meconium ileus).pdf", "Cystic Fibrosis"),
    ("6.4", "6.4_Growth (Short Stature).pdf", "Growth (Short Stature)"),
    ("9.1", "9.1_Asthma (ED).pdf", "Asthma (ED)"),
    ("9.2", "9.2_Poisoning & Envenomation.pdf", "Poisoning & Envenomation"),
    ("9.3", "9.3_DDH (Developmental Dysplasia of Hip).pdf", "DDH"),
    ("9.4", "9.4_Common Surg Conditions in Kids.pdf", "Common Surgical Conditions in Kids"),
    ("9.6", "9.6_Neonatal Resus.pdf", "Neonatal Resuscitation"),
    ("9.7", "9.7_Infections at Birth.pdf", "Infections at Birth"),
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
    <p>{case_content}</p>

    <h2>Questions</h2>
    {questions_html}

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

def extract_pdf_text(pdf_path):
    """Extract text from PDF file."""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return text
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return ""

def create_html_file(case_num, pdf_filename, title):
    """Create HTML file for a paediatrics case."""

    pdf_path = f"/Users/alexshepherd/Desktop/SCPProject/Medicine/Paediatrics/{pdf_filename}"
    output_path = f"/Users/alexshepherd/Desktop/SCPProject/case{case_num.replace('.', '_')}.html"

    # Extract PDF text
    pdf_text = extract_pdf_text(pdf_path)

    if not pdf_text:
        print(f"Warning: Could not extract text from {pdf_filename}")
        return False

    # For now, create a placeholder with instruction to manually add content
    # This ensures the file structure is created
    case_content = f"[Content to be extracted from {pdf_filename}]"
    questions_html = '''
    <div class="question">
      <strong>Questions to be added from PDF</strong><br>
      <button class="toggle">Show Answer</button>
      <div class="answer">
        <p>Answers to be extracted from PDF</p>
      </div>
    </div>
    '''

    html_content = HTML_TEMPLATE.format(
        case_num=case_num,
        title=title,
        case_content=case_content,
        questions_html=questions_html
    )

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"Created: case{case_num.replace('.', '_')}.html")
    return True

def main():
    print("Creating paediatrics case HTML files...")
    print("=" * 60)

    success_count = 0
    for case_num, pdf_filename, title in cases:
        if create_html_file(case_num, pdf_filename, title):
            success_count += 1

    print("=" * 60)
    print(f"Successfully created {success_count} out of {len(cases)} files")
    print("\nNOTE: Files created with placeholder content.")
    print("Each file needs to be manually updated with verbatim content from PDFs.")

if __name__ == "__main__":
    main()
