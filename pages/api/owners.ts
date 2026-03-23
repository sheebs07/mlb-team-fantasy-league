import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const owners = await prisma.owner.findMany({
      orderBy: { id: "asc" }
    });

    return res.status(200).json(owners);
  } catch (err: any) {
    console.error("Owners API Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
