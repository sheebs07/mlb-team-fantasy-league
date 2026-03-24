import { GetServerSideProps } from "next";
import { prisma } from "@/lib/prisma";
import DraftClient from "@/components/DraftClient";

type Owner = {
  id: number;
  name: string;
};

type MlbTeam = {
  id: number;
  name: string;
  division: string;
  mlbId: number;
};

type DraftPickClient = {
  id: number;
  ownerId: number;
  mlbTeamId: number;
  round: number;
  pickNumber: number;
  mlbTeam: {
    name: string;
  };
};

type DraftPageProps = {
  owners: Owner[];
  teams: MlbTeam[];
  picks: DraftPickClient[];
};

export const getServerSideProps: GetServerSideProps<DraftPageProps> = async () => {
  const owners = await prisma.owner.findMany({
    orderBy: { draftSlot: "asc" }
  });

  const teams = await prisma.mlbTeam.findMany({
    orderBy: { name: "asc" }
  });

  const picks = await prisma.draftPick.findMany({
    include: { mlbTeam: true },
    orderBy: { pickNumber: "asc" }
  });

  const clientPicks: DraftPickClient[] = picks.map((p) => ({
    id: p.id,
    ownerId: p.ownerId,
    mlbTeamId: p.mlbTeamId,
    round: p.round,
    pickNumber: p.pickNumber,
    mlbTeam: {
      name: p.mlbTeam.name
    }
  }));

  return {
    props: {
      owners: owners.map((o) => ({ id: o.id, name: o.name })),
      teams: teams.map((t) => ({
        id: t.id,
        name: t.name,
        division: t.division,
        mlbId: t.mlbId
      })),
      picks: clientPicks
    }
  };
};

export default function DraftPage({ owners, teams, picks }: DraftPageProps) {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>Live Draft</h1>

      <DraftClient owners={owners} teams={teams} picks={picks} />
    </div>
  );
}
