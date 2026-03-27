// global.d.ts
export {};

declare global {
  var pickStartTime: Date | undefined;
  var lastPickNumber: number | undefined;
  var preDraftStartTime: Date | null | undefined;
  var draftStatus: "inactive" | "active" | "completed" | undefined;
}
