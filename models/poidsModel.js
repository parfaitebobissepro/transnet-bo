const mongoose = require('mongoose')

let categorySchema = new mongoose.Schema({
    debut_poids: Number,
    fin_poids: Number,
    prix: Number
},{timestamps:true})

module.exports = mongoose.model('DevisPoids', categorySchema)