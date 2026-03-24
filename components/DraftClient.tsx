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

  const takenTeamIds = new Set(picks.map((p) => p.mlbTeam.id));
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
    setPicks((prev) => [...prev, pick]);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "6px" }}>Snake Draft</h2>
        <p style={{ color: "#555" }}>
          Pick {currentPickNumber} of {totalPicks}
        </p>
      </div>

      {/* Draft Board */}
      <h3 style={{ marginBottom: "10px" }}>Draft Board</h3>
      <div style={{ marginBottom: "20px" }}>
        {picks.length === 0 && (
          <p style={{ color: "#666" }}>No picks yet — draft is starting.</p>
        )}

        <ol style={{ paddingLeft: "20px" }}>
          {picks.map((p) => (
            <li
              key={p.id}
              className={p.pickNumber === currentPickNumber - 1 ? "current-pick" : ""}
              style={{ marginBottom: "6px" }}
            >
              #{p.pickNumber} — <strong>{p.owner.name}</strong> → {p.mlbTeam.name}{" "}
              <span style={{ color: "#777" }}>(Round {p.round})</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Available Teams */}
      <h3 style={{ marginBottom: "10px" }}>Available Teams</h3>
      {loading && <p style={{ color: "#777" }}>Submitting pick…</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "12px"
        }}
      >
        {teams
          .filter((t) => !takenTeamIds.has(t.id))
          .map((team) => (
            <div
              key={team.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "12px",
                gap: "10px",
                background: "white"
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "14px" }}>
                {team.name}
              </div>

              <div style={{ color: "#666", fontSize: "13px" }}>
                {team.division}
              </div>

              <button
                onClick={() => handlePick(team.id)}
                disabled={loading}
                style={{
                  marginTop: "8px",
                  padding: "6px 10px",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                Draft Team
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
