module.exports = {
  findAll: async (dbs, collectionName) => {
    return await dbs
      .collection(collectionName)
      .find({})
      .toArray();
  },
  findAllAndSort: async (dbs, collectionName, sortParam) => {
    return await dbs
      .collection(collectionName)
      .find({})
      .sort(sortParam)
      .toArray();
  },
  findByObj: async (dbs, collectionName, obj) => {
    return await dbs
      .collection(collectionName)
      .find(obj)
      .toArray();
  },
  findByObj1: async (dbs, collectionName, obj,sortParam) => {
    return await dbs
      .collection(collectionName)
      .find(obj)
      .sort(sortParam)
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
  upSert: async (dbs, collectionName, query, newValue, upsert) => {
    return await dbs.collection(collectionName).updateOne(query, newValue, upsert);
  },
  deleteOne: async (dbs, collectionName, query) => {
    return await dbs.collection(collectionName).deleteOne(query);
  },
  deleteMany: async (dbs, collectionName, query) => {
    return await dbs.collection(collectionName).deleteMany(query);
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
  },
};
