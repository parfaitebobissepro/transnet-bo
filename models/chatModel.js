const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let alertSchema = new mongoose.Schema({
    conversation:{
        type:ObjectId,
        ref:"Conversation"
    },
    message: String,
    objet: String,
    file: String,
    from:{
        type:ObjectId,
        ref:"User"
    }, 
    to:{
        type:ObjectId,
        ref:"User"
    }, 
},{timestamps:true})

module.exports = mongoose.model('Chat', alertSchema)