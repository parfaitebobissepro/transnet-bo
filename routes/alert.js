// const express = require('express')
// const router = express.Router()
// const {getDistance, convertDistance} = require('geolib')


// //Requiring alert model
// const Alert = require('../models/alertModel')
// const Category = require('../models/categoryModel')
// const User = require('../models/userModel')

// function isAuthenticatedUser(req, res, next){
//     if(req.isAuthenticated()){
//         return next()
//     }
//     req.flash('error_msg', 'Please login first to access this page')
//     res.redirect('/login')
// }



// router.get('/create-alert', isAuthenticatedUser,(req,res) =>{
//     res.render('./alerts/create')
// })

// //BO get all alert
// router.get('/alert/all', isAuthenticatedUser,(req,res)=>{
//     Alert.find({})
//         .populate('postedBy','_id phone')
//         .populate('category','_id name')
//         .then(alerts =>{
//             res.render('./alerts/all', {alerts:alerts})
//         })
//         .catch(err =>{
//             console.log(err)
//         })
// })

// router.get('/alerts/cat/:q', isAuthenticatedUser, (req,res) =>{
//     let searchQuery = {_id : req.params.q}
//     Alert.find({active:true})
//     .sort('-createdAt')
//     .populate('category','_id name time')
//     .populate('postedBy', '_id phone')
//     .then(alerts =>{
//         console.log(alerts)
//         let cat = []
//         let alertes = []
//         alerts.forEach((alert) =>{
//             cat.push(alert.category)
//             if(alert.category._id == searchQuery._id){
//                 alertes.push(alert)
//             }
//         })
//         let categories = [...new Set(cat)]
//         res.render('./users/dashboard', {alerts:alertes, categories})
//     })

// })


// //BO get all zone with most alerts

// router.get('/alerts/zone', isAuthenticatedUser, (req,res) =>{
//     Alert.aggregate([
//         { $group: { _id: "$address", total: { $sum: 1 } } }
//       ])
//       .sort('-total')
//     .then(alerts =>{
//         res.render('./alerts/zones', {alerts:alerts})
//     })

// })

// //FO get all alerts
// /**
//  * @api {get} /alerts Request fetch all alerts  
//  * @apiName AlertAll
//  * @apiGroup Alert
//  *
//  * @apiSuccess {Object} alerts all alerts from database.
//  */
// router.get('/alerts',(req,res)=>{
//     Alert.find({active:true})
//         .sort('-createdAt')
//         .populate('postedBy','_id phone')
//         .populate('category','_id name')
//         .then(alerts =>{
//             return res.status(200).json({ alerts })
//         })
//         .catch(err =>{
//             console.log(err)
//         })
// })

// /**
//  * @api {get} /alerts/id Request id the id of the user  
//  * @apiName AlertsHistory
//  * @apiGroup Alert
//  * 
//  *  @apiParam {String} id Users unique ID.
//  *
//  * @apiSuccess {Object} alerts an object of all user's alerts.
//  */
// //FO get all history alerts
// router.get('/alerts/:id',(req,res)=>{
//     Alert.find()
//         .select("-postedBy")
//         .sort('-createdAt')
//         .populate('category','_id name')
//         .then(alerts =>{
//             return res.status(200).json({ alerts })
//         })
//         .catch(err =>{
//             console.log(err)
//         })
// })

// /**
//  * @api {post} /create-alert Request creating an alert  
//  * @apiName AlertCreate
//  * @apiGroup Alert
//  * 
//  * @apiParam {String} [lat]  Latitude of the alert.
//  * @apiParam {String} [long]  Longitude of the alert.search
//  * @apiParam {String} [address]  the address of the alert.
//  *
//  * @apiSuccess {String} message Alert created successfully.
//  */
// router.post('/create-alert',(req,res)=>{
//     let {lat,long,desc,postedBy,category, address} = req.body
//     if(!lat || !long || !desc || !postedBy || !category || !address){
//         return res.status(422).json({ error: 'Add all the fields please' })
//     }
//     let coords = {latitude: lat, longitude: long}
//     Category.findOne({slug:category}).then(cate =>{
//         User.findOne({postedBy:postedBy}).then(user =>{

