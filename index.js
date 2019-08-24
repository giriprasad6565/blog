const express = require('express');
const path = require('path');
const expressEdge = require('express-edge');
const edge = require('edge.js');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Post = require('./database/models/Post');
const fileUpload = require('express-fileupload');
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const connectFlash = require('connect-flash');

const createPostController = require('./controllers/createPost');
const homePageController = require('./controllers/homePage');
const storePostController = require('./controllers/storePost');
const getPostController = require('./controllers/getPost');
const createUserController = require('./controllers/createUser');
const storeUserController = require('./controllers/storeUser');
const loginController = require('./controllers/login');
const loginUserController = require('./controllers/loginUser');
const logoutController = require('./controllers/logout');
const updatePostController = require('./controllers/getUpdate');
const updateStorePostController = require('./controllers/updateStorepost');

const app = express();

app.use(expressSession({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(connectFlash());

mongoose.connect('mongodb://localhost:27017/blog', {useNewUrlParser: true})
    .then(() => 'You are now connected to MongoDB')
    .catch(err => console.error('Something went wrong', err))

const mongoStore = connectMongo(expressSession);  

app.use(expressSession({
    secret: 'secret',
    store: new mongoStore({
        mongooseConnection: mongoose.connection
    })
}));

app.use(fileUpload());
app.use(expressEdge);
app.use(express.static('public'));
app.set('views', __dirname + '/views');

app.use('*', (req, res, next) => {
    edge.global('auth', req.session.userId)
    next()
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const storePost = require('./middleware/storePost');
const auth = require('./middleware/auth');
const redirectIfAuthenticated = require('./middleware/redirectIfAuthenticated');

app.use('/posts/store', storePost);
// app.use('/posts/store/update', updateStore);

app.get('/', homePageController);
app.get('/post/:id', getPostController);
app.get('/posts/new',auth, createPostController);
app.post("/posts/store", storePostController);
app.get('/auth/login', redirectIfAuthenticated, loginController);
app.post('/users/login', redirectIfAuthenticated, loginUserController);
app.get("/auth/register", redirectIfAuthenticated, createUserController);
app.post("/users/register", redirectIfAuthenticated, storeUserController);
app.get("/update/:id", updatePostController);
app.post("/posts/store/update", updateStorePostController);
// app.get("/auth/logout", redirectIfAuthenticated, logoutController);

app.get('/auth/logout', function(req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function(err) {
        if(err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });

 app.get("/delete/:id", async (req,res) => {
     try {
         const post = await Post.findByIdAndDelete({_id: req.params.id})
         res.redirect('/')
     } catch (error) {
         res.status(500).send();
     }
 })

 app.get("/update/:id", async (req,res) => {

 });
    

app.use('/css',  express.static(__dirname + '/css/style.css'));

app.listen(3000, (req, res) =>{
    console.log('Listening on Port 3000');
});

