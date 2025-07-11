// 1. Import required packages
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import {authentication , getTheId , getTodayActivityListByClass , insertTodayDailyActivity , register} from './database.js'
import {getTeacherFullName , getTeacherNameWithNikname, getStudentCountForTeacher , getTodayAbsenceCount , getTodayActivityCount , getStudentsByTeacher , getActivityNames } from './teacherDatabase.js'
import {getStudentFullName , getStudentNameWithNikname ,getClassNameByStudentId, getAbsenceCountByStudentId, insertNote , getTodayNoteByStudentId , insertAbsence , getTeacherNameByStudentId } from './studentDatabase.js'
import {getAllTeachersData , insertTeacher} from './adminDatabase.js'
import {getClassIdFromSession} from './serverFunctions.js'
import session from 'express-session' 

// للحصول على المسار الكامل للملف الحالي
const __filename = fileURLToPath(import.meta.url);
// للحصول على مسار المجلد الحالي
const __dirname = path.dirname(__filename);



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
app.use(express.static(path.join(__dirname, 'public')));


//********************************************************************************************************************************************************************
//********************************************************************************************************************************************************************
// 5.**************************************************************** ROUTES SECTION *********************************************************************************
//home page
app.get('/', (req, res) => {
  res.render('home'); 
})


//**************************************************************** LOGIN AND REGISTER **************************************************************************

//login page get
app.get('/login', (req, res) => {
  res.render('login' , { session : req.session });
});

