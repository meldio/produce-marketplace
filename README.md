# Meldio Produce Marketplace Example

This example illustrates how easy and fast it is to build a backend for a
marketplace app using Meldio.

Meldio is an open source GraphQL backend for building delightful mobile and web
apps. See [our start building guide](https://www.meldio.com/start-building) for
detailed instructions on getting started with Meldio.

Need help?
  * [Join our Slack channel](https://meldio-slack.herokuapp.com)
  * [Ask a question on Stack Overflow](https://stackoverflow.com/questions/ask?tags=meldio)

## Installation and Setup

First, you will need to [install Meldio following these instructions](https://www.meldio.com/start-building#requirements)

Then, clone this example from Github using the following command:

```bash
git clone https://github.com/meldio/produce-marketplace.git
```

Next, you will need to create new Facebook and Google OAuth applications and
obtain App ID and Secret from both Facebook and Google.

To initialize Meldio, run the following command and follow the prompts.
Simply accept defaults and enter Facebook and Google OAuth App ID and Secret
when prompted for those.

```bash
cd produce-marketplace
meldio init
```

## Running the app
Start meldio from the `produce-marketplace` directory with:
```bash
meldio run
```

You can now access Meldio Query IDE at [http://localhost:9000/graphql](http://localhost:9000/graphql).

## Description

The app allows users to see a list of surplus produce and dairy offered and
filter the list by category (produce vs. dairy) and item name (e.g. kale,
apple, potato).

Sellers can add their surplus produce and diary to the app and buyers can place
orders to buy a specific amount of this surplus. The app will ensure that buyers
make an offer that is greater or equal than the minimum allowed order amount
and less or equal to the remaining available amount.  Once the surplus
expires, buyers can no loger place orders on it and the surplus will be
removed from the listing.

Site administrators can pick a number of surplus items as featured deals. The
query that lists featured deals will always show the latest available set of
featured deals.

## Mutations

The following mutations are provided:
* [addSurplus](https://github.com/meldio/produce-marketplace/blob/master/mutations/addSurplus.js) -
  adds a surplus item and connects it to seller's user profile.  Returns
  `surplusEdge` and `viewer` to allow the app to retrieve surplus and
  current user data (e.g. count of surplus items sold by the current user)
  following the mutation.

* [editSurplus](https://github.com/meldio/produce-marketplace/blob/master/mutations/editSurplus.js) -
  allows seller to change the listing (e.g. quanity avaialble,
  minimum order) as long as no orders have been placed. Returns `surplus` to
  allow the app to retrieve the updated information.  If orders have been
  placed, mutation will throw `NOT_ALLOWED` error.

* [deleteSurplus](https://github.com/meldio/produce-marketplace/blob/master/mutations/deleteSurplus.js) -
  allows seller to delete the listing as long as no orders have
  been placed.  Returns `deletedSurplusId` and `viewer` to allow the app to
  remove the item by ID and retrieve the updated user information. If
  orders have already been made, mutation will throw `NOT_ALLOWED` error.

* [addOffer](https://github.com/meldio/produce-marketplace/blob/master/mutations/addOffer.js) -
  Takes `surplusId` and `quantityDesired` and adds a new offer for
  the specified quantity of the specified surplus. Connects the offer to the
  buyer's user profile and the surplus. Returns `offerEdge` and `viewer` to
  allow the app to retrieve the offer and current user data.  Throws
  `SURPLUS_ID_INVALID` if `surplusId` is invalid, `SURPLUS_EXPIRED` if surplus
  listing has expired, `ORDER_TOO_SMALL` if `quantityDesired` is lower than the
  minimum required order quantity and `INSUFFICIENT_QUANTITY` if the order
  quantity is greater than the remaining quanity.

* [editOffer](https://github.com/meldio/produce-marketplace/blob/master/mutations/editOffer.js) -
  allows the buyer to change the quanity ordered if the order has not been
  fullfield yet. Returns `offer` to allow the app to retrieve the updated
  offer data. Throws `OFFER_ID_INVALID` error if `id` is ivalid and
  `ORDER_FULLFILED` error if the order has been fullfiled already.

* [deleteOffer](https://github.com/meldio/produce-marketplace/blob/master/mutations/deleteOffer.js) -
  allows the buyer to cancel the order if the order has not been
  fullfield yet. Returns `deletedOfferId` and `viewer` to allow the app to
  remove the item by ID and retrieve the updated user information.
  Throws `OFFER_ID_INVALID` error if `id` is ivalid and `ORDER_FULLFILED` error
  if the order has been fullfiled already.

* [fullfilOffer](https://github.com/meldio/produce-marketplace/blob/master/mutations/fullfilOffer.js) -
  allows the site admins to mark an offer as fullfiled.

* [addFeaturedDeals](https://github.com/meldio/produce-marketplace/blob/master/mutations/addFeaturedDeals.js) -
  allows the site admins to add the latest featured deals. Mutation expects
  `surplusIds` array of IDs of surplus items that should be featured.  It will
  return the `featuredDeals` object which can be used to fetch data for
  each surplus item.

## Mutation Usage Examples

#### Add a new surplus item to the marketplace:
```graphql
mutation addPotato {
  addSurplus(input: {
    name: "Potato"
    category: PRODUCE
    variety: "Red"
    condition: [ CERTIFIED_ORGANIC, RIPE ]
    reasonForListing: [ EXCESS_INVENTORY ]
    unit: POUNDS
    quantityAvailable: 200
    minimumOrder: 20
    unitPrice: 0.5
    endsAt: "2016-04-26T17:48:57.769Z"
    pictureUrl: "https://...url to your cdn..."
    clientMutationId: "1"
  }) {
    surplusEdge {
      node {
        id
        name
      }
    }
    viewer {
      surplus {
        count
      }
    }
  }
}
```

Mutations returns:
```json
{
  "data": {
    "addSurplus": {
      "surplusEdge": {
        "node": {
          "id": "-KFz52uX-bR_mW9NGuD8-iLIGCLJ",
          "name": "Potato"
        }
      },
      "viewer": {
        "surplus": {
          "count": 1
        }
      }
    }
  }
}
```

#### Attempt to make an offer with a quantity that is too small:
```graphql
mutation orderTooSmall {
  addOffer(input: {
    surplusId: "-KFz52uX-bR_mW9NGuD8-iLIGCLJ" # potato id returned by addSurplus
    quantityDesired: 5
    clientMutationId: "2"
  }) {
    offerEdge {
      node {
        id
        quantityDesired
        timestamp
        surplus {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
}
```

Mutations returns:
```json
{
  "data": {
    "addOffer": null
  },
  "errors": [
    {
      "message": "ORDER_TOO_SMALL",
      "locations": [
        {
          "line": 2,
          "column": 2
        }
      ]
    }
  ]
}
```

#### Attempt to make an offer with a quantity that is too large:
```graphql
mutation orderTooLarge {
  addOffer(input: {
    surplusId: "-KFz52uX-bR_mW9NGuD8-iLIGCLJ" # potato id returned by previous mutation
    quantityDesired: 5000000 # 5mm lbs of potato
    clientMutationId: "3"
  }) {
    offerEdge {
      node {
        id
        quantityDesired
        timestamp
        surplus {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
}
```

Mutations returns:
```json
{
  "data": {
    "addOffer": null
  },
  "errors": [
    {
      "message": "INSUFFICIENT_QUANTITY",
      "locations": [
        {
          "line": 2,
          "column": 2
        }
      ]
    }
  ]
}
```

#### Make an offer on the surplus item:
```graphql
mutation orderJustRight {
  addOffer(input: {
    surplusId: "-KFz52uX-bR_mW9NGuD8-iLIGCLJ" # potato id returned by previous mutation
    quantityDesired: 25 # lbs
    clientMutationId: "4"
  }) {
    offerEdge {
      node {
        id
        quantityDesired
        timestamp
        surplus {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
}
```

Mutations returns:
```json
{
  "data": {
    "addOffer": {
      "offerEdge": {
        "node": {
          "id": "-KFzC7hXY77YiId53HhZ-e665I",
          "quantityDesired": 25,
          "timestamp": "2016-04-22T18:21:28.795Z",
          "surplus": {
            "edges": [
              {
                "node": {
                  "id": "-KFz52uX-bR_mW9NGuD8-iLIGCLJ",
                  "name": "Potato"
                }
              }
            ]
          }
        }
      }
    }
  }
}
```

#### Fullfil the offer:
```graphql
mutation fullfil {
	fullfilOffer(input: {
		id: "-KFzC7hXY77YiId53HhZ-e665I"
    clientMutationId: "5"
  }) {
    offer {
      id
      isFullfiled
      fullfieldTimestamp
    }
  }
}
```

This will fail because your user does not have admin permissions. To change
this, just open mongo shell and execute:
```
> use produce-marketplace
> db.User.update({}, {$set: { isAdmin: true }})
```

Now, mutation should return something similar to:
```json
{
  "data": {
    "fullfilOffer": {
      "offer": {
        "id": "-KFzC7hXY77YiId53HhZ-e665I",
        "isFullfiled": true,
        "fullfieldTimestamp": "2016-04-22T18:25:40.220Z"
      }
    }
  }
}
```

## Queries

#### List the latest featured deals:
```graphql
query FeaturedDeals {
  allFeaturedDeals(first: 1, orderBy: { node: { timestamp: DESCENDING }}) {
    edges {
      node {
        surplus {
          id
          name
          variety
          condition
          reasonForListing
          unit
          minimumOrder
          unitPrice
          endsAt
          pictureUrl
        }
      }
    }
  }
}
```

#### Paginated list of currently offered surplus:

```graphql
query PaginatedSurplusList($currentTimestamp: String, $afterCursor: String) {
  allSurplus(
    first: 4,
    after: $afterCursor
    filterBy: { node: { endsAt: { gt: $currentTimestamp }}}
    orderBy: { node: { endsAt: ASCENDING } }
  ) {
    count
    pageInfo {
      startCursor
      hasNextPage
    }
    edges {
      cursor
      node {
        id
        name
        category
        variety
        condition
        reasonForListing
        unit
        quantityAvailable
        offers {
          totalDesired: sum(node: quantityDesired)
        }
        # quantity remaining is calculated as:
        # quantityAvailable - offers.totalDesired || 0
        minimumOrder
        unitPrice
        endsAt
        pictureUrl
      }
    }
  }
}
```

The query above expects `currentTimestamp` and `afterCursor` parameters:

```json
{
  "currentTimestamp": "2016-04-21T19:52:51.923Z",
  "afterCursor": ""
}
```

#### Filtered list of currently offered surplus:

```graphql
query FilterCurrentSurplus($currentTimestamp:String, $nameFilter: String, $categoryFilter: [Category!]) {
  allSurplus(
    filterBy: {
      node: {
        endsAt: { gt: $currentTimestamp }
        name: { matches: $nameFilter }
        category: { eq: $categoryFilter }
      }
    },
    orderBy: { node: { name: ASCENDING }}
  ) {
    count
    edges {
      cursor
      node {
        id
        name
        category
        variety
        condition
        reasonForListing
        unit
        quantityAvailable
        offers {
          totalDesired: sum(node: quantityDesired)
        }
        # quantity remaining is calculated as:
        # quantityAvailable - offers.totalDesired || 0
        minimumOrder
        unitPrice
        endsAt
        pictureUrl
        pictureUrl
      }
    }
  }
}
```

The query above expects `currentTimestamp`, `nameFilter` and `categoryFilter`
parameters:

```json
{
  "currentTimestamp": "2016-04-21T19:52:51.923Z",
  "nameFilter": "Carr",
  "categoryFilter": [ "PRODUCE", "DAIRY" ]
}
```

#### Fetch data for a specific surplus view:

```graphql
query SurplusView($id: [ID!]!) {
  surplus(id: $id) {
    id
    name
    category
    variety
    condition
    reasonForListing
    unit
    quantityAvailable
    offers {
      totalDesired: sum(node: quantityDesired)
    }
    # quantity remaining is calculated as:
    # quantityAvailable - offers.totalDesired || 0
    minimumOrder
    unitPrice
    endsAt
    pictureUrl
  }
}
```

The query above expects `id` parameter:
```json
{
  "id": "-KFuLtZlpN-2_K9qauMK-iLIGCLJ"
}
```

#### Fetch current user infromation along with the surplus listed and unfullfiled offers:

```graphql
{
  viewer {
    id
    firstName
    lastName
    lastName
    emails
    profilePictureUrl
    surplus(
      first: 5
      orderBy: { node: { endsAt: DESCENDING }}
    ) {
      edges {
        cursor
        node {
          id
          name
          category
          variety
          condition
          reasonForListing
          unit
          unitPrice
          endsAt
          pictureUrl
        }
      }
    }
    unfullfiledOffers: offers(
      first: 5
      filterBy: { node: { isFullfiled: { eq: false }}}
      orderBy: { node: { timestamp: DESCENDING }}
    ) {
      edges {
        cursor
        node {
          id
          timestamp
          surplus {
            edges {
              node {
                id
                name
                category
                variety
                condition
                reasonForListing
                unit
                unitPrice
                endsAt
                pictureUrl
              }
            }
          }
          quantityDesired
          isFullfiled
          fullfieldTimestamp
        }
      }
    }
  }
}
```

## License

This code is free software, licensed under the MIT license. See the `LICENSE` file for more details.
