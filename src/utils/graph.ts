import { graphlib } from "dagre";
import { INode, IPartialNode } from "../types/INode";

export const runPartialGraph = (
  graph: graphlib.Graph<INode>,
  worker: Worker
) => {
  worker.postMessage({
    nodes: graph.nodes().map((v) => {
      const node = graph.node(v);
      return {
        id: node.id,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height | 300,
      };
    }),
    edges: graph.edges(),
  });
};

export const loadPartialGraph = (
  graph: graphlib.Graph<INode>,
  partial: {
    nodes: IPartialNode[];
    edges: dagre.Edge[];
  }
) => {
  for (const pnode of partial.nodes) {
    const node = graph.node(pnode.id);
    for (const k in pnode) {
      // @ts-ignore
      node[k] = pnode[k];
    }
  }

  // // removing all edges
  // for (const edge of graph.edges()) {
  //   graph.removeEdge(edge.v, edge.w)
  // }

  // // adding worker edges
  // for (const edge of partial.edges) {
  //   graph.setEdge(edge.v, edge.w)
  // }
};
