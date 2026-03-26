"use client";

import { useEffect, useState } from "react";
import { prisma } from "@/lib/prisma";

type OwnerRow = {
  ownerId: number;
  ownerName: string;
  wins: number;
  losses: number;
  pct: number;
  rank: number;
  teams: {
    mlbId: number;
    name: string;
    wins: number;
    losses: number;
  }[];
};

export async function getServerSideProps() {
  const owners = await prisma.owner.findMany({
    include: {
      picks: {
        include: {
          mlbTeam: {
            include: { standings: true }
          }
        }
      }
    },
    orderBy: { name: "asc" }
  });

  const rows: OwnerRow[] = owners.map((o) => {
    const teams = o.picks.map((p) => ({
      mlbId: p.mlbTeam.mlbId,
      name: p.mlbTeam.name,
      wins: p.mlbTeam.standings?.wins ?? 0,
      losses: p.mlbTeam.standings?.losses ?? 0
    }));

    const wins = teams.reduce((sum, t) => sum + t.wins, 0);
    const losses = teams.reduce((sum, t) => sum + t.losses, 0);
    const pct = wins + losses > 0 ? wins / (wins + losses) : 0;

    return {
      ownerId: o.id,
      ownerName: o.name,
      wins,
      losses,
      pct,
      rank: 0,
      teams
    };
  });

  // Sort by wins, win %, then losses
  rows.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.pct !== a.pct) return b.pct - a.pct;
    return a.losses - b.losses;
  });

  // Dense ranking
  if (rows.length > 0) {
    let currentRank = 1;
    rows[0].rank = 1;

    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const curr = rows[i];

      // FIXED: 0–0 and 0–1 are NOT the same
      const sameRecord =
        prev.wins === curr.wins &&
        prev.losses === curr.losses;

      if (!sameRecord) currentRank += 1;

      curr.rank = currentRank;
    }
  }

  return {
    props: {
      rows
    }
  };
}

export default function StandingsPage({ rows }: { rows: OwnerRow[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);

  // ⭐ Local timestamp stored in browser only
  const [localTime, setLocalTime] = useState("");

  // Load saved timestamp on mount
  useEffect(() => {
    const saved = localStorage.getItem("lastRefresh");
    if (saved) {
      setLocalTime(new Date(saved).toLocaleString());
    }
  }, []);

  const logo = (mlbId: number) => `/logos/${mlbId}.png`;

  const toggle = (ownerId: number) =>
    setOpen((prev) => ({ ...prev, [ownerId]: !prev[ownerId] }));

  const refreshData = async () => {
    setLoading(true);
    await fetch("/api/mlb-sync", { method: "POST" });

    // ⭐ Save timestamp to localStorage
    const now = new Date().toISOString();
    localStorage.setItem("lastRefresh", now);
    setLocalTime(new Date(now).toLocaleString());

    window.location.reload();
  };

  return (
    <div>
      {/* HEADER WITH RIGHT-ALIGNED BUTTON */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px"
        }}
      >
        <h1>League Standings</h1>

        <div style={{ textAlign: "right" }}>
          <button
            onClick={refreshData}
            disabled={loading}
            style={{
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: "14px",
              marginBottom: "6px"
            }}
          >
            {loading ? "Refreshing…" : "Refresh Data"}
          </button>

          <div style={{ fontSize: "13px", color: "#666" }}>
            Last Data Refresh: {localTime || "—"}
          </div>
        </div>
      </div>

      {/* STANDINGS TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px"
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
              Owner
            </th>
            <th style={{ textAlign: "right", borderBottom: "2px solid #ccc" }}>
              Wins
            </th>
            <th style={{ textAlign: "right", borderBottom: "2px solid #ccc" }}>
              Losses
            </th>
            <th style={{ textAlign: "right", borderBottom: "2px solid #ccc" }}>
              Win %
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((owner) => (
            <>
              <tr
                key={owner.ownerId}
                onClick={() => toggle(owner.ownerId)}
                style={{
                  cursor: "pointer",
                  background: "#f7f7f7"
                }}
              >
                <td style={{ padding: "8px 0", fontWeight: 700 }}>
                  {owner.rank}. {owner.ownerName}
                  <span style={{ marginLeft: "8px", color: "#888" }}>
                    {open[owner.ownerId] ? "▲" : "▼"}
                  </span>
                </td>

                <td style={{ textAlign: "right" }}>{owner.wins}</td>
                <td style={{ textAlign: "right" }}>{owner.losses}</td>
                <td style={{ textAlign: "right" }}>{owner.pct.toFixed(3)}</td>
              </tr>

              {open[owner.ownerId] &&
                owner.teams.map((team) => (
                  <tr key={team.mlbId}>
                    <td
                      style={{
                        padding: "6px 0 6px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}
                    >
                      <img
                        src={logo(team.mlbId)}
                        alt={team.name}
                        style={{
                          width: "28px",
                          height: "28px",
                          objectFit: "contain"
                        }}
                      />
                      {team.name}
                    </td>

                    <td style={{ textAlign: "right" }}>{team.wins}</td>
                    <td style={{ textAlign: "right" }}>{team.losses}</td>
                    <td style={{ textAlign: "right" }}>
                      {(team.wins + team.losses > 0
                        ? team.wins / (team.wins + team.losses)
                        : 0
                      ).toFixed(3)}
                    </td>
                  </tr>
                ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
