import { prisma } from "@/lib/prisma";

type MlbTeam = {
  id: number;
  name: string;
  division: string;
};

type TeamsPageProps = {
  teams: MlbTeam[];
};

export async function getServerSideProps() {
  const teams = await prisma.mlbTeam.findMany({
    orderBy: { name: "asc" }
  });

  return {
    props: {
      teams
    }
  };
}

export default function TeamsPage({ teams }: TeamsPageProps) {
  return (
    <div>
      <h2>MLB Teams</h2>
      <ul>
        {teams.map(t => (
          <li key={t.id}>
            {t.name} – {t.division}
          </li>
        ))}
      </ul>
    </div>
  );
}
