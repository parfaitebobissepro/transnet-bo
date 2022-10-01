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
const User = require('../models/userModel')
const Formation = require('../models/formationModel')
const Commande = require('../models/commandeModel')
const Conversation = require('../models/conversationModel')
const Chat = require('../models/chatModel')
const Langue = require('../models/langueModel')

const UserHonneur = require('../models/userHonneurModel')
const UserExperience = require('../models/userExperienceModel')
const UserLangue = require('../models/userLangueModel')
const UserEducation = require('../models/userEducationModel')

//Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('error_msg', 'Veuillez vous connecter pour accéder à cette page.')
    res.redirect('/login')
}

//Get routes
router.get('/', (req, res) => {
    User.find({})
        .then(users => {
            if (users.length > 0) {
                res.render('./users/login')
            } else {
                let userData = {
                    name: "Admin",
                    email: "admin@transnet.com",
                    phone: "6123456789",
                    pic: 'https://res.cloudinary.com/insta-node/image/upload/v1605181664/jybyuhfdh1euxw20i4zi.jpg',
                    type: "admin",
                    active: 1
                }
                var password = "12345678";
                User.register(userData, password, (err, user) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render('./users/login')
                    }
                })
            }
        })
        .catch(err => {
            console.log(err)
        })
})
router.get('/login', (req, res) => {
    var jan312009 = new Date();
    var oneMonthFromJan312009 = new Date(new Date(jan312009).setMonth(jan312009.getMonth()+1));
    console.log(oneMonthFromJan312009)
    res.render('./users/login')
})

