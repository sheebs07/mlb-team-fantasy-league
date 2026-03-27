import { prisma } from "@/lib/prisma";
import { generateDraftOrder } from "@/lib/draft";

export default async function handler(req: any, res: any) {
  const owners = await prisma.owner.findMany({
    orderBy: { draftSlot: "asc" }
  });

  const picks = await prisma.draftPick.findMany({
    orderBy: { pickNumber: "asc" }
  });

  // Load league settings
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    return res.status(500).json({ error: "League settings missing" });
  }

  const { rounds, draftType } = settings;

  const ownerIds = owners.map(o => o.id);

  // Build full draft order
  const draftOrder = generateDraftOrder(ownerIds, rounds, draftType as "snake" | "linear");

  const currentPick = picks.length + 1;
  const onTheClockOwnerId = draftOrder[picks.length];

  res.status(200).json({
    currentPick,
    currentRound: Math.ceil(currentPick / owners.length),
    onTheClockOwnerId,
    snakeOrder: draftOrder
  });
}
