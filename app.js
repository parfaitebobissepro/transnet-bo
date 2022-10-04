const express = require('express')
const app = express()
// var secure = require('express-force-https');
const socketIo = require('socket.io')
const http = require('http');
const Sockets = require('./lib/socket');

const path = require('path')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const passport = require('passport')
const cors = require('cors')
const localStrategy = require('passport-local').Strategy
const nodeApiDocGenerator = require('node-api-doc-generator')
const schedule = require('node-schedule');
const {DATABASE, PORT} = require('./config/keys')

//Requiring route
const userRoutes = require('./routes/users')
const alertRoutes = require('./routes/alert')
const langueRoutes = require('./routes/langue')
const formationRoutes = require('./routes/formation')
const categoryRoutes = require('./routes/category')
const publiciteRoutes = require('./routes/publicite')
const blogRoutes = require('./routes/blog')
const pagefrontRoutes = require('./routes/pagefront')
const packRoutes = require('./routes/pack')
const contactRoutes = require('./routes/contact')
const commentRoutes = require('./routes/comment')
const candidatureRoutes = require('./routes/candidature')
const commandesRoutes = require('./routes/commandes')
const docsRoutes = require('./routes/docs')
const ecolesuivieRoute = require('./routes/ecolesuivie')
const chatRoute = require('./routes/chat')
const dynamicFieldUserRoute = require('./routes/dynamic_field_user')
const domaineRoutes = require('./routes/domaine')
const devisRoutes = require('./routes/devis')

//Requiring user model
const User = require('./models/userModel')

// const cronjob_cmd = schedule.scheduleJob('00 00 12 * * 0-6', function(){
//     let currentDate = new Date();
// mongodb+srv://steph:Transnet_1999@cluster0.pyyyq.mongodb.net/?retryWrites=true&w=majority
// })

dotenv.config({path: './config.env'})

mongoose.connect('mongodb+srv://DrThug:Test_1234@cluster0.9qxlxwc.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true
}).then(con =>{
    // console.log(con);
    console.log('Database connected successfully!')
})

//set up cors
app.use(cors())
// app.use(secure);
//middleware for session
app.use(session({
    secret : 'Just a simple login/sign up application',
    resave : true,
    saveUninitialized : true
}))

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy({
    usernameField: 'email', 
    passwordField: 'password',
    passReqToCallback : true },
    function(req, email, password, done) {
        User.findOne({$or: [
                {email: email},
                {username: email}
            ]}, function(err, user) {
            if (!user){
                return done(null, false,{message: 'Incorrect email' });
            } 

            if (!user.active) {
                return done(null, false, {message: 'User is inactive'});
            }
            user.authenticate(password, function(err,users,passwordError){
                if(passwordError){
                  return  done(null,false,{message:"Password is wrong"})
                } else if(users) {
                  return   done(null,users);
                   
                }
            })
        });       
    }
))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//middleware for method override
app.use(methodOverride('_method'))

//middleware for flash messages
app.use(flash())

//Setting middleware globally
app.use((req, res, next)=> {
    res.locals.success_msg = req.flash(('success_msg'))
    res.locals.error_msg = req.flash(('error_msg'))
    res.locals.error = req.flash(('error'))
    res.locals.currentUser = req.user
    next()
})

app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static('public'))

nodeApiDocGenerator(app,'http://localhost',PORT)

app.use(userRoutes)
app.use(langueRoutes)
app.use(formationRoutes)
app.use(categoryRoutes)
app.use(publiciteRoutes)
app.use(domaineRoutes)
app.use(blogRoutes)
app.use(pagefrontRoutes)
app.use(packRoutes)
app.use(contactRoutes)
app.use(commentRoutes)
app.use(candidatureRoutes)
app.use(commandesRoutes)
app.use(docsRoutes)
app.use(ecolesuivieRoute)
app.use(chatRoute)
app.use(dynamicFieldUserRoute)
app.use(devisRoutes)

const server = http.createServer(app);

server.listen(process.env.PORT ? process.env.PORT : 7001, ()=> {
    console.log('Server is started')
})


const io = socketIo(server, {
    cors: {
      origin: "http://localhost:7001",
      methods: ["GET", "POST"]
    }
  });
const socket = new Sockets();
io.on('connection', socket.connection);