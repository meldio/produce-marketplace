export async function addOffer({ surplusId, quantityDesired }) {
  const { Surplus, Offer } = this.model;
  const viewer = this.viewer;

  // get the current timestamp and convert it to String
  const timestamp = new Date(this.timestamp).toISOString();

  const surplus = await Surplus.node(surplusId).get();

  // if a surplus with the given id does not exist, throw error
  if (!surplus) {
    throw new Error('SURPLUS_ID_INVALID');
  }

  // if surplus is no longer offered, throw error
  if (surplus.endsAt < timestamp) {
    throw new Error('SURPLUS_EXPIRED');
  }

  if (surplus.minimumOrder > quantityDesired) {
    throw new Error('ORDER_TOO_SMALL');
  }

  // calculare remaining quantity based on the available quantity and
  // total quantity offered
  const offerIds = await surplus.offers.nodeIds();
  const offers = await Offer.filter({ id: offerIds }).list();
  const totalQuantityOffered = offers
    .map(offer => offer.quantityDesired)
    .reduce( (sum, qty) => sum + qty, 0);
  const quantityRemaining = surplus.quantityAvailable - totalQuantityOffered;

  // if there is insufficient quantity, throw an error
  if (quantityRemaining < quantityDesired) {
    throw new Error('INSUFFICIENT_QUANTITY');
  }

  const offer = await Offer.addNode({
    quantityDesired,
    timestamp,
    updatedTimestamps: [ ],
    isFullfiled: false,
  });
  await surplus.offers.addEdge(offer);
  const offerEdge = await viewer.offers.addEdge(offer);

  return { offerEdge, viewer };
}
