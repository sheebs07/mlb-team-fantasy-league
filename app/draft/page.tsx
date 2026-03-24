import DraftClient from "./DraftClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function DraftPage() {
  const owners = await prisma.owner.findMany();
  const teams = await prisma.mlbTeam.findMany();
  const picks = await prisma.draftPick.findMany({
    include: { owner: true, mlbTeam: true }
  });

  return (
    <DraftClient
      owners={owners}
      teams={teams}
      picks={picks}
    />
  );
}
