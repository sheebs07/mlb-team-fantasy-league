import { useState } from "react";
import { prisma } from "@/lib/prisma";

type OwnerRow = {
  ownerId: number;
  ownerName: string;
  wins: number;
  losses: number;
  pct: number;
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
      teams
    };
  });

  rows.sort((a, b) => b.pct - a.pct);

  return { props: { rows } };
}

export default function StandingsPage({ rows }: { rows: OwnerRow[] }) {
  const logo = (mlbId: number) => `/logos/${mlbId}.png`;
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const toggle = (ownerId: number) =>
    setOpen((prev) => ({ ...prev, [ownerId]: !prev[ownerId] }));

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>League Standings</h1>

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
              {/* OWNER SUMMARY ROW */}
              <tr
                key={owner.ownerId}
                onClick={() => toggle(owner.ownerId)}
                style={{
                  cursor: "pointer",
                  background: "#f7f7f7"
                }}
              >
                <td style={{ padding: "8px 0" }}>
                  {owner.ownerName}
                  <span style={{ marginLeft: "8px", color: "#888" }}>
                    {open[owner.ownerId] ? "▲" : "▼"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>{owner.wins}</td>
                <td style={{ textAlign: "right" }}>{owner.losses}</td>
                <td style={{ textAlign: "right" }}>
                  {owner.pct.toFixed(3)}
                </td>
              </tr>

              {/* COLLAPSIBLE TEAM ROWS */}
              {open[owner.ownerId] &&
                owner.teams.map((team) => (
                  <tr key={team.mlbId}>
                    <td style={{ padding: "6px 0 6px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
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