router.get('/dashboard/users/add', isAuthenticatedUser, (req, res) => {
    var niveau = "Terminale o Bac + 1 o Bac + 2 o Bac + 2 BTS o Bac + 2 DUT o Bac + 2 Bachelor o Bac + 3 o Bac + 3 Licence Professionnelle o Bac + 3 Bachelor o Bac + 4 o Bac + 5 o Msc o MBA o Doctorat";
    niveau = niveau.split("o ");
    var spec = "Arts, Culture, Architecture o Assurance o Banque o Commerce – Business o Commerce International o Communication o Comptabilité – Gestion o Droit o Economie Gestion o Finance o Gestion des Entreprises et des Administrations o Histoire – Géographie o Hôtellerie o Industrie o Informatique o International Business o Langues Etrangères et Appliquées o Lettres Sciences Humaines o Logistique et Transport o Management o Management des Unités Commerciales o Management du Luxe o Mode o Philosophie o Santé Social o Sciences et Mathématiques o Sciences Politiques o Secrétariat Bureautique o Sport o Techniques de Commercialisation o Technologie o Tourisme o Web-marketing et E-Business o Bac ES o Bac L o Bac S o Bac Professionnel o Bac International o Bac Technologique o Autres";
    spec = spec.split("o ");
    Langue.find({active:true})
        .sort({ createdAt: -1 })
        .then(lang => {
            res.render('./users/add', { page: "Ajouter un utilisateur", username: req.user.name, user_admin_id: req.user._id,  menu: "user", niveau: niveau, spec: spec, lang })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard', isAuthenticatedUser, (req, res) => {
    User.find({})
    .then(users => {
        var nbre_eleve = users.filter( champ => champ.type == "client" ).length;
        var nbre_ecole = users.filter( champ => champ.type == "transporteur" ).length;
        Formation.find({})
            .sort({ createdAt: -1 })
            .then(formation => {
                Commande.find({})
                    .sort({ createdAt: -1 })
                    .then(cmd => {
                        User.aggregate([
                            { $match: { type: "client" } },
                            {$project:
                                {createdAt:
                                  {
                                    $dateToString:
                                    {format:"%Y-%m-%d", date:"$createdAt"}
                                  }
                                }
                            },
                            {
                             $group : {_id:
                                {createdAt:"$createdAt"}, 
                                count:{$sum: 1}
                              }
                            },
                            {$project:
                                {_id:0, createdAt:"$_id.createdAt", count:1}
                            },
                            {$sort:
                                {"createdAt":-1}
                            }
                          ])
                          .then(statdata_etudiant => {
                            User.aggregate([
                                { $match: { type: "transporteur" } },
                                {$project:
                                    {createdAt:
                                      {
                                        $dateToString:
                                        {format:"%Y-%m-%d", date:"$createdAt"}
                                      }
                                    }
                                },
                                {
                                 $group : {_id:
                                    {createdAt:"$createdAt"}, 
                                    count:{$sum: 1}
                                  }
                                },
                                {$project:
                                    {_id:0, createdAt:"$_id.createdAt", count:1}
                                },
                                {$sort:
                                    {"createdAt":-1}
                                }
                              ])
                                .then(statdata_ecole => {
                                    var admin = req.user.id;
                                    res.render('./users/dashboard', { users: users, page: "Dashboard", username: req.user.name, user_admin_id: req.user._id,  menu: "", nbre_eleve: nbre_eleve, nbre_ecole: nbre_ecole, nbre_demande: cmd.filter( champ => champ.statut != "Payé" ).length, nbre_cmd: cmd.filter( champ => champ.statut == "Payé" ).length, statdata_etudiant, statdata_ecole, admin })
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
                console.log(err)
            })
    })
    .catch(err => {
        console.log(err)
    })
})

router.get('/logout', isAuthenticatedUser, (req, res) => {
    req.logOut()
    req.flash('success_msg', 'Déconnexion reussie.')
    res.redirect('/login')
})

router.get('/forgot', (req, res) => {
    res.render('./users/forgot')
})

router.get('/reset/:token', (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                req.flash('error_msg', 'Password reset token is invalid or has been expired!')
                res.redirect('/forgot')
            }
            res.render('./users/newpassword', { token: req.params.token })
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR: ' + err)
            res.redirect('/forgot')
        })
})

router.get('/password/change', (req, res) => {
    res.render('./users/changepassword')
})

router.get('/dashboard/users', isAuthenticatedUser, (req, res) => {
    User.find({})
        .sort({createdAt:-1})
        .then(users => {
            res.render('./users/allusers', { users: users, page: "Utilisateurs", username: req.user.name, user_admin_id: req.user._id,  menu: "user" })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/transporteurs', isAuthenticatedUser, (req, res) => {
    User.find({type: "transporteur"})
        .sort({createdAt:-1})
        .then(users => {
            res.render('./users/ecoles', { users: users, page: "Utilisateurs", username: req.user.name, user_admin_id: req.user._id,  menu: "user" })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/clients', isAuthenticatedUser, (req, res) => {
    User.find({type: "client"})
        .sort({createdAt:-1})
        .then(users => {
            res.render('./users/etudiants', { users: users, page: "Utilisateurs", username: req.user.name, user_admin_id: req.user._id,  menu: "user" })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/dashboard/users/edit/:id/:typereq', isAuthenticatedUser, (req, res) => {
    let searchQuery = { _id: req.params.id }

    User.findOne(searchQuery)
        // .populate('eleve_honneur','_id titre_honneur annee_honneur description_honneur attestation_honneur')
        // .populate('eleve_experience','_id titre_poste_eleve entreprise_eleve debut_entreprise fin_entreprise desc_poste_eleve attestation_entreprise_eleve')
        // .populate('eleve_langue','_id langue_eleve attestation_langue_eleve')
        // .populate('eleve_education','_id niveau_etude_eleve specialisation_eleve etablissement_eleve pays_etablissement debut_etablissement fin_etablissement desc_formation resultat_formation bulletin_eleve diplome_eleve')
        .then(user => {
            Langue.find({active:true})
                .sort({ createdAt: -1 })
                .then(lang => {
                    res.render('./users/edituser', { user, typereq: req.params.typereq, page: "Modifier un utilisateur", username: req.user.name, user_admin_id: req.user._id,  menu: "user" , lang })
                })
                .catch(err => {
                    console.log(err);
                    // req.flash('error_msg', 'ERROR: ' + err)http://localhost:5000/dashboard/users/edit/602e529c29fc4058e4cca6c0/saveaddeducation
                    res.redirect('/dashboard/users')
                })
        })
        .catch(err => {
            console.log(err);
            // req.flash('error_msg', 'ERROR: ' + err)http://localhost:5000/dashboard/users/edit/602e529c29fc4058e4cca6c0/saveaddeducation
            res.redirect('/dashboard/users')
        })
})

router.get('/reset-password/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }

    User.findOne(searchQuery)
        .then(user => {
            res.render('./users/resetpwd', { user })
        })
        .catch(err => {
            console.log(err);
        })
})

router.get('/user/details/:id', (req, res) => {
    User.findOne({_id:req.params.id})
        .then(user =>{
            return res.status(200).json({ type: "success", data: user, message: "Infos de l'utilisateur récupérées avec succès." });
        })
        .catch(err => {
            console.log(err);
        })
})

router.get('/user/details-profile/:username', (req, res) => {
    User.findOne({username:req.params.username})
        .then(user =>{
            User.updateOne({ _id: user._id }, {
                $set: {
                    vue: parseInt(user.vue)+1
                }
            })
            .then(lange => {
                return res.status(200).json({ type: "success", data: user, message: "Infos de l'utilisateur récupérées avec succès." });
            })
            .catch(err => {
                console.log(err);
            })
        })
        .catch(err => {
            console.log(err);
        })
})

/******************Post routes*******************/
//web auth
router.post('/login', passport.authenticate('local', {
    successRedirect: '/successjson',
    failureRedirect: '/failurejson',
    failureFlash: true
}))
router.get('/successjson', function (req, res) {
    res.json({ success: 'Login ok.' });
});

router.get('/failurejson', function (req, res) {
    res.json({ error: 'Identifiants invalides.' });
});

//api auth
router.post('/api/login', function(req, res, next) {
    console.log("terrific");
    console.log(req.body);
    var langue = req.body.lang;
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.json({ type: "error", message: langue == 'en' ? 'Invalid identifiers.' : "Identifiants invalides." }); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        User.findOne({_id:req.user._id})
            .then(user =>{
                return res.status(200).json({
                    type: "success", data: user, message: langue == 'en' ? 'Welcome '+user.name : "Bienvenue "+user.name, createdAt: user.createdAt
                });
            })
            .catch(err => {
                return res.status(422).json({ message: 'ERROR: ' + err })
            })
      });
    })(req, res, next);
  });

//web and api registration
/**
 * @api {post} /signup Request User Signup 
 * @apiName UserSignup
 * @apiGroup User
 * 
 * @apiParam {String} [name]  Optional Name of the User.
 * @apiParam {String} [phone]  Phone of the User.
 * @apiParam {String} [type]  Type of the User.
 * @apiParam {String} [password] passord of the user.
 *
 * @apiSuccess {String} message Account created successfully.
 * @apiSuccess {Object} user details  of the User.
 */
router.post('/signup', (req, res, next) => {
    const form = formidable({ multiples: true });
    var filese = [];
    var champs = [];
    var tab = [];
    form.on('file', function(field, file) {
        filese.push({field:field, file:file});
    });
    form.on('field', function(fieldName, fieldValue) {
        champs.push({key:fieldName, value: fieldValue == "undefined" ? "" : fieldValue});
    });
    console.log("les champs");
    console.log(champs);
    form.parse(req, (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        if (!fields.type || !fields.username || !fields.email || !fields.name || !fields.password) {
            return res.status(200).json({ type: "error", message: fields.lang == 'en' ? 'Please fill all fields' : 'Remplissez tous les champs.' })
        }
        let userData = {};
        var uploadedFile = [];
        var i = 0;
        filese.forEach(element => {
            i++;
            console.log(element);
            if (element.file.size > 0) {
                var oldpath = element.file.path;
                var newpath = 'public/uploads/' +element.field.split("[")[0]+element.file.size+"."+element.file.name.split('.')[element.file.name.split('.').length - 1];
                fs.rename(oldpath, newpath, function (err) {
                    // if (err) throw err;
                    // console.log("Image uploaded at this path: "+newpath);
                });
                
                newpath = newpath.split("public/")[1];
                uploadedFile.push({key:element.field,value:"/"+newpath});
            }else{
                if(fields.id_eleve == "no"){
                    uploadedFile.push({key:element.field,value:"/images/default-pp.png"});
                }
            }
        }) 
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
                userData[params.split('[')[0]] = JSON.stringify(charge);
            } else {
                var charge = filteredArray[0].value;
                userData[params.split('[')[0]] = params.split('[').length >= 2 ? JSON.stringify([filteredArray[0].value]) : charge;
            }
        }

        champs.forEach(element => {
            if (element.key != "savetype" && element.key != "type_req" && element.key != "password" && element.key != "id_eleve" && element.value != "undefined") {
                filtrage(element.key, "field");
            }
        });
        
        uploadedFile.forEach(element => {
            switch (element.key) {
                case "pic":
                    filtrage("pic", "file");
                    break;
                default:
                    break;
            }
        })
        var password = fields.password;
        var tir = __dirname + "/welcome_email.ejs";
        tir = tir.replace("routes","views/partials/emails")
        if (fields.id_eleve == "no" || !fields.id_eleve) {
            User.register(userData, password, (err, user) => {
                console.log(err);
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
                                        if (fields.type == "transporteur") {
                                            new Chat({
                                                conversation: conv._id,
                                                message: "Bienvenue, votre compte est en attente d'approbation, il sera validé après remplissage de votre profil.",
                                                objet: "Bienvenue !",
                                                from: user_id_admin,
                                                to: user_id_user,
                                                file: ""
                                            });
                                        }
                                        return res.status(200).json({ type: "success", message: fields.lang == 'en' ? 'Account created successfully' : 'Compte crée avec succès !', redirector: fields.savetype, data:user })
                                    })
                                    .catch(err => {
                                        return res.status(422).json({ message: 'ERROR: ' + err })
                                    })
                            })
                        })
                    })
                })
            })
        }else{
            let searchQuery = { _id: fields.id_eleve }
            User.updateOne(searchQuery, {
                $set: userData
            })
                .then(user => {
                    if (fields.password != "" || fields.password != null || fields.password != undefined) {
                        User.findOne(searchQuery)
                            .then(users => {
                                users.setPassword(fields.password, err => {
                                    users.save()
                                        .then(user => {
                                            return res.status(200).json({ type: "success", message: fields.lang == 'en' ? 'Account updated successfully' : 'Compte modifié avec succès !', redirector: fields.savetype, data:users })
                                        })
                                })
                            })
                            .catch(err => {
                                return res.status(422).json({ message: 'ERROR: ' + err })
                            })
                    }else{
                        return res.status(200).json({ type: "success", message: fields.lang == 'en' ? 'Account updated successfully' : 'Compte modifié avec succès !', redirector: fields.savetype, data:user })
                    }
                })
                .catch(err => {
                    return res.status(200).json({ type: "error", message: 'ERROR: ' + err })
                })
        }
    });
})

