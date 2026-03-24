"use client";

import { useState, useEffect } from "react";

type Owner = { id: number; name: string };
type MlbTeam = { id: number; name: string; division: string; mlbId: number };

type DraftPick = {
  id: number;
  ownerId: number;
  mlbTeamId: number;
  round: number;
  pickNumber: number;
  mlbTeam: {
    name: string;
  };
};

type DraftState = {
  currentPick: number;
  currentRound: number;
  onTheClockOwnerId: number;
  snakeOrder: number[];
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

  // Live draft state + all picks from server
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [allPicks, setAllPicks] = useState<DraftPick[]>(initialPicks);

  const rounds = 5;

  // Poll draft state + picks every 3 seconds
  useEffect(() => {
    const load = async () => {
      const stateRes = await fetch("/api/draftState");
      const stateData = await stateRes.json();
      setDraftState(stateData);

      const picksRes = await fetch("/api/getPicks");
      const picksData = await picksRes.json();

      // Transform server picks → client picks
      const transformed = picksData.picks.map((p: any) => ({
        id: p.id,
        ownerId: p.ownerId,
        mlbTeamId: p.mlbTeamId,
        round: p.round,
        pickNumber: p.pickNumber,
        mlbTeam: {
          name: p.mlbTeam.name
        }
      }));

      setAllPicks(transformed);
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  // IMPORTANT: taken teams must match mlbTeamId, not mlbId
  const takenTeamIds = new Set(allPicks.map((p) => p.mlbTeamId));

  const totalPicks = owners.length * rounds;
  const currentPickNumber = allPicks.length + 1;

  const getLogoUrl = (team: MlbTeam) => `/logos/${team.mlbId}.png`;

  // ⭐ FIXED: handlePick updates BOTH picks + allPicks AND transforms shape
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

    const p = await res.json();

    // Transform Prisma pick → DraftClient pick
    const clientPick: DraftPick = {
      id: p.id,
      ownerId: p.ownerId,
      mlbTeamId: p.mlbTeamId,
      round: p.round,
      pickNumber: p.pickNumber,
      mlbTeam: {
        name: p.mlbTeam.name
      }
    };

    // Update BOTH states so UI updates instantly
    setPicks((prev) => [...prev, clientPick]);
    setAllPicks((prev) => [...prev, clientPick]);
  };

  // Build Draft Board grid
  const grid: Record<number, Record<number, DraftPick | null>> = {};
  owners.forEach((o) => {
    grid[o.id] = {};
    for (let r = 1; r <= rounds; r++) {
      grid[o.id][r] = null;
    }
  });

  allPicks.forEach((p) => {
    grid[p.ownerId][p.round] = p;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "6px" }}>Snake Draft</h2>
        <p style={{ color: "#555" }}>
          Pick {currentPickNumber} of {totalPicks}
        </p>
      </div>

      {/* ============================
          DRAFT BOARD
      ============================ */}
      <h3 style={{ marginBottom: "10px" }}>Draft Board</h3>

      {draftState && (
        <h4 style={{ marginBottom: "20px" }}>
          On the clock:{" "}
          <span style={{ color: "green" }}>
            {owners.find((o) => o.id === draftState.onTheClockOwnerId)?.name}
          </span>{" "}
          (Pick {draftState.currentPick})
        </h4>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
          marginBottom: "30px"
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                borderBottom: "2px solid #ccc",
                textAlign: "center",
                padding: "8px"
              }}
            >
              Owner
            </th>

            {[1, 2, 3, 4, 5].map((r) => (
              <th
                key={r}
                style={{
                  borderBottom: "2px solid #ccc",
                  textAlign: "center",
                  padding: "8px"
                }}
              >
                Round {r}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {owners.map((owner) => (
            <tr key={owner.id}>
              <td
                style={{
                  padding: "8px",
                  fontWeight:
                    draftState?.onTheClockOwnerId === owner.id ? "bold" : "normal",
                  background:
                    draftState?.onTheClockOwnerId === owner.id
                      ? "#e0ffe0"
                      : "transparent"
                }}
              >
                {owner.name}
              </td>

              {[1, 2, 3, 4, 5].map((round) => {
                const pick = grid[owner.id][round];

                return (
                  <td
                    key={round}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      background: pick ? "#fff3cd" : "transparent"
                    }}
                  >
                    {pick ? pick.mlbTeam.name : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ============================
          AVAILABLE TEAMS
      ============================ */}
      <h3 style={{ marginBottom: "10px" }}>Available Teams</h3>
      {loading && <p style={{ color: "#777" }}>Submitting pick…</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "12px"
        }}
      >
        {teams
          .filter((t) => !takenTeamIds.has(t.id)) // FIXED
          .map((team) => (
            <div
              key={team.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "12px",
                gap: "12px",
                background: "white"
              }}
            >
              <img
                src={getLogoUrl(team)}
                alt={team.name}
                style={{
                  width: "48px",
                  height: "48px",
                  objectFit: "contain"
                }}
              />

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 600, fontSize: "15px" }}>
                  {team.name}
                </div>

                <div style={{ color: "#666", fontSize: "13px" }}>
                  {team.division}
                </div>
              </div>

              <button
                onClick={() => handlePick(team.id)}
                disabled={loading}
                style={{
                  marginLeft: "auto",
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
