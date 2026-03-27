export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Start 5-second global countdown
  global.preDraftStartTime = new Date();
  global.draftStatus = "inactive"; // still inactive until countdown ends

  return res.status(200).json({ ok: true });
}
