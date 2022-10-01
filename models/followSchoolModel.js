const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let cmdSchema = new mongoose.Schema({
    candidat: {
        type:ObjectId,
        ref:"User"
    },
    ecole: {
        type:ObjectId,
        ref:"User"
    },
},{timestamps:true})

module.exports = mongoose.model('Followschool', cmdSchema)