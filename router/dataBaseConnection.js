const MongoClient = require('mongodb').MongoClient;
const constants = require('../constant');
const mongoUrl = constants.mongoUrl;

connect = (url) => {
    return MongoClient.connect(url).then(client => client.db());
}

module.exports = async () => {
    let databases = await Promise.all([connect(mongoUrl)])

    return databases[0];
}
