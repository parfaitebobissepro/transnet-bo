const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

let blogSchema = new mongoose.Schema({
    user_id: {
        type:ObjectId,
        ref:"User"
    },
    content: String,
    title: String,
    content_en: String,
    title_en: String,
    status: {
        type: Boolean,
        default: true
    },
    type: String,
    image: String,
    slug: String,
    category: [{
        type:ObjectId,
        ref:"Category"
    }],
    vue: {
        type: Number,
        default: 0
    },
    comments:[{
        type:ObjectId,
        ref:"Comment"
    }],
},{timestamps:true})
module.exports = mongoose.model('Blog', blogSchema)