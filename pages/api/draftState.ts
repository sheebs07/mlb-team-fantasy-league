import { prisma } from "@/lib/prisma";

export default async function handler(req: any, res: any) {
  const owners = await prisma.owner.findMany({
    orderBy: { draftSlot: "asc" }
  });

  const picks = await prisma.draftPick.findMany();

  const rounds = 5;
  const snakeOrder = [];

  for (let round = 1; round <= rounds; round++) {
    const forward = round % 2 === 1;
    const order = forward ? owners : [...owners].reverse();
    for (const owner of order) snakeOrder.push(owner.id);
  }

  const currentPick = picks.length + 1;
  const onTheClockOwnerId = snakeOrder[picks.length];

  res.status(200).json({
    currentPick,
    currentRound: Math.ceil(currentPick / owners.length),
    onTheClockOwnerId,
    snakeOrder
  });
}
