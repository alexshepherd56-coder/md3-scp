import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const casesDir = path.resolve(__dirname, '../src/cases')
const outputFile = path.resolve(__dirname, '../src/data/questionIndex.json')

interface QuestionData {
  caseId: string
  questionNumber: number
  questionText: string
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const frontmatter: Record<string, string> = {}
  const lines = match[1].split('\n')

  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim()
      let value = line.substring(colonIndex + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      frontmatter[key] = value
    }
  }

  return frontmatter
}

function extractQuestions(content: string, caseId: string): QuestionData[] {
  const questions: QuestionData[] = []

  // Match CaseQuestion with number and question props
  // Try double quotes
  const regexDouble = /<CaseQuestion\s+number=\{(\d+)\}\s+question="([^"]+)"/g
  let match
  while ((match = regexDouble.exec(content)) !== null) {
    questions.push({
      caseId,
      questionNumber: parseInt(match[1]),
      questionText: match[2]
    })
  }

  // Try single quotes
  const regexSingle = /<CaseQuestion\s+number=\{(\d+)\}\s+question='([^']+)'/g
  while ((match = regexSingle.exec(content)) !== null) {
    questions.push({
      caseId,
      questionNumber: parseInt(match[1]),
      questionText: match[2]
    })
  }

  // Try with template literals
  const regexTemplate = /<CaseQuestion\s+number=\{(\d+)\}\s+question=\{`([^`]+)`\}/g
  while ((match = regexTemplate.exec(content)) !== null) {
    questions.push({
      caseId,
      questionNumber: parseInt(match[1]),
      questionText: match[2]
    })
  }

  return questions
}

if (!fs.existsSync(casesDir)) {
  console.error(`Cases directory not found: ${casesDir}`)
  process.exit(1)
}

const outputDir = path.dirname(outputFile)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const mdxFiles = fs.readdirSync(casesDir).filter((f) => f.endsWith('.mdx')).sort()

console.log(`\nProcessing ${mdxFiles.length} MDX files for question index...\n`)

// Store as a map: { "caseId-qN": "question text" }
const questionIndex: Record<string, string> = {}

let totalQuestions = 0

for (const file of mdxFiles) {
  const filePath = path.join(casesDir, file)
  const content = fs.readFileSync(filePath, 'utf-8')

  // Parse case ID from filename
  let caseId: string
  if (file.startsWith('y4_case')) {
    // Year 4: y4_case1_1.mdx -> y4.1_1
    caseId = file.replace('.mdx', '').replace('y4_case', 'y4.')
  } else {
    // Year 3: case1_1.mdx -> 1.1
    caseId = file.replace('.mdx', '').replace('case', '').replace('_', '.')
  }

  const questions = extractQuestions(content, caseId)

  for (const q of questions) {
    const key = `${q.caseId}-q${q.questionNumber}`
    questionIndex[key] = q.questionText
    totalQuestions++
  }
}

fs.writeFileSync(outputFile, JSON.stringify(questionIndex, null, 2), 'utf-8')

console.log(`Generated question index at: ${outputFile}`)
console.log(`   ${totalQuestions} questions indexed\n`)
