export function generateSnakeOrder(ownerIds: number[], rounds: number): number[] {
  const order: number[] = [];

  for (let r = 1; r <= rounds; r++) {
    const forward = r % 2 === 1;
    const roundOrder = forward ? ownerIds : [...ownerIds].reverse();
    order.push(...roundOrder);
  }

  return order;
}
