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
    mlbId: number;
  };
};

type DraftState = {
  currentPick: number;
  currentRound: number;
  onTheClockOwnerId: number;
  snakeOrder: number[];
};

type Settings = {
  id: number;
  draftType: string; // "snake" or "linear"
  rounds: number;
  commissionerPassword: string;
};

export default function DraftClient({
  owners,
  teams,
  picks: initialPicks,
  settings
}: {
  owners: Owner[];
  teams: MlbTeam[];
  picks: DraftPick[];
  settings: Settings;
}) {
  const [picks, setPicks] = useState(initialPicks);
  const [loading, setLoading] = useState(false);
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [allPicks, setAllPicks] = useState<DraftPick[]>(initialPicks);

  const rounds = settings.rounds;
  const isSnake = settings.draftType === "snake";

  // Poll draft state + picks every 3 seconds
  useEffect(() => {
    const load = async () => {
      const stateRes = await fetch("/api/draftState");
      const stateData = await stateRes.json();
      setDraftState(stateData);

      const picksRes = await fetch("/api/getPicks");
      const picksData = await picksRes.json();

      const transformed = picksData.picks.map((p: any) => ({
        id: p.id,
        ownerId: p.ownerId,
        mlbTeamId: p.mlbTeamId,
        round: p.round,
        pickNumber: p.pickNumber,
        mlbTeam: {
          name: p.mlbTeam.name,
          mlbId: p.mlbTeam.mlbId
        }
      }));

      setAllPicks(transformed);
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const takenTeamIds = new Set(allPicks.map((p) => p.mlbTeamId));
  const totalPicks = owners.length * rounds;
  const currentPickNumber = allPicks.length + 1;

  const draftComplete = allPicks.length >= totalPicks;

  const getLogoUrl = (team: MlbTeam) => `/logos/${team.mlbId}.png`;

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

    const clientPick: DraftPick = {
      id: p.id,
      ownerId: p.ownerId,
      mlbTeamId: p.mlbTeamId,
      round: p.round,
      pickNumber: p.pickNumber,
      mlbTeam: {
        name: p.mlbTeam.name,
        mlbId: p.mlbTeam.mlbId
      }
    };

    setPicks((prev) => [...prev, clientPick]);
    setAllPicks((prev) => [...prev, clientPick]);
  };

  // Build pivoted grid: grid[round][ownerId]
  const grid: Record<number, Record<number, DraftPick | null>> = {};

  for (let r = 1; r <= rounds; r++) {
    grid[r] = {};
    owners.forEach((o) => {
      grid[r][o.id] = null;
    });
  }

  allPicks.forEach((p) => {
    grid[p.round][p.ownerId] = p;
  });

  // Compute next 5 picks (including on-the-clock)
  let nextPicks: { pickNumber: number; ownerId: number }[] = [];

  if (draftState && !draftComplete) {
    for (let i = 0; i < 6; i++) {
      const pickNum = draftState.currentPick + i;
      if (pickNum > totalPicks) break;

      const ownerId = draftState.snakeOrder[pickNum - 1];
      nextPicks.push({ pickNumber: pickNum, ownerId });
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        {!draftComplete ? (
          <p style={{ color: "#555", margin: 0 }}>
            Pick {currentPickNumber} of {totalPicks}
          </p>
        ) : (
          <p style={{ color: "green", fontWeight: 600, margin: 0 }}>
            Draft Complete
          </p>
        )}
      </div>

      {/* UPCOMING PICKS STRIP */}
      {!draftComplete && draftState && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px",
            background: "#f0f7ff",
            border: "1px solid #cce0ff",
            borderRadius: "6px"
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "8px" }}>
            Upcoming Picks
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {nextPicks.map((np, idx) => {
              const owner = owners.find((o) => o.id === np.ownerId);

              return (
                <div
                  key={np.pickNumber}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "4px",
                    background: idx === 0 ? "#d4f8d4" : "#fff",
                    border: idx === 0 ? "1px solid #8cd98c" : "1px solid #ddd",
                    fontWeight: idx === 0 ? 700 : 500
                  }}
                >
                  {idx === 0 ? "On the Clock: " : ""}

                  {(() => {
                    const ownersPerRound = owners.length;
                    const overall = np.pickNumber;
                    const round = Math.ceil(overall / ownersPerRound);

                    // Correct owner index based on snake order
                    const indexInSnake = overall - 1;
                    const ownerIdForPick =
                      draftState.snakeOrder[indexInSnake];
                    const ownerIndexInRound = owners.findIndex(
                      (o) => o.id === ownerIdForPick
                    );

                    // Correct pick-in-round
                    const pickInRound = isSnake
                      ? round % 2 === 1
                        ? ownerIndexInRound + 1
                        : ownersPerRound - ownerIndexInRound
                      : ownerIndexInRound + 1;

                    return `${owner?.name} - ${round}.${pickInRound} (#${overall})`;
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DRAFT BOARD */}
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
                padding: "8px"
              }}
            ></th>

            {owners.map((owner) => (
              <th
                key={owner.id}
                style={{
                  borderBottom: "2px solid #ccc",
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "700",
                  background:
                    draftState?.onTheClockOwnerId === owner.id &&
                    !draftComplete
                      ? "#e0ffe0"
                      : "transparent"
                }}
              >
                {owner.name}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => (
            <tr key={round}>
              <td
                style={{
                  padding: "8px",
                  fontWeight: 700,
                  borderRight: "2px solid #ccc"
                }}
              >
                Round {round}
              </td>

              {owners.map((owner) => {
                const pick = grid[round][owner.id];
                const ownerIndex = owners.findIndex(
                  (o) => o.id === owner.id
                );

                const ownersPerRound = owners.length;

                // Compute overall pick number
                let overallPickNumber: number;

                if (!isSnake) {
                  // Linear draft
                  overallPickNumber =
                    (round - 1) * ownersPerRound + (ownerIndex + 1);
                } else {
                  // Snake draft
                  overallPickNumber =
                    round % 2 === 1
                      ? (round - 1) * ownersPerRound + (ownerIndex + 1)
                      : (round - 1) * ownersPerRound +
                        (ownersPerRound - ownerIndex);
                }

                const isOnClock =
                  draftState &&
                  overallPickNumber === draftState.currentPick;

                return (
                  <td
                    key={owner.id}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      background: isOnClock
                        ? "#e0ffe0"
                        : pick
                        ? "#fff3cd"
                        : "transparent"
                    }}
                  >
                    {pick ? (
                      // Drafted cell
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: "6px",
                          justifyContent: "flex-start"
                        }}
                      >
                        <img
                          src={`/logos/${pick.mlbTeam.mlbId}.png`}
                          alt={pick.mlbTeam.name}
                          style={{
                            width: "45px",
                            height: "45px",
                            objectFit: "contain",
                            flexShrink: 0
                          }}
                        />

                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "16px",
                            textAlign: "left",
                            lineHeight: 1.1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%"
                          }}
                        >
                          {pick.mlbTeam.name}
                        </div>
                      </div>
                    ) : (
                      // Empty cell — show Round.Pick
                      <div style={{ fontSize: "14px", color: "#555" }}>
                        {(() => {
                          const indexInRound = ownerIndex;

                          const pickInRound = !isSnake
                            ? indexInRound + 1
                            : round % 2 === 1
                            ? indexInRound + 1
                            : ownersPerRound - indexInRound;

                          return `${round}.${pickInRound}`;
                        })()}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* AVAILABLE TEAMS */}
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
          .filter((t) => !takenTeamIds.has(t.id))
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
                disabled={loading || draftComplete}
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
