"use client";

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type MlbTeam = { id: number; name: string; division: string };

export default function TeamsPage() {
  const [teams, setTeams] = useState<MlbTeam[]>([]);

  useEffect(() => {
    fetch('/api/teams')
      .then(r => r.json())
      .then(setTeams);
  }, []);

  return (
    <div>
      <h2>MLB Teams</h2>
      <ul>
        {teams.map(t => (
          <li key={t.id}>
            {t.name} – {t.division}
          </li>
        ))}
      </ul>
    </div>
  );
}
