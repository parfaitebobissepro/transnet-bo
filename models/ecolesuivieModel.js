const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let cmdSchema = new mongoose.Schema({
    candidat: {
        type:ObjectId,
        ref:"User"
    },
    formation: {
        type:ObjectId,
        ref:"Formation"
    },
},{timestamps:true})

module.exports = mongoose.model('Ecolesuivie', cmdSchema)