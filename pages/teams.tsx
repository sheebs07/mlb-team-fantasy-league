import { prisma } from "@/lib/prisma";

type Team = {
  id: number;
  name: string;
  division: string;
  mlbId: number;
};

type TeamsPageProps = {
  teams: Team[];
};

export async function getServerSideProps() {
  const teams = await prisma.mlbTeam.findMany({
    select: {
      id: true,
      name: true,
      division: true,
      mlbId: true
    },
    orderBy: { name: "asc" }
  });

  return {
    props: { teams }
  };
}

export default function TeamsPage({ teams }: TeamsPageProps) {
  const getLogoUrl = (team: Team) => `/logos/${team.mlbId}.png`;

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>MLB Teams</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px"
        }}
      >
        {teams.map((team) => (
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
          </div>
        ))}
      </div>
    </div>
  );
}
