import { adjustNodeLinks, nodes } from "../mock";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useGraphContext } from "../contexts/GraphContext";
import dagre from "dagre";
import Konva from "konva";
import { useWorker } from "../hooks/use-worker";
import { IPartialNode } from "../types/INode";
import { loadPartialGraph, runPartialGraph } from "../utils/graph";
import { NODE_PADDING, NODE_WIDTH } from "../constants";

export const Notebook = () => {
  const { graph } = useGraphContext();
  const canvasId = useId();
  const stage = useRef<Konva.Stage | null>(null);
  const layer = useRef<Konva.Layer | null>(null);
  const [initialized, setInitialized] = useState<Date | null>(null);

  const konvaNodeRefs = useRef<Record<string, Konva.Group | null>>({});

  const [heightUpdated, setHeightUpdated] = useState<Date>(new Date());
  const [graphReload, setGraphReload] = useState<Date>(new Date());
  const _heightUpdated = useDeferredValue(heightUpdated);

  const workerOnMessage = useCallback(
    (
      e: MessageEvent<{
        nodes: IPartialNode[];
        edges: dagre.Edge[];
      }>
    ) => {
      loadPartialGraph(graph, e.data);

      // setGraphReload(new Date());
      for (const v of graph.nodes()) {
        const node = graph.node(v);

        const isExisting = v in konvaNodeRefs.current;
        const konvaNode =
          konvaNodeRefs.current[v] ||
          new Konva.Group({
            x: node.x,
            y: node.y,
          });
        konvaNodeRefs.current[v] = konvaNode;

        // Need optimization here
        layer.current?.destroyChildren();
        konvaNode.clear();

        // Node wrap
        const nodeWrap = new Konva.Rect({
          width: node.width,
          height: node.height,
          fill: "#333",
        });

        const title = new Konva.Text({
          width: NODE_WIDTH - 20,
          x: NODE_PADDING / 2,
          y: 10,
          fill: "#fff",
          text: String(node.title),
          fontSize: 18,
        });

        const content = new Konva.Text({
          x: NODE_PADDING / 2,
          y: 20 + (title.height() || 0),
          width: NODE_WIDTH - 20,
          fill: "#fff",
          text: String(node?.content),
          fontSize: 18,
        });

        konvaNode.add(title);
        konvaNode.add(content);
        konvaNode.add(nodeWrap);

        if (!isExisting) {
          stage.current?.add(konvaNode);
        }
      }
    },
    [graph]
  );

  const { worker } = useWorker<{
    nodes: IPartialNode[];
    edges: dagre.Edge[];
  }>(workerOnMessage);

  useEffect(() => {
    // If Notebook reinitialized
    if (stage.current) {
      stage.current.destroy();
    }
    stage.current = new Konva.Stage({
      container: canvasId,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setInitialized(new Date());
  }, [canvasId]);

  useEffect(() => {
    if (!stage.current || !initialized) return;

    const scaleBy = 1.1;
    const _stage = stage.current;

    const listener: Konva.KonvaEventListener<Konva.Stage, WheelEvent> = (e) => {
      // stop default scrolling
      e.evt.preventDefault();

      const oldScale = _stage.scaleX();
      const pointer = _stage.getPointerPosition() || {
        x: 0,
        y: 0,
      };

      const mousePointTo = {
        x: (pointer.x - _stage.x()) / oldScale,
        y: (pointer.y - _stage.y()) / oldScale,
      };

      // how to scale? Zoom in? Or zoom out?
      let direction = e.evt.deltaY > 0 ? 1 : -1;

      // when we zoom on trackpad, e.evt.ctrlKey is true
      // in that case lets revert direction
      if (e.evt.ctrlKey) {
        direction = -direction;
      }

      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

      _stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      _stage.position(newPos);
    };
    _stage.on("wheel", listener);

    return () => {
      _stage && _stage.off("wheel", listener);
    };
  }, [initialized]);

  useEffect(() => {
    // Cleaning Graph
    for (const edge of graph.edges()) {
      graph.removeEdge(edge.v, edge.w);
    }
    for (const nodeId of graph.nodes()) {
      graph.removeNode(nodeId);
    }

    graph.setDefaultEdgeLabel({} as any);
    graph.setDefaultNodeLabel({} as any);

    // Building Graph
    for (const node of nodes) {
      graph.setNode(`${node.id}`, node);
      for (const parent of node.parents) {
        const parentNode = nodes.find((_node) => _node.id === parent.id);
        if (!parentNode) continue;
        graph.setEdge(parentNode.id, node.id);
      }
    }

    // Execute Layout for DAG coords
    runPartialGraph(graph, worker.current);
    // dagre.layout(graph)
  }, [graphReload]);

  // useEffect(() => {
  //   Object.keys(konvaNodeRefs.current).forEach((nodeId) => {
  //     if (!konvaNodeRefs.current[nodeId]) return;

  //     const node = graph.node(nodeId);
  //     node.height = konvaNodeRefs.current[nodeId]!.height() || 0;
  //   });

  //   // Execute Layout for DAG coords
  //   runPartialGraph(graph, worker.current);
  // }, [_heightUpdated]);

  const regenerateGraph = useCallback(() => {
    adjustNodeLinks(nodes);
    setGraphReload(new Date());
  }, [setGraphReload]);

  const runDagre = useCallback(() => {
    runPartialGraph(graph, worker.current);
  }, [setGraphReload]);

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
      <div id={canvasId}></div>
      {/* <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        draggable={true}
        ref={stageRef}
      >
        <Layer x={0} y={0}>
          {nodes.map((node) => (
            <Node
              key={node.id}
              id={`${node.id}`}
              setHeightUpdated={setHeightUpdated}
            />
          ))}
        </Layer>
      </Stage> */}
    </div>
  );
};
