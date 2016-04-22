export async function deleteSurplus({ id }) {
  const { Surplus } = this.model;
  const viewer = this.viewer;

  const offerIds = await Surplus.node(id).offers.nodeIds();

  // don't allow deletion if there are offers on this surplus
  if (offerIds.length) {
    throw new Error('NOT_ALLOWED');
  }

  const deletedSurplusId = await Surplus.node(id).delete();

  return { deletedSurplusId, viewer };
}
