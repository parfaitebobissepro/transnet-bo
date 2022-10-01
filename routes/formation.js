const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');

//Requiring user model
const Formation = require('../models/formationModel')
const Langue = require('../models/langueModel')
const User = require('../models/userModel')
const Candidature = require('../models/candidatureModel')
const Commande = require('../models/commandeModel')
const Domaine = require('../models/domaineModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/formations', isAuthenticatedUser, (req, res) => {
    Formation.find({})
        .populate('user_id','_id name')
        .populate('langues','_id nom nom_en')
        .populate('domaine','_id name name_en slug image')
        .sort({ createdAt: -1 })
        .then(lang => {
            Candidature.find({})
                .sort({ createdAt: -1 })
                .then(cand => {
                    res.render('./formations/index', { page: "Liste des formations", username: req.user.name, user_admin_id: req.user._id,  menu: "formation", users: lang, cand })
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/formations', (req, res) => {
    Formation.find({active:true})
        .populate('user_id','_id name nom_ecole logo_ecole username titre_ecole adresse_ecole couverture_ecole')
        .populate('domaine','_id name name_en slug image')
        // .populate('suiveur','_id name')
        .populate('langues','_id nom nom_en')
        .sort({ createdAt: -1 })
        .then(lang => {
            var tabrangevedette = [];
            var tabrangenonvedette = [];
            lang.forEach((formation)=>{
                if (formation.en_vedette == "on") {
                    tabrangevedette.push(formation);
                } else {
                    tabrangenonvedette.push(formation);
                }
            })
            var tabrangeall = tabrangevedette.concat(tabrangenonvedette);
            return res.status(200).json({ type: "success", message: 'Formations recupérées avec succès !', data:tabrangeall })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/formation_ecole/:user', (req, res) => {
    Formation.find({user_id:req.params.user})
        .populate('user_id','_id name nom_ecole logo_ecole titre_ecole adresse_ecole couverture_ecole')
        .populate('domaine','_id name name_en slug image')
        .populate('suiveur','_id name')
        .populate('candidatures','_id nom')
        .populate('langues','_id nom nom_en')
        .sort({ active: -1 })
        .sort({ createdAt: -1 })
        .then(lang => {
            console.log(lang);
            return res.status(200).json({ type: "success", message: 'Formations recupérées avec succès !', data:lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/formation_ecole_username/:user', (req, res) => {
    var usernma = req.params.user
    Formation.find({active:true})
        .populate('user_id','_id name nom_ecole logo_ecole username titre_ecole adresse_ecole couverture_ecole')
        .populate('suiveur','_id name')
        .populate('candidatures','_id nom')
        .populate('domaine','_id name name_en slug image')
        .populate('langues','_id nom nom_en')
        .sort({ createdAt: -1 })
        .then(lang => {
            var forma = [];
            lang.forEach((element)=>{
                if (element.user_id.username == usernma) {
                    forma.push(element)
                }
            })
            return res.status(200).json({ type: "success", message: 'Formations recupérées avec succès !', data:forma })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/formation_likes/:user', (req, res) => {
    Formation.find({user_id:req.params.user})
        .populate('suiveur','_id name')
        .populate('domaine','_id name name_en slug image')
        .populate('langues','_id nom nom_en')
        .sort({ createdAt: -1 })
        .then(lang => {
            var sum = lang.reduce((s, a) => s + a.suiveur.length, 0);
            return res.status(200).json({ type: "success", message: 'Formations recupérées avec succès !', data:sum })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/formations/:slug', (req, res) => {
    Formation.findOne({slug:req.params.slug})
        .populate('user_id','_id name nom_ecole logo_ecole username site_ecole titre_ecole adresse_ecole couverture_ecole')
        // .populate('suiveur','_id name')
        .populate('domaine','_id name name_en slug image')
        .populate('langues','_id nom nom_en')
        .populate('candidatures','_id user_id formation_id')
        .sort({ createdAt: -1 })
        .then(lang => {
            Formation.updateOne({ _id: lang._id }, {
                $set: {
                    vue: parseInt(lang.vue)+1
                }
            })
                .then(lange => {
                    return res.status(200).json({ type: "success", message: 'Formations recupérées avec succès !', data:lang })
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/formation_details/:id', (req, res) => {
    Formation.findOne({_id:req.params.id})
        .populate('user_id','_id name nom_ecole logo_ecole titre_ecole adresse_ecole couverture_ecole')
        .populate('suiveur','_id name')
        .populate('domaine','_id name name_en slug image')
        .populate('langues','_id nom nom_en')
        .sort({ createdAt: -1 })
        .then(lang => {
            // Formation.updateOne({ _id: lang._id }, {
            //     $set: {
            //         vue: parseInt(lang.vue)+1
            //     }
            // })
            //     .then(lange => {
                    return res.status(200).json({ type: "success", message: 'Formations recupérées avec succès !', data:lang })
                // })
                // .catch(err => {
                //     console.log(err)
                // })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/formation_ecoles', (req, res) => {
    User.find({type:"Ecole",active:true})
        .populate('formations','_id nom nom_en')
        .sort({createdAt:-1})
        .then(users => {
            return res.status(200).json({ type: "success", message: 'Ecoles recupérées avec succès !', data:users })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/api/domaine_formation_slug/:slug', (req, res) => {
    var slug = req.params.slug
    Formation.find({})
        .populate('user_id','_id name nom_ecole logo_ecole titre_ecole adresse_ecole couverture_ecole')
        .populate('suiveur','_id name')
        .populate('domaine','_id name name_en slug image')
        .populate('langues','_id nom nom_en')
        .sort({ createdAt: -1 })
        .then(data => {
            return res.status(200).json({ type: "success", message: 'Formations recupérées avec succès !', data:data.filter(element=>element.domaine.slug == slug) })
        })
        .catch(err => {
            console.log(err)
        })
})


router.get('/api/formation_domaine', (req, res) => {
    Formation.aggregate([
        {
         $group : { _id : "$domaine", formation: { $push: "$$ROOT" } }
        },
        {
            $project: {
                domaine: '$_id',
                formation: 1,
                _id: 0
            }
        },
        {
            $lookup: {
                from: "domaines",
                localField: "domaine",
                foreignField: "_id",
                as: "domaine_form"
            }
        }
      ])
      .then(data => {
          console.log(data);
        return res.status(200).json({ type: "success", message: 'Formations recupérées avec succès !', data:data })
      })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/formations/add', isAuthenticatedUser, (req, res) => {
    Langue.find({active:true})
        .sort({ createdAt: -1 })
        .then(lang => {
            Domaine.find()
                .sort({ createdAt: -1 })
                .then(domaines => {
                    User.find({type: "Ecole",active:true})
                        .sort({ createdAt: -1 })
                        .then(user => {
                            res.render('./formations/add', { page: "Ajouter une formation", username: req.user.name, user_admin_id: req.user._id,  menu: "formation", lang, user, domaines })
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

router.get('/dashboard/formations/edit/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Formation.findOne(searchQuery)
        .populate('user_id','_id name')
        .populate('langues','_id nom nom_en')
        .populate('domaine','_id name name_en slug image')
        .then(formation => {
            Langue.find({active:true})
                .sort({ createdAt: -1 })
                .then(lang => {
                    Domaine.find()
                        .sort({ createdAt: -1 })
                        .then(domaines => {
                            User.find({type: "Ecole",active:true})
                                .sort({ createdAt: -1 })
                                .then(user => {
                                    res.render('./formations/edit', { lang, user, domaines,  formation, page: "Modifier une formation", username: req.user.name, user_admin_id: req.user._id,  menu: "formation" })
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
        .catch(err => {
            console.log(err);
            res.redirect('/dashboard/formations')
        })
})

router.get('/dashboard/formations/delete/:id', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    Formation.deleteOne(searchQuery)
        .then(lang => {
            return res.status(200).json({ type: "success", message: 'Formation supprimée avec succès !' })
        })
        .catch(err => {
            console.log(err);
            return res.status(200).json({ type: "error", message: 'Erreur '+err })
        })
})

router.get('/api/restore-formation/:id', (req, res, next) => {
    console.log("test du retest");
    let searchQuery = { _id: req.params.id }
    Formation.findOne(searchQuery)
        .populate('user_id','_id name en_vedette nbre_candidature')
        .populate('langues','_id nom nom_en')
        .populate('domaine','_id name name_en slug image')
        .then(formation => {
            var search = { _id: formation.user_id._id };
            User.findOne(search)
                .populate('formations','_id nom nom_en')
                .then(user => {
                    if (user.nbre_candidature != 0) {
                        // formation.save().then(result => {
                            var restformation = parseInt(user.nbre_candidature)-1;
                            var restvedette = parseInt(user.en_vedette)-1;
                            if (user.en_vedette > 0 && formation.en_vedette == "on") {
                                User.updateOne(search, {
                                    $set: {
                                        nbre_candidature: restformation,
                                        en_vedette: restvedette
                                    }
                                })
                                    .then(result => {
                                        Formation.updateOne({_id: formation._id}, {
                                            $set: {
                                                active:true
                                            }
                                        })
                                            .then(result => {
                                                return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Training successfully restored' : 'Formation restaurée avec succès !', data:result })
                                            })
                                            .catch(err => {
                                                console.log(err);
                                            })
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    })
                            } else {
                                User.updateOne(search, {
                                    $set: {
                                        nbre_candidature: restformation
                                    }
                                })
                                    .then(result => {
                                        if (formation.en_vedette == "on") {
                                            Formation.updateOne({_id: formation._id}, {
                                                $set: {
                                                    en_vedette: "off",
                                                    active:true
                                                }
                                            })
                                                .then(result => {
                                                    return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'The course has been successfully restored but you have exhausted your stock of featured courses' : 'La formation a été restaurée avec succès mais vous avez épuisé votre stock de formations en vedette' })
                                                })
                                                .catch(err => {
                                                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                                                })
                                        }
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    })
                            }
                        // })
                    } else {
                        return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'You have exhausted the number of training courses that your package offers.' : 'Vous avez épuisé le nombre de formations que vous offre votre pack.' })
                    }
                })
                .catch(err => {
                    console.log(err);
                })
    })
    .catch(err => {
        return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
    })
})

////////////////===== POST ROUTES =====////////////////

router.post('/search-formation', (req, res, next) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        var paysville = fields.paysville == "all" ? "" : fields.paysville;
        var category = fields.category;
        console.log(new RegExp("^" + fields.title , "i"));
        if(category == "all"){
            Formation.find({active:true})
                .populate('user_id','_id name nom_ecole logo_ecole')
                .populate('domaine','_id name name_en slug image')
                .sort({ createdAt: -1 })
                .then(lang => {
                    var result = [];
                    lang.forEach((elt)=>{
                        if (fields.country == "") {
                            if (elt.nom.toLowerCase().includes(fields.title.toLowerCase())) {
                                result.push(elt);
                            }
                        } else {
                            if (elt.nom.toLowerCase().includes(fields.title.toLowerCase()) && (elt.campus1.includes('|'+fields.country+'|||') || elt.campus2.includes('|'+fields.country+'|||'))) {
                                result.push(elt);
                            }
                        }
                    })
                    return res.status(200).json({ type: "success", message: 'Recherche effectuée avec succès !', data:result })
                })
                .catch(err => {
                    console.log(err)
                })
        }else{
            Formation.find({active:true, domaine:category})
                .populate('user_id','_id name nom_ecole logo_ecole')
                .populate('domaine','_id name name_en slug image')
                .sort({ createdAt: -1 })
                .then(lang => {
                    var result = [];
                    lang.forEach((elt)=>{
                        if (fields.country == "") {
                            if (elt.nom.toLowerCase() == fields.title.toLowerCase()) {
                                result.push(elt);
                            }
                        } else {
                            if (elt.nom.toLowerCase() == fields.title.toLowerCase() && (elt.campus1.includes('|'+fields.country+'|||') || elt.campus1.includes('|'+fields.country+'|||'))) {
                                result.push(elt);
                            }
                        }
                    })
                    return res.status(200).json({ type: "success", message: 'Recherche effectuée avec succès !', data:result })
                })
                .catch(err => {
                    console.log(err)
                })
        }
    });
})

router.get('/edit-formation-activate/:id/:active', (req, res) => {
    let searchQuery = { _id: req.params.id }
    let active_query = req.params.active;
    Formation.updateOne(searchQuery, {
        $set: {
            active: req.params.active
        }
    })
        .then(user => {
            Formation.findOne(searchQuery)
                .then(formation => {
                    User.findOne({_id: formation.user_id._id})
                        .then(user => {
                            if (active_query == 0 && parseInt(user.nbre_candidature) > 0) {
                                var restcand = parseInt(user.nbre_candidature)+1;
                            }else if (active_query == 1 && parseInt(user.nbre_candidature) > 0) {
                                var restcand = parseInt(user.nbre_candidature)-1;
                            } else {
                                var restcand = user.nbre_candidature;
                            }
                            // var restcand = active_query == 0 ? parseInt(user.nbre_candidature)+1 : parseInt(user.nbre_candidature)-1;
                            if (formation.en_vedette == "on") {
                                if (active_query == 0 && parseInt(user.en_vedette) > 0) {
                                    var restvedette = parseInt(user.en_vedette)+1;
                                }else if (active_query == 1 && parseInt(user.en_vedette) > 0) {
                                    var restvedette = parseInt(user.en_vedette)-1;
                                } else {
                                    var restvedette = user.en_vedette;
                                }
                            }else{
                                var restvedette = parseInt(user.en_vedette);
                            }
                            User.updateOne({_id: formation.user_id._id}, {
                                $set: {
                                    nbre_candidature: restcand,
                                    en_vedette: restvedette
                                }
                            })
                            .then(result => {
                                return res.status(200).json({ message: 'Formation updated successfully', result })
                            })
                            .catch(err => {
                                return res.status(422).json({ error: err })
                            })
                        })
                        .catch(err => {
                            return res.status(422).json({ error: err })
                        })
                })
                .catch(err => {
                    return res.status(422).json({ error: err })
                })
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.put('/renew-formation/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }
    Formation.findOne(searchQuery)
        .populate('user_id','_id name en_vedette nbre_candidature nbre_renew')
        .populate('domaine','_id name name_en slug image')
        .then(formation => {
            // if (formation.user_id.nbre_renew != 0 && formation.renew == 1) {
            if (formation.user_id.nbre_renew != 0 && formation.renew != 1) {
                User.findOne({_id: formation.user_id._id})
                    .then(user => {
                        var restrenew = parseInt(user.nbre_renew)-1;
                        User.updateOne({_id: formation.user_id._id}, {
                            $set: {
                                nbre_renew: restrenew
                            }
                        })
                            .then(result => {
                                var actudate = new Date()
                                var nextmonthdate = new Date(new Date(actudate).setMonth(actudate.getMonth()+1))
                                Formation.updateOne(searchQuery, {
                                    $set: {
                                        active: true,
                                        renew: 1,
                                        date_renew: nextmonthdate
                                    }
                                })
                                    .then(user => {
                                        return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Training successfully renewed' : 'Formation renouvelée avec succès', user })
                                    })
                                    .catch(err => {
                                        return res.status(422).json({ error: err })
                                    })
                            })
                            .catch(err => {
                                console.log(err);
                            })
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }else{
                return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'Renewal not completed, please check the number of renewals you have left or you have already renewed this course.' : "Renouvellement non effectué, veuillez vérifier le nombre de renouvellement qu'il vous reste ou alors vous avez déjà renouvelé cette formation." })
            }
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.put('/restor-formation/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }
    Formation.findOne(searchQuery)
        .populate('user_id','_id name en_vedette nbre_candidature nbre_renew')
        .populate('domaine','_id name name_en slug image')
        .then(formation => {
            if (formation.user_id.nbre_renew != 0 && formation.renew == 1) {
                User.findOne({_id: formation.user_id._id})
                    .then(user => {
                        var restrenew = parseInt(user.nbre_renew)-1;
                        User.updateOne({_id: formation.user_id._id}, {
                            $set: {
                                nbre_renew: restrenew
                            }
                        })
                            .then(result => {
                                var actudate = new Date()
                                var nextmonthdate = new Date(new Date(actudate).setMonth(actudate.getMonth()+1))
                                Formation.updateOne(searchQuery, {
                                    $set: {
                                        active: true,
                                    }
                                })
                                    .then(user => {
                                        return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Training successfully renewed' : 'Formation renouvelée avec succès', user })
                                    })
                                    .catch(err => {
                                        return res.status(422).json({ error: err })
                                    })
                            })
                            .catch(err => {
                                console.log(err);
                            })
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }else{
                return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'Renewal not completed, please check the number of renewals you have left or you have already renewed this course.' : "Renouvellement non effectué, veuillez vérifier le nombre de renouvellement qu'il vous reste ou alors vous avez déjà renouvelé cette formation." })
            }
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

router.post('/addedit-formation', (req, res, next) => {
    const form = formidable({ multiples: true });
    var champs = [];
    form.on('field', function(fieldName, fieldValue) {
        champs.push({key:fieldName, value:fieldValue});
    });
    form.parse(req, (err, fields, files) => {
        if (fields.nom == "" || fields.user_id == "" || fields.id_formation == "" || fields.langues == "" || fields.domaine == "" || fields.cout == "") {
            return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'Please fill all the fields !' : 'Veuillez remplir tous les champs !' , data:"" })
        } else {
            function filtrage(params) {
                var filteredArray = [];
                filteredArray = champs.filter( champ => champ.key == params );
                console.log(champs);
                if (filteredArray.length > 1) {
                    var charge = [];
                    filteredArray.forEach(element => {
                        charge.push(element.value);
                    })
                    return JSON.stringify(charge);
                } else {
                    console.log(filteredArray[0]);
                    var charge = filteredArray[0].value;
                    return params.split('[').length >= 2 ? JSON.stringify([filteredArray[0].value]) : charge;
                }
            }
            function slugify(text) {
                return text.toString().toLowerCase()
                    .replace(/\s+/g, '-')           // Replace spaces with -
                    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                    .replace(/^-+/, '')             // Trim - from start of text
                    .replace(/-+$/, '');            // Trim - from end of text
            }
            var nom = fields.nom;
            var slug = slugify(fields.nom);
            var description = fields.description;
            var nom_en = fields.nom_en;
            var description_en = fields.description_en;
            var domaine = fields.domaine;
            var langues = filtrage("langues[]");
            var campus1 = fields.campus1;
            var campus2 = fields.campus2;
            var cout = fields.cout;
            var date_limite = fields.date_limite;
            var user_id = fields.user_id;
            var duree = fields.duree;
            var en_vedette = fields.en_vedette;
            var rentree_scolaire = fields.rentree_scolaire;
            var frais_dossier = fields.frais_dossier;
            var formation = new Formation({
                nom,
                description,
                nom_en,
                description_en,
                domaine,
                campus1,
                campus2,
                cout,
                duree,
                date_limite,
                en_vedette,
                rentree_scolaire,
                frais_dossier,
                slug,
                user_id,
            })
            if (fields.id_formation == "no") {
                Commande.find({user_id:user_id,statut:"Payé"})
                    .sort({ createdAt: -1 })
                    .then(cmd => {
                        console.log(cmd);
                        if (cmd.length == 0) {
                            return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'Please subscribe to a package before continuing.' : 'Veuillez souscrire à un pack avant de continuer.' })
                        }else if (cmd[0].date_limite < fields.date_limite) {
                            return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'You cannot create a course with a deadline that is longer than the deadline of your pack.' : 'Vous ne pouvez pas créer une formation ayant une date limite supérieure à la date limite de votre pack.' })
                        } else {
                            var search = { _id: user_id };
                            User.findOne(search)
                                .populate('formations','_id nom nom_en')
                                .then(user => {
                                    if (user.nbre_candidature != 0) {
                                        formation.save().then(result => {
                                            Formation.findOne({_id: result._id})
                                                .then(forma => {
                                                    JSON.parse(langues).forEach((elt)=>{
                                                        forma.langues.push(elt);
                                                    })
                                                    forma.save();
                                                })
                                                .catch(err => {
                                                    console.log(err);
                                                })
                                            var restformation = parseInt(user.nbre_candidature)-1;
                                            var restvedette = parseInt(user.en_vedette)-1;
                                            user.formations.push(result);
                                            user.save();
                                            if (user.en_vedette > 0 && en_vedette == "on") {
                                                User.updateOne(search, {
                                                    $set: {
                                                        nbre_candidature: restformation,
                                                        en_vedette: restvedette
                                                    }
                                                })
                                                    .then(result => {
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                    })
                                            } else {
                                                User.updateOne(search, {
                                                    $set: {
                                                        nbre_candidature: restformation
                                                    }
                                                })
                                                    .then(result => {
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                    })
                                                if (en_vedette == "on") {
                                                    Formation.updateOne({_id: result._id}, {
                                                        $set: {
                                                            en_vedette: "off"
                                                        }
                                                    })
                                                        .then(result => {
                                                            return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'The course has been successfully created but you have exhausted your stock of featured courses' : 'La formation a été crée avec succès mais vous avez épuisé votre stock de formations en vedette' })
                                                        })
                                                        .catch(err => {
                                                            return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                                                        })
                                                }
                                            }
                                            return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Training created with success!' : 'Formation créee avec succès !', result })
                                        })
                                    } else {
                                        return res.status(200).json({ type: "error", message: fields.lang == "en" ? 'You have exhausted the number of training courses that your package offers.' : 'Vous avez épuisé le nombre de formations que vous offre votre pack.' })
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        }
                    })
                    .catch(err => {
                        return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                    })
            } else {
                var searchQuery = { _id: fields.id_formation }
                var idforma = fields.id_formation;
                Formation.findOne(searchQuery)
                    .populate('user_id','_id name en_vedette nbre_candidature')
                    .then(formation => {
                        if (formation.en_vedette == "on" && en_vedette == "off") {
                            User.findOne({_id: formation.user_id._id})
                                .then(user => {
                                    var restvedette = parseInt(user.en_vedette)+1;
                                    User.updateOne({_id: formation.user_id._id}, {
                                        $set: {
                                            en_vedette: restvedette
                                        }
                                    })
                                        .then(result => {
                                            var langueData = {
                                                nom:nom,
                                                description:description,
                                                nom_en:nom_en,
                                                description_en:description_en,
                                                domaine:domaine,
                                                campus1:campus1,
                                                campus2:campus2,
                                                en_vedette:"off",
                                                cout:cout,
                                                date_limite:date_limite,
                                                rentree_scolaire: rentree_scolaire,
                                                frais_dossier: frais_dossier,
                                                user_id:user_id,
                                            }
                                            Formation.updateOne(searchQuery, {
                                                $set: langueData
                                            })
                                                .then(result => {
                                                    Formation.findOne(searchQuery)
                                                        .then(forma => {
                                                            forma.langues = [];
                                                            JSON.parse(langues).forEach((elt)=>{
                                                                forma.langues.push(elt);
                                                            })
                                                            forma.save();
                                                        })
                                                        .catch(err => {
                                                            console.log(err);
                                                        })
                                                    return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Training successfully updated !' : 'Formation modifiée avec succès !', result })
                                                })
                                                .catch(err => {
                                                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                                                })
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        } else if (formation.en_vedette == "off" && en_vedette == "on") {
                            User.findOne({_id: formation.user_id._id})
                                .then(user => {
                                    if (user.en_vedette > 0) {
                                        var restvedette = parseInt(user.en_vedette)-1;
                                        User.updateOne({_id: formation.user_id._id}, {
                                            $set: {
                                                en_vedette: restvedette
                                            }
                                        })
                                            .then(result => {
                                                var langueData = {
                                                    nom:nom,
                                                    description:description,
                                                    nom_en:nom_en,
                                                    description_en:description_en,
                                                    domaine:domaine,
                                                    campus1:campus1,
                                                    campus2:campus2,
                                                    en_vedette:"on",
                                                    cout:cout,
                                                    date_limite:date_limite,
                                                    rentree_scolaire: rentree_scolaire,
                                                    frais_dossier: frais_dossier,
                                                    user_id:user_id,
                                                }
                                                Formation.updateOne(searchQuery, {
                                                    $set: langueData
                                                })
                                                    .then(result => {
                                                        Formation.findOne(searchQuery)
                                                            .then(forma => {
                                                                forma.langues = [];
                                                                JSON.parse(langues).forEach((elt)=>{
                                                                    forma.langues.push(elt);
                                                                })
                                                                forma.save();
                                                            })
                                                            .catch(err => {
                                                                console.log(err);
                                                            })
                                                        return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Training successfully updated !' : 'Formation modifiée avec succès !', result })
                                                    })
                                                    .catch(err => {
                                                        return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                                                    })
                                            })
                                            .catch(err => {
                                                console.log(err);
                                            })
                                    }else{
                                        var langueData = {
                                            nom:nom,
                                            description:description,
                                            nom_en:nom_en,
                                            description_en:description_en,
                                            domaine:domaine,
                                            campus1:campus1,
                                            campus2:campus2,
                                            en_vedette:"off",
                                            cout:cout,
                                            date_limite:date_limite,
                                            rentree_scolaire: rentree_scolaire,
                                            frais_dossier: frais_dossier,
                                            user_id:user_id,
                                        }
                                        Formation.updateOne(searchQuery, {
                                            $set: langueData
                                        })
                                            .then(result => {
                                                Formation.findOne(searchQuery)
                                                    .then(forma => {
                                                        forma.langues = [];
                                                        JSON.parse(langues).forEach((elt)=>{
                                                            forma.langues.push(elt);
                                                        })
                                                        forma.save();
                                                    })
                                                    .catch(err => {
                                                        console.log(err);
                                                    })
                                                return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Successfully modified training but you have exhausted your stock of featured training!' : 'Formation modifiée avec succès mais vous avez épuisé votre stock de formations en vedette !', result })
                                            })
                                            .catch(err => {
                                                return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                                            })
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                        } else {
                            var langueData = {
                                nom:nom,
                                description:description,
                                nom_en:nom_en,
                                description_en:description_en,
                                domaine:domaine,
                                campus1:campus1,
                                campus2:campus2,
                                en_vedette:"off",
                                cout:cout,
                                date_limite:date_limite,
                                rentree_scolaire: rentree_scolaire,
                                frais_dossier: frais_dossier,
                                user_id:user_id,
                            }
                            Formation.updateOne(searchQuery, {
                                $set: langueData
                            })
                                .then(result => {
                                    Formation.findOne(searchQuery)
                                        .then(forma => {
                                            forma.langues = [];
                                            JSON.parse(langues).forEach((elt)=>{
                                                forma.langues.push(elt);
                                            })
                                            forma.save();
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                    return res.status(200).json({ type: "success", message: fields.lang == "en" ? 'Training updated successfully' : 'Formation modifiée avec succès !', result })
                                })
                                .catch(err => {
                                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                                })
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }
        }
    });
})

module.exports = router