router.post('/password/change', (req, res) => {
    User.findOne({ _id: req.body.id_user })
        .then(user => {
            user.setPassword(req.body.password, err => {
                user.save()
                    .then(user => {
                        return res.status(200).json({ type:"success", message: req.body.lang == "en" ? 'Password reset successfully' : "Mot de passe reinitialisé avec succès." })
                    })
            })
        })
        .catch(err => {
            return res.status(422).json({ message: 'ERROR: ' + err })
        })
})

//Routes to handle forgot password
router.post('/forgot-pwd', (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user == null) {                
                return res.status(200).json({ type: "error", message: req.body.lang == "en" ? 'We do not have any users with this email in our system, please check your email and resume!' : "Nous n'avons pas d'utilisateur ayant cet email dans notre système, veuillez vérifier votre email et reprendre !" })
            } else {
                var link = req.body.type == "api" ? "" : "https://admin.universcitiz.com/reset-password/"+user._id;
                var tir = __dirname + "/template_email.ejs";
                tir = tir.replace("routes","views/partials/emails")
                ejs.renderFile(tir, { header: "Hello "+user.name+",", body: "Votre demande de reinitialisation de mot de passe a été bien prise en compte, cliquez sur le lien suivant pour le reinitialiser.", btn:link, user: user }, function (err, data) {
                    let mailOptions = {
                        to: user.email,
                        from: 'UniversCity <no-reply@smartcodegroup.com>',
                        subject: 'Reinitialisation de mot de passe',
                        html: data
                    }
                    smtpTransport.sendMail(mailOptions, err => {
                        return res.status(200).json({ type: "success", message: req.body.lang == "en" ? 'An email has been sent to you to reset your password.' : "Un email vient de vous être envoyé pour la reinitialisation de votre mot de passe." })
                    })
                })
            }
        })
        .catch(err => {
            return res.status(422).json({ error: 'ERROR: ' + err })
        })
})

