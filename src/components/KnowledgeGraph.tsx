import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Network, ZoomIn, ZoomOut, Maximize2, RotateCcw,
  Search, Filter, Share2, X, ChevronRight, Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Word, ContentType } from '../types';
import { predictRecallProbability } from '../lib/algorithm';
import { CONTENT_TYPE_LABELS } from '../types';

interface KnowledgeGraphProps {
  words: Word[];
  isOpen: boolean;
  onClose: () => void;
  onNodeClick?: (word: Word) => void;
}

interface GraphNode {
  id: string;
  word: Word;
  x: number;
  y: number;
  vx: number;
  vy: number;
  recall: number;
  contentType: ContentType;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

const NODE_COLORS: Record<ContentType, string> = {
  word: '#3b82f6',
  formula: '#8b5cf6',
  knowledge: '#22c55e',
  mistake: '#ef4444',
  definition: '#f59e0b',
};

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  words, isOpen, onClose, onNodeClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const animationRef = useRef<number | null>(null);

  // Build nodes and edges from words
  const buildGraph = useMemo(() => {
    if (words.length === 0) return { nodes: [], edges: [] };

    const now = Date.now();
    const centerX = 400;
    const centerY = 300;
    const radius = Math.min(250, 50 + words.length * 2);

    const newNodes: GraphNode[] = words.map((word, i) => {
      const angle = (2 * Math.PI * i) / words.length;
      const r = words.length > 30 ? radius + Math.random() * 100 : radius;
      return {
        id: word.id,
        word,
        x: centerX + r * Math.cos(angle) + (Math.random() - 0.5) * 50,
        y: centerY + r * Math.sin(angle) + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        recall: predictRecallProbability(word, now),
        contentType: word.contentType || 'word',
      };
    });

    // Build edges: connect words with same content type or shared tags
    const newEdges: GraphEdge[] = [];
    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        const n1 = newNodes[i];
        const n2 = newNodes[j];
        let weight = 0;

        // Same content type
        if (n1.contentType === n2.contentType) weight += 0.3;

        // Shared tags
        const sharedTags = (n1.word.tags || []).filter(t => (n2.word.tags || []).includes(t));
        weight += sharedTags.length * 0.2;

        // Similar recall probability (within 20%)
        if (Math.abs(n1.recall - n2.recall) < 0.2) weight += 0.2;

        if (weight > 0) {
          newEdges.push({
            source: n1.id,
            target: n2.id,
            weight: Math.min(1, weight),
          });
        }
      }
    }

