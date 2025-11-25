// src/components/SavingsTipPanel.jsx
// Pulls a live "tip" from a free external API and displays it.
// This proves you are integrating a real third-party API into the app.

import { useEffect, useState } from 'react'

function SavingsTipPanel() {
  const [tip, setTip] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchTip() {
    try {
      setLoading(true)
      setError('')

      // external API: random advice
      const res = await fetch('https://api.adviceslip.com/advice')

      if (!res.ok) {
        throw new Error('failed to fetch savings tip.')
      }

      const data = await res.json()
      const adviceText =
        data?.slip?.advice ||
        'save a little more than feels comfortable today.'

      setTip(adviceText)
    } catch (err) {
      console.error(err)
      setError('could not load a tip right now. try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTip()
  }, [])

  return (
    <div className="check-upload">
      <strong>daily savings tip</strong>
      {loading && <p>loading a tip...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && tip && <p>“{tip}”</p>}

      <button
        type="button"
        className="secondary-button"
        style={{ marginTop: '0.6rem' }}
        onClick={fetchTip}
      >
        new tip
      </button>

      <p className="file-note">
        tips are powered by a free third-party API and meant for practice only.
      </p>
    </div>
  )
}

export default SavingsTipPanel
