import {
  forwardRef,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  Layer,
  Rect,
  Text
} from 'react-konva';
import Konva from 'konva'
import { useGraphContext } from '../contexts/GraphContext';

const NODE_WIDTH = 340;
const NODE_PADDING = 20;

export const Node = forwardRef(({ id }: {
  id: string
}, nodeRef: React.ForwardedRef<Konva.Layer>) => {
  const { graph } = useGraphContext()
  const node = graph.node(id)

  const refs = useRef<
    Record<string, Konva.Text | null>
  >({
    title: null,
    content: null
  })

  const [
    heights,
    setHeights
  ] = useState<
    Record<string, number>
  >({
    title: 20,
    content: 100,
    border: 30
  })

  useEffect(() => {
    if (!refs.current) return;

    const _heights = { ...heights }
    for (const k in refs.current) {
      if (!refs.current[k]) continue;
      _heights[k] = refs.current[k]!.height()
    }
    setHeights(_heights)
  }, [])

  const nodeHeight = Object.values(heights).reduce(
    (height, dimension) => height + dimension, 0
  )

  return (
    <Layer
      x={node.x}
      y={node.y}
      ref={nodeRef}
    >
      {/* Node background */}
      <Rect
        width={NODE_WIDTH}
        height={nodeHeight}
        fill='#333'
      >
      </Rect>
      {/* Title */}
      <Text
        ref={(ref) => refs.current.title = ref}
        width={NODE_WIDTH - 20}
        x={NODE_PADDING / 2}
        y={10}
        fill='#fff'
        text={String(node.title)}
        fontSize={18}
      />
      {/* Content */}
      {/* TODO: try mark down */}
      <Text
        ref={(ref) => refs.current.content = ref}
        x={NODE_PADDING / 2}
        y={(heights.title || 0) + 20}
        width={NODE_WIDTH - 20}
        fill='#fff'
        text={String(node.content)}
        fontSize={18}
      />
    </Layer>
  )
})