    return { nodes: newNodes, edges: newEdges };
  }, [words]);

  // Apply filters
  const filteredNodes = useMemo(() => {
    return buildGraph.nodes.filter(node => {
      const matchesType = filterType === 'all' || node.contentType === filterType;
      const matchesSearch = !searchTerm ||
        node.word.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.word.definition.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [buildGraph, filterType, searchTerm]);

  // D3-style force simulation
  useEffect(() => {
    if (!isOpen) return;

    const centerX = 400;
    const centerY = 300;
    const alpha = 0.3;

    const simulate = () => {
      setNodes(prevNodes => {
        const nodeMap = new Map(prevNodes.map(n => [n.id, n]));

        // Apply forces
        const forces = prevNodes.map(node => {
          let fx = 0, fy = 0;

          // Center gravity
          fx -= (node.x - centerX) * 0.001 * alpha;
          fy -= (node.y - centerY) * 0.001 * alpha;

          // Node repulsion
          prevNodes.forEach(other => {
            if (other.id === node.id) return;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 500 / (dist * dist);
            fx += (dx / dist) * force * alpha;
            fy += (dy / dist) * force * alpha;
          });

          // Edge attraction
          edges.forEach(edge => {
            if (edge.source === node.id || edge.target === node.id) {
              const otherId = edge.source === node.id ? edge.target : edge.source;
              const other = nodeMap.get(otherId);
              if (!other) return;
              const dx = other.x - node.x;
              const dy = other.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const idealDist = 80;
              const force = (dist - idealDist) * edge.weight * 0.01 * alpha;
              fx += (dx / dist) * force;
              fy += (dy / dist) * force;
            }
          });

          return { vx: node.vx * 0.9 + fx, vy: node.vy * 0.9 + fy };
        });

        return prevNodes.map((node, i) => ({
          ...node,
          x: Math.max(20, Math.min(780, node.x + forces[i].vx)),
          y: Math.max(20, Math.min(580, node.y + forces[i].vy)),
          vx: forces[i].vx,
          vy: forces[i].vy,
        }));
      });
    };

    // Run simulation
    let iterations = 100;
    const run = () => {
      if (iterations > 0) {
        simulate();
        iterations--;
        animationRef.current = requestAnimationFrame(run);
      }
    };
    run();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isOpen, edges]);

  // Draw on canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 800 * dpr;
    canvas.height = 600 * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, 800, 600);

    // Apply transform
    ctx.save();
    ctx.translate(offset.x + 400, offset.y + 300);
    ctx.scale(zoom, zoom);
    ctx.translate(-400, -300);

    // Draw edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;

      const isHighlighted = hoveredNode && (hoveredNode.id === source.id || hoveredNode.id === target.id);

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = isHighlighted
        ? 'rgba(139, 92, 246, 0.8)'
        : `rgba(139, 92, 246, ${edge.weight * 0.3})`;
      ctx.lineWidth = isHighlighted ? 2 : edge.weight * 1.5;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      const isHov = hoveredNode?.id === node.id;
      const color = NODE_COLORS[node.contentType] || '#3b82f6';
      const radius = isHov ? 12 : 8 + node.recall * 4;

      // Glow effect
      if (node.recall < 0.5) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${color}33`;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      if (isHov || zoom > 1.2) {
        ctx.font = `${10 / zoom}px system-ui`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(node.word.term.slice(0, 10), node.x, node.y + radius + 12);
      }
    });

    ctx.restore();
  }, [nodes, edges, zoom, offset, hoveredNode, isOpen]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMouse({ x: e.clientX, y: e.clientY });
    }

    // Detect hover
    if (canvasRef.current && containerRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - offset.x - 400) / zoom + 400;
      const mouseY = (e.clientY - rect.top - offset.y - 300) / zoom + 300;

      const hovered = nodes.find(node => {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        return Math.sqrt(dx * dx + dy * dy) < 12;
      });

      setHoveredNode(hovered || null);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => setDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        <Card className="shadow-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network size={20} className="text-indigo-500" />
                <CardTitle>知识图谱</CardTitle>
                <span className="text-xs text-muted-foreground ml-2">
                  {filteredNodes.length} 个节点，{edges.length} 条边
                </span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                <X size={16} />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 mt-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="搜索节点..."
                  className="w-full pl-9 pr-3 py-1.5 bg-muted/50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as ContentType | 'all')}
                className="px-3 py-1.5 bg-muted/50 rounded-lg text-sm outline-none"
              >
                <option value="all">全部类型</option>
                {Object.entries(CONTENT_TYPE_LABELS).map(([type, labels]) => (
                  <option key={type} value={type}>{labels.zh}</option>
                ))}
              </select>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(3, z * 1.2))}>
                  <ZoomIn size={14} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(0.3, z * 0.8))}>
                  <ZoomOut size={14} />
                </Button>
                <Button size="sm" variant="outline" onClick={resetView}>
                  <Maximize2 size={14} />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div
              ref={containerRef}
              className="relative bg-gradient-to-br from-slate-900 to-slate-800 cursor-grab active:cursor-grabbing"
              style={{ height: 600 }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full h-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onClick={e => {
                  if (hoveredNode) {
                    onNodeClick?.(hoveredNode.word);
                  }
                }}
              />

              {/* Tooltip */}
              {hoveredNode && (
                <div
                  className="absolute pointer-events-none z-10 bg-card/95 backdrop-blur border rounded-xl p-3 shadow-xl max-w-xs"
                  style={{ left: tooltipPos.x - (containerRef.current?.getBoundingClientRect().left || 0) + 10, top: tooltipPos.y - (containerRef.current?.getBoundingClientRect().top || 0) - 60 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${NODE_COLORS[hoveredNode.contentType]}20`,
                        color: NODE_COLORS[hoveredNode.contentType]
                      }}
                    >
                      {CONTENT_TYPE_LABELS[hoveredNode.contentType].zh}
                    </span>
                    <span className="font-bold text-foreground">{hoveredNode.word.term}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{hoveredNode.word.definition}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-muted-foreground">
                      召回率: <span className={hoveredNode.recall > 0.7 ? 'text-green-500' : hoveredNode.recall > 0.4 ? 'text-amber-500' : 'text-red-500'}>
                        {Math.round(hoveredNode.recall * 100)}%
                      </span>
                    </span>
                    <span className="text-muted-foreground">曝光: {hoveredNode.word.totalExposure || 0}</span>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur rounded-xl p-3 border">
                <p className="text-xs font-bold text-muted-foreground mb-2">节点颜色</p>
                <div className="space-y-1">
                  {Object.entries(NODE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs">{CONTENT_TYPE_LABELS[type as ContentType]?.zh || type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur rounded-xl p-3 border">
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap size={12} className="text-amber-500" />
                    <span>缩放: {Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight size={12} className="text-indigo-500" />
                    <span>节点: {filteredNodes.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default KnowledgeGraph;
