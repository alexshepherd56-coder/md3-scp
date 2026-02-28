import type { SAQQuestion, ExamInfo } from '@/types/exam'

// 2024 SAQ Exam - 35 Questions
export const saq2024Questions: SAQQuestion[] = [
  {
    id: 1,
    text: 'All probable and definitive cases of pertussis are notifiable in Australia',
    subQuestions: [
      'a. What clinical features must be present to make the diagnosis pertussis probable?',
      'b. What is another finding that in addition to the probable diagnosis of pertussis (based on clinical features) would make the diagnosis of pertussis definitive?',
      'c. What changed in pertussis vaccination schedule in 2015 to for the protection of children or improve immunity in children?',
      'd. What are 2 other changes that occurred to reduce morbidity and mortality associated with pertussis, specifically in infants less than 3 months?',
      'e. Interpret graph on pertussis notification rates in 2018-2020, Give 3 findings?',
      'f. What 4 public health personal hygiene factors were implemented in 2020 that explains the reduction rates of pertussis? (with reference to COVID-19 pandemic)',
      'g. Absolute contraindication to pertussis vaccine'
    ]
  },
  {
    id: 2,
    text: 'ESKD Graph and analysis (Repeat Q of 2023)',
    subQuestions: [
      'a. What is the epidemiological measure that is used in this graph?',
      'b. What are 3 trends?',
      'c. What are 2 underlying reasons for the distribution of Indigenous ESKD in the remote region?'
    ]
  },
  {
    id: 3,
    text: 'Graph showing highest expenditure drugs from PBS, top 2 drugs were rosuvastatin and atorvastatin',
    subQuestions: [
      'a. What CV risk factor does the highest expenditure drug (rosuvastatin) address?',
      'b. What are 4 personal preventable lifestyle factors that can reduce CVD risk and also contribute to a high disease burden?'
    ]
  },
  {
    id: 4,
    text: 'Shared decision making',
    subQuestions: [
      'a. What are 2 features of shared decision-making?',
      'b. What are 5 benefits of shared-decision making?'
    ]
  },
  {
    id: 5,
    text: 'A patient comes in with face lacerations, an image of the laceration needs to be sent to the surgeon for review to determine the urgency of the management. The patient has already consented to taking and sending the image to the surgeon.',
    subQuestions: [
      'a. What are 3 things you need to consider before taking a clinical image (for a face laceration image)?',
      'b. What 2 things would you do once the image has been taken?'
    ]
  },
  {
    id: 6,
    text: "A 22 year old woman comes for a checkup at the GP after surgery. Surgery went well and there are no problems. She hasn't seen the GP in 3 years.",
    subQuestions: [
      'a. What are 2 opportunistic preventative things the GP could do? How would the GP explain the benefit of these (4 marks)'
    ]
  },
  {
    id: 7,
    text: 'What are 4 things that could suggest sexual abuse in a child?',
    subQuestions: []
  },
  {
    id: 8,
    text: 'Mental Health Act: Involuntary admission',
    subQuestions: [
      'a. 3 things a doctor must consider about a patient before admitting?',
      'b. 4 rights of involuntary admitted patients in addition to the rights all mental health patients have?',
      'c. 2 kinds of treatment there needs to be extra consent for despite involuntary admission'
    ]
  },
  {
    id: 9,
    text: 'Drug seeking behaviour',
    subQuestions: [
      'a. 4 kinds of drug seeking behaviour besides anger and aggression?',
      'b. 2 most sought after drugs of dependence?',
      'c. 2 things put in place by practices / GPs to reduce drug seeking behaviour?'
    ]
  },
  {
    id: 10,
    text: 'A child is brought into ED 30 minutes after being bitten on the ankle by a Snake',
    subQuestions: [
      'a. List 5 questions you would ask the parents in your History.',
      'b. What are 3 steps in the management of this child?',
      'c. What are 3 exam findings you would expect for a child bitten by a snake?'
    ]
  },
  {
    id: 11,
    text: 'A patient with a diagnosis of Bipolar is brought to the ED by the police.',
    subQuestions: [
      'a. List 2 physical signs of mania in a patient with bipolar disorder',
      'b. List 3 collateral questions to ask their family members'
    ]
  },
  {
    id: 12,
    text: 'Woman with PID',
    subQuestions: [
      'a. List 4 examination/investigation findings you would expect in a person with PID'
    ]
  },
  {
    id: 13,
    text: "Patient presented to her GP a few weeks ago with fatigue, she thinks she is iron deficient, but blood tests return normal. She returns today distressed and can't sleep. She becomes teary during the consultation.",
    subQuestions: [
      'a. List 4 Differential Diagnoses for this presentation'
    ]
  },
  {
    id: 14,
    text: 'A patient is having withdrawal symptoms from heroin and wants your help.',
    subQuestions: [
      'a. What are two questions you would ask the patient when taking the history?',
      'b. What is the MOA buprenorphine and how can it help this patient?',
      'c. What are 2 considerations you must make before starting this patient on Buprenorphine.'
    ]
  },
  {
    id: 15,
    text: 'Healthy 22 years female patient comes into GP post-surgery, otherwise well.',
    subQuestions: [
      'a. What 2x preventative things could you offer and how would you explain the benefit of each one to the patient?'
    ]
  },
  {
    id: 16,
    text: 'Mother who is 34 weeks pregnant presents to hospital with HTN, proteinuria and epigastric pain.',
    subQuestions: [
      'a. List 4 clinical examination findings.',
      'b. What is the most likely diagnosis in this patient?',
      'c. What are 2 fetal complications of this diagnosis?',
      'd. What are 2 maternal complications of this diagnosis?'
    ]
  },
  {
    id: 17,
    text: 'Refugee presents to a GP seeking help for depression and low mood.',
    subQuestions: [
      'a. What are 4 history Questions to assess high risk for suicide in the same day'
    ]
  },
  {
    id: 18,
    text: 'Rhesus negative mother G1P0',
    subQuestions: [
      'a. List some situations when she would need Anti-D?',
      'b. When during pregnancy is anti-D prophylaxis Given?'
    ]
  },
  {
    id: 19,
    text: 'Pregnant woman 8 weeks of gestation, positive home pregnancy test, with bleeding and lower abdo pain.',
    subQuestions: [
      'a. List 4 Differential Diagnoses'
    ]
  },
  {
    id: 20,
    text: 'Patients present for their first antenatal check-up at 8 weeks gestation, confirmed intrauterine pregnancy on ultrasound. All initial antenatal screening was negative.',
    subQuestions: [
      'a. What are 6 screening things done routinely throughout pregnancy for preventative healthcare (not including initial blood test at the first visit like Hep B, C etc)'
    ]
  },
  {
    id: 21,
    text: 'Man comes in with a palpable groin mass. On examination, there is a 2cm palpable lymph node in the right groin.',
    subQuestions: [
      'a. List 4 DDx for Lymphadenopathy Specifically',
      'b. What is the gold standard Investigation for lymphadenopathy?',
      'c. List 3 other sites that would need to be examined.'
    ]
  },
  {
    id: 22,
    text: '39F comes in for a repeat COCP. She has been on it for years and happy to continue',
    subQuestions: [
      'a. What are 4 contraindications to the COCP?',
      'b. What are 4 lower-risk alternatives to the COCP?'
    ]
  },
  {
    id: 23,
    text: 'Patient is being administered zoledronic acid by a nurse, who steps out into another room, you are the medical student, and you notice they are suddenly pale and coughing.',
    subQuestions: [
      'a. What is your Diagnosis?'
    ]
  },
  {
    id: 24,
    text: 'Liver CT',
    subQuestions: [
      'a. List 2 features on this CT',
      'b. What is your leading Differential Diagnosis?'
    ]
  },
  {
    id: 25,
    text: 'Patient presents with haematemesis and dark tarry stools, hepatosplenomegaly. Blood tests results given: Low Hb, MCV high, Thrombocytopenia, Low albumin, AST = 86 (5-35), ALT = 122 (5-35)',
    subQuestions: [
      'a. Why is the patient tired & why do they have oedema?',
      'b. What 3 aspects of social history would you inquire about in order to determine the diagnosis?',
      'c. What is the significance of their raised AST/ALT?'
    ]
  },
  {
    id: 26,
    text: 'Patient case painting a picture of nephrotic syndrome, which includes examination findings and some blood tests (24hr urine = 4g protein, hypertensive, 4 RBCs in urine, fatty casts in urine, total cholesterol = 8, oedema to shin and periorbital).',
    subQuestions: [
      'a. 4 DDx',
      'b. 3 Ix',
      'c. 3 Mx',
      'd. 2 complications untreated'
    ]
  },
  {
    id: 27,
    text: 'A 3 year old Child UTI',
    subQuestions: [
      'a. 4 risks for UTI in Children',
      'b. 3 Common organisms that cause UTI in children',
      'c. What Ix would you order in a child with recurrent UTIs - Justify each Ix.'
    ]
  },
  {
    id: 28,
    text: 'Patient is 3 days post hemi-colectomy and has started on PO fluids. Has developed abdominal pain, guarding, afebrile, and constipation, and urine output is XXX ml/hr (was it 10ml?) in the last 2 hours.',
    subQuestions: [
      'a. 4 DDx',
      'b. 6 immediate Mx'
    ]
  },
  {
    id: 29,
    text: 'Nurse calls you to review a patient in a nursing home who has started acting confused 24-48h of Symptoms. Nurse thinks the patient has delirium.',
    subQuestions: [
      'a. List 4 DDx'
    ]
  },
  {
    id: 30,
    text: '42 yo male with painless non-febrile haematuria, on aspirin, beta-blocker, ACE-I. Nonsmoker, does not drink.',
    subQuestions: [
      'a. List 5 DDx',
      'b. List 5 Ix'
    ]
  },
  {
    id: 31,
    text: 'Mother brings her child in who she felt was hot, then developed a seizure.',
    subQuestions: [
      'a. List 4 aspects of the history that indicate it was a simple febrile seizure',
      'b. List 3-5 Mx steps'
    ]
  },
  {
    id: 32,
    text: 'Patient is a few days post radical prostatectomy, and develops SOB and distress a few hours ago.',
    subQuestions: [
      'a. List 4 causes',
      'b. Give 6 questions on history that would differentiate the cause.'
    ]
  },
  {
    id: 33,
    text: 'Case with a 2-year-old child who is dehydrated - slightly sunken eyes, decreased alertness but easily arousable, cap refill 2sec, dry mucous membranes, normal BP, HR and RR.',
    subQuestions: [
      'a. List 4 assessment categories that determine their hydration status.',
      'b. Does the child have Mild, Moderate or Severe Hydration & Why?'
    ]
  },
  {
    id: 34,
    text: '45-year-old presents multiple swollen joints in hands, MCP, PIP, symmetrical, worse in the morning.',
    subQuestions: [
      'a. What are the 4 most likely diagnoses?',
      'b. What are 6 investigations you would order?'
    ]
  },
  {
    id: 35,
    text: 'Mental Health',
    subQuestions: [
      'a. List 5 features of PTSD'
    ]
  }
]

