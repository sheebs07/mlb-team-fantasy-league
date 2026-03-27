import { prisma } from "@/lib/prisma";
import { generateDraftOrder } from "@/lib/draft";

// Initialize global variables if they don't exist
if (!global.pickStartTime) global.pickStartTime = new Date();
if (!global.lastPickNumber) global.lastPickNumber = 1;
if (global.draftStatus === undefined) global.draftStatus = "inactive"; 
if (global.preDraftStartTime === undefined) global.preDraftStartTime = null;

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

  // Build full draft order (snake or linear)
  const draftOrder = generateDraftOrder(
    ownerIds,
    rounds,
    draftType as "snake" | "linear"
  );

  const currentPick = picks.length + 1;
  const onTheClockOwnerId = draftOrder[picks.length];

  // ⭐ Reset global pick clock ONLY when pick number changes
  if (global.lastPickNumber !== currentPick) {
    global.pickStartTime = new Date();
    global.lastPickNumber = currentPick;
  }

  res.status(200).json({
    currentPick,
    currentRound: Math.ceil(currentPick / owners.length),
    onTheClockOwnerId,
    snakeOrder: draftOrder,
    pickStartTime: global.pickStartTime, // ⭐ Send to all clients
    draftStatus: global.draftStatus,
    preDraftStartTime: global.preDraftStartTime
  });
}
