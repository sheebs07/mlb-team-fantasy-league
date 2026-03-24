import { prisma } from "@/lib/prisma";
import DraftClient from "@/app/draft/DraftClient";

type Owner = {
  id: number;
  name: string;
};

type Team = {
  id: number;
  name: string;
  division: string;
};

type Pick = {
  id: number;
  pickNumber: number;
  round: number;
  owner: Owner;
  mlbTeam: Team;
};

type DraftPageProps = {
  owners: Owner[];
  teams: Team[];
  picks: Pick[];
};

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

export default function DraftPage({ owners, teams, picks }: DraftPageProps) {
  return <DraftClient owners={owners} teams={teams} picks={picks} />;
}