//login page post 
app.post('/login', async (req , res) => {
   const { username, password } = req.body ;

   const user = await authentication(username , password); 
   
   //if the login is failed 
   if(user === false ){
    req.session.user = null; //للتنظيف من اي جلسة قديمة 
    req.session.loginError = '! اسم المستخدم أو كلمة المرور غير صحيحة';
    res.redirect('/login');
   }

   //if the login is success 
   else {
    
    //if the user is the admin 
    if(user.role === 'admin')
    {
       req.session.user = {
        username: user.username,
        role: user.role 
       }
      console.log(req.session.user);
      res.redirect('/admin') ;
    }

    //if the user is not the admin 
    else
    {

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
  }
})

//register pasge get
app.get('/register', async (req , res) => {
   res.render('register', { session: req.session });
})

//register pasge post 
app.post('/register', async (req , res) => {
  const {id , firstName , lastName , username, password1 , password2  , role } = req.body ;
  const registerResult = await register(id , firstName , lastName , username, password1 , password2  , role) ;
  if(registerResult.success)
    res.render('successRegister')  
  else {
    req.session.user = null; //للتنظيف من اي جلسة قديمة 
    req.session.registerError = registerResult.message ;
    res.redirect('/register');}
})

//**************************************************************** LOGIN AND REGISTER END ************************************************************************

//**************************************************************** GET ADMIN AND TEACHER AND STUDENT  ********************************************************

//get the admin page
app.get('/admin' , async (req,res ) => {
  if (!req.session.user || req.session.user.role != 'admin' ) { 
    return res.redirect('/login');
  }
   
  res.render( 'admin' ) ; 

})


//get the student page
app.get('/student' , async (req,res ) => {
  if (!req.session.user ) { //حتى ما يعطي خطأ لان مافي معلومات بالجلسه وما يكون فينه يدخل عهالصفحه بلا ما يسجل
    return res.redirect('/login');
  }
  try{
  const student_id = req.session.user.student_id ;
  const full_name = await getStudentFullName(student_id) ; 
  const name_With_Nikname = await getStudentNameWithNikname(student_id) ;
  const class_Name =await getClassNameByStudentId(student_id);
  const teacher_Name = await getTeacherNameByStudentId(student_id);
  const absenceCount = await getAbsenceCountByStudentId(student_id);
  const today_Note = await getTodayNoteByStudentId(student_id);
  res.render( 'student' , {full_name, name_With_Nikname , class_Name ,teacher_Name , absenceCount, today_Note})
 }catch (error) {
  console.error(error);
  res.status(500).send('حدث خطأ في السيرفر');
}
})

//get the teacher page
app.get('/teacher' , async (req,res ) => {
  if (!req.session.user || !req.session.user.teacher_id ) { //حتى ما يعطي خطأ لان مافي معلومات بالجلسه وما يكون فينه يدخل عهالصفحه بلا ما يسجل
    return res.redirect('/login');
  }
 try{
  const teacher_id = req.session.user.teacher_id ; 
  const full_name = await getTeacherFullName(teacher_id) ; 
  const name_With_Nikname = await getTeacherNameWithNikname(teacher_id)
  const student_count = await getStudentCountForTeacher(teacher_id) ; 
  const absence_count = await getTodayAbsenceCount(teacher_id) ;
  const attendance_count = student_count - absence_count ;
  const activity_count = await getTodayActivityCount(teacher_id) ; 
  const activity_names = await getActivityNames() ;
  res.render( 'teacher' , { full_name ,name_With_Nikname, student_count , absence_count , attendance_count , activity_count , activity_names })
  }catch(err){
    console.error('Error loading /teacher page:', err);
    res.status(500).send('حدث خطأ في السيرفر');
  }
})

//**************************************************************** GET ADMIN AND TEACHER AND STUDENT END ********************************************************


app.get('/dailyReport' , (req,res ) => {
   if (!req.session.user || !req.session.user.teacher_id )  //حتى ما يعطي خطأ لان مافي معلومات بالجلسه وما يكون فينه يدخل عهالصفحه بلا ما يسجل
     return res.redirect('/login');
  try{
     res.render('dailyReport') ;
  }catch(err){
    console.error("Error rendering daily report:", err);
  }
})

app.post('/dailyReport' , async (req,res ) => {
  try{
    const reportData = req.body; 
    const date = new Date().toISOString().split('T')[0];
    for (const entry of reportData){
      const {student_id , attendance , note } = entry ; 
      
      //اذا الطالب غايب 
      if(attendance === false)
        await insertAbsence(student_id , date) ;
      //اذا في ملاحظة
      if(note && note.trim()!='')
        await insertNote(student_id , note.trim() , date) ;      
    }
  res.status(200).json({ success: true, message: "تم حفظ التقرير بنجاح" });
  }catch(err){
  console.error("Error processing daily report:", err);
  res.status(500).json({ success: false, message: "حدث خطأ أثناء حفظ التقرير" });
  }

})

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send("حدث خطأ أثناء تسجيل الخروج");
        }
        res.redirect('/'); // يرجع للصفحة الرئيسية
    });
});

//**************************************************************** Routes End ***************************************************************************************
//********************************************************************************************************************************************************************
//********************************************************************************************************************************************************************
//******************************************************************API SECTION***************************************************************************************

//هي  ليحصل الفرونت على قائمة باسماء الطلاب بصف المعلم 
app.get('/api/getStudentsNames' , async (req, res ) => {
  if (!req.session.user || !req.session.user.teacher_id) {
  return res.status(401).json({ error: 'Unauthorized' });
  }
  try{
  const teacher_id = req.session.user.teacher_id ; 
  const studentsNamesObject = await getStudentsByTeacher(teacher_id);

  res.json(studentsNamesObject);
  }catch(err){
    console.error('Error loading /api/getStudentsNames :', err);
    res.status(500).send('حدث خطأ في قاعدة البيانات');
  }
})

//هي لارسال اسماء الانشطة كلها مشان يختار منها المعلم 
app.get('/api/getActivityNames' , async (req, res) => {
   if (!req.session.user ) {
  return res.status(401).json({ error: 'Unauthorized' });
  }
  try{
  const activityNames = await getActivityNames();

  res.json(activityNames);
  }catch(err){
    console.error('Error loading /api/getActivityNames :', err);
    res.status(500).send('حدث خطأ في قاعدة البيانات');
  }
})

