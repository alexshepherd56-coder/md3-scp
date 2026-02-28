import type { WeekData } from '@/types/week'

// Year 3 weeks - cases 1-30 organized by week/specialty
// Only includes cases that have corresponding MDX files
export const year3Weeks: WeekData[] = [
  {
    id: 'w1-cardiology',
    weekNumber: 1,
    specialty: 'Cardiology',
    displayName: 'Week 1 - Cardiology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '1.1', title: 'Hypertension' },
      { id: '1.2', title: 'Chest Pain (SDL)' },
      { id: '1.3', title: 'Heart Failure' },
      { id: '1.4', title: 'Hyperlipidaemia (Acquired)' },
      { id: '1.5', title: 'Obesity' },
      { id: '1.6', title: 'Smoking Cessation (SDL)' },
    ]
  },
  {
    id: 'w2-cardiology',
    weekNumber: 2,
    specialty: 'Cardiology',
    displayName: 'Week 2 - Cardiology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '2.1', title: 'Cardiomyopathy (Hypertrophic)' },
      { id: '2.2', title: 'Cardiomyopathy (Dilated) [SDL]' },
      { id: '2.3', title: 'Stable Angina' },
      { id: '2.4', title: 'Coronary Artery Disease (Unstable Angina)' },
      { id: '2.5', title: 'Acute Myocardial Infarction' },
      { id: '2.6', title: 'Hyperlipidaemia (Congenital) [SDL]' },
    ]
  },
  {
    id: 'w3-general-surgery',
    weekNumber: 3,
    specialty: 'General Surgery',
    displayName: 'Week 3 - General Surgery',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '3.1', title: 'Peri-Operative Management' },
      { id: '3.2', title: 'Appendicitis' },
      { id: '3.6', title: 'Cholecystitis & Biliary Colic' },
    ]
  },
  {
    id: 'w4-og',
    weekNumber: 4,
    specialty: 'O&G',
    displayName: 'Week 4 - O&G',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '4.1', title: 'Pre-Conception Care' },
      { id: '4.2', title: 'Antenatal Care' },
      { id: '4.3', title: 'Bleeding in Early Pregnancy' },
      { id: '4.4', title: 'Ectopic Pregnancy' },
      { id: '4.5', title: 'Vulvovaginitis (Adolescence) [SDL]' },
      { id: '4.6', title: 'Dysmenorrhea & Menorrhagia (Adolescence)' },
      { id: '4.7', title: 'Contraception (Adolescence)' },
    ]
  },
  {
    id: 'w5-psychiatry',
    weekNumber: 5,
    specialty: 'Psychiatry',
    displayName: 'Week 5 - Psychiatry',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '5.1', title: 'Self Harm & Suicide [SDL]' },
      { id: '5.2', title: 'Anxiety Disorders' },
      { id: '5.3', title: 'Depression' },
      { id: '5.4', title: 'Bipolar Disorder' },
    ]
  },
  {
    id: 'w6-paediatrics',
    weekNumber: 6,
    specialty: 'Paediatrics',
    displayName: 'Week 6 - Paediatrics',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '6.1', title: 'T1D (New Diagnosis)' },
      { id: '6.2', title: 'T1D (Ongoing Management)' },
      { id: '6.3', title: 'Cystic Fibrosis' },
      { id: '6.4', title: 'Growth (Short Stature)' },
    ]
  },
  {
    id: 'w7-respiratory',
    weekNumber: 7,
    specialty: 'Respiratory',
    displayName: 'Week 7 - Respiratory',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '7.1', title: 'Asthma Exacerbation' },
      { id: '7.2', title: 'Severe Asthma' },
      { id: '7.3', title: 'COPD' },
      { id: '7.4', title: 'Bronchiectasis [SDL]' },
      { id: '7.5', title: 'Cystic Fibrosis [SDL]' },
      { id: '7.6', title: 'Community Acquired Pneumonia' },
    ]
  },
  {
    id: 'w8-git-surgery',
    weekNumber: 8,
    specialty: 'GIT Surgery',
    displayName: 'Week 8 - GIT Surgery',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '8.1', title: 'Diverticular Disease' },
      { id: '8.2', title: 'Colorectal Polyps & Cancer' },
      { id: '8.3', title: 'IBD (UC & Crohns)' },
      { id: '8.4', title: 'LBO [SDL]' },
      { id: '8.5', title: 'Internal & External Haemorrhoids' },
      { id: '8.6', title: 'Perianal Access & Fistula' },
      { id: '8.7', title: 'Anal Fissures, Cancers and STIs [SDL]' },
    ]
  },
  {
    id: 'w9-paediatrics',
    weekNumber: 9,
    specialty: 'Paediatrics',
    displayName: 'Week 9 - Paediatrics',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '9.1', title: 'Asthma (ED)' },
      { id: '9.2', title: 'Poisoning & Envenomation' },
      { id: '9.3', title: 'DDH' },
      { id: '9.4', title: 'Common Surgical Conditions in Kids' },
      { id: '9.6', title: 'Neonatal Resuscitation' },
      { id: '9.7', title: 'Infections at Birth' },
    ]
  },
  {
    id: 'w10-respiratory',
    weekNumber: 10,
    specialty: 'Respiratory',
    displayName: 'Week 10 - Respiratory',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '10.1', title: 'Obstructive Sleep Apnoea' },
      { id: '10.2', title: 'Pneumonia [SDL]' },
      { id: '10.3', title: 'Tuberculosis [SDL]' },
      { id: '10.4', title: 'Bronchial Cancer' },
      { id: '10.5', title: 'Interstitial Lung Disease & Sarcoidosis' },
      { id: '10.6', title: 'Pulmonary Embolism' },
    ]
  },
  {
    id: 'w11-general-surgery-breast',
    weekNumber: 11,
    specialty: 'General Surgery & Breast',
    displayName: 'Week 11 - General Surgery & Breast',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '11.1', title: 'Inguinal Hernias' },
      { id: '11.2', title: 'Umbilical Hernias' },
      { id: '11.3', title: 'Breast Cancers [SDL]' },
      { id: '11.4', title: 'Benign Breast Conditions' },
      { id: '11.5', title: 'Breast Cancer (new diagnosis)' },
    ]
  },
  {
    id: 'w12-paediatrics',
    weekNumber: 12,
    specialty: 'Paediatrics',
    displayName: 'Week 12 - Paediatrics',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '12.1', title: 'Febrile Seizures' },
      { id: '12.3', title: 'Headache (Migraine)' },
      { id: '12.4', title: 'Hydrocephalus' },
      { id: '12.5', title: 'Neural Tube Defects' },
      { id: '12.6', title: 'Developmental Delay (Cerebral Palsy)' },
    ]
  },
  {
    id: 'w13-og',
    weekNumber: 13,
    specialty: 'O&G',
    displayName: 'Week 13 - O&G',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w14-renal',
    weekNumber: 14,
    specialty: 'Renal',
    displayName: 'Week 14 - Renal',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '14.3', title: 'Nephrotic Syndrome' },
      { id: '14.4', title: 'Diabetic Nephropathy [SDL]' },
    ]
  },
  {
    id: 'w15-psychiatry',
    weekNumber: 15,
    specialty: 'Psychiatry',
    displayName: 'Week 15 - Psychiatry',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '15.1', title: 'Alcohol Abuse' },
      { id: '15.2', title: 'Substance Abuse' },
      { id: '15.3', title: 'Dementia' },
      { id: '15.4', title: 'Delirium [SDL]' },
      { id: '15.5', title: 'Personality Disorders' },
    ]
  },
  {
    id: 'w16-paediatrics',
    weekNumber: 16,
    specialty: 'Paediatrics',
    displayName: 'Week 16 - Paediatrics',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '16.2', title: 'Pyloric Stenosis' },
      { id: '16.3', title: 'Acute Diarrhoea' },
      { id: '16.4', title: 'Chronic Diarrhoea & Malabsorption' },
      { id: '16.5', title: 'Febrile Child & Vaccination' },
      { id: '16.6', title: 'Teething [SDL]' },
    ]
  },
  {
    id: 'w17-endocrinology',
    weekNumber: 17,
    specialty: 'Endocrinology',
    displayName: 'Week 17 - Endocrinology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '17.1', title: 'Primary Hypothyroidism' },
      { id: '17.2', title: 'Graves Disease' },
      { id: '17.3', title: 'Thyroid Mass [SDL]' },
      { id: '17.5', title: 'Adrenal Insufficiency' },
      { id: '17.6', title: 'Disorders of Calcium Metabolism' },
    ]
  },
  {
    id: 'w18-og',
    weekNumber: 18,
    specialty: 'O&G',
    displayName: 'Week 18 - O&G',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '18.1', title: 'Menorrhagia' },
      { id: '18.2', title: 'Post-Menopausal Bleeding' },
      { id: '18.3', title: 'Acute Pelvic Pain (Benign Ovarian Disease)' },
      { id: '18.4', title: 'Endometriosis' },
      { id: '18.5', title: 'Premalignant Disease of the Cervix' },
    ]
  },
  {
    id: 'w19-ortho-surgery',
    weekNumber: 19,
    specialty: 'Ortho Surgery',
    displayName: 'Week 19 - Ortho Surgery',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '19.1', title: 'Osteoarthritis' },
      { id: '19.2', title: 'Septic Arthritis' },
      { id: '19.3', title: 'Bony Lumps' },
      { id: '19.4', title: 'Gout' },
      { id: '19.5', title: 'Knee Injuries' },
      { id: '19.6', title: 'Paediatric Fractures' },
    ]
  },
  {
    id: 'w20-paediatrics',
    weekNumber: 20,
    specialty: 'Paediatrics',
    displayName: 'Week 20 - Paediatrics',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '20.4', title: 'Asthma (Acute Exacerbation)' },
      { id: '20.5', title: 'Child with Stridor' },
      { id: '20.6', title: 'Pneumonia' },
    ]
  },
  {
    id: 'w21-gastroenterology',
    weekNumber: 21,
    specialty: 'Gastroenterology',
    displayName: 'Week 21 - Gastroenterology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '21.1', title: 'Oesophageal Carcinoma' },
      { id: '21.2', title: 'Gastric Ulcers & Gastric Cancer' },
      { id: '21.3', title: 'Coeliac [SDL]' },
      { id: '21.4', title: 'Constipation [SDL]' },
      { id: '21.5', title: 'IBS' },
    ]
  },
  {
    id: 'w22-neurology',
    weekNumber: 22,
    specialty: 'Neurology',
    displayName: 'Week 22 - Neurology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '22.1', title: 'Stroke & TIA' },
      { id: '22.2', title: 'Multiple Sclerosis' },
      { id: '22.3', title: 'Alzheimers' },
      { id: '22.4', title: 'Parkinsons & MND' },
      { id: '22.5', title: 'Meningitis [SDL]' },
      { id: '22.6', title: 'Creutzfeldt-Jacob Disease [SDL]' },
      { id: '22.7', title: 'Intracranial Tumours & Hydrocephalus [SDL]' },
    ]
  },
  {
    id: 'w23-paediatrics',
    weekNumber: 23,
    specialty: 'Paediatrics',
    displayName: 'Week 23 - Paediatrics',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '23.1', title: 'Congenital Heart Disease (Acyanotic)' },
      { id: '23.2', title: 'Congenital Heart Disease (Cyanotic)' },
      { id: '23.3', title: 'Nasolacrimal Duct Blockage' },
      { id: '23.4', title: 'Strabismus' },
      { id: '23.5', title: 'Laryngomalacia' },
    ]
  },
  {
    id: 'w24-og',
    weekNumber: 24,
    specialty: 'O&G',
    displayName: 'Week 24 - O&G',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '24.2', title: 'Secondary Amenorrhoea' },
      { id: '24.3', title: 'PCOS' },
      { id: '24.4', title: 'Infertility' },
      { id: '24.5', title: 'Primary Amenorrhoea [SDL]' },
      { id: '24.6', title: 'Hirsutism [SDL]' },
      { id: '24.7', title: 'Pre-Menstrual Syndrome & Dysphoric Disorder' },
    ]
  },
  {
    id: 'w25-psychiatry',
    weekNumber: 25,
    specialty: 'Psychiatry',
    displayName: 'Week 25 - Psychiatry',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '25.1', title: 'Borderline Personality Disorder' },
      { id: '25.2', title: 'Substance Abuse' },
      { id: '25.3', title: 'Drug Seeking Patient' },
      { id: '25.4', title: 'PTSD' },
    ]
  },
  {
    id: 'w26-rheumatology',
    weekNumber: 26,
    specialty: 'Rheumatology',
    displayName: 'Week 26 - Rheumatology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w27-vascular-surgery',
    weekNumber: 27,
    specialty: 'Vascular Surgery',
    displayName: 'Week 27 - Vascular Surgery',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '27.1', title: 'Abdominal Aortic Aneurysm (AAA)' },
      { id: '27.2', title: 'Lower Limb Peripheral Arterial Disease (PAD)' },
      { id: '27.3', title: 'Carotid Artery Disease [SDL]' },
      { id: '27.4', title: 'Varicose Veins' },
      { id: '27.5', title: 'Lower Limb Ulcers & Chronic Venous Insufficiency' },
    ]
  },
  {
    id: 'w28-paediatrics',
    weekNumber: 28,
    specialty: 'Paediatrics',
    displayName: 'Week 28 - Paediatrics',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '28.1', title: 'UTI' },
      { id: '28.2', title: 'Glomerulonephritis' },
      { id: '28.3', title: 'Nephrotic Syndrome' },
      { id: '28.4', title: 'Anaemia (Nutritional)' },
      { id: '28.5', title: 'Purpuric Rash' },
      { id: '28.6', title: 'Acute Lymphoblastic Leukaemia' },
    ]
  },
  {
    id: 'w29-og',
    weekNumber: 29,
    specialty: 'O&G',
    displayName: 'Week 29 - O&G',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '29.1', title: 'Urinary Stress Incontinence' },
      { id: '29.2', title: 'Urinary Urge Incontinence (Overactive Bladder)' },
      { id: '29.3', title: 'Uterine Prolapse (Pelvic Organ Prolapse)' },
      { id: '29.4', title: 'Perimenopause & Menopause' },
      { id: '29.5', title: 'Premature Ovarian Insufficiency [SDL]' },
      { id: '29.6', title: 'Vulvovaginal Candidiasis [SDL]' },
      { id: '29.7', title: 'Genital Herpes [SDL]' },
      { id: '29.8', title: 'Unplanned Pregnancy & Contraception [SDL]' },
    ]
  },
  {
    id: 'w30-haematology',
    weekNumber: 30,
    specialty: 'Haematology',
    displayName: 'Week 30 - Haematology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: '30.1', title: 'Microcytic Anaemia' },
      { id: '30.2', title: 'Macrocytic Anaemia' },
      { id: '30.3', title: 'Aplastic Anaemia [SDL]' },
      { id: '30.4', title: 'Haemolytic Anaemias [SDL]' },
      { id: '30.5', title: 'Myeloproliferative Disorders & Myelofibrosis' },
      { id: '30.6', title: 'Bleeding Disorders & Thrombocytopaenia' },
    ]
  },
]