router.post('/reset/:token', (req, res) => {
    async.waterfall([
        (done) => {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
                .then(user => {
                    if (!user) {
                        if (req.body.type !== 'admin') {
                            return res.status(422).json({ error: 'Password reset token is invalid or has been expired!' })
                        }
                        req.flash('error_msg', 'Password reset token is invalid or has been expired!')
                        res.redirect('/forgot')
                    }
                    if (req.body.password !== req.body.confirmpassword) {
                        if (req.body.type !== 'admin') {
                            return res.status(422).json({ error: "Password don't match" })
                        }
                        req.flash('error_msg', "Password don't match")
                        res.redirect('/forgot')
                    }
                    user.setPassword(req.body.password, err => {
                        user.resetPasswordToken = undefined
                        user.resetPasswordExpires = undefined
                        user.save(err => {
                            req.logIn(user, err => {
                                done(err, user)
                            })
                        })
                    })
                })
                .catch(err => {
                    if (req.body.type !== 'admin') {
                        return res.status(422).json({ error: 'ERROR: ' + err })
                    }
                    req.flash('error_msg', 'ERROR: ' + err)
                    res.redirect('/forgot')
                })
        },
        (user) => {
            let smtpTransport = nodemailer.createTransport({
                host: "mail.smartcodegroup.com",
                port: 465,
                secure: 'ssl', // upgrade later with STARTTLS
                auth: {
                    user: "no-reply@smartcodegroup.com",
                    pass: "63-U5}]K[fB4"
                }
            })

            let mailOptions = {
                to: user.email,
                from: 'no-reply@smartcodegroup.com',
                subject: 'Your password is changed',
                text: 'Hello, ' + user.username + '\n\n' +
                    'This is the confirmation that the password for your account ' + user.email + ' has been changed.'
            }
            smtpTransport.sendMail(mailOptions, err => {
                if (req.body.type !== 'admin') {
                    return res.status(200).json({ message: 'Your password has beenchanged successfully' })
                }
                req.flash('success_msg', 'Your password has beenchanged successfully')
                res.redirect('/login')
            })
        }
    ], err => {
        res.redirect('/login')
    })
})

