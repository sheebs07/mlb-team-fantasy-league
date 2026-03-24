import { prisma } from "@/lib/prisma";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { order } = req.body;

  try {
    for (const entry of order) {
      await prisma.owner.update({
        where: { id: entry.ownerId },
        data: { draftSlot: entry.draftSlot }
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update draft order" });
  }
}
