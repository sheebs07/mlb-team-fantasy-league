import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const owners = await prisma.owner.findMany({
      include: {
        picks: {
          include: {
            mlbTeam: {
              include: { standings: true }
            }
          }
        }
      }
    });

    const standings = owners.map(o => {
      const wins = o.picks.reduce(
        (sum, p) => sum + (p.mlbTeam.standings?.wins ?? 0),
        0
      );
      const losses = o.picks.reduce(
        (sum, p) => sum + (p.mlbTeam.standings?.losses ?? 0),
        0
      );
      const total = wins + losses;
      const pct = total > 0 ? wins / total : 0;

      return {
        ownerId: o.id,
        ownerName: o.name,
        wins,
        losses,
        pct,
        teams: o.picks.map(p => p.mlbTeam.name)
      };
    });

    standings.sort((a, b) => b.wins - a.wins || b.pct - a.pct);

    return res.status(200).json(standings);
  } catch (err: any) {
    console.error("Standings API Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
