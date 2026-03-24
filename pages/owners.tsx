import { prisma } from "@/lib/prisma";

type Owner = { id: number; name: string };

type OwnersPageProps = {
  owners: Owner[];
};

export async function getServerSideProps() {
  const owners = await prisma.owner.findMany({
    orderBy: { id: "asc" }
  });

  return {
    props: {
      owners
    }
  };
}

export default function OwnersPage({ owners }: OwnersPageProps) {
  return (
    <div>
      <h2>Owners</h2>
      <ul>
        {owners.map(o => (
          <li key={o.id}>{o.name}</li>
        ))}
      </ul>
    </div>
  );
}
