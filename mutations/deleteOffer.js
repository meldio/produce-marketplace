export async function deleteOffer({ id }) {
  const { Offer } = this.model;
  const viewer = this.viewer;

  const offer = await Offer.node(id).get();
  if (!offer) {
    throw new Error('OFFER_ID_INVALID');
  }
  if (offer.isFullfiled) {
    throw new Error('ORDER_FULLFILED');
  }

  const deletedOfferId = offer.delete();

  return { deletedOfferId, viewer };
}
