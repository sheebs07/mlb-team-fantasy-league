export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const teams = await prisma.mlbTeam.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(teams);
}
