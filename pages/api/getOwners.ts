import { prisma } from "@/lib/prisma";

export default async function handler(req: any, res: any) {
  const owners = await prisma.owner.findMany({
    select: {
      id: true,
      name: true,
      draftSlot: true
    },
    orderBy: { draftSlot: "asc" }
  });

  res.status(200).json({ owners });
}
