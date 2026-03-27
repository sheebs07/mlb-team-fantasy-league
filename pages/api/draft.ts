import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { generateDraftOrder } from "@/lib/draft";

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

    // Load league settings
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return res.status(500).json({ error: "League settings missing" });
    }

    const { rounds, draftType } = settings;

    // Load owners in draft order
    const owners = await prisma.owner.findMany({
      orderBy: { draftSlot: "asc" }
    });
    const ownerIds = owners.map(o => o.id);

    // Generate full draft order
    const draftOrder = generateDraftOrder(ownerIds, rounds, draftType as "snake" | "linear");

    // Load existing picks
    const existingPicks = await prisma.draftPick.findMany({
      orderBy: { pickNumber: "asc" }
    });

    // Draft complete?
    if (existingPicks.length >= draftOrder.length) {
      return res.status(400).json({ error: "Draft complete" });
    }

    // Team already taken?
    const alreadyTaken = await prisma.draftPick.findFirst({
      where: { mlbTeamId }
    });
    if (alreadyTaken) {
      return res.status(400).json({ error: "Team already drafted" });
    }

    // Determine next owner
    const nextOwnerId = draftOrder[existingPicks.length];

    // Compute pick number + round
    const pickNumber = existingPicks.length + 1;
    const round = Math.ceil(pickNumber / owners.length);

    // Create pick
    const pick = await prisma.draftPick.create({
      data: {
        ownerId: nextOwnerId,
        mlbTeamId,
        round,
        pickNumber
      },
      include: { owner: true, mlbTeam: true }
    });

    return res.status(200).json(pick);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
