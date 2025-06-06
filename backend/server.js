// 1. Import required packages
import express from 'express'
import cors from 'cors'
import {authentication , getTheId , getStudentCountForTeacher , getTodayAbsenceCount , getTodayActivityCount , getTeacherName , getStudentName} from './database.js'
import session from 'express-session' 




const app = express();
app.set('view engine' , 'ejs') ;

// 3. Middleware setup
app.use(cors()); // Allow Cross-Origin requests
app.use(express.json()); // Parse incoming JSON bodies
app.use(express.urlencoded({ extended : true })) //Parse incoming bodies for the req object from the form 
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
    //save the user id from its table in the session 
    const userRealId = await getTheId(user.id) ; 

    if (userRealId === -1) {
    req.session.loginError = 'حدث خطأ أثناء استرجاع بيانات الحساب.';
    return res.redirect('/login');
    }

    req.session.user = {
      user_id: user.id,
      username: user.username,
      role: user.role ,
      ...(user.role === 'student' ? { student_id: userRealId } : { teacher_id: userRealId })

    };
    
    if(user.role == 'student') {
      console.log(req.session.user);
      res.redirect('/student') ; }
    else {
      console.log(req.session.user);
      res.redirect('/teacher') ; }
   }
})


app.get('/student' , async (req,res ) => {

  const username = req.session.user.username ;
  const student_id = req.session.user.student_id ;
  const first_name = await getStudentName(student_id) ; 
  res.render( 'student' , {first_name }) ; 

})

app.get('/teacher' , async (req,res ) => {

  const username = req.session.user.username ; //لازم اعمل الاسم ما اسم المستخدم 
  const teacher_id = req.session.user.teacher_id ; 
  const first_name = await getTeacherName(teacher_id) ; 
  const student_count = await getStudentCountForTeacher(teacher_id) ; 
  const absence_count = await getTodayAbsenceCount(teacher_id) ;
  const attendance_count = student_count - absence_count ;
  const activity_count = await getTodayActivityCount(teacher_id) ; 
  res.render( 'teacher' , { first_name , student_count , absence_count , attendance_count , activity_count  })

})


app.use((req,res) => {

  res.send("opps 404 !! ") ; 
})


// 6. Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});