// src/components/GoalCard.jsx
// Presentational card for one savings goal.

import ProgressBar from './ProgressBar.jsx'

function GoalCard({ goal, onEmergencyWithdraw }) {
  const {
    id,
    label,
    targetAmount,
    currentAmount,
    lockUntil,
    status,
    emergencyAllowed,
    withdrawCount = 0,
    penaltyAmount = 0,
  } = goal

  const canWithdraw = status === 'locked' && emergencyAllowed

  return (
    <li className="goal-card">
      <div className="goal-card-main">
        <h3>{label}</h3>
        <p className="goal-amount">
          ${currentAmount.toFixed(2)} / ${targetAmount.toFixed(2)} saved
        </p>
        <ProgressBar current={currentAmount} target={targetAmount} />
        <p className="goal-meta">
          lock until: {lockUntil || 'no date set'}
        </p>
      </div>

      <div className="goal-status-block">
        <span className={`status-pill ${status}`}>
          {status === 'locked' ? 'locked' : 'withdrawn'}
        </span>

        {emergencyAllowed && (
          <span className="status-pill emergency">
            emergency {status === 'locked' ? 'available' : 'used'}
          </span>
        )}

        <span className="status-pill">
          withdrawals: {withdrawCount}
        </span>

        {penaltyAmount > 0 && (
          <span className="status-pill penalty">
            penalties: ${penaltyAmount.toFixed(2)}
          </span>
        )}

        {canWithdraw && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => onEmergencyWithdraw(id)}
          >
            emergency withdraw
          </button>
        )}
      </div>
    </li>
  )
}

export default GoalCard
