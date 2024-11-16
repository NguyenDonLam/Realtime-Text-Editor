const { MongoClient } = require("mongodb")

const { Schema, model } = require("mongoose")

const Document = new Schema({
    _id: String,
    data: Object
})

let dbConnection

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect("mongodb://localhost:27017/sandbox")
        .then( (client) => {
            dbConnection = client.db();
            return cb();
        }).catch(err => {
            console.log(err);
            return cb(err);
        })
    },
    getDb: () => {
        return dbConnection;
    },
    Document
}