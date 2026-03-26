import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { generateSnakeOrder } from "@/lib/draft"; // if needed elsewhere

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const season = 2026;

    const apiRes = await fetch(
      `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${season}`
    );
    const data = await apiRes.json();

    const records = data.records ?? [];

    for (const record of records) {
      for (const teamRec of record.teamRecords) {
        const team = teamRec.team;
        const mlbId = team.id;
        const wins = teamRec.wins;
        const losses = teamRec.losses;
        const pct = parseFloat(teamRec.winningPercentage);

        // Upsert MLB team
        const mlbTeam = await prisma.mlbTeam.upsert({
          where: { mlbId },
          update: {
            name: team.name,
          },
          create: {
            mlbId,
            name: team.name,
            division: record.division?.name ?? "Unknown"
          }
        });

        // Upsert standings
        await prisma.mlbStanding.upsert({
          where: { mlbTeamId: mlbTeam.id },
          update: { wins, losses, pct },
          create: {
            mlbTeamId: mlbTeam.id,
            wins,
            losses,
            pct
          }
        });
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (err: any) {
    console.error("MLB Sync Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