//هي  ليحصل الفرونت على قائمة بالانشطة اليوم بالصف سواء للمعلم او للطالب  
app.get('/api/getTodayActivityList' , async (req, res ) => {
  if (!req.session.user ) {
  return res.status(401).json({ error: 'Unauthorized' });
  }
 
 try{
  //اول شي بجيب رقم الصف للمستخدم 
 const classId = await getClassIdFromSession(req.session.user);
 if (!classId) 
      return res.status(404).json({ error: ' لا يوجد صف مرتبط بهذا المستخدم او لا يوجد رقم لهذا المستخدم' });
    
 
const TodayActivity = await getTodayActivityListByClass(classId) ;
//صار معي مصفوفة اغراض بتعبر عن الانشطه وكل نشاط فيه اسم ووصف وايقونه وتاريخ اليوم
//[{name: ... , description : ... , icon : ... } , .....]
 res.json(TodayActivity) ;

 }catch(err){
  console.error('Error loading /api/getTodayActivityList :', err);
  res.status(500).send('حدث خطأ في قاعدة البيانات');
 }

})

//هي مشان وقت بده المعلم يضيف نشاط جديد 
app.post('/api/insertTodayDailyActivity' , async (req, res ) => {

if (!req.session.user || req.session.user.role != "teacher") 
  return res.status(401).json({ error: 'Unauthorized' });

try{
//اول شي بجيب رقم الصف للمستخدم 
const classId = await getClassIdFromSession(req.session.user);
if (!classId) 
      return res.status(404).json({ error: ' لا يوجد صف مرتبط بهذا المستخدم او لا يوجد رقم لهذا المستخدم' });
  
const { activityName } = req.body;  //بدي من الفرونت يبعتولي بس اسم النشاط اللي بده المعلم يضيفه

await insertTodayDailyActivity(activityName , classId) ; 
 res.json({ success: true });

}catch(err){
  console.error('Error loading /api/insertTodayDailyActivity :', err);
  res.status(400).json({ error: err.message || 'حدث خطأ في قاعدة البيانات' });}
})
//****************************************************************ِAPI FOR ADMIN PAGE****************************************************************************************************
//لرد جميع بيانات المعلمين 
//برد مصفوفة هيك شكل عناصرها {id :... , first_name :... , last_name :...  , class_name: .... , phone:.... } وكل عنصر بمثل معلم وممكن يكون في معلم اسم صفه null لازم نعالج هالحاله
app.get('/api/getTeachersData' , async (req, res) => {
   if (!req.session.user ) {
  return res.status(401).json({ error: 'Unauthorized' });
  }
  try{
  const teachersData = await getAllTeachersData();

  res.json(teachersData);
  }catch(err){
    console.error('Error loading /api/getTeachersData :', err);
    res.status(500).send('حدث خطأ في قاعدة البيانات');
  }
})

//لاضافة معلم جديد الى قاعدة البيانات 
app.post('/api/insertTeacher' , async (req, res ) => {

if (!req.session.user || req.session.user.role != "teacher") 
  return res.status(401).json({ error: 'Unauthorized' });

try{
   const { first_name , last_name , phone } = req.body; //بدي من الفرونت هالبيانات بس ورقم الهاتف ممكن لا
   await insertTeacher(first_name , last_name , phone) ;
   res.json({ success: true });

}catch{
  console.error('Error loading /api/insertTeacher :', err);
  res.status(400).json({ error: err.message || 'حدث خطأ في قاعدة البيانات' });}
}
)

//****************************************************************ِAPI FOR ADMIN PAGE END****************************************************************************************************


//****************************************************************API SECTION END*************************************************************************************
//********************************************************************************************************************************************************************
//********************************************************************************************************************************************************************
//********************************************************************************************************************************************************************

//404 page 
app.use((req,res) => {

  res.send("opps 404 !! ") ; 
})

// 6. Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});