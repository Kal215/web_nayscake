"use client";
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: '2rem', background: '#ffcccc', color: '#990000', fontFamily: 'monospace' }}>
      <h2>CRITICAL DASHBOARD CRASH (DITANGKAP OLEH ERROR BOUNDARY)</h2>
      <p><strong>Pesan:</strong> {error.message}</p>
      <p><strong>Stack:</strong> {error.stack}</p>
      <button onClick={() => reset()} style={{ padding: '0.5rem 1rem' }}>Coba Lagi</button>
    </div>
  );
}
