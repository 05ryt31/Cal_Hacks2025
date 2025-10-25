"use client"

import type React from "react"

import {
  Server,
  Zap,
  Database,
  HardDrive,
  Network,
  Scale,
  Globe,
  Shield,
  Key,
  Lock,
  DollarSign,
  ScanLine,
  ArrowUpDown,
  Archive,
  Container,
  Layers,
  Cloud,
  Link2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Block } from "@/types/infrastructure"

const iconMap: Record<string, any> = {
  ec2: Server,
  lambda: Zap,
  kubernetes: Layers,
  container: Container,
  s3: Database,
  rds: Database,
  redis: Zap,
  ebs: HardDrive,
  vpc: Network,
  loadbalancer: Scale,
  apigateway: Globe,
  cloudfront: Cloud,
  securitygroup: Shield,
  iam: Key,
  secrets: Lock,
  waf: Shield,
  costmonitor: DollarSign,
  securityscanner: ScanLine,
  autoscaler: ArrowUpDown,
  backupmanager: Archive,
}

const colorMap: Record<string, string> = {
  ec2: "bg-orange-500/30 border-orange-500",
  lambda: "bg-amber-500/30 border-amber-500",
  kubernetes: "bg-cyan-500/30 border-cyan-500",
  container: "bg-indigo-500/30 border-indigo-500",
  s3: "bg-green-500/30 border-green-500",
  rds: "bg-emerald-500/30 border-emerald-500",
  redis: "bg-red-500/30 border-red-500",
  ebs: "bg-orange-600/30 border-orange-600",
  vpc: "bg-purple-500/30 border-purple-500",
  loadbalancer: "bg-pink-500/30 border-pink-500",
  apigateway: "bg-teal-500/30 border-teal-500",
  cloudfront: "bg-sky-500/30 border-sky-500",
  securitygroup: "bg-rose-500/30 border-rose-500",
  iam: "bg-violet-500/30 border-violet-500",
  secrets: "bg-fuchsia-500/30 border-fuchsia-500",
  waf: "bg-red-600/30 border-red-600",
  costmonitor: "bg-yellow-500/30 border-yellow-500",
  securityscanner: "bg-lime-500/30 border-lime-500",
  autoscaler: "bg-blue-600/30 border-blue-600",
  backupmanager: "bg-slate-500/30 border-slate-500",
}

interface BlockNodeProps {
  block: Block
  isSelected: boolean
  isConnecting?: boolean
  onSelect: () => void
  onDragStart: (e: React.MouseEvent) => void
  onStartConnection: () => void
  onCompleteConnection: () => void
}

export function BlockNode({
  block,
  isSelected,
  isConnecting,
  onSelect,
  onDragStart,
  onStartConnection,
  onCompleteConnection,
}: BlockNodeProps) {
  const Icon = iconMap[block.type] || Server
  const colorClass = colorMap[block.type] || "bg-card border-border"

  return (
    <div
      className={`absolute cursor-move transition-all group ${
        isSelected ? "ring-2 ring-primary shadow-lg shadow-primary/20 z-20" : "z-10"
      } ${isConnecting ? "ring-2 ring-blue-500 animate-pulse" : ""}`}
      style={{
        left: block.x,
        top: block.y,
        width: 200,
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (isConnecting) {
          onCompleteConnection()
        } else {
          onSelect()
        }
      }}
      onMouseDown={onDragStart}
    >
      <div
        className={`${colorClass} border-2 rounded-lg p-3 hover:shadow-xl hover:scale-105 transition-all duration-200 backdrop-blur-sm`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-md ${colorClass} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">{block.name}</div>
            <div className="text-xs text-muted-foreground uppercase">{block.type}</div>
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110"
          onClick={(e) => {
            e.stopPropagation()
            onStartConnection()
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Link2 className="w-3 h-3 text-primary-foreground" />
        </Button>
      </div>
    </div>
  )
}
