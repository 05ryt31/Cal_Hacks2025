"use client"

import { useState, useCallback } from "react"
import { MessageSquare } from "lucide-react"
import { ComponentPalette } from "@/components/component-palette"
import { Canvas } from "@/components/canvas"
import { PropertiesPanel } from "@/components/properties-panel"
import { Toolbar } from "@/components/toolbar"
import { Button } from "@/components/ui/button"
import type { Block, Connection } from "@/types/infrastructure"

interface HistoryState {
  blocks: Block[]
  connections: Connection[]
}

export default function InfrastructureBuilder() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [showAIChat, setShowAIChat] = useState(false)

  const [history, setHistory] = useState<HistoryState[]>([{ blocks: [], connections: [] }])
  const [historyIndex, setHistoryIndex] = useState(0)

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId)

  const saveToHistory = useCallback(
    (newBlocks: Block[], newConnections: Connection[]) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push({ blocks: newBlocks, connections: newConnections })
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const handleAddBlock = (block: Block) => {
    const newBlocks = [...blocks, block]
    setBlocks(newBlocks)
    saveToHistory(newBlocks, connections)
  }

  const handleUpdateBlock = (id: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b))
    setBlocks(newBlocks)
    saveToHistory(newBlocks, connections)
  }

  const handleDeleteBlock = (id: string) => {
    const newBlocks = blocks.filter((b) => b.id !== id)
    const newConnections = connections.filter((c) => c.from !== id && c.to !== id)
    setBlocks(newBlocks)
    setConnections(newConnections)
    saveToHistory(newBlocks, newConnections)
    if (selectedBlockId === id) {
      setSelectedBlockId(null)
    }
  }

  const handleAddConnection = (connection: Connection) => {
    const newConnections = [...connections, connection]
    setConnections(newConnections)
    saveToHistory(blocks, newConnections)
  }

  const handleDeleteConnection = (id: string) => {
    const newConnections = connections.filter((c) => c.id !== id)
    setConnections(newConnections)
    saveToHistory(blocks, newConnections)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setBlocks(history[newIndex].blocks)
      setConnections(history[newIndex].connections)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setBlocks(history[newIndex].blocks)
      setConnections(history[newIndex].connections)
    }
  }

  const handleNewProject = () => {
    if (confirm("Start a new project? This will clear all blocks and connections.")) {
      setBlocks([])
      setConnections([])
      setSelectedBlockId(null)
      setZoom(1)
      setHistory([{ blocks: [], connections: [] }])
      setHistoryIndex(0)
    }
  }

  const handleSave = () => {
    const data = { blocks, connections }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "infrastructure.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeploy = () => {
    alert("Deploy functionality would connect to your cloud provider here!")
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <ComponentPalette onAddBlock={handleAddBlock} />

      <div className="flex-1 flex flex-col">
        <Toolbar
          onNewProject={handleNewProject}
          onSave={handleSave}
          onDeploy={handleDeploy}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />

        <Canvas
          blocks={blocks}
          connections={connections}
          selectedBlockId={selectedBlockId}
          zoom={zoom}
          onSelectBlock={setSelectedBlockId}
          onUpdateBlock={handleUpdateBlock}
          onAddBlock={handleAddBlock}
          onAddConnection={handleAddConnection}
          onDeleteConnection={handleDeleteConnection}
          onZoomChange={setZoom}
        />
      </div>

      <PropertiesPanel
        block={selectedBlock}
        blocks={blocks}
        connections={connections}
        onUpdateBlock={handleUpdateBlock}
        onDeleteBlock={handleDeleteBlock}
      />

      <Button
        size="icon"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
        onClick={() => setShowAIChat(!showAIChat)}
      >
        <MessageSquare className="w-5 h-5" />
      </Button>

      {showAIChat && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">AI Code Review Assistant</h3>
            <Button size="icon" variant="ghost" onClick={() => setShowAIChat(false)}>
              ×
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">
                  Hello! I'm your AI assistant. I can help you review your infrastructure code, suggest improvements,
                  and answer questions about best practices.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-border">
            <input
              type="text"
              placeholder="Ask about your infrastructure..."
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
            />
          </div>
        </div>
      )}
    </div>
  )
}
