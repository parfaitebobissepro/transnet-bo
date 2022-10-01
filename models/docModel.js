const mongoose = require('mongoose')
// const {ObjectId} = mongoose.Schema.Types

let docSchema = new mongoose.Schema({
    nom: String,
    nom_en: String,
    type: String,
    url: String,
    active:{
        type: Boolean,
        default: true
    }
},{timestamps:true})

module.exports = mongoose.model('Doc', docSchema)