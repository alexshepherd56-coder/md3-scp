import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface CaseMetadata {
  id: string
  title: string
  category: string
  discipline: string
  setting: string
}

function extractMetadata(html: string): CaseMetadata | null {
  //Extract title from <title> tag
  const titleMatch = html.match(/<title>Case ([\d.]+) - (.+?)<\/title>/)
  if (!titleMatch) return null

  const id = titleMatch[1]
  const title = titleMatch[2]

  // Extract metadata from <p class="meta">
  const metaMatch = html.match(
    /<p class="meta"><strong>Category:<\/strong>\s*(.+?)\s*\|\s*<strong>Discipline:<\/strong>\s*(.+?)\s*\|\s*<strong>Setting:<\/strong>\s*(.+?)<\/p>/
  )

  if (!metaMatch) return null

  return {
    id,
    title,
    category: metaMatch[1].trim(),
    discipline: metaMatch[2].trim(),
    setting: metaMatch[3].trim(),
  }
}

function extractCaseDescription(html: string): string {
  // Extract content between <h2>Case</h2> and <h2>Questions</h2>
  const caseMatch = html.match(
    /<h2>Case<\/h2>\s*<p>(.+?)<\/p>\s*(?=<h2>Questions<\/h2>)/s
  )
  return caseMatch ? caseMatch[1].trim() : ''
}

function htmlToMdx(html: string): string {
  // Replace HTML tags with MDX/Markdown equivalents
  let mdx = html

  // Replace paragraph tags
  mdx = mdx.replace(/<p>/g, '\n\n').replace(/<\/p>/g, '')

  // Replace strong tags
  mdx = mdx.replace(/<strong>/g, '**').replace(/<\/strong>/g, '**')

  // Replace em/italic tags
  mdx = mdx.replace(/<em>/g, '*').replace(/<\/em>/g, '*')

  // Replace unordered lists
  mdx = mdx.replace(/<ul>/g, '\n').replace(/<\/ul>/g, '\n')
  mdx = mdx.replace(/<li>/g, '- ').replace(/<\/li>/g, '\n')

  // Replace ordered lists
  mdx = mdx.replace(/<ol>/g, '\n').replace(/<\/ol>/g, '\n')

  // Clean up excessive newlines
  mdx = mdx.replace(/\n{3,}/g, '\n\n')

  return mdx.trim()
}

function extractQuestions(html: string): Array<{ number: number; question: string; answer: string }> {
  const questions: Array<{ number: number; question: string; answer: string }> = []

  // Match all question divs
  const questionRegex = /<div class="question">([\s\S]*?)<\/div>(?=\s*(?:<div class="question">|<script|$))/g
  let match

  while ((match = questionRegex.exec(html)) !== null) {
    const questionBlock = match[1]

    // Extract question text
    const questionMatch = questionBlock.match(/<strong>(\d+)\.\s*(.+?)<\/strong>/)
    if (!questionMatch) continue

    const number = parseInt(questionMatch[1])
    const question = questionMatch[2].trim()

    // Extract answer content
    const answerMatch = questionBlock.match(
      /<div class="answer">([\s\S]*?)<\/div>\s*$/
    )
    if (!answerMatch) continue

    const answerHtml = answerMatch[1].trim()
    const answer = htmlToMdx(answerHtml)

    questions.push({ number, question, answer })
  }

  return questions
}

function convertHtmlToMdx(inputPath: string, outputPath: string): boolean {
  try {
    const html = fs.readFileSync(inputPath, 'utf-8')

    const metadata = extractMetadata(html)
    if (!metadata) {
      console.error(`❌ Failed to extract metadata from ${inputPath}`)
      return false
    }

    const caseDescription = extractCaseDescription(html)
    const questions = extractQuestions(html)

    if (questions.length === 0) {
      console.warn(`⚠️  No questions found in ${inputPath}`)
    }

    // Build MDX content
    const mdxQuestions = questions
      .map(
        (q) => `<CaseQuestion
  number={${q.number}}
  question="${q.question.replace(/"/g, '\\"')}"
>

${q.answer}

</CaseQuestion>`
      )
      .join('\n\n')

    const mdx = `---
id: "${metadata.id}"
title: "${metadata.title.replace(/"/g, '\\"')}"
category: "${metadata.category}"
discipline: "${metadata.discipline}"
setting: "${metadata.setting}"
---

import CaseQuestion from '@/components/cases/CaseQuestion';

# Case ${metadata.id} – ${metadata.title}

**Category:** {frontmatter.category} | **Discipline:** {frontmatter.discipline} | **Setting:** {frontmatter.setting}

## Case

${caseDescription}

## Questions

${mdxQuestions}
`

    fs.writeFileSync(outputPath, mdx, 'utf-8')
    console.log(`✅ Converted ${path.basename(inputPath)} → ${path.basename(outputPath)}`)
    return true
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error)
    return false
  }
}

// Main execution
const casesDir = path.resolve(__dirname, '../../cases')
const outputDir = path.resolve(__dirname, '../src/cases')

if (!fs.existsSync(casesDir)) {
  console.error(`❌ Cases directory not found: ${casesDir}`)
  process.exit(1)
}

// Create output directory
fs.mkdirSync(outputDir, { recursive: true })

// Get all HTML case files
const htmlFiles = fs.readdirSync(casesDir).filter((f) => f.match(/^case\d+_\d+\.html$/))

console.log(`\n📦 Found ${htmlFiles.length} case files to convert\n`)

let successCount = 0
let failureCount = 0

htmlFiles.forEach((file) => {
  const inputPath = path.join(casesDir, file)
  const outputPath = path.join(outputDir, file.replace('.html', '.mdx'))

  if (convertHtmlToMdx(inputPath, outputPath)) {
    successCount++
  } else {
    failureCount++
  }
})

console.log(`\n✨ Conversion complete!`)
console.log(`   ✅ Success: ${successCount}`)
console.log(`   ❌ Failures: ${failureCount}`)
