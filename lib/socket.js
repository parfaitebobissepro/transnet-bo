
const nodemailer = require('nodemailer')
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

const User = require('../models/userModel')
const Conversation = require('../models/conversationModel')
const Chat = require('../models/chatModel')
const users = {};

class Sockets {
  connection(client) {
    // console.log(client);
    // client.emit('test', "connexion reussie");
    client.on("message", (message) => {
        console.log(message);
        var message_data = JSON.parse(message)
        var chat = new Chat({
            conversation: message_data.conversation,
            message: message_data.message,
            objet: message_data.objet,
            from: message_data.from,
            to: message_data.to,
            file: ""
        });
        console.log(chat);
        chat.save().then(result => {
            // console.log(result);
            Conversation.findOne({ _id: message_data.conversation })
            .then(forma => {
                forma.messages.push(result._id);
                forma.save();
                  Chat.findOne({ _id: result._id })
                  .populate('from','_id name prenom email pic type username')
                  .populate('to','_id name prenom email pic type username')
                  .then(chat => {
                    console.log(chat);
                    if (Object.values(users).indexOf(message_data.to) > -1) {
                      client.broadcast.emit('new_message', JSON.stringify(chat));
                      if (message_data.hasFile) {
                        client.emit('retour_message_file', JSON.stringify(chat));
                      }
                    }else{
                      client.broadcast.emit('new_message', JSON.stringify(chat));
                      if (message_data.hasFile) {
                        client.emit('retour_message_file', JSON.stringify(chat));
                      }
                      
                      var tir = __dirname + "/template_email.ejs";
                      tir = tir.replace("lib","views/partials/emails")
                      var body = "Vous avez un nouveau message de <strong>"+chat.from.name+"</strong> sur le chat interne, voici les détails: <br><br> <strong>Objet:</strong> "+chat.objet+" <br> <strong>Message:</strong> "+chat.message;
                      ejs.renderFile(tir, { header: "Hello "+chat.to.name+",", body: body, btn:"no" }, function (err, data) {
                          let mailOptions = {
                              to: chat.to.email,
                              from: 'TransNet <no-reply@smartcodegroup.com>',
                              subject: "Un nouveau message",
                              html: data
                          }
                          smtpTransport.sendMail(mailOptions, err => {
                              // return res.status(200).json({ type:"success", message: st+' avec succès', user })
                          })
                      })
                    }
                  });
            });
        });
    });

    client.on("image_uploaded", (data) => {
      console.log(data);
      Chat.findOne({ _id: data })
      .populate('from','_id name prenom email pic type username')
      .populate('to','_id name prenom email pic type username')
      .then(chat => {
        console.log(chat);
        client.emit('new_file', JSON.stringify(chat));
        client.broadcast.emit('new_file', JSON.stringify(chat));
      });
    });

    client.on('login', function(data){
      console.log('a user ' + data.userId + ' connected');
      // saving userId to object with socket ID
      users[client.id] = data.userId;
    });
  
    client.on('disconnect', function(){
      console.log('user ' + users[client.id] + ' disconnected');
      // remove saved socket from users object
      delete users[client.id];
    });
  }
}

module.exports =  Sockets;