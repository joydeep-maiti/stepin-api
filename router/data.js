module.exports = {
  findAll: async (dbs, collectionName) => {
    return await dbs
      .collection(collectionName)
      .find({})
      .toArray();
  },
  findByObj: async (dbs, collectionName, obj) => {
    return await dbs
      .collection(collectionName)
      .find(obj)
      .toArray();
  },
  insertOne: async (dbs, collectionName, obj) => {
    return await dbs.collection(collectionName).insertOne(obj);
  },
  findOne: async (dbs, collectionName, obj) => {
    return await dbs.collection(collectionName).findOne(obj);
  },
  updateOne: async (dbs, collectionName, query, newValue) => {
    return await dbs.collection(collectionName).updateOne(query, newValue);
  },
  findByMatch: async (dbs, collectionName, filterArray) => {
    return await dbs
      .collection(collectionName)
      .aggregate(filterArray)
      .toArray();
  },
  correctMonthAndYear: (month, year) => {
    if (month > 11) return { month: month - 12, year: year + 1 };
    else return { month, year };
  }
};
