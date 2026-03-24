import { prisma } from "@/lib/prisma";

type Owner = {
  id: number;
  name: string;
  picks: {
    mlbTeam: {
      name: string;
    };
  }[];
};

type OwnersPageProps = {
  owners: Owner[];
};

export async function getServerSideProps() {
  const owners = await prisma.owner.findMany({
    include: {
      picks: {
        include: {
          mlbTeam: true
        }
      }
    },
    orderBy: { name: "asc" }
  });

  return {
    props: { owners }
  };
}

export default function OwnersPage({ owners }: OwnersPageProps) {
  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>League Owners</h1>

      {owners.map((owner) => (
        <div className="card" key={owner.id}>
          <h2 style={{ marginBottom: "10px" }}>{owner.name}</h2>

          {owner.picks.length === 0 ? (
            <p style={{ color: "#666" }}>No teams drafted yet</p>
          ) : (
            <ul style={{ paddingLeft: "20px" }}>
              {owner.picks.map((p, index) => (
                <li key={index}>{p.mlbTeam.name}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
