export async function fullfilOffer({ id }) {
  const { Offer } = this.model;

  const isFullfiled = true;
  const fullfieldTimestamp = new Date(this.timestamp).toISOString();
  const offer = await Offer.node(id).update({isFullfiled, fullfieldTimestamp});

  return { offer };
}
