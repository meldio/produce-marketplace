export async function addSurplus({
  name,
  category,
  variety,
  condition,
  reasonForListing,
  unit,
  quantityAvailable,
  minimumOrder,
  unitPrice,
  endsAt,
  pictureUrl,
}) {
  const { Surplus } = this.model;
  const viewer = this.viewer;

  const surplus = await Surplus.addNode({
    name,
    category,
    variety,
    condition,
    reasonForListing,
    unit,
    quantityAvailable,
    minimumOrder,
    unitPrice,
    endsAt,
    pictureUrl,
  });

  const surplusEdge = await viewer.surplus.addEdge(surplus);

  return { surplusEdge, viewer };
}
