// src/FlowBoard.tsx
import React from 'react';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CalendarNode } from './nodes/CalendarNode';
import { CalendarNodeData } from './types/flow';

const nodeTypes = {
  calendarNode: CalendarNode,
} as const; // <-- Добавьте "as const" для точной типизации

const initialNodes: Node<CalendarNodeData, 'calendarNode'>[] = [
  {
    id: 'calendar-1',
    type: 'calendarNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Календарь',
    },
    width: 1300, // Добавьте явно
    height: 1000, // Добавьте явно
  },
];

function FlowBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default FlowBoard;