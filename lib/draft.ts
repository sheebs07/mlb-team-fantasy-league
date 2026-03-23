export function generateSnakeOrder(ownerIds: number[], rounds: number) {
  const order: { round: number; pick: number; ownerId: number }[] = [];
  for (let r = 1; r <= rounds; r++) {
    const roundOrder = r % 2 === 1 ? ownerIds : [...ownerIds].reverse();
    roundOrder.forEach((ownerId) => {
      order.push({
        round: r,
        pick: order.length + 1,
        ownerId
      });
    });
  }
  return order;
}
