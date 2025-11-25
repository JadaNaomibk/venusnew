// src/components/SavingsQuote.jsx
// small motivational quote card for the dashboard

import { useEffect, useState } from 'react';

const QUOTES = [
  {
    id: 1,
    text: 'We locked up your money and threw away the key!”',
  },
  {
    id: 2,
    text: 'Future you is counting on present you to leave this money alone.',
  },
  {
    id: 3,
    text: 'e locked up your money and threw away the key!',
  },
  {
    id: 4,
    text: 'The lock date is a promise to yourself, not a suggestion.',
  },
  {
    id: 5,
    text: 'Every dollar you don’t touch is proof you can trust yourself with more.',
  },
];

export default function SavingsQuote() {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setQuote((prev) => {
        const currentIndex = QUOTES.findIndex((q) => q.id === prev.id);
        const nextIndex = (currentIndex + 1) % QUOTES.length;
        return QUOTES[nextIndex];
      });
    }, 15000); // 15s rotation

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section
      className="card"
      style={{
        marginTop: '1.5rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '18px',
        border: '1px solid rgba(148,163,184,0.25)',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '0.8rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '0.5rem',
        }}
      >
        savings reminder
      </p>
      <p
        style={{
          margin: 0,
          fontSize: '0.95rem',
          lineHeight: 1.6,
        }}
      >
        {quote.text}
      </p>
    </section>
  );
}
