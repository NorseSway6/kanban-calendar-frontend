// src/FlowBoard.tsx
import React, { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CalendarNode from './nodes/CalendarNode';

const nodeTypes = {
  calendarNode: CalendarNode,
};

const initialNodes: Node[] = [
  {
    id: 'calendar-1',
    type: 'calendarNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Календарь задач',
    },
    style: {
      width: 900,
      height: 700,
    },
    draggable: true,
  },
];

const initialEdges: Edge[] = [];

function FlowBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Функция для обновления закрепления
  const updateNodePin = useCallback((nodeId: string, isPinned: boolean) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            draggable: !isPinned,
            data: {
              ...node.data,
              isPinned,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Функция для обновления размера
  const updateNodeSize = useCallback((nodeId: string, width: number, height: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            style: {
              ...node.style,
              width,
              height,
            },
            data: {
              ...node.data,
              width,
              height,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Обновляем ноды с callback функциями
  const nodesWithCallbacks = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      embeded: true,
      onPinToggle: (isPinned: boolean, nodeId: string = node.id) => {
        updateNodePin(nodeId, isPinned);
      },
      onResize: (width: number, height: number, nodeId: string = node.id) => {
        updateNodeSize(nodeId, width, height);
      },
    },
  }));

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodesWithCallbacks}
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