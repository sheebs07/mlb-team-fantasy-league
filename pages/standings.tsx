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

  const rows: Row[] = owners.map((o) => {
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
      teams: o.picks.map((p) => p.mlbTeam.name)
    };
  });

  rows.sort((a, b) => b.wins - a.wins || b.pct - a.pct);

  return {
    props: { rows }
  };
}

export default function StandingsPage({ rows }: StandingsPageProps) {
  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>League Standings</h1>

      <table>
        <thead>
          <tr>
            <th>Owner</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Win %</th>
            <th>Teams</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.ownerId}>
              <td>{r.ownerName}</td>
              <td>{r.wins}</td>
              <td>{r.losses}</td>
              <td>{r.pct.toFixed(3)}</td>
              <td>{r.teams.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
