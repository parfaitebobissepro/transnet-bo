const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');

//Requiring user model
const Pack = require('../models/packModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/pack', isAuthenticatedUser, (req, res) => {
    Pack.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./pack/index', { page: "Liste des packs", username: req.user.name, user_admin_id: req.user._id,  menu: "pack", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/pack-ecole', (req, res) => {
    Pack.find({type:"Ecole"})
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Pack récupéré avec succès !', data:lang })
            // res.render('./pack/index', { page: "Liste des packs", username: req.user.name, user_admin_id: req.user._id,  menu: "pack", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/pack-etudiant', (req, res) => {
    Pack.find({type:"Etudiant"})
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Pack récupéré avec succès !', data:lang })
            // res.render('./pack/index', { page: "Liste des packs", username: req.user.name, user_admin_id: req.user._id,  menu: "pack", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/pack/add', isAuthenticatedUser, (req, res) => {
    res.render('./pack/add', { page: "Ajouter un pack", username: req.user.name, user_admin_id: req.user._id,  menu: "pack" })
})

router.get('/dashboard/pack/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Pack.findOne(searchQuery)
        .then(lang => {
            res.render('./pack/edit', { lang, page: "Modifier un pack", username: req.user.name, user_admin_id: req.user._id,  menu: "pack" })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/pack')
        })
})

router.get('/dashboard/pack/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Pack.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Pack supprimé avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})

router.put('/edit-pack-activate/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }
    Pack.updateOne(searchQuery, {
        $set: {
            active: req.body.active
        }
    })
        .then(user => {
            return res.status(200).json({ message: 'Pack updated successfully', user })
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

////////////////===== POST ROUTES =====////////////////

router.post('/addedit-pack', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function(fieldName, fieldValue) {
        champs.push({key:fieldName, value:fieldValue});
    });
    form.parse(req, (err, fields, files) => {
        var uploadedFile = [];
        var category_data = {};
        var i = 0;
        function filtrage(params,type) {
            var filteredArray = [];
            if(type == "field"){
                filteredArray = champs.filter( champ => champ.key == params );
            }else{
                filteredArray = uploadedFile.filter( champ => champ.key == params );
            }
            if (filteredArray.length > 1) {
                var charge = [];
                filteredArray.forEach(element => {
                    charge.push(element.value);
                })
                category_data[params.split('[')[0]] = JSON.stringify(charge);
            } else {
                var charge = filteredArray[0].value;
                category_data[params.split('[')[0]] = params.split('[').length >= 2 ? JSON.stringify([filteredArray[0].value]) : charge;
            }
        }
        champs.forEach(element => {
            if (element.key != "id_pack") {
                filtrage(element.key, "field");
            }
        });
        console.log(category_data);
        var pack = new Pack(category_data)
        if (fields.id_pack == "no") {
            pack.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Pack crée avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_pack }
            Pack.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Pack modifié avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

module.exports = router