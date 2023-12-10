import { graphlib } from "dagre"
import { INode } from "../types/INode"
import React, { ReactNode, useContext } from "react"
import { COLUMN_GAP, NODE_GAP } from "../constants/graph"

export type GraphContext = {
  graph: graphlib.Graph<INode>
}

const INITIAL_DATA: GraphContext = {
  graph: new graphlib.Graph<INode>()
}
INITIAL_DATA.graph.setGraph({
  rankdir: "LR",
  nodesep: NODE_GAP,
  ranksep: COLUMN_GAP,
})

const Context = React.createContext<GraphContext>(INITIAL_DATA)

type Props = {
  children: ReactNode
}

export const GraphContextProvider: React.FC<Props> = ({ children }) => {
  return (
    <Context.Provider
      value={INITIAL_DATA}
    >
      {children}
    </Context.Provider>
  )
}

export const useGraphContext = () => {
  return useContext(Context)
}
