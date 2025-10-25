"use client"

import type React from "react"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
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
  Container,
  Layers,
  Cloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Block, BlockTemplate } from "@/types/infrastructure"

const blockTemplates: BlockTemplate[] = [
  // Compute
  {
    type: "ec2",
    name: "EC2 Instance",
    icon: "Server",
    category: "compute",
    defaultConfig: { instanceType: "t3.micro", region: "us-east-1" },
  },
  {
    type: "lambda",
    name: "Lambda Function",
    icon: "Zap",
    category: "compute",
    defaultConfig: { runtime: "nodejs20.x", memory: 128 },
  },
  {
    type: "kubernetes",
    name: "Kubernetes Cluster",
    icon: "Layers",
    category: "compute",
    defaultConfig: { nodes: 3, version: "1.28" },
  },
  {
    type: "container",
    name: "Container",
    icon: "Container",
    category: "compute",
    defaultConfig: { image: "nginx:latest" },
  },

  // Storage
  {
    type: "s3",
    name: "S3 Bucket",
    icon: "Database",
    category: "storage",
    defaultConfig: { versioning: true, encryption: true },
  },
  {
    type: "rds",
    name: "RDS Database",
    icon: "Database",
    category: "storage",
    defaultConfig: { engine: "postgres", size: "db.t3.micro" },
  },
  {
    type: "redis",
    name: "Redis Cache",
    icon: "Zap",
    category: "storage",
    defaultConfig: { nodeType: "cache.t3.micro" },
  },
  {
    type: "ebs",
    name: "EBS Volume",
    icon: "HardDrive",
    category: "storage",
    defaultConfig: { size: 100, type: "gp3" },
  },

  // Networking
  { type: "vpc", name: "VPC", icon: "Network", category: "networking", defaultConfig: { cidr: "10.0.0.0/16" } },
  {
    type: "loadbalancer",
    name: "Load Balancer",
    icon: "Scale",
    category: "networking",
    defaultConfig: { type: "application" },
  },
  { type: "apigateway", name: "API Gateway", icon: "Globe", category: "networking", defaultConfig: { type: "REST" } },
  {
    type: "cloudfront",
    name: "CloudFront CDN",
    icon: "Cloud",
    category: "networking",
    defaultConfig: { priceClass: "PriceClass_100" },
  },

  // Security
  {
    type: "securitygroup",
    name: "Security Group",
    icon: "Shield",
    category: "security",
    defaultConfig: { inbound: [], outbound: [] },
  },
  { type: "iam", name: "IAM Role", icon: "Key", category: "security", defaultConfig: { policies: [] } },
  { type: "secrets", name: "Secrets Manager", icon: "Lock", category: "security", defaultConfig: { rotation: true } },
  { type: "waf", name: "WAF Rule", icon: "Shield", category: "security", defaultConfig: { rules: [] } },
]

const iconMap: Record<string, any> = {
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
  Container,
  Layers,
  Cloud,
}

interface ComponentPaletteProps {
  onAddBlock: (block: Block) => void
}

export function ComponentPalette({ onAddBlock }: ComponentPaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "compute",
    "storage",
    "networking",
    "security",
  ])

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleDragStart = (e: React.DragEvent, template: BlockTemplate) => {
    e.dataTransfer.setData("blockTemplate", JSON.stringify(template))
  }

  const categories = [
    { id: "compute", name: "COMPUTE", icon: Server },
    { id: "storage", name: "STORAGE", icon: Database },
    { id: "networking", name: "NETWORKING", icon: Network },
    { id: "security", name: "SECURITY", icon: Shield },
  ]

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Components</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {categories.map((category) => {
            const CategoryIcon = category.icon
            const isExpanded = expandedCategories.includes(category.id)
            const categoryBlocks = blockTemplates.filter((b) => b.category === category.id)

            return (
              <div key={category.id} className="mb-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => toggleCategory(category.id)}
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3 mr-2" /> : <ChevronRight className="w-3 h-3 mr-2" />}
                  <CategoryIcon className="w-3 h-3 mr-2" />
                  {category.name}
                </Button>

                {isExpanded && (
                  <div className="ml-2 mt-1 space-y-1">
                    {categoryBlocks.map((template) => {
                      const Icon = iconMap[template.icon]

                      return (
                        <div
                          key={template.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, template)}
                          className="flex items-center gap-2 p-2 rounded-md bg-card hover:bg-accent cursor-move transition-colors group"
                        >
                          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          <span className="text-xs text-card-foreground flex-1">{template.name}</span>
                          <div className="w-1 h-4 bg-muted-foreground/20 rounded group-hover:bg-primary/50" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
