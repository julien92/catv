export interface NodeGraph {
  id: string;
  val: number;
}

export interface Link {
  source: string;
  target: string;
}
export interface Graph {
  nodes: NodeGraph[];
  links: Link[];
}
