const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');

//Requiring user model
const Langue = require('../models/langueModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/langues', isAuthenticatedUser, (req, res) => {
    Langue.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./langues/index', { page: "Liste des langues", username: req.user.name, user_admin_id: req.user._id,  menu: "langue", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/langues', (req, res) => {
    Langue.find({})
        .sort({ createdAt: -1 })
        .then(data => {
            return res.status(200).json({ type: "success", message: 'Langues recupérées avec succès !', data })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/langues/add', isAuthenticatedUser, (req, res) => {
    res.render('./langues/add', { page: "Ajouter une langue", username: req.user.name, user_admin_id: req.user._id,  menu: "langue" })
})

router.get('/dashboard/langues/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Langue.findOne(searchQuery)
        .then(lang => {
            res.render('./langues/edit', { lang, page: "Modifier une langue", username: req.user.name, user_admin_id: req.user._id,  menu: "langue" })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/langues')
        })
})

router.get('/dashboard/langues/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Langue.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Langue supprimée avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})

////////////////===== POST ROUTES =====////////////////

router.put('/edit-langue-activate/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }
    Langue.updateOne(searchQuery, {
        $set: {
            active: req.body.active
        }
    })
        .then(user => {
            return res.status(200).json({ message: 'Language updated successfully', user })
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.post('/addedit-langue', (req, res, next) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        var nom = fields.nom;
        var nom_en = fields.nom_en;
        var langue = new Langue({
            nom,
            nom_en
        })
        console.log(langue);
        console.log(fields.id_langue);
        if (fields.id_langue == "no") {
            langue.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Langue créee avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_langue }
            var langueData = {
                nom,
                nom_en
            }
            Langue.updateOne(searchQuery, {
                $set: langueData
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Langue modifiée avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

module.exports = router