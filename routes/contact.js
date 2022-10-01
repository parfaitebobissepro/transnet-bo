const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');
var ejs = require("ejs");
var smtpTransport = nodemailer.createTransport({
    host: "mail.smartcodegroup.com",
    port: 465,
    secure: 'ssl', // upgrade later with STARTTLS
    auth: {
        user: "no-reply@smartcodegroup.com",
        pass: "63-U5}]K[fB4"
    }
})

//Requiring user model
const Contact = require('../models/contactModel')
const Commande = require('../models/commandeModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/contact', isAuthenticatedUser, (req, res) => {
    Contact.find({})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./contact/index', { page: "Liste des contacts", username: req.user.name, user_admin_id: req.user._id,  menu: "contact", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

////////////////===== POST ROUTES =====////////////////

router.post('/contact-transnet', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.parse(req, (err, fields, files) => {
        var uploadedFile = [];
        var category_data = {};
        var i = 0;
        function filtrage(params, type) {
            var filteredArray = [];
            if (type == "field") {
                filteredArray = champs.filter(champ => champ.key == params);
            } else {
                filteredArray = uploadedFile.filter(champ => champ.key == params);
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
            filtrage(element.key, "field");
        });
        // console.log(category_data);
        var contact = new Contact(category_data)
        var tir = __dirname + "/contact_email_user.ejs";
        tir = tir.replace("routes","views/partials/emails")
        ejs.renderFile(tir, { data: category_data }, function (err, data) {
            let mailOptions = {
                to: fields.email,
                from: 'UniversCity <no-reply@smartcodegroup.com>',
                subject: 'Merci de nous avoir contacté !',
                html: data
            }
            smtpTransport.sendMail(mailOptions, err => {
            })
        })
        var tira = __dirname + "/contact_email_admin.ejs";
        tira = tira.replace("routes","views/partials/emails")
        ejs.renderFile(tira, { data: category_data }, function (err, data) {
            let mailOptions = {
                to: "universcity.france@gmail.com",
                from: 'UniversCity <no-reply@smartcodegroup.com>',
                subject: 'Une nouvelle demande de contact !',
                html: data
            }
            smtpTransport.sendMail(mailOptions, err => {
                contact.save().then(result => {
                    return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Message sent successfully' : 'Message envoyé avec succès !', result })
                })
            })
        })

    });
})


router.post('/contact-user', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.parse(req, (err, fields, files) => {
        var uploadedFile = [];
        var category_data = {};
        var i = 0;
        function filtrage(params, type) {
            var filteredArray = [];
            if (type == "field") {
                filteredArray = champs.filter(champ => champ.key == params);
            } else {
                filteredArray = uploadedFile.filter(champ => champ.key == params);
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
            filtrage(element.key, "field");
        });
        Commande.findOne({user_id: category_data.user, statut: "Payé"})
            .then(lango => {
                if (lango != null) {
                    console.log(category_data.email_to);
                    var tira = __dirname + "/contact_email_user_inter.ejs";
                    tira = tira.replace("routes","views/partials/emails")
                    ejs.renderFile(tira, { data: category_data }, function (err, data) {
                        let mailOptions = {
                            to: category_data.email_to,
                            from: 'UniversCity <no-reply@smartcodegroup.com>',
                            subject: 'Une nouvelle demande de contact !',
                            html: data
                        }
                        smtpTransport.sendMail(mailOptions, err => {
                            return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Message sent successfully' : 'Message envoyé avec succès !' })
                        })
                    })
                } else {
                    return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'You must have a pack to send an email to a school!' : 'Vous devez avoir un pack pour envoyer un mail à une école !' })
                }
            })
            .catch(err => {
                console.log(err)
            })

    });
})

module.exports = router