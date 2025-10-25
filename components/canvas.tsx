"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Plus, Minus, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlockNode } from "@/components/block-node"
import type { Block, Connection, BlockTemplate } from "@/types/infrastructure"

interface CanvasProps {
  blocks: Block[]
  connections: Connection[]
  selectedBlockId: string | null
  zoom: number
  onSelectBlock: (id: string | null) => void
  onUpdateBlock: (id: string, updates: Partial<Block>) => void
  onAddBlock: (block: Block) => void
  onAddConnection: (connection: Connection) => void
  onDeleteConnection: (id: string) => void
  onZoomChange: (zoom: number) => void
}

export function Canvas({
  blocks,
  connections,
  selectedBlockId,
  zoom,
  onSelectBlock,
  onUpdateBlock,
  onAddBlock,
  onAddConnection,
  onDeleteConnection,
  onZoomChange,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [connectionPreview, setConnectionPreview] = useState<{ x: number; y: number } | null>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const templateData = e.dataTransfer.getData("blockTemplate")

    if (templateData) {
      const template: BlockTemplate = JSON.parse(templateData)
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const x = (e.clientX - rect.left) / zoom
        const y = (e.clientY - rect.top) / zoom

        const newBlock: Block = {
          id: `${template.type}-${Date.now()}`,
          type: template.type,
          name: template.name,
          x,
          y,
          config: template.defaultConfig,
        }

        console.log("[v0] Adding new block:", newBlock)
        onAddBlock(newBlock)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleBlockDragStart = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation()
    const block = blocks.find((b) => b.id === blockId)
    if (block) {
      setDraggedBlock(blockId)
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left - block.x * zoom,
          y: e.clientY - rect.top - block.y * zoom,
        })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    if (draggedBlock) {
      const x = (e.clientX - rect.left - dragOffset.x) / zoom
      const y = (e.clientY - rect.top - dragOffset.y) / zoom
      onUpdateBlock(draggedBlock, { x, y })
    }

    if (connectingFrom) {
      setConnectionPreview({
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
      })
    }
  }

  const handleMouseUp = () => {
    setDraggedBlock(null)
    if (connectingFrom) {
      setConnectingFrom(null)
      setConnectionPreview(null)
    }
  }

  const handleStartConnection = (blockId: string) => {
    setConnectingFrom(blockId)
  }

  const handleCompleteConnection = (toBlockId: string) => {
    if (connectingFrom && connectingFrom !== toBlockId) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: connectingFrom,
        to: toBlockId,
      }
      onAddConnection(newConnection)
    }
    setConnectingFrom(null)
    setConnectionPreview(null)
  }

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 0.1, 2))
  }

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 0.1, 0.5))
  }

  const handleZoomReset = () => {
    onZoomChange(1)
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={canvasRef}
        className="w-full h-full canvas-grid overflow-auto"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelectBlock(null)
          }
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
            width: "200%",
            height: "200%",
            position: "relative",
          }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {connections.map((conn) => {
              const fromBlock = blocks.find((b) => b.id === conn.from)
              const toBlock = blocks.find((b) => b.id === conn.to)
              if (!fromBlock || !toBlock) return null

              const x1 = fromBlock.x + 100
              const y1 = fromBlock.y + 40
              const x2 = toBlock.x + 100
              const y2 = toBlock.y + 40

              return (
                <g key={conn.id}>
                  <path
                    d={`M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`}
                    className="connection-line"
                    strokeWidth="2"
                  />
                  <path
                    d={`M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`}
                    stroke="transparent"
                    strokeWidth="12"
                    fill="none"
                    className="pointer-events-auto cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("Delete this connection?")) {
                        onDeleteConnection(conn.id)
                      }
                    }}
                  />
                </g>
              )
            })}

            {connectingFrom &&
              connectionPreview &&
              (() => {
                const fromBlock = blocks.find((b) => b.id === connectingFrom)
                if (!fromBlock) return null

                const x1 = fromBlock.x + 100
                const y1 = fromBlock.y + 40
                const x2 = connectionPreview.x
                const y2 = connectionPreview.y

                return (
                  <path
                    d={`M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    fill="none"
                    opacity="0.5"
                  />
                )
              })()}
          </svg>

          {blocks.map((block) => (
            <BlockNode
              key={block.id}
              block={block}
              isSelected={block.id === selectedBlockId}
              isConnecting={connectingFrom === block.id}
              onSelect={() => onSelectBlock(block.id)}
              onDragStart={(e) => handleBlockDragStart(e, block.id)}
              onStartConnection={() => handleStartConnection(block.id)}
              onCompleteConnection={() => handleCompleteConnection(block.id)}
            />
          ))}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 bg-card border border-border rounded-lg p-1 shadow-lg">
        <Button size="icon" variant="ghost" onClick={handleZoomOut} className="hover:bg-accent">
          <Minus className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleZoomReset} className="hover:bg-accent">
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleZoomIn} className="hover:bg-accent">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Mini Map */}
      <div className="absolute bottom-4 left-4 w-48 h-32 bg-card/80 border border-border rounded-lg backdrop-blur-sm shadow-lg">
        <div className="w-full h-full relative overflow-hidden p-2">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="absolute w-2 h-2 bg-primary rounded-sm"
              style={{
                left: `${(block.x / 2000) * 100}%`,
                top: `${(block.y / 2000) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {connectingFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          Click on another block to create a connection
        </div>
      )}
    </div>
  )
}
