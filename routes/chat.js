const express = require('express')
const router = express.Router()
const passport = require('passport')
const crypto = require('crypto')
const async = require('async')
const nodemailer = require('nodemailer')
const formidable = require('formidable')
var fs = require('fs');
var moment = require('moment');
require('moment/locale/fr');
moment.locale('fr');

//Requiring user model
const Doc = require('../models/docModel')
const Formation = require('../models/formationModel')
const Conversation = require('../models/conversationModel')
const Chat = require('../models/chatModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

////////////////===== GET ROUTES =====////////////////

router.get('/dashboard/chat', isAuthenticatedUser, (req, res) => {
    let searchQuery = { $or:[ {'emetteur':req.user.id}, {'recepteur':req.user.id} ]};
    Conversation.find(searchQuery)
        .populate('emetteur','_id name prenom email pic type username')
        .populate('recepteur','_id name prenom email pic type username')
        .populate('messages','_id objet message file createdAt from to conversation')
        .sort({ updatedAt: -1 })
        .then(chatconvers => {
            console.log("conversations du chat");
            console.log(chatconvers);
            var admin = req.user.id;
            res.render('./chat/index', { page: "Chat", username: req.user.name, user_admin_id: req.user._id,  menu: "chat", chatconvers, admin, moment: moment })
        })
        .catch(err => {
            return res.status(422).json({ message: 'ERROR: ' + err })
        })
})

router.get('/dashboard/chat-list', isAuthenticatedUser, (req, res) => {
    Chat.find({})
        .populate('from','_id name prenom_eleve nom_ecole email pic logo_ecole type username')
        .populate('to','_id name prenom_eleve nom_ecole email pic logo_ecole type username')
        .sort({ createdAt: -1 })
        .then(chatconvers => {
            var admin = req.user.id;
            res.render('./chat/list', { page: "Chat", username: req.user.name, user_admin_id: req.user._id,  menu: "chat", chatconvers, admin, moment:moment })
        })
        .catch(err => {
            return res.status(422).json({ message: 'ERROR: ' + err })
        })
})

router.get('/api/chat_user/:id', (req, res) => {
    let searchQuery = { $or:[ {'emetteur':req.params.id}, {'recepteur':req.params.id} ]};
    Conversation.find(searchQuery)
        .populate('emetteur','_id name prenom_eleve nom_ecole email pic logo_ecole type username')
        .populate('recepteur','_id name prenom_eleve nom_ecole email pic logo_ecole type username')
        .populate('messages','_id objet message file createdAt from to conversation')
        .sort({ updatedAt: -1 })
        .then(chatconvers => {
            res.status(200).json({ type:"success", message: "Messages récuperés avec succès !", data:chatconvers })
        })
        .catch(err => {
            return res.status(422).json({ message: 'ERROR: ' + err })
        })
})

////////////////===== POST ROUTES =====////////////////

router.post('/upload-chat-image/:id', (req, res, next) => {
    let searchQuery = { _id: req.params.id }
    var idimg = req.params.id;
    const form = formidable({ multiples: true });
    var filese = [];
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
                var oldpath = element.file.path;
                var newpath = 'public/uploads/imageupload' + new Date().getTime() + i + "." + element.file.type.split('/')[1];
                fs.rename(oldpath, newpath, function (err) {
                });
                newpath = newpath.split("public/")[1];
                uploadedFile.push({ key: element.field, value: "/" + newpath });
            } else {
            }
        })
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
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "file":
                    filtrage("file", "file");
                    break;
                default:
                    break;
            }
        })
        console.log(category_data);
        Chat.updateOne(searchQuery, {
            $set: category_data
        })
            .then(result => {
                return res.status(200).json({ type: "success", message: 'Fichier uploadé avec succès !', data:idimg })
            })
            .catch(err => {
                console.log(err);
                return res.status(200).json({ type: "error", message: 'ERROR: ' + err })
            })
    });
})

router.post('/addedit-doc', (req, res, next) => {
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
                if (fields.id_doc == "no") {
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
            if (element.key != "id_doc") {
                filtrage(element.key, "field");
            }
        });
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "url":
                    filtrage("url", "file");
                    break;
                default:
                    break;
            }
        })
        var docc = new Doc(category_data)
        if (fields.id_doc == "no") {
            docc.save().then(result => {
                return res.status(200).json({ type: "success", message: 'Document crée avec succès !', result })
            })
        } else {
            var searchQuery = { _id: fields.id_doc }
            Doc.updateOne(searchQuery, {
                $set: category_data
            })
                .then(result => {
                    return res.status(200).json({ type: "success", message: 'Document modifié avec succès !', result })
                })
                .catch(err => {
                    return res.status(422).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

module.exports = router