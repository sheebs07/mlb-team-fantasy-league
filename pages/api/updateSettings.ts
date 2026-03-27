import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { draftType, rounds } = req.body;

    if (!draftType || !rounds) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updated = await prisma.settings.update({
      where: { id: 1 }, // assuming single row
      data: {
        draftType,
        rounds: Number(rounds)
      }
    });

    return res.status(200).json({ settings: updated });
  } catch (err) {
    console.error("Error updating league settings:", err);
    return res.status(500).json({ error: "Failed to update league settings" });
  }
}
