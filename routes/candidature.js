const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');
var ejs = require("ejs");
// var pdf = require('html-pdf')
// var pdf_options = { 
//     format: 'A4', 
//     orientation: "portrait" ,
//     base: __dirname.replace("routes","public/uploads/"),
//     type: "pdf,png,jpeg"
// };
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
const Candidature = require('../models/candidatureModel')
const User = require('../models/userModel')
const Formation = require('../models/formationModel')
const Pack = require('../models/packModel')
const Commande = require('../models/commandeModel')
const ReponseMail = require('../models/reponsemailModel')
const Conversation = require('../models/conversationModel')
// const Formation = require('../models/formationModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/candidatures', isAuthenticatedUser, (req, res) => {
    Candidature.find({})
        .populate('user_id','_id name')
        .populate('formation_id','_id nom')
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./candidatures/index', { page: "Liste des candidatures", username: req.user.name, user_admin_id: req.user._id,  menu: "candidatures", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/candidatures/:id', (req, res) => {
    Candidature.find({user_id:req.params.id})
        .populate({ path: 'formation_id', populate: { path: 'user_id' } }).sort({ createdAt: -1})
        .sort({ createdAt: -1 })
        .then(cand => {
            console.log(cand.user_id);
            res.status(200).json({ type:"success", message: 'Candidature récupérée avec succès', data:cand })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/candidature_ecole/:user', (req, res) => {
    var user = req.params.user;
    Candidature.find({})
        .populate({ path: 'user_id' })
        .populate({ path: 'formation_id', populate: { path: 'user_id' } })
        .sort({ createdAt: -1 })
        .then(cand => {
            console.log(cand);
            var candlist = [];
            cand.forEach(element => {
                if (element.formation_id.user_id._id == user) {
                    candlist.push(element);
                }
            });
            res.status(200).json({ type:"success", message: 'Candidatures récupérées avec succès', data:candlist })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/candidature_etudiant/:user', (req, res) => {
    var user = req.params.user;
    // var formacandlist = [];
    Formation.find({active:true})
        .populate('user_id','_id username name nom_ecole logo_ecole')
        .populate({
            path: 'candidatures',
            match: { user_id: user },
            select: '_id formation_id statut nom user_id'
        })
        .sort({ createdAt: -1 })
        .then(formations => {
            res.status(200).json({ type:"success", message: 'Candidatures récupérées avec succès', data:formations })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/formation-candidatures/:formation', (req, res) => {
    let searchQuery = { formation_id: req.params.formation }
    Candidature.find(searchQuery)
        .populate('user_id','_id username name pays_eleve email prenom_eleve')
        .populate('formation_id','id user_id nom')
        .sort({ createdAt: -1 })
        .then(lang => {
            res.status(200).json({ type:"success", message: 'Candidatures récupérées avec succès', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/reponsemail', isAuthenticatedUser, (req, res) => {
    ReponseMail.find({})
        .populate('user_id','_id name nom_ecole')
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./reponsemail/index', { page: "Liste des messages de mails", username: req.user.name, user_admin_id: req.user._id,  menu: "candidatures", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/reponsemail/:id', (req, res) => {
    let searchQuery = { user_id: req.params.id }
    ReponseMail.find(searchQuery)
        .populate('user_id','_id name nom_ecole')
        .sort({ createdAt: -1 })
        .then(lang => {
            res.status(200).json({ type:"success", message: 'Réponses récupérées avec succès', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/reponsemail/edit/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }

    ReponseMail.findOne(searchQuery)
        .then(lang => {
            res.status(200).json({ type:"success", message: 'Réponses récupérées avec succès', data:lang })
        })
        .catch(err => {
            console.log(err);
        })
})

router.get('/dashboard/formation-candidatures/:formation', isAuthenticatedUser, (req, res) => {
    let searchQuery = { formation_id: req.params.formation }
    Candidature.find(searchQuery)
        .populate('user_id','_id name')
        .populate('formation_id','_id nom')
        .sort({ createdAt: -1 })
        .then(lang => {
            // console.log(lang);
            res.render('./candidatures/index', { page: "Liste des candidatures", username: req.user.name, user_admin_id: req.user._id,  menu: "candidatures", users: lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/candidatures/add', isAuthenticatedUser, (req, res) => {
    Candidature.find({})
        .sort({ createdAt: -1 })
        .then(cand => {
            User.find({type:"Etudiant",active:true})
                .sort({ createdAt: -1 })
                .then(user => {
                    Formation.find({active:true})
                        .sort({ createdAt: -1 })
                        .then(formation => {
                            res.render('./candidatures/add', { page: "Ajouter une candidature", username: req.user.name, user_admin_id: req.user._id,  menu: "candidatures", cand, user, formation })
                        })
                        .catch(err => {
                            console.log(err)
                        })
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/candidatures/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Candidature.findOne(searchQuery)
        .then(cand => {
            User.find({})
                .sort({ createdAt: -1 })
                .then(user => {
                    Formation.find({})
                        .sort({ createdAt: -1 })
                        .then(formation => {
                            res.render('./candidatures/edit', { cand, user, formation, page: "Modifier une candidature", username: req.user.name, user_admin_id: req.user._id,  menu: "candidatures" })
                })
                .catch(err => {
                    console.log(err)
                })
            })
            .catch(err => {
                console.log(err)
            })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/candidatures')
        })
})

router.get('/dashboard/reponsemail/add', isAuthenticatedUser, (req, res) => {
    User.find({type:"Ecole",active:true})
        .sort({ createdAt: -1 })
        .then(user => {
            res.render('./reponsemail/add', { page: "Ajouter une réponse", username: req.user.name, user_admin_id: req.user._id,  menu: "candidatures", user })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/reponsemail/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    ReponseMail.findOne(searchQuery)
        .then(cand => {
            User.find({})
                .sort({ createdAt: -1 })
                .then(user => {
                    res.render('./reponsemail/edit', { cand, user, page: "Modifier une réponse", username: req.user.name, user_admin_id: req.user._id,  menu: "candidatures" })
            })
            .catch(err => {
                console.log(err)
            })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/reponsemail')
        })
})

router.get('/dashboard/candidatures/print/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }

    Candidature.findOne(searchQuery)
        .populate('user_id','_id name pic email')
        .populate('formation_id','_id nom user_id')
        .populate('pack','_id nom montant')
        .then(cand => {
            User.find({})
                .sort({createdAt:-1})
                .then(users => {
                    var tir = __dirname + "/print_template.ejs";
                    tir = tir.replace("routes","views/print")
                    var user = users.filter( champ => champ._id.toString() == cand.formation_id.user_id.toString() );
                    // console.log(user);
                    res.render('./print/print_template', { cand,user:user[0] });
                })
                .catch(err => {
                    console.log(err);
                    // res.redirect('/dashboard/candidatures')
                })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/candidatures')
        })
})

router.get('/dashboard/candidatures/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Blog.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Candidature supprimée avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur ' + err })
        })
})

////////////////===== POST AND PUT ROUTES =====////////////////

router.put('/edit-candidatures/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }
    Candidature.updateOne(searchQuery, {
        $set: {
            status: req.body.status
        }
    })
        .then(user => {
            return res.status(200).json({ message: 'Candidature updated successfully', user })
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.post('/sendmail-cand', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.on('file', function (field, file) {
        filese.push({ field: field, file: file });
    });
    form.parse(req, (err, fields, files) => {
        var i = 0;
        if (filese.length > 1 && filese[0].file.size > 0) {
            var oldpath = filese[0].file.path;
            var newpath = 'public/uploads/candidature_document' + new Date().getTime() + i + "." + filese[0].file.type.split('/')[1];
            fs.rename(oldpath, newpath, function (err) {
                // if (err) throw err;
                console.log("Image uploaded at this path: "+newpath);
            });
            newpath = newpath.split("uploads/")[1];
            var tir = __dirname + "/" + newpath;
            tir = tir.replace("routes","public/uploads")
            let mailOptions = {
                to: fields.to,
                from: 'UniversCity <no-reply@smartcodegroup.com>',
                subject: fields.sujet,
                attachments: [
                    {
                      filename: newpath,
                      path: tir,
                      cid: 'Candidature_document.'+newpath.split(".")[1] 
                    }
                ],
                html: fields.body
            }
            smtpTransport.sendMail(mailOptions, err => {
                if (err) {
                    return res.status(200).json({ type:"error", message: "Error: "+err })
                }
                return res.status(200).json({ type:"success", message: fields.lang == "en"  ? "Answer sent successfully" : "Réponse envoyée avec succès" })
            })
        } else {
            let mailOptions = {
                to: fields.to,
                from: 'UniversCity <no-reply@smartcodegroup.com>',
                subject: fields.sujet,
                html: fields.body
            }
            smtpTransport.sendMail(mailOptions, err => {
                if (err) {
                    return res.status(200).json({ type:"error", message: "Erreur: "+err })
                }
                return res.status(200).json({ type:"success", message: fields.lang == "en" ? "Answer sent successfully" : "Réponse envoyée avec succès" })
            })
        }
    });
})

router.put('/changestatus-candidatures/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }
    var st = req.body.statut;
    var current_lang_fo = req.body.lang;
    Candidature.updateOne(searchQuery, {
        $set: {
            statut: st
        }
    })
        .then(user => {
            Candidature.findOne(searchQuery)
                .populate('user_id','_id name email')
                .populate('formation_id','_id nom')
                .then(cand => {
                    Formation.findOne({_id:cand.formation_id._id})
                        .populate('user_id','_id name nom_ecole logo_ecole email')
                        .sort({ createdAt: -1 })
                        .then(formation => {
                            ReponseMail.findOne({user_id:formation.user_id._id})
                                .then(rep => {
                                    var subject = "";
                                    var body = "";
                                    function replaceAll(str, find, replace) {
                                        var escapedFind=find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
                                        return str.replace(new RegExp(escapedFind, 'g'), replace);
                                    }
                                    if (rep != null && st == "Candidature acceptée") {
                                        subject = rep.subject_ok;
                                        console.log(subject);
                                        body = replaceAll(rep.content_ok, "#ecole_name#", formation.user_id.nom_ecole);
                                        console.log(body);
                                        body = replaceAll(body, "#ecole_email#", formation.user_id.email);
                                        body = replaceAll(body, "#etudiant_name#", cand.user_id.name);
                                        body = replaceAll(body, "#etudiant_email#", cand.user_id.email);
                                    }else if (rep != null && st == "Candidature refusée") {
                                        subject = rep.subject_no;
                                        body = replaceAll(rep.content_no, "#ecole_name#", formation.user_id.nom_ecole);
                                        body = replaceAll(body, "#ecole_email#", formation.user_id.email);
                                        body = replaceAll(body, "#etudiant_name#", cand.user_id.name);
                                        body = replaceAll(body, "#etudiant_email#", cand.user_id.email);
                                        User.updateOne({ _id: cand.user_id._id }, {
                                            $set: {
                                                essai: "off"
                                            }
                                        }).then(test => {
                                            // console.log(test);
                                        })
                                        .catch(err => {
                                            // console.log(err);
                                        })
                                    }else if (rep != null && st == "Demande interview") {
                                        subject = rep.subject_interview;
                                        body = replaceAll(rep.content_interview, "#ecole_name#", formation.user_id.nom_ecole);
                                        body = replaceAll(body, "#ecole_email#", formation.user_id.email);
                                        body = replaceAll(body, "#etudiant_name#", cand.user_id.name);
                                        body = replaceAll(body, "#etudiant_email#", cand.user_id.email);
                                        User.updateOne({ _id: cand.user_id._id }, {
                                            $set: {
                                                essai: "off"
                                            }
                                        }).then(test => {
                                            // console.log(test);
                                        })
                                        .catch(err => {
                                            // console.log(err);
                                        })
                                    }else if (rep == null && st == "Candidature acceptée") {
                                        subject = "";
                                        body = "";
                                        User.updateOne({ _id: cand.user_id._id }, {
                                            $set: {
                                                essai: "off"
                                            }
                                        }).then(test => {
                                            // console.log(test);
                                        })
                                        .catch(err => {
                                            // console.log(err);
                                        })
                                    }else if (rep == null && (st == "Candidature refusée" || st == "Demande interview")) {
                                        subject = "";
                                        body = "";
                                    }
                                    var tir = __dirname + "/template_email_cand.ejs";
                                    tir = tir.replace("routes","views/partials/emails")
                                    ejs.renderFile(tir, { header: "Hello "+cand.user_id.name+",", body: body, btn:"no", logo_ecole: formation.user_id.logo_ecole }, function (err, data) {
                                        // let mailOptions = {
                                        //     to: cand.user_id.email,
                                        //     from: 'UniversCity <no-reply@smartcodegroup.com>',
                                        //     subject: subject,
                                        //     html: data
                                        // }
                                        // smtpTransport.sendMail(mailOptions, err => {
                                        return res.status(200).json({ type:"success", message: current_lang_fo == "en" ? "Action successfully completed, check the email to send." : "Action effectuée avec succès, vérifiez l' email à envoyer.", user, data, subject, to:cand.user_id.email })
                                        // })
                                    })
                                })
                                .catch(err => {
                                    return res.status(200).json({ type:"error", message: err })
                                })
                        })
                        .catch(err => {
                            return res.status(200).json({ type:"error", message: err })
                        })
                })
                .catch(err => {
                    return res.status(200).json({ type:"error", message: err })
                })
        })
        .catch(err => {
            return res.status(200).json({ type:"error", message: err })
        })
})

router.post('/edit-cand', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.on('file', function (field, file) {
        filese.push({ field: field, file: file });
    });
    form.parse(req, (err, fields, files) => {
        
        var uploadedFile = [];
        var category_data = {};
        var i = 0;
        filese.forEach(element => {
            i++;
            if (element.file.size > 0) {
                // console.log(element.file);
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime() + i + "." + element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({ key: element.field, value: "/" + newpath });
            } else {
                if (fields.id_eleve == "no") {
                    uploadedFile.push({ key: element.field, value: "/" });
                }
            }
        })
        function filtrage(params, type) {
            var filteredArray = [];
            if (type == "field") {
                filteredArray = champs.filter(champ => champ.key == params);
            } else {
                filteredArray = uploadedFile.filter(champ => champ.key == params);
            }
            console.log(champs);
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
            if (element.key != "id_candidature") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "fichier":
                    filtrage("fichier", "file");
                    break;
                default:
                    break;
            }
        })
        
        let searchQuery = { _id: fields.id_candidature }
        Candidature.updateOne(searchQuery, {
            $set: category_data
        })
            .then(cand => {
                return res.status(200).json({ message: fields.lang == "en" ? 'Candidature updated successfully' : 'Candidature modifée avec succès !', cand })
            })
            .catch(err => {
                return res.status(422).json({ error: err })
            })
    });
})

router.post('/addedit-candidatures', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.on('file', function (field, file) {
        filese.push({ field: field, file: file });
    });
    form.parse(req, (err, fields, files) => {
        
        var uploadedFile = [];
        var category_data = {};
        var i = 0;
        filese.forEach(element => {
            i++;
            if (element.file.size > 0) {
                // console.log(element.file);
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime() + i + "." + element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({ key: element.field, value: "/" + newpath });
            } else {
                if (fields.id_eleve == "no") {
                    uploadedFile.push({ key: element.field, value: "/" });
                }
            }
        })
        function filtrage(params, type) {
            var filteredArray = [];
            if (type == "field") {
                filteredArray = champs.filter(champ => champ.key == params);
            } else {
                filteredArray = uploadedFile.filter(champ => champ.key == params);
            }
            // console.log(champs);
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
            if (element.key != "id_candidatures") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "fichier":
                    filtrage("fichier", "file");
                    break;
                default:
                    break;
            }
        })
        console.log("deja hey");
        console.log(category_data);
        // console.log(JSON.parse(category_data.formation_id));
        var tir = __dirname + "/template_email.ejs";
        tir = tir.replace("routes","views/partials/emails")
        User.findOne({_id: category_data.user_id})
            .then(user => {
                console.log(user);
                // console.log(category_data.user_id);
                var te = parseInt(user.nbre_candidature);
                var essai = user.essai;
                // console.log(te);
                if(user.nbre_candidature != 0 || user.nbre_candidature == -1 || user.nbre_candidature == -2){
                    console.log("date limite non");
                    JSON.parse(category_data.formation_id).forEach(element => {
                        var element_id_form = element;
                        Formation.findOne({_id: element})
                            .populate('user_id','_id name email nom_ecole')
                            .then(formation => {
                                console.log("date limite");
                                console.log(Date.parse(formation.date_limite));
                                if (Date.parse(formation.date_limite) > Date.now()) {
                                    category_data["formation_id"] = formation._id;
                                    console.log(category_data);
                                    var form = new Candidature(category_data)
                                    form.save().then(result => {
                                        // console.log(user._id);
                                        console.log(result);
                                        Formation.findOne({ _id: element_id_form })
                                        .then(forma => {
                                            forma.candidatures.push(result._id);
                                            forma.save();
                                            var user_id_ecole = formation.user_id._id;
                                            var user_id_user = user._id;
                                            console.log("les id des chatteurs");
                                            console.log(user_id_ecole);
                                            console.log(user_id_user);
                                            Conversation.findOne({ emetteur: user_id_ecole, recepteur: user_id_user })
                                                .then(chatconvers => {
                                                    if (chatconvers == null) {
                                                        var conversation = new Conversation({
                                                            emetteur: user_id_ecole,
                                                            recepteur: user_id_user,
                                                        })
                                                        conversation.save();
                                                    }
                                                })
                                                .catch(err => {
                                                    return res.status(422).json({ message: 'ERROR: ' + err })
                                                })
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                        if (te != -1) {
                                            if (user.nbre_candidature == -2) {
                                                User.updateOne({ _id: user._id }, {
                                                    $set: {
                                                        nbre_candidature: 0
                                                    }
                                                }).then(test => {
                                                    // console.log(test);
                                                })
                                                .catch(err => {
                                                    // console.log(err);
                                                })
                                            } else {
                                                if (essai == "on") {
                                                    User.updateOne({ _id: user._id }, {
                                                        $set: {
                                                            nbre_candidature: parseInt(te-1) == 0 ? -2 : parseInt(te-1)
                                                        }
                                                    }).then(test => {
                                                        // console.log(test);
                                                    })
                                                    .catch(err => {
                                                        // console.log(err);
                                                    })
                                                } else {
                                                    User.updateOne({ _id: user._id }, {
                                                        $set: {
                                                            nbre_candidature: parseInt(te-1)
                                                        }
                                                    }).then(test => {
                                                        // console.log(test);
                                                    })
                                                    .catch(err => {
                                                        // console.log(err);
                                                    })
                                                }
                                            }
                                            te = parseInt(te-1);
                                        }
                                        ejs.renderFile(tir, { header: "Hello "+user.name+",", body: "Votre candidature a bien été envoyée à l'établissement <strong>"+formation.user_id.nom_ecole+"</strong> pour la formation <strong>"+formation.nom+"</strong>.<br><br> Bonne chance pour votre formation ! ", btn:"no", user: user }, function (err, data) {
                                            let mailOptions = {
                                                to: user.email,
                                                from: 'UniversCity <no-reply@smartcodegroup.com>',
                                                subject: 'Merci pour votre candidature !',
                                                html: data
                                            }
                                            smtpTransport.sendMail(mailOptions, err => {
                                                
                                            })
                                        })
                                        ejs.renderFile(tir, { header: "Hello "+formation.user_id.name+",", body: "Vous venez de recevoir une candidature de la part de l'étudiant <strong>"+user.name+"</strong>.Cliquez sur le bouton ci-dessous pour en avoir les détails.", btn:"https://admin.universcitiz.com/dashboard/candidatures/"+result._id, user: user }, function (err, data) {
                                            let mailOptions = {
                                                to: formation.user_id.email,
                                                from: 'UniversCity <no-reply@smartcodegroup.com>',
                                                subject: 'Une nouvelle candidature !',
                                                html: data
                                            }
                                            smtpTransport.sendMail(mailOptions, err => {
                                                
                                            })
                                        })
                                        return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Application created successfully !' : 'Candidature créee avec succès !', result })
                                    })
                                } else {
                                    console.log("Entrer dans le support");
                                    return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'Deadline for application already arrived for the training' : 'Date limite de dépôt de dossier déjà arrivée pour la formation '+formation.nom});
                                }
                            })
                            .catch(err => {
                                // console.log(err)
                            })
                    })
                }else{
                    return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'You have not subscribed to a package. Please do so to apply.' : 'Vous n\'avez pas souscrit à un pack. Veuillez le faire pour candidater.' })
                }
            })
            .catch(err => {
                // console.log(err)
            })
    });
})

router.post('/addedit-reponsemail', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    var filese = [];
    form.on('field', function (fieldName, fieldValue) {
        champs.push({ key: fieldName, value: fieldValue });
    });
    form.on('file', function (field, file) {
        filese.push({ field: field, file: file });
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
            if (element.key != "id_reponse" || element.key != "type_req") {
                filtrage(element.key, "field");
            }
        });
        
        let searchQuery = { _id: fields.id_reponse }
        if (fields.type_req == "add") {
            ReponseMail.find({user_id:fields.user_id})
                .sort({ createdAt: -1 })
                .then(data => {
                    // var filteredArray = data.filter(champ => champ.user_id == fields.user_id);
                    if (data != null && data.length > 0) {
                        return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'You have already saved email responses, just edit them.' : "Vous avez déjà enregistré des réponses de mails, veuillez juste les modifier." })
                    }else{
                        var form = new ReponseMail(category_data)
                        form.save().then(result => {
                            return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Email response added successfully' : 'Reponse Mail ajoutée avec succès', data:result })
                        })
                    }
                })
                .catch(err => {
                    return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'You have already saved email responses, just edit them.' : "Vous avez déjà enregistré des réponses de mails, veuillez juste les modifier." })
                })
        } else {
            ReponseMail.updateOne(searchQuery, {
                $set: category_data
            })
                .then(cand => {
                    return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Email response updated successfully' : 'Reponse Mail modifiée avec succès', data:cand })
                })
                .catch(err => {
                    return res.status(200).json({ type: "error", message: err })
                })
        }
    });
})

module.exports = router