// Year 4 weeks - organized by week/specialty
export const year4Weeks: WeekData[] = [
  {
    id: 'w1-anaesthesia',
    weekNumber: 1,
    specialty: 'Anaesthesia',
    displayName: 'WK1 - Anaesthesia',
    hasLearningObjectives: true,
    loCount: 28,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: 'y4.1_1', title: 'Pre-operative Assessment (Low Risk)' },
      { id: 'y4.1_2', title: 'Pre-operative Assessment (High Risk)' },
      { id: 'y4.1_3', title: 'Balanced General Anaesthesia' },
      { id: 'y4.1_4', title: 'Airway Management' },
      { id: 'y4.1_5', title: 'Emergency Anaesthesia' },
    ]
  },
  {
    id: 'w2-anaesthesia',
    weekNumber: 2,
    specialty: 'Anaesthesia',
    displayName: 'WK2 - Anaesthesia',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: 'y4.2_1', title: 'Fluid and Electrolyte Balance' },
      { id: 'y4.2_2', title: 'Anaphylaxis' },
      { id: 'y4.2_3', title: 'Malignant Hyperthermia' },
      { id: 'y4.2_4', title: 'Monitoring (Standard & Invasive)' },
    ]
  },
  {
    id: 'w3-anaesthetics',
    weekNumber: 3,
    specialty: 'Anaesthetics',
    displayName: 'WK3 - Anaesthetics',
    hasLearningObjectives: true,
    loCount: 16,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: [
      { id: 'y4.3_1', title: 'Post Operative Nausea & Vomiting' },
      { id: 'y4.3_2', title: 'Post Operative Pain Management' },
      { id: 'y4.3_3', title: 'Chronic Pain' },
      { id: 'y4.3_4', title: 'Post Operative Monitoring' },
    ]
  },
  {
    id: 'w4-anaesthetics',
    weekNumber: 4,
    specialty: 'Anaesthetics',
    displayName: 'WK4 - Anaesthetics',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w5-intensive-care',
    weekNumber: 5,
    specialty: 'Intensive Care',
    displayName: 'WK5 - Intensive Care',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w6-intensive-care',
    weekNumber: 6,
    specialty: 'Intensive Care',
    displayName: 'WK6 - Intensive Care',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w7-emergency-medicine',
    weekNumber: 7,
    specialty: 'Emergency Medicine',
    displayName: 'WK7 - Emergency Medicine',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w8-emergency-medicine',
    weekNumber: 8,
    specialty: 'Emergency Medicine',
    displayName: 'WK8 - Emergency Medicine',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w9-emergency-medicine',
    weekNumber: 9,
    specialty: 'Emergency Medicine',
    displayName: 'WK9 - Emergency Medicine',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w10-emergency-medicine',
    weekNumber: 10,
    specialty: 'Emergency Medicine',
    displayName: 'WK10 - Emergency Medicine',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w11-emergency-paediatrics',
    weekNumber: 11,
    specialty: 'Emergency Paediatrics',
    displayName: 'WK11 - Emergency Paediatrics',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w12-emergency-medicine',
    weekNumber: 12,
    specialty: 'Emergency Medicine',
    displayName: 'WK12 - Emergency Medicine',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w13-medicine',
    weekNumber: 13,
    specialty: 'Medicine',
    displayName: 'WK13 - Medicine',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w14-surgery',
    weekNumber: 14,
    specialty: 'Surgery',
    displayName: 'WK14 - Surgery',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w15-endocrinology',
    weekNumber: 15,
    specialty: 'Endocrinology',
    displayName: 'WK15 - Endocrinology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w16-hepatology',
    weekNumber: 16,
    specialty: 'Hepatology',
    displayName: 'WK16 - Hepatology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w17-medicine',
    weekNumber: 17,
    specialty: 'Medicine',
    displayName: 'WK17 - Medicine',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w18-paediatrics',
    weekNumber: 18,
    specialty: 'Paediatrics and Child Health',
    displayName: 'WK18 - Paediatrics and Child Health',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w19-dermatology',
    weekNumber: 19,
    specialty: 'Dermatology',
    displayName: 'WK19 - Dermatology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w20-medicine',
    weekNumber: 20,
    specialty: 'Medicine',
    displayName: 'WK20 - Medicine',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w21-ophthalmology',
    weekNumber: 21,
    specialty: 'Ophthalmology',
    displayName: 'WK21 - Ophthalmology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w22-ophthalmology',
    weekNumber: 22,
    specialty: 'Ophthalmology',
    displayName: 'WK22 - Ophthalmology',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w23-neurosurgery',
    weekNumber: 23,
    specialty: 'Neurosurgery',
    displayName: 'WK23 - Neurosurgery',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w24-psychiatry',
    weekNumber: 24,
    specialty: 'Psychiatry',
    displayName: 'WK24 - Psychiatry',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w25-orthopaedics',
    weekNumber: 25,
    specialty: 'Orthopaedics',
    displayName: 'WK25 - Orthopaedics',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w26-paediatrics-ent',
    weekNumber: 26,
    specialty: 'Paediatrics (ENT)',
    displayName: 'WK26 - Paediatrics (ENT)',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w27-ent-surgery',
    weekNumber: 27,
    specialty: 'ENT Surgery',
    displayName: 'WK27 - ENT Surgery',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
  {
    id: 'w28-plastic-surgery',
    weekNumber: 28,
    specialty: 'Plastic Surgery',
    displayName: 'WK28 - Plastic Surgery',
    hasLearningObjectives: false,
    loCount: 0,
    hasLoQuestions: false,
    loQuestionCount: 0,
    cases: []
  },
]

export function getYear3WeekById(weekId: string): WeekData | undefined {
  return year3Weeks.find(w => w.id === weekId)
}

export function getYear4WeekById(weekId: string): WeekData | undefined {
  return year4Weeks.find(w => w.id === weekId)
}

// Legacy export for backward compatibility
export function getWeekById(weekId: string): WeekData | undefined {
  return getYear3WeekById(weekId) || getYear4WeekById(weekId)
}
