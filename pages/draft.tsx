import { prisma } from "@/lib/prisma";
import DraftClient from "@/components/DraftClient";

type Owner = {
  id: number;
  name: string;
};

type Team = {
  id: number;
  name: string;
  division: string;
  mlbId: number; // ⭐ Added
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

  // ⭐ Updated to include mlbId
  const teams = await prisma.mlbTeam.findMany({
    select: {
      id: true,
      name: true,
      division: true,
      mlbId: true
    },
    orderBy: { name: "asc" }
  });

  const picks = await prisma.draftPick.findMany({
    include: {
      owner: true,
      mlbTeam: true // includes mlbId automatically
    },
    orderBy: { pickNumber: "asc" }
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
  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Live Draft</h1>

      <DraftClient owners={owners} teams={teams} picks={picks} />
    </div>
  );
}