// 2023 SAQ Exam - 38 Questions
export const saq2023Questions: SAQQuestion[] = [
  {
    id: 1,
    text: 'My Health Record',
    subQuestions: [
      'a. 2 acts of legislation',
      'b. 5 benefits of shared electronic records',
      'c. 5 disadvantages of shared electronic records'
    ]
  },
  {
    id: 2,
    text: 'Graph comparing prevalence of ESKD in Australia between Indigenous and non-Indigenous and based on remoteness in 2017',
    subQuestions: [
      'a. What is the epidemiological measure that is used in this graph?',
      'b. What are 3 trends?',
      'c. What are 2 underlying reasons for the distribution of Indigenous ESKD in the remote region?'
    ]
  },
  {
    id: 3,
    text: 'Graph comparing BMI of individuals aged 18 and over from 1995 to 2017/18',
    subQuestions: [
      'a. What are 2 changes to the modal BMI between the years?',
      'b. What changed in the normal weight group',
      'c. What changed in the obese weight group',
      'd. Give 2 population level personal reasons for these changes'
    ]
  },
  {
    id: 4,
    text: 'Graph showing highest expenditure drugs.',
    subQuestions: [
      'a. What CV risk factor does the highest expenditure drug (rosuvastatin) address?',
      'b. What are 4 preventable lifestyle factors that can reduce CVD risk and also contribute to a high disease burden?'
    ]
  },
  {
    id: 5,
    text: 'Pertussis question',
    subQuestions: [
      'a. What changed to pertussis vaccination schedule in 2015?',
      'b. What clinical feature must be present to consider pertussis?',
      'c. What is another clinical feature that makes pertussis definitive?',
      'd. What are 2 other changes that occurred to reduce severe pertussis?',
      'e. What is an absolute contraindication to the acellular pertussis vaccine'
    ]
  },
  {
    id: 6,
    text: 'What are five things legally required in GP notes (National Health Practitioner Law)?',
    subQuestions: []
  },
  {
    id: 7,
    text: 'Shared decision making',
    subQuestions: [
      'a. What are 2 features of shared decision-making?',
      'b. What are 5 benefits of shared-decision making?'
    ]
  },
  {
    id: 8,
    text: 'List 4 manifestations of growing up exposed to domestic violence that you may see in an adolescent/young adult?',
    subQuestions: []
  },
  {
    id: 9,
    text: "Scenario where mother brings her young daughter into GP - note rashes & other injuries. Mother says the child has been abused by father. Need to explain to medical student colleague why doctor-patient confidentiality can be breached in this situation (2 marks)",
    subQuestions: []
  },
  {
    id: 10,
    text: 'Scenario where on-call consultant wants you to take a clinical image of a face laceration.',
    subQuestions: [
      'a. What are 3 things you need to consider (general principles) before taking a clinical image?',
      'b. What 2 things would you do once the image has been taken?'
    ]
  },
  {
    id: 11,
    text: "35 year old woman comes for a checkup at the GP after surgery. Surgery went well and there are no problems. She hasn't seen the GP in 3 years.",
    subQuestions: [
      'a. What are 2 opportunistic preventative things the GP could do? (2 marks)',
      'b. Explain how the GP could explain the benefits of each item (2 marks)'
    ]
  },
  {
    id: 12,
    text: '20 year old woman presents to the GP seeking a prescription of COCP. She has had unprotected sex for the past 2 weeks. What are 5 things to screen for before prescribing the pill.',
    subQuestions: []
  },
  {
    id: 13,
    text: '25-year-old has type I diabetes diagnosed 10 years ago. What are 5 reasons why they might find it difficult to attend their multidisciplinary care appointments/treatments?',
    subQuestions: []
  },
  {
    id: 14,
    text: '4 characteristics of body dysmorphia',
    subQuestions: []
  },
  {
    id: 15,
    text: 'Hypertensive urgency (aortic dissection) >190 systolic',
    subQuestions: [
      'a. 3 pharmacological treatments to start'
    ]
  },
  {
    id: 16,
    text: 'G2P2 woman presents at 34 weeks gestation with reduced foetal movements, heavy bleeding and on examination had tender rigid abdomen (uterus?) pain in epigastric region, tense and rigid abdomen',
    subQuestions: [
      'a. Diagnosis',
      'b. 5 steps in initial management'
    ]
  },
  {
    id: 17,
    text: 'Patient comes in feeling tired and complaining of weight gain. You suspect hypothyroidism.',
    subQuestions: [
      'a. What are 4 history questions for hypothyroidism?',
      'b. 4 exam findings'
    ]
  },
  {
    id: 18,
    text: '30-year-old woman presents 2 weeks post birth with rigors, fever and chills, and her left breast is red and hot to touch.',
    subQuestions: [
      'a. What is the diagnosis',
      'b. Outline her management (6 things)'
    ]
  },
  {
    id: 19,
    text: '85yo man with short term memory loss, disoriented, MMSE 23/30, no loss of attention',
    subQuestions: [
      'a. 3 investigations',
      'b. 2 differentials'
    ]
  },
  {
    id: 20,
    text: 'Schizophrenia',
    subQuestions: [
      'a. 4 negative symptoms of schizophrenia (2 marks)',
      'b. How to manage (4 marks)'
    ]
  },
  {
    id: 21,
    text: 'A child has many findings of bacterial meningitis and CSF microscopy shows gram negative diplococci.',
    subQuestions: [
      'a. Give 3 causative organisms',
      'b. What are 2 empiric antibiotics',
      'c. 5 features of respiratory distress in the newborn'
    ]
  },
  {
    id: 22,
    text: '30 year old woman was taking psychotropic drugs for a mental disorder. 1 year later, she visits the psychiatrist and complains of 6 months of amenorrhea and 2 months of galactorrhea.',
    subQuestions: [
      'a. 4 investigations',
      'b. Diagnosis',
      'c. Management (4 marks)'
    ]
  },
  {
    id: 23,
    text: '30-year-old woman with curd-like vaginal discharge with pruritus and vulval pain.',
    subQuestions: [
      'a. Diagnosis (1 mark)',
      'b. Management (3 marks)'
    ]
  },
  {
    id: 24,
    text: 'Women has recently been diagnosed with osteopaenia',
    subQuestions: [
      'a. 4 risk factors',
      'b. 4 things GP should discuss with the patient'
    ]
  },
  {
    id: 25,
    text: 'What are 6 drugs for unstable angina',
    subQuestions: []
  },
  {
    id: 26,
    text: 'What are 6 side effects of olanzapine',
    subQuestions: []
  },
  {
    id: 27,
    text: 'Woman has jaundice and 6 day malaise. Bilirubin is raised, AST & ALT just above normal range, ALP more than 2x normal range. No GGT given. Urinalysis shows negative urobilinogen',
    subQuestions: [
      'a. What is the diagnosis?',
      'b. Explain your reasoning (2 marks)'
    ]
  },
  {
    id: 28,
    text: '4 discussion points on lithium toxicity at a GP to ensure they stay well',
    subQuestions: []
  },
  {
    id: 29,
    text: 'Febrile convulsion 1 day hx of fever, 15 min generalised tonic clonic, still seizing. 4 things in management',
    subQuestions: []
  },
  {
    id: 30,
    text: 'A 53-year-old female presents with pleuritic chest pain, SOB and tachycardia (HR>100). Her creatine is has elevated (160mmol/L) and she has an eGFR of <35, but otherwise normal vitals. Chest Xray is normal. She has several medical conditions (SLE, hypertension, CKD) and is on several medications including OCP, thiazide, diflofenac and ramipril',
    subQuestions: [
      'a. What criteria can be used to gauge if she has pulmonary embolism?',
      'b. What probability is she of a PE?',
      'c. What investigation would you do next?',
      'd. What 2 imaging studies can you do?'
    ]
  },
  {
    id: 31,
    text: 'What are 4 risk factors for development of gallstones',
    subQuestions: []
  },
  {
    id: 32,
    text: 'Man has not passed flatus in 2 days. Xray & CT provided (showing small bowel obstruction - valvulae conniventes & centrally located).',
    subQuestions: [
      'a. What are 3 features that can be seen on imaging',
      'b. What is your diagnosis'
    ]
  },
  {
    id: 33,
    text: 'Patient has just given birth and after the placenta is delivered she is bleeding profusely. What are 4 reasons this may be happening?',
    subQuestions: []
  },
  {
    id: 34,
    text: '6 differentials for post menopausal bleeding not on HRT (last menstrual period 5 years ago)',
    subQuestions: []
  },
  {
    id: 35,
    text: 'Patient has fractured his femur. What are 6 possible complications of long bone fractures?',
    subQuestions: []
  },
  {
    id: 36,
    text: 'Post splenectomy',
    subQuestions: [
      'a. What is the key risk? (long term risk)',
      'b. What are three key considerations of management (outside peri-operative care)'
    ]
  },
  {
    id: 37,
    text: 'Four advantages of laparoscopic surgery vs open surgery for appendectomy',
    subQuestions: []
  },
  {
    id: 38,
    text: 'Man with hypertension has started medications for it but is still hypertensive when coming back to the GP six months later. What are three reasons this may be?',
    subQuestions: []
  }
]

