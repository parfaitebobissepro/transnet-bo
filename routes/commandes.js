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
const Commande = require('../models/commandeModel')
const Conversation = require('../models/conversationModel')
const Chat = require('../models/chatModel')
const User = require('../models/userModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/commandes', isAuthenticatedUser, (req, res) => {
    Commande.find({})
        .populate('user_id','_id name prenom type')
        .populate('transporteur_id','_id name prenom type')
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./commandes/index', { page: "Liste des commandes", username: req.user.name, user_admin_id: req.user._id,  menu: "commandes", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/commandes-user/:id', (req, res) => {
    Commande.find({user_id:req.params.id})
        .populate('user_id','_id name prenom type')
        .populate('transporteur_id','_id name prenom type')
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Commande récupérée avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/commandes-details/:id', (req, res) => {
    Commande.findOne({_id:req.params.id})
        .populate('user_id','_id name prenom type')
        .populate('transporteur_id','_id name prenom type')
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Commande récupérée avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/make-payment/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }
    Commande.updateOne(searchQuery, {
        $set: {
            statut: "Payé"
        }
    })
        .then(user => {
            return res.status(200).json({ type: "success", message: 'Paiement enregistré avec succès !' })
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.get('/api/commandes-transporteur', (req, res) => {
    Commande.find({statut:"Payé", transporteur_id: { $exists: false } })
        .populate('user_id','_id name prenom type')
        .populate('transporteur_id','_id name prenom type')
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Commande récupérée avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/attribute-transporteur/:idcmd/:idtransporteur', (req, res) => {
    let searchQuery = { _id: req.params.idcmd, transporteur_id: { $exists: false } }
    var transporteur_id = req.params.idtransporteur;
    Commande.findOne(searchQuery)
        .populate('user_id','_id name prenom type email')
        .populate('transporteur_id','_id name prenom type')
        .sort({ createdAt: -1 })
        .then(cmdd => {
            if (cmdd != null) {
                Commande.updateOne({ _id: req.params.idcmd }, {
                    $set: {
                        transporteur_id: transporteur_id,
                        statut: "En cours de transport"
                    }
                })
                    .then(command => {
                        var tiraz = __dirname + "/template_email.ejs";
                        tiraz = tiraz.replace("routes","views/partials/emails")
                        ejs.renderFile(tiraz, { header: "Hello "+cmdd.user_id.name+",", body: "Votre colis a été pris en charge par un de nos transporteurs et est déjà en route vers destination.", btn:"" }, function (err, doto) {
                            let mailOptions2 = {
                                to: cmdd.user_id.email,
                                from: 'TransNet <no-reply@smartcodegroup.com>',
                                subject: 'Colis pris en charge !',
                                html: doto
                            }
                            smtpTransport.sendMail(mailOptions2, err => {
                                return res.status(200).json({ type: "success", message: 'Transporteur attribué avec succès !', data:command })
                            })
                        })
                    })
                    .catch(err => {
                        return res.status(422).json({ errors: err })
                    })
            } else {
                return res.status(200).json({ type: "error", message: 'Un transporteur est déjà en charge de cette demande !' })
            }
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/transporteur-a-destination/:idcmd', (req, res) => {
    let searchQuery = { _id: req.params.idcmd }
    Commande.findOne(searchQuery)
        .populate('user_id','_id name prenom type email')
        .populate('transporteur_id','_id name prenom type')
        .sort({ createdAt: -1 })
        .then(cmdd => {
            Commande.updateOne({ _id: req.params.idcmd }, {
                $set: {
                    statut: "A destination"
                }
            })
                .then(command => {
                    var tiraz = __dirname + "/template_email.ejs";
                    tiraz = tiraz.replace("routes","views/partials/emails")
                    ejs.renderFile(tiraz, { header: "Hello "+cmdd.user_id.name+",", body: "Votre colis est arrivé à destination, veuillez confirmer la réception de celui-ci en marquant comme livrée votre demande de transport depuis votre espace membre.", btn:"https://blissful-archimedes-671723.netlify.app/dashboard/demandes" }, function (err, doto) {
                        let mailOptions2 = {
                            to: cmdd.user_id.email,
                            from: 'TransNet <no-reply@smartcodegroup.com>',
                            subject: 'Colis à destination !',
                            html: doto
                        }
                        smtpTransport.sendMail(mailOptions2, err => {
                            return res.status(200).json({ type: "success", message: 'Colis arrivé avec succès !', data:command })
                        })
                    })
                })
                .catch(err => {
                    return res.status(422).json({ errors: err })
                })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/confirmation-commande-livree/:idcmd', (req, res) => {
    let searchQuery = { _id: req.params.idcmd }
    Commande.findOne(searchQuery)
        .populate('user_id','_id name prenom type email')
        .populate('transporteur_id','_id name prenom type')
        .sort({ createdAt: -1 })
        .then(cmdd => {
            Commande.updateOne({ _id: req.params.idcmd }, {
                $set: {
                    statut: "Livrée"
                }
            })
                .then(command => {
                    var tiraz = __dirname + "/template_email.ejs";
                    tiraz = tiraz.replace("routes","views/partials/emails")
                    ejs.renderFile(tiraz, { header: "Hello "+cmdd.user_id.name+",", body: "Vous venez de confirmer la réception de votre commande , merci d'avoir fait confiance à Transnet.", btn:"" }, function (err, doto) {
                        let mailOptions2 = {
                            to: cmdd.user_id.email,
                            from: 'TransNet <no-reply@smartcodegroup.com>',
                            subject: 'Accusé de réception du colis',
                            html: doto
                        }
                        smtpTransport.sendMail(mailOptions2, err => {
                            return res.status(200).json({ type: "success", message: 'Colis recu avec succès !', data:command })
                        })
                    })
                })
                .catch(err => {
                    return res.status(422).json({ errors: err })
                })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/commandes-transporteur/:id', (req, res) => {
    Commande.findOne({transporteur_id:req.params.id})
        .populate('user_id','_id name prenom type')
        .populate('transporteur_id','_id name prenom type')
        .sort({ createdAt: -1 })
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Commande récupérée avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

////////////////===== POST ROUTES =====////////////////

router.post('/commandes-transnet', (req, res, next) => {
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
            // if (element.key != "user_id") {
                filtrage(element.key, "field");
            // }
        });
        function makeid(length) {
            var result           = [];
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
              result.push(characters.charAt(Math.floor(Math.random() * 
         charactersLength)));
           }
           return result.join('');
        }
        category_data["cmd"] = makeid(8);
        category_data["statut"] = "En attente";
        
        var tir = __dirname + "/receive_payment_email.ejs";
        tir = tir.replace("routes","views/partials/emails")
        var utilisateur = "";
        if (category_data.user_id != "") {
            utilisateur = category_data.user_id;
            User.findOne({ _id: utilisateur })
            .then(usera => {
                ejs.renderFile(tir, { data: category_data, user: usera }, function (err, data) {
                    let mailOptions = {
                        to: usera.email,
                        from: 'Transnet <no-reply@smartcodegroup.com>',
                        subject: 'Merci pour votre demande de transport !',
                        html: data
                    }
                    smtpTransport.sendMail(mailOptions, err => {
                        var tiraz = __dirname + "/template_email.ejs";
                        tiraz = tiraz.replace("routes","views/partials/emails")
                        ejs.renderFile(tiraz, { header: "Hello Admin,", body: "Une nouvelle demande de transport vient d'être enregistrée sur la plateforme, cliquez sur le bouton ci dessous pour en avoir les détails.", btn:"https://transnet-admin.herokuapp.com/dashboard/commandes" }, function (err, doto) {
                            let mailOptions2 = {
                                to: "drthugsteph@gmail.com",
                                from: 'TransNet <no-reply@smartcodegroup.com>',
                                subject: 'Une nouvelle demande de transport !',
                                html: doto
                            }
                            smtpTransport.sendMail(mailOptions2, err => {
                                var cmd = new Commande(category_data)
                                cmd.save().then(resulta => {
                                    return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Order saved successfully' : 'Commande enregistrée avec succès !', data:resulta })
                                })
                            })
                            .catch(err => {
                                return res.status(422).json({ message: 'ERROR: ' + err })
                            })
                        })
                        .catch(err => {
                            return res.status(422).json({ message: 'ERROR: ' + err })
                        })
                    })
                })
            })
            .catch(err => {
                console.log(err);
            })
        } else {
            var userData = {
                name: category_data.name,
                email: category_data.email,
                username: category_data.name,
                type: "client"
            };
            var tir = __dirname + "/welcome_email.ejs";
            tir = tir.replace("routes","views/partials/emails")
            User.register(userData, category_data.password, (err, user) => {
                // console.log(err);
                if (err) {
                    var message = "";
                    if (err.code == 11000 && err.message.indexOf('username_1') > -1) {
                        message = fields.lang == 'en' ? 'A user with this name already exists' : "Un utilisateur ayant ce nom existe déjà";
                    }else if (err.message.indexOf('username') > -1) {
                        message = fields.lang == 'en' ? 'A user with this email already exists' : "Un utilisateur ayant cet email existe déjà";
                    }
                    return res.status(200).json({ type: "error", message: message })
                }
                ejs.renderFile(tir, { data: user }, function (err, data) {
                    let mailOptions = {
                        to: fields.email,
                        from: 'TransNet <no-reply@smartcodegroup.com>',
                        subject: 'Bienvenue sur TransNet !',
                        html: data
                    }
                    smtpTransport.sendMail(mailOptions, err => {
                        var tiraz = __dirname + "/template_email.ejs";
                        tiraz = tiraz.replace("routes","views/partials/emails")
                        ejs.renderFile(tiraz, { header: "Hello Admin,", body: "Un nouvel utilisateur vient d'être enregistré sur la plateforme, cliquez sur le bouton ci dessous pour en avoir les détails.", btn:"https://transnet-admin.herokuapp.com/dashboard/users/edit/"+user._id+"/save" }, function (err, doto) {
                            let mailOptions2 = {
                                to: "drthugsteph@gmail.com",
                                from: 'TransNet <no-reply@smartcodegroup.com>',
                                subject: 'Un nouvel utilisateur !',
                                html: doto
                            }
                            smtpTransport.sendMail(mailOptions2, err => {
                                User.findOne({ name: "Admin" })
                                    .then(useradmin => {
                                        var user_id_admin = useradmin._id;
                                        var user_id_user = user._id;
                                        var conversation = new Conversation({
                                            emetteur: user_id_user,
                                            recepteur: user_id_admin,
                                        })
                                        var conv = conversation.save();
                                        // ezaezaeza
                                        User.findOne({ _id: user._id })
                                        .then(usera => {
                                            ejs.renderFile(tir, { data: category_data, user: usera }, function (err, data) {
                                                let mailOptions = {
                                                    to: user.email,
                                                    from: 'Transnet <no-reply@smartcodegroup.com>',
                                                    subject: 'Merci pour votre demande de transport !',
                                                    html: data
                                                }
                                                smtpTransport.sendMail(mailOptions, err => {
                                                    category_data["user_id"] = usera._id;
                                                    var cmd = new Commande(category_data)
                                                    cmd.save().then(resulta => {
                                                        return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Order saved successfully' : 'Commande enregistrée avec succès !', data:resulta })
                                                    })
                                                })
                                            })
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                    })
                                    .catch(err => {
                                        return res.status(422).json({ message: 'ERROR: ' + err })
                                    })
                            })
                        })
                    })
                })
            })
        }
        // User.find({ user_id: utilisateur, statut: "Payé" })
        //     .then(command => {
        //         console.log(command);
                // if (command.length == 0) {
                    // if (fields.verify == "oui") {
                    //     return res.status(200).json({ type: "success", message: 'Commande payable avec succès !' })
                    // }else{
                    // }
                // }else{
                //     return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'You already have a package in use.' : 'Vous avez déjà un pack en cours d\'utilisation.', })
                // }
            // })
            // .catch(err => {
            //     console.log(err);
            // })
    });
})


module.exports = router