const mongoose = require('mongoose')

let categorySchema = new mongoose.Schema({
    debut_km: Number,
    fin_km: Number,
    prix: Number
},{timestamps:true})

module.exports = mongoose.model('DevisDistance', categorySchema)