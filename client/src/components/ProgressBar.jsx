// src/components/ProgressBar.jsx
// Visual progress bar for "currentAmount / targetAmount"

function ProgressBar({ current, target }) {
  const safeTarget = target > 0 ? target : 1
  const percentage = Math.min(
    100,
    Math.round((Number(current || 0) / safeTarget) * 100)
  )

  return (
    <div className="progress-shell" aria-label="savings progress">
      <div
        className="progress-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export default ProgressBar
