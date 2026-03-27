import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      return res.status(404).json({ error: "League settings not found" });
    }

    return res.status(200).json({ settings });
  } catch (err) {
    console.error("Error loading league settings:", err);
    return res.status(500).json({ error: "Failed to load league settings" });
  }
}
