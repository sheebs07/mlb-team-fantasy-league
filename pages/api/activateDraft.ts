export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  global.draftStatus = "active";
  global.pickStartTime = new Date(); // start Pick 1 clock
  global.preDraftStartTime = null;

  return res.status(200).json({ ok: true });
}