/**
 * @api {put} /edit/id Request id the id of the user  
 * @apiName UserEdit
 * @apiGroup User
 * 
 *  @apiParam {String} id Users unique ID.
 * @apiParam {String} [residence]  Residence of the User.
 * @apiParam {String} [phone]  Phone of the User.
 *
 * @apiSuccess {String} message User updated successfully.
 * @apiSuccess {Object} user details  of the User.
 */
//Put routes starts here
router.get('/dashboard/activate-user/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }
    User.updateOne(searchQuery, {
        $set: {
            active: 1
        }
    })
        .then(user => {
            return res.redirect('https://blissful-archimedes-671723.netlify.app');
        })
        .catch(err => {
            return res.status(422).json({ error: err })
        })
})

/**
 * @api {put} /edit/id Request id the id of the user  
 * @apiName UserEdit
 * @apiGroup User
 * 
 *  @apiParam {String} id Users unique ID.
 * @apiParam {String} [residence]  Residence of the User.
 * @apiParam {String} [phone]  Phone of the User.
 *
 * @apiSuccess {String} message User updated successfully.
 * @apiSuccess {Object} user details  of the User.
 */
//Put routes starts here
router.put('/edit/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }
    if (req.body.activate == "oui") {
        User.updateOne(searchQuery, {
            $set: {
                active: req.body.active
            }
        })
            .then(user => {
                Formation.update({ user_id: req.params.id }, {
                    $set: {
                        active: req.body.active
                    }
                })
                    .then(user => {
                        return res.status(200).json({ message: 'User updated successfully', user })
                    })
                    .catch(err => {
                        return res.status(422).json({ error: err })
                    })
            })
            .catch(err => {
                return res.status(422).json({ error: err })
            })
    } else {
        User.updateOne(searchQuery, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                residence: req.body.residence
            }
        })
            .then(user => {
                return res.status(200).json({ message: 'User updated successfully', user })
            })
            .catch(err => {
                return res.status(200).json({ error: err })
            })
    }
})

