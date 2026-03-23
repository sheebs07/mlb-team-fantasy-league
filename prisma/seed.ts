import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 6 owners
  const owners = [
    'Alice',
    'Bob',
    'Chris',
    'Dana',
    'Evan',
    'Frank'
  ];

  for (const name of owners) {
    await prisma.owner.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  // Minimal MLB teams (you can expand to all 30 later)
  const teams = [
    { mlbId: 119, name: 'Los Angeles Dodgers', division: 'NL West' },
    { mlbId: 110, name: 'Baltimore Orioles', division: 'AL East' },
    { mlbId: 158, name: 'Milwaukee Brewers', division: 'NL Central' },
    { mlbId: 136, name: 'Seattle Mariners', division: 'AL West' },
    { mlbId: 144, name: 'Atlanta Braves', division: 'NL East' },
    { mlbId: 140, name: 'Texas Rangers', division: 'AL West' },
    { mlbId: 117, name: 'Houston Astros', division: 'AL West' },
    { mlbId: 142, name: 'Minnesota Twins', division: 'AL Central' },
    { mlbId: 141, name: 'Toronto Blue Jays', division: 'AL East' },
    { mlbId: 112, name: 'Chicago Cubs', division: 'NL Central' }
  ];

  for (const t of teams) {
    await prisma.mlbTeam.upsert({
      where: { mlbId: t.mlbId },
      update: { name: t.name, division: t.division },
      create: t
    });
  }

  console.log('Seed complete');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
