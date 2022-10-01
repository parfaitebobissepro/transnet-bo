const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let usermetaSchema = new mongoose.Schema({
    meta_key: String,
    meta_value: String,
    user_id: {
        type:ObjectId,
        ref:"User"
    }
},{timestamps:true})

module.exports = mongoose.model('UserMeta', usermetaSchema)