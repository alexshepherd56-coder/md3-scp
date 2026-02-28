import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const casesDir = path.resolve(__dirname, '../src/cases')
const outputFile = path.resolve(__dirname, '../src/data/searchIndex.json')

interface SearchableCase {
  id: string
  title: string
  category: string
  discipline: string
  setting: string
  content: string // Combined searchable text
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
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      frontmatter[key] = value
    }
  }

  return frontmatter
}

function extractTextContent(content: string): string {
  // Remove frontmatter
  let text = content.replace(/^---\n[\s\S]*?\n---\n?/, '')

  // Remove import statements
  text = text.replace(/^import\s+.*?;?\s*$/gm, '')

  // Extract questions and answers from CaseQuestion components
  const questions: string[] = []
  const questionRegex = /<CaseQuestion[^>]*question="([^"]*)"[^>]*>([\s\S]*?)<\/CaseQuestion>/g
  let match

  while ((match = questionRegex.exec(text)) !== null) {
    questions.push(match[1]) // The question text
    questions.push(match[2]) // The answer content
  }

  // Also try with single quotes
  const questionRegexSingle = /<CaseQuestion[^>]*question='([^']*)'[^>]*>([\s\S]*?)<\/CaseQuestion>/g
  while ((match = questionRegexSingle.exec(text)) !== null) {
    questions.push(match[1])
    questions.push(match[2])
  }

  // Also try with curly braces (JSX expressions)
  const questionRegexJsx = /<CaseQuestion[^>]*question=\{["`']([^"`']*)["`']\}[^>]*>([\s\S]*?)<\/CaseQuestion>/g
  while ((match = questionRegexJsx.exec(text)) !== null) {
    questions.push(match[1])
    questions.push(match[2])
  }

  // Remove all JSX/HTML tags but keep the text content
  text = text.replace(/<[^>]+>/g, ' ')

  // Remove markdown formatting but keep text
  text = text.replace(/[#*_`~]/g, ' ')
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // Images

  // Clean up HTML entities
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#\d+;/g, ' ')

  // Add extracted questions
  text = text + ' ' + questions.join(' ')

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim()

  return text
}

if (!fs.existsSync(casesDir)) {
  console.error(`Cases directory not found: ${casesDir}`)
  process.exit(1)
}

// Ensure output directory exists
const outputDir = path.dirname(outputFile)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const mdxFiles = fs.readdirSync(casesDir).filter((f) => f.endsWith('.mdx')).sort()

console.log(`\nProcessing ${mdxFiles.length} MDX files for search index...\n`)

const searchData: SearchableCase[] = []

for (const file of mdxFiles) {
  const filePath = path.join(casesDir, file)
  const content = fs.readFileSync(filePath, 'utf-8')

  const frontmatter = parseFrontmatter(content)
  const textContent = extractTextContent(content)

  // Parse case ID from filename (case1_1.mdx -> 1.1)
  const caseId = file.replace('.mdx', '').replace('case', '').replace('_', '.')

  searchData.push({
    id: caseId,
    title: frontmatter.title?.replace(' | MD3 SCP Cases', '') || '',
    category: frontmatter.category || '',
    discipline: frontmatter.discipline || '',
    setting: frontmatter.setting || '',
    content: textContent
  })
}

fs.writeFileSync(outputFile, JSON.stringify(searchData, null, 2), 'utf-8')

console.log(`Generated search index at: ${outputFile}`)
console.log(`   ${searchData.length} cases indexed\n`)
