export async function editOffer({ id, quantityDesired }) {
  const { Offer } = this.model;

  let offer = await Offer.node(id).get();
  if (!offer) {
    throw new Error('OFFER_ID_INVALID');
  }
  if (offer.isFullfiled) {
    throw new Error('ORDER_FULLFILED');
  }

  const timestamp = new Date(this.timestamp).toISOString();
  offer = await offer.update({
    quantityDesired,
    updatedTimestamps: { insert: timestamp }
  });

  return { offer };
}
