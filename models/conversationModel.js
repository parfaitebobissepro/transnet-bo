const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let alertSchema = new mongoose.Schema({
    emetteur:{
        type:ObjectId,
        ref:"User"
    }, 
    recepteur:{
        type:ObjectId,
        ref:"User"
    }, 
    messages:[{
        type:ObjectId,
        ref:"Chat"
    }]
},{timestamps:true})

module.exports = mongoose.model('Conversation', alertSchema)