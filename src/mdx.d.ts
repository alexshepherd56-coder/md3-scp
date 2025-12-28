declare module '*.mdx' {
  let MDXComponent: (props: any) => JSX.Element
  export default MDXComponent
  export const frontmatter: {
    id: string
    title: string
    category: string
    discipline: string
    setting: string
  }
}
