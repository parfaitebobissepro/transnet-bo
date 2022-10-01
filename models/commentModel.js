const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let commentSchema = new mongoose.Schema({
    name: String,
    email: String,
    comment: String,
    website: String,
    blog_id: {
        type:ObjectId,
        ref:"Blog"
    },
    user_id: {
        type:ObjectId,
        ref:"User"
    },
},{timestamps:true})

module.exports = mongoose.model('Comment', commentSchema)