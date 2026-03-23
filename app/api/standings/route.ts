export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

  return NextResponse.json(standings);
}
