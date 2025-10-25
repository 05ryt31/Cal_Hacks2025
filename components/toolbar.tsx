"use client"

import { FilePlus, Save, Rocket, Undo2, Redo2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToolbarProps {
  onNewProject: () => void
  onSave: () => void
  onDeploy: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo?: boolean
  canRedo?: boolean
}

export function Toolbar({ onNewProject, onSave, onDeploy, onUndo, onRedo, canUndo, canRedo }: ToolbarProps) {
  return (
    <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onNewProject} className="hover:bg-accent">
          <FilePlus className="w-4 h-4 mr-2" />
          New Project
        </Button>
        <Button variant="ghost" size="sm" onClick={onSave} className="hover:bg-accent">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-accent">
          <Upload className="w-4 h-4 mr-2" />
          Import Template
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          className="hover:bg-accent disabled:opacity-50"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          className="hover:bg-accent disabled:opacity-50"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      <div>
        <Button className="bg-primary hover:bg-primary/90" onClick={onDeploy}>
          <Rocket className="w-4 h-4 mr-2" />
          Deploy
        </Button>
      </div>
    </div>
  )
}
