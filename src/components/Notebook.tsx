import { Stage } from "react-konva"
import { Node } from "./Node"
import { nodes } from "../mock"
import { useEffect } from "react"
import { useGraphContext } from "../contexts/GraphContext"

export const Notebook = () => {
  const { graph } = useGraphContext()

  useEffect(() => {
    for (const node of nodes) {
      graph.setNode(`${node.id}`, node)
    }
  }, [])

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      draggable={true}
    >
      {nodes.map((node) => (
        <Node key={node.id} id={`${node.id}`} />
      ))}
    </Stage>
  )
}