import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const casesDir = path.resolve(__dirname, '../src/cases')
const outputFile = path.resolve(casesDir, 'index.ts')

if (!fs.existsSync(casesDir)) {
  console.error(`❌ Cases directory not found: ${casesDir}`)
  process.exit(1)
}

const mdxFiles = fs.readdirSync(casesDir).filter((f) => f.endsWith('.mdx')).sort()

console.log(`\n📦 Found ${mdxFiles.length} MDX case files\n`)

// Generate imports - import both default component and frontmatter named export
const imports = mdxFiles.map((file, index) => {
  return `import Case${index}, { frontmatter as frontmatter${index} } from './${file}';`
}).join('\n')

// Generate case metadata array (for search functionality)
const caseMetadata = mdxFiles.map((file, index) => {
  const caseId = file.replace('.mdx', '').replace('case', '').replace('_', '.')
  return `  {
    id: '${caseId}',
    component: Case${index},
    metadata: frontmatter${index} || {}
  },`
}).join('\n')

// Generate exports
const exports = mdxFiles.map((file, index) => {
  const caseId = file.replace('.mdx', '').replace('case', '').replace('_', '.')
  return `  '${caseId}': Case${index},`
}).join('\n')

const indexContent = `// Auto-generated case index
// Run 'npm run generate-index' to regenerate this file

${imports}

export interface CaseModule {
  id: string
  component: any
  metadata: {
    id: string
    title: string
    category: string
    discipline: string
    setting: string
  }
}

// Array of all cases with metadata (useful for search/filtering)
export const allCases: CaseModule[] = [
${caseMetadata}
];

// Case lookup by ID (e.g., '12.3')
export const caseIndex = {
${exports}
};

export type CaseId = keyof typeof caseIndex;

// Get all case IDs
export const caseIds = Object.keys(caseIndex) as CaseId[];

// Get case count
export const caseCount = caseIds.length;
`

fs.writeFileSync(outputFile, indexContent, 'utf-8')

console.log(`✅ Generated case index at: ${outputFile}`)
console.log(`   📊 ${mdxFiles.length} cases indexed\n`)
