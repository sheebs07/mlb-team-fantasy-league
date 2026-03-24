import { useEffect, useState } from "react";

type Owner = {
  id: number;
  name: string;
  draftSlot: number;
};

type Pick = {
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

export default function DraftBoard() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [state, setState] = useState<DraftState | null>(null);

  useEffect(() => {
    const load = async () => {
      const ownersRes = await fetch("/api/getOwners");
      const ownersData = await ownersRes.json();
      setOwners(ownersData.owners);

      const picksRes = await fetch("/api/getPicks");
      const picksData = await picksRes.json();
      setPicks(picksData.picks);

      const stateRes = await fetch("/api/draftState");
      const stateData = await stateRes.json();
      setState(stateData);
    };

    load();

    // Auto-refresh every 3 seconds
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!state) return <div>Loading draft board…</div>;

  const rounds = 5;
  const grid: Record<number, Record<number, Pick | null>> = {};


  // Build grid: ownerId -> round -> pick
  owners.forEach((o) => {
    grid[o.id] = {};
    for (let r = 1; r <= rounds; r++) {
      grid[o.id][r] = null;
    }
  });

  picks.forEach((p) => {
    grid[p.ownerId][p.round] = p;
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>Draft Board</h1>

      <h2 style={{ marginBottom: "20px" }}>
        On the clock:{" "}
        <span style={{ color: "green" }}>
          {owners.find((o) => o.id === state.onTheClockOwnerId)?.name}
        </span>{" "}
        (Pick {state.currentPick})
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center"
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #ccc" }}>Owner</th>
            {[1, 2, 3, 4, 5].map((r) => (
              <th key={r} style={{ borderBottom: "2px solid #ccc" }}>
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
                    owner.id === state.onTheClockOwnerId ? "bold" : "normal",
                  background:
                    owner.id === state.onTheClockOwnerId
                      ? "#e0ffe0"
                      : "transparent"
                }}
              >
                {owner.name}
              </td>

              {[1, 2, 3, 4, 5].map((round) => {
                const pick = grid[owner.id][round];
                const isCurrent =
                  pick?.pickNumber === state.currentPick - 1 &&
                  owner.id === state.onTheClockOwnerId;

                return (
                  <td
                    key={round}
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      background: isCurrent ? "#fff3cd" : "transparent"
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
    </div>
  );
}
