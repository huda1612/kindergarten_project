// 1. Import required packages
import express from 'express'
import cors from 'cors'
import {authentication} from './database.js'
import session from 'express-session' 




const app = express();
app.set('view engine' , 'ejs') ;

// 3. Middleware setup
app.use(cors()); // Allow Cross-Origin requests
app.use(express.json()); // Parse incoming JSON bodies
app.use(express.urlencoded({ extended : true }))
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// 5. Routes
app.get('/', (req, res) => {
  res.render('home'); 
})

app.get('/login', (req, res) => {
  res.render('login' , { session : req.session });
});

app.post('/login', async (req , res) => {
   const { username, password } = req.body ;

   const user = await authentication(username , password); 

   if(user === false ){
    req.session.loginError = '! اسم المستخدم أو كلمة المرور غير صحيحة';
    res.redirect('/login');
   }

   else {
    //save the user in the session 
    req.session.user = {
      id: user.id,
      username: user.username,
      type: user.user_type
    };
    if(user.user_type == 'student')
      res.redirect('/hellostudent') ; 
    else 
      res.redirect('/helloteacher') ; 
   }
})




app.get('/hellostudent' , (req,res ) => {
  res.send(`hello student ${req.session.user.username} `)
})

app.get('/helloteacher' , (req,res ) => {
  res.send(`hello teacher ${req.session.user.username} `)
})


app.use((req,res) => {

  res.send("opps 404 !! ") ; 
})


// 6. Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});








/*
// Get all users
app.get('/users', (req, res) => {
  res.json(users);
});

// Get a single user by ID
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Add a new user
app.post('/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name
  };
  users.push(newUser);
  res.status(201).json(newUser);
});
*/