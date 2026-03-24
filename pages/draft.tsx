import { prisma } from "@/lib/prisma";
import DraftClient from "@/app/draft/DraftClient"; // keep your client component

export async function getServerSideProps() {
  const owners = await prisma.owner.findMany();
  const teams = await prisma.mlbTeam.findMany();
  const picks = await prisma.draftPick.findMany({
    include: { owner: true, mlbTeam: true }
  });

  return {
    props: {
      owners,
      teams,
      picks
    }
  };
}

export default function DraftPage({ owners, teams, picks }) {
  return <DraftClient owners={owners} teams={teams} picks={picks} />;
}
