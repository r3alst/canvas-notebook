import { Edge } from "dagre";
import { IPartialNode } from "./INode";

export interface LayoutMessage {
  nodes: IPartialNode[];
  edges: Edge[];
}
