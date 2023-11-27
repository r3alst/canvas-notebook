import { INode } from "./types/INode";

const mockTitles = [
  "Ut consectetur leo quis sem feugiat sagittis",
  "Suspendisse sed porttitor risus",
  "Nam lectus risus, efficitur ut mi a, ullamcorper laoreet justo"
]
const mockContents = [
  "Aenean sed est in nulla hendrerit imperdiet ut eget leo. Vivamus pretium lacus ac dui vehicula vehicula. Nullam cursus eros a metus ultricies feugiat non ut dolor. Curabitur lacinia purus massa, sit amet mattis sem pretium a. Praesent egestas neque a laoreet fringilla. Vivamus et ullamcorper erat. Aliquam fermentum tortor sapien, at consequat libero finibus ac.",
  "Praesent vel nisi ut nunc pulvinar gravida. Quisque quis ornare nisi. Proin maximus laoreet nunc. Integer varius quam eu gravida mattis. Nulla viverra vehicula dolor nec placerat. Aliquam erat volutpat. Fusce maximus felis eu blandit cursus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam fermentum, arcu non interdum efficitur, libero dui tristique quam, et interdum libero metus id felis. Ut bibendum fermentum orci, non tempus mauris finibus id.",
  "In dictum eros justo, id tincidunt lorem vehicula ut. Vivamus vel lacus eu risus faucibus gravida. Suspendisse ut nunc malesuada sem tempor consequat. Aliquam erat volutpat. Nam sem ipsum, venenatis sodales dolor et, condimentum mollis diam. Fusce tempor fermentum metus in suscipit."
]

export const nodes: INode[] = []

// Generating Mock data

// Nodes
for(let i = 0; i < 100; i++) {
  nodes.push({
    id: `${i+1}`,
    title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
    content: mockContents[Math.floor(Math.random() * mockContents.length)],
    children: []
  })
}

// Node Links
for(let i = 0; i < nodes.length; i++) {
  const node = nodes[i]
  // Children
  const nOfLinks = Math.floor(Math.random() * 4)
  
  // atmost 3 links for each node
  const childIds = new Set<number>()
  for(let r = 0; r < nOfLinks; r++) {
    const randomIdx = Math.floor(Math.random() * nodes.length - 1)
    const linkIdx = randomIdx === i ? randomIdx + 1 : randomIdx
    childIds.add(linkIdx)
  }

  for(const childId of childIds) {
    const linkNode = nodes[childId]
    node.children.push(linkNode)
  }
}