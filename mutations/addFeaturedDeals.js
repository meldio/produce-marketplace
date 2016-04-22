export async function addFeaturedDeals({ surplusIds }) {
  const { FeaturedDeals } = this.model;

  const timestamp = new Date(this.timestamp).toISOString();
  const featuredDeals = await FeaturedDeals.addNode({
    timestamp,
    surplus: surplusIds
  });

  return { featuredDeals };
}
