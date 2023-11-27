export interface INode {
  id: string
  title: string
  content: string
  children: {
    id: string
    title: string
  }[]
}