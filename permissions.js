
export function permissions() {
  return {
    // Node permissions return 'Nodes' instance that specifies which nodes
    // are accessible to the current viewer

    // logged in users can view each other's profiles
    async User() {
      const { User } = this.model;
      const viewer = this.viewer;

      if (viewer) {
        return User.filter({ });
      }
    },

    // anyone can see surplus
    async Surplus() {
      const { Surplus } = this.model;
      return Surplus.filter({ });
    },

    // anyone can see offers (i.e. quantity but not user who made an offer)
    async Offer() {
      const { Offer } = this.model;
      return Offer.filter({ });
    },

    // anyone can see FeaturedDeals
    async FeaturedDeals() {
      const { FeaturedDeals } = this.model;
      return FeaturedDeals.filter({ });
    },

    // mutation permissions return true if viewer is allowed to execute mutation
    addSurplus: userIsLoggedIn,
    editSurplus: userOwnsSurplus,
    deleteSurplus: userOwnsSurplus,
    addOffer: userIsLoggedIn,
    editOffer: userMadeOffer,
    deleteOffer: userMadeOffer,
    addFeaturedDeals: userIsAdmin,
    fullfilOffer: userIsAdmin,
  };
}

async function userIsLoggedIn() {
  const viewer = this.viewer;
  if (viewer) {
    return true;
  }
}

async function userOwnsSurplus({ id }) {
  const viewer = this.viewer;
  if (viewer) {
    return viewer.surplus.edge(id).exists();
  }
}

async function userMadeOffer({ id }) {
  const viewer = this.viewer;
  if (viewer) {
    return viewer.offers.edge(id).exists();
  }
}

async function userIsAdmin() {
  const viewer = this.viewer;
  const userInfo = await viewer.get();
  return userInfo.isAdmin;
}
