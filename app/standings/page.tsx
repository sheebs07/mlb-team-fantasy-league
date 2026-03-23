"use client";

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type Row = {
  ownerId: number;
  ownerName: string;
  wins: number;
  losses: number;
  pct: number;
  teams: string[];
};

export default function StandingsPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch('/api/standings')
      .then(r => r.json())
      .then(setRows);
  }, []);

  return (
    <div>
      <h2>League Standings</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Owner</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}>Wins</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}>Losses</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}>Win %</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Teams</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.ownerId}>
              <td style={{ padding: '4px 0' }}>{r.ownerName}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>{r.wins}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>{r.losses}</td>
              <td style={{ padding: '4px 0', textAlign: 'right' }}>{r.pct.toFixed(3)}</td>
              <td style={{ padding: '4px 0' }}>{r.teams.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
