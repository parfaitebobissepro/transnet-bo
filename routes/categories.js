// const express = require('express')
// const router = express.Router()
// const path = require('path')
// const multer = require('multer')
// const fs = require('fs')
// const async = require('async')
// const nodemailer = require('nodemailer')
// const slugify = require('slugify')

// //Requiring category model
// const Category = require('../models/categoryModel')

// //Checks if user is authenticated
// function isAuthenticatedUser(req, res, next){
//     if(req.isAuthenticated()){
//         return next()
//     }
//     req.flash('error_msg', 'Please login first to access this page')
//     res.redirect('/login')
// }


// //Set Image Storage
// let storage = multer.diskStorage({
//     destination : './public/uploads/images/',
//     filename : (req, file, cb) => {
//         cb(null, file.originalname)
//     }
// })

// let upload = multer({
//     storage : storage,
//     fileFilter : (req, file, cb) => {
//         checkFileType(file, cb)
//     }
// })

// function checkFileType(file, cb){
//     const fileTypes = /jpeg|jpg|png|gif/
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())

//     if(extname){
//         return cb(null, true)
//     }else{
//         cb('ERROR: Please images only')
//     }
// }


// router.get('/create-cat', isAuthenticatedUser,(req,res) =>{
//     res.render('./categories/create')
// })

// router.get('/categories/all', isAuthenticatedUser,(req,res)=>{
//     Category.find({})
//         .then(categories =>{
//             res.render('./categories/allcat', {categories:categories})
//         })
//         .catch(err =>{
//             console.log(err)
//         })
// })

// router.get('/categories',(req,res)=>{
//     Category.find()
//         .then(categories =>{
//             return res.status(200).json({ categories })
//         })
//         .catch(err =>{
//             console.log(err)
//         })
// })

// router.get('/edit/cat/:id', isAuthenticatedUser, (req,res) =>{
//     let searchQuery = {_id:req.params.id}
    
//     Category.findOne(searchQuery)
//     .then(category =>{
//         res.render('./categories/editcat', {category})
//     })
//     .catch(err =>{
//         req.flash('error_msg', 'ERROR: '+err)
//         res.redirect('/categories/all')
//     })
// })


// router.put('/edit/cat/:id', isAuthenticatedUser, upload.single('singleImage'), (req,res) =>{
//     let searchQuery = {_id:req.params.id}
//     if(req.file){
//         const file = req.file
//         let url = file.path.replace('public', '')

//         Category.updateOne(searchQuery,{$set:{
//             name : req.body.name,
//             desc : req.body.desc,
//             time : req.body.time,
//             perimeter : req.body.perimeter,
//             imgUrl:url
//         }})
//         .then(category =>{
//             req.flash('success_msg', 'Category updated successfully')
//             res.redirect('/categories/all')
//         })
//         .catch(err =>{
//             req.flash('error_msg', 'ERROR: '+err)
//             res.redirect('/categories/all')
//         })
//     }
    
//     Category.updateOne(searchQuery,{$set:{
//         name : req.body.name,
//         desc : req.body.desc,
//         time : req.body.time,
//         perimeter : req.body.perimeter,
//     }})
//     .then(category =>{
//         req.flash('success_msg', 'Category updated successfully')
//         res.redirect('/categories/all')
//     })
//     .catch(err =>{
//         req.flash('error_msg', 'ERROR: '+err)
//         res.redirect('/categories/all')
//     })

// })

// router.post('/create-cat', isAuthenticatedUser, upload.single('singleImage'), (req,res) =>{
//     let {name, desc, time, perimeter} = req.body;
//     const file = req.file

//     if(!name || !desc || !time || !perimeter || !file){
//         req.flash('error_msg', 'Please complete all the fields.')
//         res.redirect('/create-cat')
//     }
//     let url = file.path.replace('public', '')

//     Category.findOne({name:name})
//         .then(category =>{
//             if(category){
//                 req.flash('error_msg', 'Category with this name already exists.')
//                 res.redirect('/create-cat')
//             }else{
//                 const cat = new Category({
//                     name,
//                     desc,
//                     time,
//                     perimeter,
//                     slug: slugify(name),
//                     imgUrl:url
//                 })
//                 cat.save().then(result =>{
//                     req.flash('success_msg', 'Category created successfully.')
//                     res.redirect('/categories/all')
//                 })
//                 .catch(err =>{
//                     console.log(err)
//                 })
//             }
//         })
// })

// router.delete('/delete/cat/:id',(req,res)=>{
//     let searchQuery = {_id : req.params.id}

//     Category.deleteOne(searchQuery)
//         .then(category =>{
//             req.flash('success_msg', 'category deleted successfully')
//             res.redirect('/categories/all')
//         })
//         .catch(err =>{
//             req.flash('error_msg', 'ERROR: '+err)
//             res.redirect('/categories/all')
//         })
// })

// module.exports = router