import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const teams = await prisma.mlbTeam.findMany({
      orderBy: { name: "asc" }
    });

    return res.status(200).json(teams);
  } catch (err: any) {
    console.error("Teams API Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
