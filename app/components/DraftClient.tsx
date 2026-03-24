"use client";

import { useState } from "react";

type Owner = { id: number; name: string };
type MlbTeam = { id: number; name: string; division: string };
type DraftPick = {
  id: number;
  owner: Owner;
  mlbTeam: MlbTeam;
  round: number;
  pickNumber: number;
};

export default function DraftClient({
  owners,
  teams,
  picks: initialPicks
}: {
  owners: Owner[];
  teams: MlbTeam[];
  picks: DraftPick[];
}) {
  const [picks, setPicks] = useState(initialPicks);
  const [loading, setLoading] = useState(false);
  const rounds = 5;

  const takenTeamIds = new Set(picks.map(p => p.mlbTeam.id));
  const totalPicks = owners.length * rounds;
  const currentPickNumber = picks.length + 1;

  const handlePick = async (teamId: number) => {
    setLoading(true);
    const res = await fetch("/api/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mlbTeamId: teamId })
    });
    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Error making pick");
      return;
    }

    const pick = await res.json();
    setPicks(prev => [...prev, pick]);
  };

  return (
    <div>
      <h2>Snake Draft</h2>
      <p>
        Pick {currentPickNumber} of {totalPicks}
      </p>

      <h3>Drafted so far</h3>
      <ol>
        {picks.map(p => (
          <li key={p.id}>
            #{p.pickNumber} – <strong>{p.owner.name}</strong> →{" "}
            {p.mlbTeam.name} (Round {p.round})
          </li>
        ))}
      </ol>

      <h3>Available Teams</h3>
      {loading && <p>Submitting pick...</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {teams
          .filter(t => !takenTeamIds.has(t.id))
          .map(team => (
            <button
              key={team.id}
              onClick={() => handlePick(team.id)}
              disabled={loading}
              style={{ padding: 8, border: "1px solid #ccc", cursor: "pointer" }}
            >
              {team.name} ({team.division})
            </button>
          ))}
      </div>
    </div>
  );
}
