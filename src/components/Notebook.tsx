import { useCallback, useState } from "react";
import { adjustNodeLinks, generateNodes } from "../mock";
import { useGraphContext } from "../contexts/GraphContext";
import { createGraph, loadPartialGraph } from "../utils/graph";
import { useWorker } from "../hooks/use-worker";
import { LayoutMessage } from "../types/LayoutMessage";

export const Notebook = () => {
  const [noOfNodes, setNoOfNodes] = useState<number>(100);
  // const [nodes, setNodes] = useState<INode[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const ctx = useGraphContext();

  const workerListener = useCallback(
    (e: MessageEvent<LayoutMessage>) => {
      setEndTime(new Date().getTime());
      loadPartialGraph(ctx.graph, e.data);
    },
    [setEndTime, ctx]
  );

  const worker = useWorker<LayoutMessage>(workerListener);

  const runDagre = useCallback(() => {
    // Create New Graph
    const nodes = generateNodes(noOfNodes);
    adjustNodeLinks(nodes);

    ctx.graph = createGraph();
    for (const node of nodes) {
      ctx.graph.setNode(node.id, node);
    }
    for (const node of nodes) {
      for (const child of node.children) {
        ctx.graph.setEdge(node.id, child.id);
      }

      for (const parent of node.parents) {
        ctx.graph.setEdge(parent.id, node.id);
      }
    }
    // End Create New Graph

    setStartTime(new Date().getTime());
    worker.postMessage({
      nodes,
      edges: ctx.graph.edges(),
    });
  }, [worker, setStartTime]);

  return (
    <div id="notebook-wrap">
      <div className="notebook-actions">
        <div>
          Dagre:{" "}
          {worker.processing
            ? "Executing..."
            : `${Math.floor((endTime - startTime) * 100) / 100}ms`}
        </div>
        <div>
          <label>Nodes Count:</label>
          <br />
          <input
            value={noOfNodes}
            onChange={(e) => {
              const num = parseInt(e.target.value);
              setNoOfNodes(isNaN(num) ? 0 : num);
            }}
          />
        </div>
        <div>
          <button onClick={runDagre}>Run Dagre</button>
        </div>
      </div>
    </div>
  );
};
