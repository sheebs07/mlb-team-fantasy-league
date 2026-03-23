import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { generateSnakeOrder } from "@/lib/draft";

const ROUNDS = 5;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const picks = await prisma.draftPick.findMany({
      orderBy: { pickNumber: "asc" },
      include: { owner: true, mlbTeam: true }
    });
    return res.status(200).json(picks);
  }

  if (req.method === "POST") {
    const { mlbTeamId } = req.body;

    const owners = await prisma.owner.findMany({ orderBy: { id: "asc" } });
    const ownerIds = owners.map(o => o.id);
    const snakeOrder = generateSnakeOrder(ownerIds, ROUNDS);

    const existingPicks = await prisma.draftPick.findMany({
      orderBy: { pickNumber: "asc" }
    });

    if (existingPicks.length >= snakeOrder.length) {
      return res.status(400).json({ error: "Draft complete" });
    }

    const alreadyTaken = await prisma.draftPick.findFirst({
      where: { mlbTeamId }
    });
    if (alreadyTaken) {
      return res.status(400).json({ error: "Team already drafted" });
    }

    const nextSlot = snakeOrder[existingPicks.length];

    const pick = await prisma.draftPick.create({
      data: {
        ownerId: nextSlot.ownerId,
        mlbTeamId,
        round: nextSlot.round,
        pickNumber: nextSlot.pick
      },
      include: { owner: true, mlbTeam: true }
    });

    return res.status(200).json(pick);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
