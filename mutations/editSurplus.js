export async function editSurplus({
  id,
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

  const offerIds = await Surplus.node(id).offers.nodeIds();

  // don't allow edit if there are offers on this surplus
  if (offerIds.length) {
    throw new Error('NOT_ALLOWED');
  }

  const surplus = await Surplus.node(id).update({
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

  return { surplus };
}
