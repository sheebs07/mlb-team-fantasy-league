import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 6 owners
  const owners = [
    'Abbey',
    'Brian',
    'Faja',
    'Kyle',
    'Masa',
    'Olivia'
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
    { mlbId: 109, name: "Arizona Diamondbacks", division: "NL West" },
    { mlbId: 144, name: "Atlanta Braves", division: "NL East" },
    { mlbId: 110, name: "Baltimore Orioles", division: "AL East" },
    { mlbId: 111, name: "Boston Red Sox", division: "AL East" },
    { mlbId: 112, name: "Chicago Cubs", division: "NL Central" },
    { mlbId: 145, name: "Chicago White Sox", division: "AL Central" },
    { mlbId: 113, name: "Cincinnati Reds", division: "NL Central" },
    { mlbId: 114, name: "Cleveland Guardians", division: "AL Central" },
    { mlbId: 115, name: "Colorado Rockies", division: "NL West" },
    { mlbId: 116, name: "Detroit Tigers", division: "AL Central" },
    { mlbId: 117, name: "Houston Astros", division: "AL West" },
    { mlbId: 118, name: "Kansas City Royals", division: "AL Central" },
    { mlbId: 108, name: "Los Angeles Angels", division: "AL West" },
    { mlbId: 119, name: "Los Angeles Dodgers", division: "NL West" },
    { mlbId: 146, name: "Miami Marlins", division: "NL East" },
    { mlbId: 158, name: "Milwaukee Brewers", division: "NL Central" },
    { mlbId: 142, name: "Minnesota Twins", division: "AL Central" },
    { mlbId: 121, name: "New York Mets", division: "NL East" },
    { mlbId: 147, name: "New York Yankees", division: "AL East" },
    { mlbId: 133, name: "Oakland Athletics", division: "AL West" },
    { mlbId: 143, name: "Philadelphia Phillies", division: "NL East" },
    { mlbId: 134, name: "Pittsburgh Pirates", division: "NL Central" },
    { mlbId: 135, name: "San Diego Padres", division: "NL West" },
    { mlbId: 137, name: "San Francisco Giants", division: "NL West" },
    { mlbId: 136, name: "Seattle Mariners", division: "AL West" },
    { mlbId: 138, name: "St. Louis Cardinals", division: "NL Central" },
    { mlbId: 139, name: "Tampa Bay Rays", division: "AL East" },
    { mlbId: 140, name: "Texas Rangers", division: "AL West" },
    { mlbId: 141, name: "Toronto Blue Jays", division: "AL East" },
    { mlbId: 120, name: "Washington Nationals", division: "NL East" }
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
