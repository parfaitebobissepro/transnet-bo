const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let suivisSchema = new mongoose.Schema({
    user_id:{
        type:ObjectId,
        ref:"User"
    }, 
    ecole_id:{
        type:ObjectId,
        ref:"User"
    }
},{timestamps:true})

module.exports = mongoose.model('Suivis', suivisSchema)