//         Alert.find({category:cate._id})
//         .then(result =>{
//             if(result.length > 0){
//                 let goodDistance = []
//                 result.forEach(cat => {
//                     let distance = getDistance(coords, {latitude: cat.lat, longitude: cat.long}, 1000)
//                     goodDistance.push(convertDistance(distance, 'km'))
//                 })
//                 const even = (element) => element <= cate.perimeter
//                 if(goodDistance.some(even)){
//                     const alert = new Alert({
//                         lat,
//                         long,
//                         desc,
//                         address,
//                         postedBy,
//                         category: cate._id,
//                         active: 0
//                     })
//                     alert.save().then(result =>{
//                         return res.status(200).json({ message: 'Alert created successfully' })
//                     })
//                 }else{
//                     const alert = new Alert({
//                         lat,
//                         long,
//                         desc,
//                         postedBy,
//                         category: cate._id,
//                         active: 1
//                     })
//                     alert.save().then(result =>{
//                         return res.status(200).json({ message: 'Alert created successfully' })
//                     })
//                 }
//             }else{
//                 const alert = new Alert({
//                     lat,
//                     long,
//                     desc,
//                     postedBy,
//                     category: cate._id,
//                     active: 1
//                 })
//                 alert.save().then(result =>{
//                     return res.status(200).json({ message: 'Alert created successfully' })
//                 })
//             }
//         }).catch(err =>{
//             return res.status(422).json({ error: 'ERROR: '+err })
//         })

//         }).catch(err =>{
//             return res.status(422).json({ message: "Error: "+ err })
//         })
//     }).catch(err =>{
//         return res.status(422).json({ message: "Error: "+ err })
//     })
    
    
// })

// router.post('/alerts/addr', isAuthenticatedUser, (req,res)=>{
//      let {catName, address} = req.body
//     if(address && catName){
//         if(catName === 'all'){
//             Alert.find({address:{ $regex: `.*${address}.*`}, active:true})
//             .sort('-createdAt')
//             .populate('category','_id name time imgUrl')
//             .populate('postedBy', '_id phone')
//             .then(alerts =>{
//                 let cat = []
//                 //   let alertes = []
//                 alerts.forEach((alert) =>{
//                     cat.push(alert.category)
//                     //   if(alert.category._id == searchQuery._id){
//                     //       alertes.push(alert)
//                     //   }
//                 })
//                   let categories = [...new Set(cat)]
//                 res.render('./users/dashboard', {alerts, categories:categories})
//             })
//         }else{
//             Alert.find({category:catName, address:{ $regex: `.*${address}.*`}, active:true})
//             .sort('-createdAt')
//             .populate('category','_id name time imgUrl')
//             .populate('postedBy', '_id phone')
//             .then(alerts =>{
//                 let cat = []
//                 //   let alertes = []
//                 alerts.forEach((alert) =>{
//                     cat.push(alert.category)
//                     //   if(alert.category._id == searchQuery._id){
//                     //       alertes.push(alert)
//                     //   }
//                 })
//                   let categories = [...new Set(cat)]
//                 res.render('./users/dashboard', {alerts, categories:categories})
//             })
//         }
           
//     }else if(!address && catName === 'all'){
//         Alert.find({active:true})
//             .sort('-createdAt')
//             .populate('category','_id name time imgUrl')
//             .populate('postedBy', '_id phone')
//             .then(alerts =>{
//                 let cat = []
//                 //   let alertes = []
//                 alerts.forEach((alert) =>{
//                     cat.push(alert.category)
//                     //   if(alert.category._id == searchQuery._id){
//                     //       alertes.push(alert)
//                     //   }
//                 })
//                   let categories = [...new Set(cat)]
//                 res.render('./users/dashboard', {alerts, categories:categories})
//             })
//     }else{
//         Alert.find({category:catName, active:true})
//             .sort('-createdAt')
//             .populate('category','_id name time imgUrl')
//             .populate('postedBy', '_id phone')
//             .then(alerts =>{
//                 let cat = []
//                 //   let alertes = []
//                 alerts.forEach((alert) =>{
//                     cat.push(alert.category)
//                     //   if(alert.category._id == searchQuery._id){
//                     //       alertes.push(alert)
//                     //   }
//                 })
//                   let categories = [...new Set(cat)]
//                 res.render('./users/dashboard', {alerts, categories:categories})
//             })
//     }
    
// })

// router.delete('/delete/alert/:id',(req,res)=>{
//     let searchQuery = {_id : req.params.id}

//     Alert.deleteOne(searchQuery)
//         .then(alert =>{
//             req.flash('success_msg', 'alert deleted successfully')
//             res.redirect('/alert/all')
//         })
//         .catch(err =>{
//             req.flash('error_msg', 'ERROR: '+err)
//             res.redirect('/alert/all')
//         })
// })



// module.exports = router