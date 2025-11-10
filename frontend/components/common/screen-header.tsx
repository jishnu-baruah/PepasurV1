"use client"

import { Skull } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import TipBar from "@/components/common/tip-bar"

interface ScreenHeaderProps {
  title: string
  timer?: number
  subtitle?: string | React.ReactNode
  isEliminated?: boolean
  showTips?: boolean
  tipPhase?: "lobby" | "night" | "resolution" | "task" | "voting" | "discussion"
  customTips?: string[]
  className?: string
  titleClassName?: string
  timerClassName?: string
  subtitleClassName?: string
}

export default function ScreenHeader({
  title,
  timer,
  subtitle,
  isEliminated = false,
  showTips = false,
  tipPhase,
  customTips,
  className = "",
  titleClassName = "",
  timerClassName = "",
  subtitleClassName = ""
}: ScreenHeaderProps) {
  return (
    <div className={`w-full max-w-7xl text-center space-y-4 ${className}`}>
      {/* Eliminated Indicator */}
      {isEliminated && (
        <div className="mb-4 animate-bounce">
          <Badge
            variant="destructive"
            className="px-6 py-3 text-lg font-press-start bg-red-600/90 border-2 border-red-400 shadow-lg shadow-red-500/50"
          >
            <Skull className="w-5 h-5 mr-2 inline-block" />
            YOU ARE ELIMINATED
            <Skull className="w-5 h-5 ml-2 inline-block" />
          </Badge>
          <div className="mt-2 text-sm font-press-start text-gray-400 pixel-text-3d-glow">
            You can still watch the game unfold
          </div>
        </div>
      )}

      {/* Title */}
      <h1 className={`text-4xl md:text-5xl font-bold font-press-start pixel-text-3d-white pixel-text-3d-float-long ${titleClassName}`}>
        {title}
      </h1>

      {/* Timer */}
      {timer !== undefined && (
        <div className={`text-5xl md:text-7xl font-bold font-press-start pixel-text-3d-blue my-2 ${timerClassName}`}>
          {timer}
        </div>
      )}

      {/* Subtitle/Instruction Bar */}
      {subtitle && (
        <div className={`w-full bg-black/50 border-2 border-gray-500 p-3 text-lg md:text-xl font-press-start text-gray-300 ${subtitleClassName}`}>
          {subtitle}
        </div>
      )}

      {/* Tips Bar */}
      {showTips && tipPhase && (
        <TipBar phase={tipPhase} tips={customTips} />
      )}
    </div>
  )
}
