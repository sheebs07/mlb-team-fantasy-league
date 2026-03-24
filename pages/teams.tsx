import { prisma } from "@/lib/prisma";

type Team = {
  id: number;
  name: string;
  division: string;
};

type TeamsPageProps = {
  teams: Team[];
};

export async function getServerSideProps() {
  const teams = await prisma.mlbTeam.findMany({
    orderBy: { name: "asc" }
  });

  return {
    props: { teams }
  };
}

export default function TeamsPage({ teams }: TeamsPageProps) {
  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>MLB Teams</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "16px"
        }}
      >
        {teams.map((team) => (
          <div className="card" key={team.id}>
            <h2 style={{ marginBottom: "8px" }}>{team.name}</h2>
            <p style={{ color: "#555" }}>{team.division}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
