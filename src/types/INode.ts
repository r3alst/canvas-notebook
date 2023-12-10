export interface INode {
  id: string
  title: string
  content: string
  width: number
  height: number
  children: {
    id: string
    title: string
  }[],
  parents: {
    id: string
    title: string
  }[]
}