export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSnakeOrder } from '@/lib/draft';

const ROUNDS = 5;

export async function GET() {
  const picks = await prisma.draftPick.findMany({
    orderBy: { pickNumber: 'asc' },
    include: { owner: true, mlbTeam: true }
  });
  return NextResponse.json(picks);
}

export async function POST(req: NextRequest) {
  const { mlbTeamId } = await req.json();

  const owners = await prisma.owner.findMany({ orderBy: { id: 'asc' } });
  const ownerIds = owners.map(o => o.id);
  const snakeOrder = generateSnakeOrder(ownerIds, ROUNDS);

  const existingPicks = await prisma.draftPick.findMany({
    orderBy: { pickNumber: 'asc' }
  });

  if (existingPicks.length >= snakeOrder.length) {
    return NextResponse.json({ error: 'Draft complete' }, { status: 400 });
  }

  const alreadyTaken = await prisma.draftPick.findFirst({
    where: { mlbTeamId }
  });
  if (alreadyTaken) {
    return NextResponse.json({ error: 'Team already drafted' }, { status: 400 });
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

  return NextResponse.json(pick);
}
