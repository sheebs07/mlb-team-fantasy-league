export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const season = 2024;
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${season}`
  );
  const data = await res.json();

  const records = data.records ?? [];
  for (const record of records) {
    for (const teamRec of record.teamRecords) {
      const team = teamRec.team;
      const mlbId = team.id;
      const wins = teamRec.wins;
      const losses = teamRec.losses;
      const pct = parseFloat(teamRec.winningPercentage);

      const mlbTeam = await prisma.mlbTeam.upsert({
        where: { mlbId },
        update: {
          name: team.name,
          division: record.division?.name ?? 'Unknown'
        },
        create: {
          mlbId,
          name: team.name,
          division: record.division?.name ?? 'Unknown'
        }
      });

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

  return NextResponse.json({ status: 'ok' });
}
