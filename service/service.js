const mongoose = require('mongoose')
async function deleteDoc(collectionName, filter) {
    try {
        const collection = mongoose.connection.collection(collectionName)
        const result = await collection.deleteMany(filter)
    } catch (err) {
        console.log(`delete doc in ${collectionName} filtered by ${filter} err: ` + err)
    }
}

module.exports = {
    deleteDoc
}