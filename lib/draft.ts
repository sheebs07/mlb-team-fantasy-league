export function generateDraftOrder(
  ownerIds: number[],
  rounds: number,
  draftType: "snake" | "linear"
): number[] {
  const order: number[] = [];

  for (let r = 1; r <= rounds; r++) {
    if (draftType === "linear") {
      // Always forward
      order.push(...ownerIds);
    } else {
      // Snake
      const forward = r % 2 === 1;
      const roundOrder = forward ? ownerIds : [...ownerIds].reverse();
      order.push(...roundOrder);
    }
  }

  return order;
}
