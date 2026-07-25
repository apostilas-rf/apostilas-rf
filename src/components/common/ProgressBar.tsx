interface ProgressBarProps {
  progress: number
  height?: string
  showLabel?: boolean
}

export function ProgressBar({
  progress,
  height = 'h-4',
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(progress, 0), 100)

  return (
    <div>
      <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
        <div
          className="bg-rf-green h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm font-medium text-gray-700 mt-1">{percentage}%</p>
      )}
    </div>
  )
}