// 2022 SAQ Exam - 39 Questions
export const saq2022Questions: SAQQuestion[] = [
  {
    id: 1,
    text: 'Graph comparing prevalence of ESKD in Australia between Indigenous and non-Indigenous and based on remoteness in 2017',
    subQuestions: [
      'a. What is the epidemiological measure that is used in this graph?',
      'b. What are 3 trends?',
      'c. What are 2 underlying reasons for the trends?'
    ]
  },
  {
    id: 2,
    text: 'Graph comparing BMI of individuals aged 18 and over from 1995 to 2017/18',
    subQuestions: [
      'a. What are 2 changes between the years?',
      'b. What changed in the normal weight group?',
      'c. What changed in the obese weight group?',
      'd. Give 2 population level personal reasons for these changes',
      'e. What is the modal change in the two groups?'
    ]
  },
  {
    id: 3,
    text: "Outline 3 questions to determine how obesogenic someone's home environment is",
    subQuestions: []
  },
  {
    id: 4,
    text: 'Previous question about eczema and probiotics',
    subQuestions: [
      'a. Give the PICO break down of the question',
      'b. Interpret the pooled relative risk of 0.74'
    ]
  },
  {
    id: 5,
    text: 'Interpret graph on pertussis notification rates in 2018-2020',
    subQuestions: [
      'a. Give 3 findings',
      'b. What changed to pertussis vaccination schedule in 2015?',
      'c. What clinical feature makes pertussis diagnosis probable?',
      'd. What makes it confirmed?',
      'e. What are 2 other changes that occured to reduce severe pertussis?',
      'f. What is an absolute contraindication to the acellular pertussis vaccine'
    ]
  },
  {
    id: 6,
    text: '4 things to brief a translator on before consult with mother and son who recently immigrated from Ukraine',
    subQuestions: []
  },
  {
    id: 7,
    text: 'Involuntary admission',
    subQuestions: [
      'a. 3 things a doctor must consider about a patient before admitting',
      'b. 4 rights of involuntary admitted patients',
      'c. 2 kinds of treatment there needs to be extra consent for despite involuntary admission'
    ]
  },
  {
    id: 8,
    text: "4 situations where it's okay to breach confidentiality",
    subQuestions: []
  },
  {
    id: 9,
    text: 'Define impairment of a doctor and name 3 other types of notifiable conduct',
    subQuestions: []
  },
  {
    id: 10,
    text: 'Drug seeking behaviour',
    subQuestions: [
      'a. 4 kinds of drug seeking behaviour besides anger and aggression',
      'b. 2 most sought after drugs of dependence',
      'c. 2 things put in place by practices / GPS to reduce drug seeking behaviour'
    ]
  },
  {
    id: 11,
    text: 'Morbid obese women, what are 4 obesogenic factors in her home',
    subQuestions: []
  },
  {
    id: 12,
    text: '6 side effects of olanzapine',
    subQuestions: []
  },
  {
    id: 13,
    text: '7 patient factors that led to wound infection and dehiscence',
    subQuestions: []
  },
  {
    id: 14,
    text: '4 things to discuss with patient on lithium after relapse to ensure they stay well',
    subQuestions: []
  },
  {
    id: 15,
    text: 'A child has many findings of bacterial meningitis and CSF microscopy shows gram negative diplococci.',
    subQuestions: [
      'a. Give 3 causative organisms for this bacterial meningitis',
      'b. Give 2 empiric antibiotic treatments'
    ]
  },
  {
    id: 16,
    text: 'Xray of bony lesion on tibia',
    subQuestions: [
      'a. Give the 2 xray findings',
      'b. Most likely diagnosis: osteosarcoma'
    ]
  },
  {
    id: 17,
    text: 'Situation where lady is described as giving the PE',
    subQuestions: [
      'a. What is the criteria used to assess probability and what is her probability',
      'b. What is your next step in investigation',
      'c. What are 2 imaging tests to diagnose'
    ]
  },
  {
    id: 18,
    text: '4 clinical features of moderate to severe aortic regurg',
    subQuestions: []
  },
  {
    id: 19,
    text: '4 features of post strep GN (lab and/or clinical) and 4 non glomerular differentials of hematuria in a kid',
    subQuestions: []
  },
  {
    id: 20,
    text: '4 risk factors for diabetic nephropathy in a diabetic and 4 clinical features',
    subQuestions: []
  },
  {
    id: 21,
    text: 'Biggest risk factor post splenectomy and 3 things put in place to manage this risk',
    subQuestions: []
  },
  {
    id: 22,
    text: '5 immediate management points for lady presenting at 29 weeks in contractions 5 minutes apart, closed cervix, in a rural hospital',
    subQuestions: []
  },
  {
    id: 23,
    text: 'Child had afebrile seizure and signs of increased ICP 3 months after bacterial meningitis.',
    subQuestions: [
      'a. What is the diagnosis',
      'b. 2 long-term sequelae not already mentioned/complications that can occur'
    ]
  },
  {
    id: 24,
    text: 'Man with short memory loss, MMSE 23/30, no loss of attention',
    subQuestions: [
      'a. Give 3 investigations',
      'b. 3 differentials'
    ]
  },
  {
    id: 25,
    text: 'Woman presenting with nightmares and trouble sleeping after car accident 6 months ago',
    subQuestions: [
      'a. 4 differentials',
      'b. 4 questions to clarify provisional diagnosis'
    ]
  },
  {
    id: 26,
    text: '2 types of gallstones',
    subQuestions: [
      'a. What type is most common',
      'b. 4 risk factors for gallstones',
      'c. 4 complications'
    ]
  },
  {
    id: 27,
    text: '6 differentials for post menopausal bleeding not on HRT',
    subQuestions: []
  },
  {
    id: 28,
    text: 'Immediate hormonal treatment for menorrhagia and 6 long term treatments',
    subQuestions: []
  },
  {
    id: 29,
    text: '25yr old male with back pain on background of sickle cell Anemia',
    subQuestions: [
      'a. What is the pathophysiology (2marks)?',
      'b. What are the key goals of management for this admission?(3marks)'
    ]
  },
  {
    id: 30,
    text: '4 causative organisms of acute watery diarrhea in a six month old',
    subQuestions: []
  },
  {
    id: 31,
    text: 'Patient with Cushings disease due to prolonged corticosteroid intake.',
    subQuestions: [
      'a. Two other causes other than iatrogenic',
      'b. What steroid would you give for treatment?',
      'c. Tests to confirm provisional diagnosis (2 marks)?'
    ]
  },
  {
    id: 32,
    text: 'List the 4 stages of smoking cessation',
    subQuestions: []
  },
  {
    id: 33,
    text: 'X-Ray and CT of SBO.',
    subQuestions: [
      'a. Describe the features on the X-ray and CT',
      'b. Whats the Dx.'
    ]
  },
  {
    id: 34,
    text: 'Pleuritic chest pain, SOB of 53F with SLE...',
    subQuestions: [
      'a. What criteria can be used to gauge her PE?',
      'b. What probability is she of PE?',
      'c. What investigation to do next?',
      'd. What 2 imaging can you do?'
    ]
  },
  {
    id: 35,
    text: 'Evidence of benefits of ACE inhibitors in the treatment of heart failure',
    subQuestions: []
  },
  {
    id: 36,
    text: 'What are 5 clinical features that are suspicious of breast cancer?',
    subQuestions: []
  },
  {
    id: 37,
    text: 'What are 5 Risk factors for breast cancer aside from FHx, age, gender',
    subQuestions: []
  },
  {
    id: 38,
    text: 'A woman presents with acute minimal haematemesis...',
    subQuestions: [
      'a. Why is she tired & odematous?',
      'b. What 3 aspects of the social history would you inquire about in order to determine the diagnosis?'
    ]
  },
  {
    id: 39,
    text: 'Child with positive gram negative cocci on CSF...3 months later presents with seizure.',
    subQuestions: [
      'a. What is your diagnosis (1mark)?',
      'b. What are two other long term sequale of the condition (2marks)?'
    ]
  }
]

// Exam metadata for Year 3 SAQs
export const year3SAQExams: ExamInfo[] = [
  {
    id: 'saq-2024',
    year: 2024,
    type: 'saq',
    title: '2024 Summative SAQ',
    questionCount: 35
  },
  {
    id: 'saq-2023',
    year: 2023,
    type: 'saq',
    title: '2023 Summative SAQ',
    questionCount: 38
  },
  {
    id: 'saq-2022',
    year: 2022,
    type: 'saq',
    title: '2022 Summative SAQ',
    questionCount: 39
  }
]

// Helper function to get questions by exam ID
export function getSAQQuestions(examId: string): SAQQuestion[] {
  switch (examId) {
    case 'saq-2024':
      return saq2024Questions
    case 'saq-2023':
      return saq2023Questions
    case 'saq-2022':
      return saq2022Questions
    default:
      return []
  }
}