//Update residence Api
// router.put('/residence/:id', (req,res) =>{
//     let searchQuery = {_id:req.params.id}
//     User.updateOne(searchQuery, {$set: {residence: req.body.residence}})
//     .then(user =>{
//         return res.status(200).json({ message: 'User updated successfully', user: {residence: req.body.residence, phone: req.body.phone} })
//     })
//     .catch(err =>{
//         return res.status(422).json({ error: 'ERROR: '+err })
//     })
// })

//Delete route starts here
router.delete('/delete/user/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }

    // User.updateOne(searchQuery, {$set: {active:0}})
    //     .then(user =>{
    //         if(req.body.type !== 'admin'){
    //             return res.status(200).json({ message: 'User blocked successfully' })
    //         }
    //         req.flash('success_msg', 'User blocked successfully')
    //         res.redirect('/users/all')
    //     })
    //     .catch(err =>{
    //         if(req.body.type !== 'admin'){
    //             return res.status(422).json({ error: 'ERROR: '+err })
    //         }
    //         req.flash('error_msg', 'ERROR: '+err)
    //         res.redirect('/users/all')
    //     })
})

//Delete route starts here
router.delete('/undelete/user/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }

    User.updateOne(searchQuery, { $set: { active: 1 } })
        .then(user => {
            if (req.body.type !== 'admin') {
                return res.status(200).json({ message: 'User unblocked successfully' })
            }
            req.flash('success_msg', 'User unblocked successfully')
            res.redirect('/users/all')
        })
        .catch(err => {
            if (req.body.type !== 'admin') {
                return res.status(422).json({ error: 'ERROR: ' + err })
            }
            req.flash('error_msg', 'ERROR: ' + err)
            res.redirect('/users/all')
        })
})

//Delete route starts here
router.get('/dashboard/user-delete/:id', (req, res) => {
    let searchQuery = { _id: req.params.id }

    User.deleteOne(searchQuery)
        .then(lang => {
            res.redirect('/dashboard/users')
        })
        .catch(err => {
            console.log(err);
            // return res.status(200).json({ type: "error", message: 'Erreur ' + err })
        })
})

module.exports = router