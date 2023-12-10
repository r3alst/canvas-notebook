import { Layer, Stage } from "react-konva"
import { Node } from "./Node"
import { adjustNodeLinks, nodes } from "../mock"
import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react"
import { useGraphContext } from "../contexts/GraphContext"
import dagre from "dagre"
import Konva from "konva"
import { useWorker } from "../hooks/use-worker"
import { INode } from "../types/INode"

export const Notebook = () => {
  const { graph } = useGraphContext()
  const stageRef = useRef<Konva.Stage | null>(null)
  const konvaNodeRefs = useRef<
    Record<string, Konva.Layer | null>
  >({})
  const [heightUpdated, setHeightUpdated] = useState<Date>(new Date())
  const [graphReload, setGraphReload] = useState<Date>(new Date())
  const _heightUpdated = useDeferredValue(heightUpdated)

  const workerOnMessage = useCallback((e: MessageEvent<{
    nodes: dagre.Node<INode>[],
    edges: dagre.Edge[]
  }>) => {
    for (const node of e.data.nodes) {
      graph.setNode(node.id, node)
    }

    // removing all edges
    for (const edge of graph.edges()) {
      graph.removeEdge(edge.v, edge.w)
    }

    // adding worker edges
    for (const edge of e.data.edges) {
      graph.setEdge(edge.v, edge.w)
    }

    setGraphReload(new Date())
  }, [graph])

  const { worker } = useWorker<{
    nodes: dagre.Node<INode>[],
    edges: dagre.Edge[]
  }>(workerOnMessage)

  useEffect(() => {
    if (!stageRef.current) return;

    const scaleBy = 1.1;
    const stage = stageRef.current

    const listener: Konva.KonvaEventListener<Konva.Stage, WheelEvent> = (e) => {
      // stop default scrolling
      e.evt.preventDefault();

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition() || {
        x: 0,
        y: 0
      };

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      // how to scale? Zoom in? Or zoom out?
      let direction = e.evt.deltaY > 0 ? 1 : -1;

      // when we zoom on trackpad, e.evt.ctrlKey is true
      // in that case lets revert direction
      if (e.evt.ctrlKey) {
        direction = -direction;
      }

      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stage.position(newPos);
    };
    stage.on('wheel', listener);

    return () => {
      stage && stage.off('wheel', listener)
    }
  }, [])

  useEffect(() => {
    // Cleaning Graph
    for (const edge of graph.edges()) {
      graph.removeEdge(edge.v, edge.w)
    }
    for (const nodeId of graph.nodes()) {
      graph.removeNode(nodeId)
    }

    graph.setDefaultEdgeLabel({} as any)
    graph.setDefaultNodeLabel({} as any)

    // Building Graph
    for (const node of nodes) {
      graph.setNode(`${node.id}`, node)
      for (const parent of node.parents) {
        const parentNode = nodes.find((_node) => _node.id === parent.id)
        if (!parentNode) continue;
        graph.setEdge(parentNode.id, node.id)
      }
    }

    // Execute Layout for DAG coords
    worker.postMessage({
      nodes: graph.nodes().map((v) => graph.node(v)),
      edges: graph.edges()
    })
    // dagre.layout(graph)
  }, [graphReload])

  useEffect(() => {
    Object.keys(konvaNodeRefs.current).forEach((nodeId) => {
      if (!konvaNodeRefs.current[nodeId]) return;

      const node = graph.node(nodeId)
      node.height = konvaNodeRefs.current[nodeId]!.height() || 0
    })

    // Execute Layout for DAG coords
    worker.postMessage({
      nodes: graph.nodes().map((v) => graph.node(v)),
      edges: graph.edges()
    })
  }, [_heightUpdated])

  const regenerateGraph = useCallback(() => {
    adjustNodeLinks(nodes)
    setGraphReload(new Date())
  }, [setGraphReload])

  const runDagre = useCallback(() => {
    worker.postMessage({
      nodes: graph.nodes().map((v) => graph.node(v)),
      edges: graph.edges()
    })
  }, [setGraphReload])

  return (
    <div id="notebook-wrap">
      <div className="notebook-actions">
        <div>
          <button onClick={regenerateGraph}>Regenerate Graph</button>
        </div>
        <div>
          <button onClick={runDagre}>Run Dagre</button>
        </div>
      </div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        draggable={true}
        ref={stageRef}
      >
        <Layer x={0} y={0}>
          {nodes.map((node) => (
            <Node key={node.id} id={`${node.id}`} setHeightUpdated={setHeightUpdated} />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}