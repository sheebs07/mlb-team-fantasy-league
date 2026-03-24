import { prisma } from "@/lib/prisma";

type OwnerRow = {
  ownerId: number;
  ownerName: string;
  wins: number;
  losses: number;
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

    return {
      ownerId: o.id,
      ownerName: o.name,
      wins,
      losses,
      teams
    };
  });

  // Sort owners by wins, then win %
  rows.sort((a, b) => {
    const pctA = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
    const pctB = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;
    return b.wins - a.wins || pctB - pctA;
  });

  return { props: { rows } };
}

export default function StandingsPage({ rows }: { rows: OwnerRow[] }) {
  const logo = (mlbId: number) => `/logos/${mlbId}.png`;

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>League Standings</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {rows.map((owner) => (
          <div
            key={owner.ownerId}
            className="card"
            style={{
              padding: "16px",
              background: "white",
              borderRadius: "8px"
            }}
          >
            {/* OWNER SUMMARY ROW */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                fontSize: "18px",
                marginBottom: "10px"
              }}
            >
              <span>{owner.ownerName}</span>
              <span>
                {owner.wins}-{owner.losses}
              </span>
            </div>

            {/* NESTED TEAM ROWS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {owner.teams.map((team) => (
                <div
                  key={team.mlbId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 0",
                    borderBottom: "1px solid #eee"
                  }}
                >
                  <img
                    src={logo(team.mlbId)}
                    alt={team.name}
                    style={{
                      width: "32px",
                      height: "32px",
                      objectFit: "contain",
                      marginRight: "10px"
                    }}
                  />

                  <div style={{ flexGrow: 1, fontSize: "15px" }}>
                    {team.name}
                  </div>

                  <div style={{ fontWeight: 600 }}>
                    {team.wins}-{team.losses}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
