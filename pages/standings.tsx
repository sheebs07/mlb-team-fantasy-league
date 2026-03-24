import { prisma } from "@/lib/prisma";

type Row = {
  ownerId: number;
  ownerName: string;
  wins: number;
  losses: number;
  pct: number;
  teams: string[];
};

type StandingsPageProps = {
  rows: Row[];
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
    }
  });

  const rows: Row[] = owners.map(o => {
    const wins = o.picks.reduce(
      (sum, p) => sum + (p.mlbTeam.standings?.wins ?? 0),
      0
    );
    const losses = o.picks.reduce(
      (sum, p) => sum + (p.mlbTeam.standings?.losses ?? 0),
      0
    );
    const total = wins + losses;
    const pct = total > 0 ? wins / total : 0;

    return {
      ownerId: o.id,
      ownerName: o.name,
      wins,
      losses,
      pct,
      teams: o.picks.map(p => p.mlbTeam.name)
    };
  });

  rows.sort((a, b) => b.wins - a.wins || b.pct - a.pct);

  return {
    props: {
      rows
    }
  };
}

export default function StandingsPage({ rows }: StandingsPageProps) {
  return (
    <div>
      <h2>League Standings</h2>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Owner</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "right" }}>Wins</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "right" }}>Losses</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "right" }}>Win %</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Teams</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.ownerId}>
              <td style={{ padding: "4px 0" }}>{r.ownerName}</td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>{r.wins}</td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>{r.losses}</td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>{r.pct.toFixed(3)}</td>
              <td style={{ padding: "4px 0" }}>{r.teams.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
