import { graphlib } from "dagre"
import { INode } from "../types/INode"
import React, { ReactNode, useContext } from "react"

export type GraphContext = {
  graph: graphlib.Graph<INode>
}

const INITIAL_DATA: GraphContext = {
  graph: new graphlib.Graph<INode>()
}

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
