import dagre, { graphlib } from "dagre";
import { INode } from "../types/INode";
import { COLUMN_GAP, NODE_GAP } from "../constants/graph";

onmessage = (e: MessageEvent<{
  nodes: dagre.Node<INode>[],
  edges: dagre.Edge[]
}>) => {

  const graph = new graphlib.Graph()
  graph.setGraph({
    rankdir: "LR",
    nodesep: NODE_GAP,
    ranksep: COLUMN_GAP,
  })

  graph.setDefaultEdgeLabel({} as any)
  graph.setDefaultNodeLabel({} as any)

  for(const node of e.data.nodes) {
    graph.setNode(node.id, node)
  }
  for(const edge of e.data.edges) {
    graph.setEdge(edge.v, edge.w)
  }

  dagre.layout(graph)

  postMessage({
    nodes: graph.nodes().map((v) => graph.node(v)),
    edges: graph.edges()
  });
};