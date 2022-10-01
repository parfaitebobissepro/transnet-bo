const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let alerteSchema = new mongoose.Schema({
    nom: String,
    type: String,
    document: String,
    description: String
},{timestamps:true})

module.exports = mongoose.model('Alerte', alerteSchema)