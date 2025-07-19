// 1. Import required packages
import express from 'express'
import cors from 'cors'
import path from 'path'
import multer from 'multer'
import fs from "fs/promises"; 
import iconv from'iconv-lite';//لتزبيط اسم الملف العربي لما بينرفع



import { fileURLToPath } from 'url'
import {authentication , getTheId , getTeacherRole , getTodayActivityListByClass , insertTodayDailyActivity , register , deleteDailyActivity , getFlieListByClass , deleteFile} from './database.js'
import {getTeacherFullName , getTeacherNameWithNikname, getStudentCountForTeacher , getTodayAbsenceCount , getTodayActivityCount , getStudentsByTeacher , getActivityNames, saveClassFile } from './teacherDatabase.js'
import {getStudentFullName , getStudentNameWithNikname ,getClassNameByStudentId, getAbsenceCountByStudentId, insertNote , getTodayNoteByStudentId , insertAbsence , getTeacherNameByStudentId } from './studentDatabase.js'
import {getAllMainTeachersData , insertTeacher , updateClassTeacher , deleteTeacherById , updateTeacherById ,getAllEngTeachersData, getEnglishTeachersWithClasses ,    getGradeLevels , getAllClassesData , updateClassNameById , updateClassTeacherById  , deleteClassById , insertClass} from './adminDatabase.js'
import {getEnglishTeacherClasses , getStudentCountForClass ,getTodayAbsenceCountByClassId , getStudentsByClassId , getTodayEnglishActivityCount , getEnglishActivityNames} from './englishTeacherDatabase.js'
import {weekActivityCount , allTeachersCount , allStudentsCount , allClassesCount , getMonthAttendanceRate , getAllActivities , getGradeLevelsWithClassCount} from './aboutDatabase.js'
import {getClassIdFromSession} from './serverFunctions.js' 
import session from 'express-session' 

// للحصول على المسار الكامل للملف الحالي
const __filename = fileURLToPath(import.meta.url);
// للحصول على مسار المجلد الحالي
const __dirname = path.dirname(__filename);

// تحديد مكان الحفظ للملفات المرفوعه واسم الملف
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // مجلد للتخزين
  },
 filename: function (req, file, cb) {
    // نعيد ترميز الاسم من latin1 إلى utf8 (أغلب الحالات)
    const buffer = Buffer.from(file.originalname, 'binary');  // أو 'latin1'
    const decodedName = iconv.decode(buffer, 'utf8');
    const uniqueName = Date.now() + '-' + decodedName;

    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

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
app.use('/uploads', express.static('uploads'));//لتحميل الملفات 


//********************************************************************************************************************************************************************
//********************************************************************************************************************************************************************
// 5.**************************************************************** ROUTES SECTION *********************************************************************************
//home page
app.get('/', (req, res) => {
  console.log(new Date().toISOString().split('T')[0])
  res.render('home'); 
})

app.get('/about-kindergarten' ,async(req , res) =>{
  try{
  const weekActivity = await weekActivityCount();
  const teachersCount = await allTeachersCount();
  const studentsCount = await allStudentsCount();  
  const classesCount = await allClassesCount(); 
  const monthAttendanceRate = await getMonthAttendanceRate(); 
  const AllActivities = await getAllActivities();
  const gradeLevels = await getGradeLevelsWithClassCount();
  res.render('aboutKindergarten' , {weekActivity , teachersCount , studentsCount , classesCount , monthAttendanceRate , AllActivities , gradeLevels})

  }catch (error) {
  console.error(error);
  res.status(500).send('حدث خطأ في السيرفر');
}
});

app.get('/kindergarten-environment' ,async(req , res) =>{
  try{
  const mainTeachers = await getAllMainTeachersData();
  const englishTeachers = await getAllEngTeachersData();
  
  res.render('kindergartenEnvironment' , {mainTeachers , englishTeachers})

  }catch (error) {
  console.error(error);
  res.status(500).send('حدث خطأ في السيرفر');
}
});




//**************************************************************** LOGIN AND REGISTER **************************************************************************

//login page get
app.get('/login', (req, res) => {
  //لمسح نجاح انشاء الحساب بعد الذهاب لصفحة تسجيل الدخول 
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
    else 
    {
      //اذا معلم اساسي بحوله على صفحة المعلم
      const teacherRole =await getTeacherRole(userRealId) ; 
      if(teacherRole === 'main')
      {
      req.session.user.teacherRole = 'main'
      console.log(req.session.user);
      res.redirect('/teacher') ;
      }
      else if(teacherRole === 'english')
      {
      req.session.user.teacherRole = 'english'
      console.log(req.session.user);
      res.redirect('/classChoose') ;
      }
    }
    }
}})

//register pasge get
app.get('/register', async (req , res) => {
  req.session.user = null ; 
  console.log(req.session.registerSuccess)
   res.render('register', { session: req.session });
})

//register pasge post 
app.post('/register', async (req , res) => {
  const {id , firstName , lastName , username, password1 , password2  , role } = req.body ;
  const registerResult = await register(id , firstName , lastName , username, password1 , password2  , role) ;
  if(registerResult.success){
    req.session.registerSuccess = true ; 
    res.redirect('/register')}  
  else {
    req.session.user = null; //للتنظيف من اي جلسة قديمة 
    req.session.registerError = registerResult.message ;
    req.session.registerSuccess = false ; 
    res.redirect('/register');}
})

//**************************************************************** LOGIN AND REGISTER END ************************************************************************

//**************************************************************** GET ADMIN AND TEACHER AND STUDENT  ********************************************************

//get the admin page
app.get('/admin' , async (req,res ) => {
  if (!req.session.user || req.session.user.role != 'admin' ) { 
    return res.redirect('/login');
  }
  try {
  const teachers = await getAllMainTeachersData();
  const engTeachers = await getAllEngTeachersData();
  const engTeachersClasses = await getEnglishTeachersWithClasses();
  const gradeLevels = await getGradeLevels();
  const allClassesData = await getAllClassesData() ;
  const updateClassNameError = req.session.updateClassNameError || null ;  
  req.session.updateClassNameError =null ;
  res.render( 'admin' ,{teachers ,engTeachers,engTeachersClasses, gradeLevels , allClassesData , session: req.session ,  updateClassNameError  } ) ; 
  }catch (error) {
  console.error(error);
  res.status(500).send('حدث خطأ في السيرفر');
  }
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
app.get('/teacher', async (req, res) => {
  if (!req.session.user || !req.session.user.teacher_id) { //حتى ما يعطي خطأ لان مافي معلومات بالجلسه وما يكون فينه يدخل عهالصفحه بلا ما يسجل
    return res.redirect('/login');
  }
  try {
    const teacher_id = req.session.user.teacher_id;
    const full_name = await getTeacherFullName(teacher_id);
    const name_With_Nikname = await getTeacherNameWithNikname(teacher_id,'main')
    const student_count = await getStudentCountForTeacher(teacher_id);
    const absence_count = await getTodayAbsenceCount(teacher_id);
    const attendance_count = student_count - absence_count;
    const students = await getStudentsByTeacher(teacher_id);
    const activity_count = await getTodayActivityCount(teacher_id);
    const activity_names = await getActivityNames();
    const classId = await getClassIdFromSession(req.session.user);
    res.render('teacher', { classId , full_name, name_With_Nikname, student_count, absence_count, attendance_count, activity_count, students, activities: activity_names })
  } catch (err) {
    console.error('Error loading /teacher page:', err);
    res.status(500).send('حدث خطأ في السيرفر');
  }
})




app.get('/classChoose' ,  async (req,res ) => {
  if (!req.session.user || !req.session.user.teacher_id || req.session.user.teacherRole !='english' ) { //حتى ما يعطي خطأ لان مافي معلومات بالجلسه وما يكون فينه يدخل عهالصفحه بلا ما يسجل
  return res.redirect('/login');
  }
  try {
  const teacher_id = req.session.user.teacher_id;
  const name_With_Nikname = await getTeacherNameWithNikname(teacher_id , 'english')
  const classes = await getEnglishTeacherClasses(teacher_id) ;
  res.render('classChoose' ,{name_With_Nikname , classes}) ;

  }catch (error) {
  console.error(error);
  res.status(500).send('حدث خطأ في السيرفر');
  } 
} )




app.get('/englishTeacherClass/:classId' ,  async (req,res ) => {
   if (!req.session.user || !req.session.user.teacher_id)  //حتى ما يعطي خطأ لان مافي معلومات بالجلسه وما يكون فينه يدخل عهالصفحه بلا ما يسجل
    return res.redirect('/login');
  
  try{
    const classId = req.params.classId ;
    const teacher_id = req.session.user.teacher_id;
    const name_With_Nikname = await getTeacherNameWithNikname(teacher_id,'english')

    const student_count = await getStudentCountForClass(classId);
    const absence_count = await getTodayAbsenceCountByClassId(classId);
    const attendance_count = student_count - absence_count;
    const students = await getStudentsByClassId(classId);

    const activity_count = await getTodayEnglishActivityCount(classId); 
    const activity_names = await getEnglishActivityNames(); //بده تعديل 
    res.render('englishTeacher',{ classId, name_With_Nikname, student_count, absence_count, attendance_count , activity_count, students,activities: activity_names })
  }catch (err) {
    console.error('Error loading /englishTeacherClass/:classId page:', err);
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
//يمكن بدها حذف هي 
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



//هي  ليحصل الفرونت على قائمة بالانشطة اليوم بالصف سواء للمربية او للطالب  
//مسار للمربية والطالب فقط
app.get('/api/getTodayActivityList' , async (req, res ) => {
  if (!req.session.user || req.session.user.teacherRole ==='english') {
  return res.status(401).json({ error: 'Unauthorized' });
  }
 try{
  //اول شي بجيب رقم الصف للمستخدم 
  const  classId = await getClassIdFromSession(req.session.user);
  if (!classId) 
    return res.status(404).json({ error: ' لا يوجد صف مرتبط بهذا المستخدم او لا يوجد رقم لهذا المستخدم' });
 
const TodayActivity = await getTodayActivityListByClass(classId ) ;

//صار معي مصفوفة اغراض بتعبر عن الانشطه وكل نشاط فيه اسم ووصف وايقونه وتاريخ اليوم
//[{name: ... , description : ... , icon : ... } , .....]
    res.json({
    dailyActivities :TodayActivity,
    role: req.session.user.role , 
    });
 }catch(err){
  console.error('Error loading /api/getTodayActivityList :', err);
  res.status(500).send('حدث خطأ في قاعدة البيانات');
 }
})



//لجلب انشطة اليوم لمعلم الانجليزي فقط
app.post('/api/getTodayEnglishActivityList' , async (req, res ) => {
if (!req.session.user || req.session.user.role ==='student' || req.session.user.teacherRole ==='main') {
  return res.status(401).json({ error: 'Unauthorized' });
  }
try{
   const { classId }= req.body ;
   console.log(classId);
   const TodayActivity = await getTodayActivityListByClass(classId ) ;
   res.json({
    dailyActivities :TodayActivity,
    });
}catch(err){
  console.error('Error loading /api/getTodayActivityList :', err);
  res.status(500).send('حدث خطأ في قاعدة البيانات');
 }
})



//هي مشان وقت بده المربية تضيف نشاط جديد 
app.post('/api/insertTodayDailyActivity', async (req, res) => {
  if (!req.session.user || req.session.user.role !== "teacher" || req.session.user.teacherRole !="main" )
    return res.status(401).json({ success: false, message: 'غير مصرح' })   

try{
//اول شي بجيب رقم الصف للمستخدم 
const classId = await getClassIdFromSession(req.session.user); 
if (!classId) 
      return res.status(404).json({ error: ' لا يوجد صف مرتبط بهذا المستخدم او لا يوجد رقم لهذا المستخدم' });
  
const {activityName, description} = req.body;  //بدي من الفرونت يبعتولي بس اسم النشاط اللي بده المعلم يضيفه

    if (!activityName || !description)
      return res.status(400).json({ success: false, message: 'البيانات ناقصة' });

    await insertTodayDailyActivity(activityName, classId, description);

    res.json({ success: true });
  } catch (err) {
    console.error('Error in /teacher/addActivity:', err);
    res.status(500).json({ success: false, message: `${err.message}` });
  }
});


//هي اضافه نشاط جديد لصف معلم انجليزي نشاط جديد 
app.post('/api/insertTodayEnglishDailyActivity', async (req, res) => {
  if (!req.session.user || req.session.user.role !== "teacher" || req.session.user.teacherRole !== "english")
    return res.status(401).json({ success: false, message: 'غير مصرح' })   

try{
  
const {activityName, description ,classId} = req.body; 

    if (!activityName || !description || !classId)
      return res.status(400).json({ success: false, message: 'البيانات ناقصة' });
    //بدي جيب رقم الصف من الفرونت 
    await insertTodayDailyActivity(activityName, classId, description);

    res.json({ success: true });
  } catch (err) {
    console.error('Error in /teacher/addActivity:', err);
    res.status(500).json({ success: false, message: `${err.message}` });
  }
});

app.post('/api/deleteDailyActivity', async (req, res) => {
  console.log("start delete");

  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const classId = await getClassIdFromSession(req.session.user);
    console.log("عم يشوف ال id");

    if (!classId) {
      return res.status(404).json({ error: 'لا يوجد صف مرتبط بهذا المستخدم' });
    }

    const { activityName } = req.body;

    if (!activityName) {
      return res.status(400).json({ error: 'اسم النشاط غير موجود في الطلب' });
    }

    await deleteDailyActivity(classId, activityName);
    console.log("تم حذف النشاط:", activityName);

    res.json({ success: true });

  } catch (err) {
    console.error("Error deleting activity:", err);
    res.status(500).json({ error: 'فشل في حذف النشاط' });
  }
});

//حذف النشاط من استاذ الانجليزي
app.post('/api/deleteDailyEnglishActivity', async (req, res) => {

  if (!req.session.user || req.session.user.role !='teacher' ||  req.session.user.teacherRole !='english' ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {

    const { activityName , classId } = req.body;

    if (!activityName) {
      return res.status(400).json({ error: 'اسم النشاط غير موجود في الطلب' });
    }

    await deleteDailyActivity(classId, activityName);
    console.log("تم حذف النشاط:", activityName);

    res.json({ success: true });

  } catch (err) {
    console.error("Error deleting activity:", err);
    res.status(500).json({ error: 'فشل في حذف النشاط' });
  }
});


//لجلب الملفات بيوم محدد
app.post('/api/getFileList' , async(req , res) =>{
  if (!req.session.user ) {
  return res.status(401).json({ error: 'Unauthorized' });
  }
 try{
  //اول شي بجيب رقم الصف للمستخدم 
const {classId , date} =req.body ;
 
const flies = await getFlieListByClass(classId , date ) ;

    res.json({
    flies :flies,
    role: req.session.user.role , 
    });
 }catch(err){
  console.error('Error loading /api/getFileList :', err);
  res.status(500).send('حدث خطأ في قاعدة البيانات');
 }
})


app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.path)
      return res.json({ success: false, message: "يجب اختيار ملف أولاً" });
    const { class_id , daily_activity_id  , description , type , date } = req.body;
    if(!req.file.path)
      return res.json({success : false , message : "يجب اختيار ملف اولاً"});
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    //رح استخرج اسم الملف من المسار لان عم يتخزن بالداتا كرموز كان
    const baseName = path.basename(filePath); 
    const cleanName = baseName.substring(baseName.indexOf('-') + 1);

    await saveClassFile(
      class_id,
      daily_activity_id ==='null' ? null : daily_activity_id , 
      description , 
      type ,
      date,
      cleanName ,
      filePath
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في قواعد البيانات" });
  }
});


app.post('/api/deleteFile', async (req, res) => {
  console.log("start delete");

  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    
    const { fileId , classId , filePath} = req.body;

    const result = await deleteFile( fileId , classId );
    //لحذف الملف من السيرفر لو انحذف من الداتا
    if(result.success){
      //اول شي منجيب المسار الحقيقي للملف بالمجلد
      const uploadsDir = path.join(process.cwd(), "uploads"); // مسار مجلد uploads كامل
      const fileRealPath = path.join(uploadsDir, path.basename(filePath)); // خذ اسم الملف فقط وأبني المسار
      if (!fileRealPath.startsWith(uploadsDir)) 
          return res.status(400).json({ success: false, message: "مسار غير آمن" });

      console.log("Deleting file at path:", fileRealPath);
      //منحذف الملف من المجلد
      await fs.unlink(fileRealPath);
      
    }


    res.json({ success: true });

  } catch (err) {
    console.error("Error deleting activity:", err);
    res.status(500).json({ error: 'فشل في حذف الملف' });
  }
});


//****************************************************************ِAPI FOR ADMIN PAGE****************************************************************************************************

app.post('/admin/updateClassTeacher' , async (req, res ) => {
  if (!req.session.user || req.session.user.role != "admin") 
   return res.status(401).json({ error: 'Unauthorized' });
  try{
  const {oldTeacherId , newTeacherId } = req.body ; 
  await updateClassTeacher(oldTeacherId , newTeacherId) ;
  res.redirect('/admin') ;

  }catch(err){
  console.error('Error loading /admin/updateClassTeacher :', err);
  res.status(400).json({ error: err.message || 'حدث خطأ في قاعدة البيانات' });
  }
})

app.post('/admin/deleteTeacher' , async (req, res ) => {
 if (!req.session.user || req.session.user.role != "admin") 
  return res.status(401).json({ error: 'Unauthorized' });
 try{
  const {teacherId} = req.body ; 
  const result = await deleteTeacherById(teacherId) ;
  if(!result.success){
    req.session.deleteTeacherError = null ;
    req.session.deleteTeacherError = result.Message ;
     req.session.deleteErrorTeacherId = teacherId ;
    return res.redirect('/admin');
  }
  else  
    res.redirect('/admin') ;
 }catch(err){
    req.session.deleteTeacherError = 'حدث خطأ أثناء حذف المعلم';
    res.redirect('/admin');
 }
})


//لتحديد المعلم اللي بدنا نعدل على بياناته مشان يفتحله حقول للتعديل 
app.post('/admin/editTeacher', (req, res) => {
  const { editTeacherId } = req.body;
  req.session.editTeacherId = parseInt(editTeacherId); // نحدد من هو المعلم الذي نعدّله
  res.redirect('/admin');
});


//لتعديل بيانات معلم 
app.post('/admin/updateTeacher', async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin") 
    return res.status(401).json({ error: 'Unauthorized' });
  try{
  const {teacherId , first_name , last_name , phone , certificate , description } = req.body ;
  const result = await updateTeacherById(teacherId ,first_name , last_name , phone , certificate , description ) ;
  if(result.success){
   req.session.editTeacherId = null ;
   req.session.updateTeacherError = null ;
   res.redirect('/admin');}
  else 
  {
  req.session.updateTeacherError = null ;
    req.session.updateTeacherError = result.message ;

    return res.redirect('/admin');
  }
  }catch(err){
    console.error('Error loading /admin/updateTeacher :', err);
    res.status(400).json({ error: err.message || 'حدث خطأ في قاعدة البيانات' });
  }
}) ;


app.post('/admin/cencelUpdateTeacher', async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin") 
    return res.status(401).json({ error: 'Unauthorized' });
  
  req.session.editTeacherId = null ;
  res.redirect('/admin');
 
})


//لاضافة معلم جديد الى قاعدة البيانات 
app.post('/admin/insertTeacher' , async (req, res ) => {

if (!req.session.user || req.session.user.role != "admin") 
  return res.status(401).json({ error: 'Unauthorized' });

try{
   const { first_name , last_name , phone , role ,  certificate , description } = req.body; 
   const result = await insertTeacher(first_name , last_name , phone , role ,  certificate , description) ;
   
   if(!result.success){
    req.session.insertTeacherError = null ;
    req.session.insertTeacherError = result.message ;
    return res.redirect('/admin')
  }
   else{
     req.session.insertTeacherError = null ;
     return res.redirect('/admin')
   }

}catch(err){
  console.error('Error loading /admin/insertTeacher :', err);
  res.status(400).json({ error: err.message || 'حدث خطأ في قاعدة البيانات' });}
}
)


//للتعديل على اسم الصف 

/*
app.post('/admin/editClassName', (req, res) => {
  const { editClassNameId } = req.body;
  req.session.editClassNameId = parseInt(editClassNameId); // نحدد من هو الصف الذي نعدّله
  res.redirect('/admin');
});

app.post('/admin/cencelUpdateClassName', async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin") 
    return res.status(401).json({ error: 'Unauthorized' });
  
  req.session.editClassNameId = null ;
  res.redirect('/admin');
 
})
*/

app.post('/admin/updateClassName', async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin") 
    return res.status(401).json({ error: 'Unauthorized' });
  try{
  const {classId  , class_name , oldTeacherId , newTeacherId} = req.body ;
  const result = await updateClassNameById(classId  , class_name , oldTeacherId , newTeacherId) ;
  if(result.success){
  // req.session.editClassNameId = null ;
   req.session.updateClassNameError = null ;
   res.redirect('/admin');}
  else 
  {
    req.session.updateClassNameError = null ;
    req.session.updateClassNameError = result.message ;
    return res.redirect('/admin');
  }
  }catch(err){
    console.error('Error loading /admin/updateClassName :', err);
    res.status(400).json({ error: err.message || 'حدث خطأ في قاعدة البيانات' });
  }
})



//للتعديل على معلم الصف
/*
app.post('/admin/editClassTeacher', (req, res) => {
  const { editClassTeacherId } = req.body;
  req.session.editClassTeacherId = parseInt(editClassTeacherId); // نحدد من هو الصف الذي نعدّله
  res.redirect('/admin');
});

app.post('/admin/cencelUpdateClassTeacher', async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin") 
    return res.status(401).json({ error: 'Unauthorized' });
  
  req.session.editClassTeacherId = null ;
  res.redirect('/admin');
 
})

*/

app.post('/admin/updateClassTeacherByClassId', async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin") 
    return res.status(401).json({ error: 'Unauthorized' });
  try{
  const {classId  , oldTeacherId , newTeacherId} = req.body ;
  const result = await updateClassTeacherById(classId , oldTeacherId , newTeacherId) ;
 
 if(result.success){
   req.session.editClassTeacherId = null ;
   req.session.updateClassTeacherError = null ;
   res.redirect('/admin');}
  else 
  {
    req.session.updateClassTeacherError = null ;
    req.session.updateClassTeacherError = result.message ;
    return res.redirect('/admin');
  }

  }catch(err){
    console.error('Error loading /admin/updateClassTeacherByClassId :', err);
    res.status(400).json({ error: err.message || 'حدث خطأ في قاعدة البيانات' });
  }
})

app.post('/admin/deleteClass', async (req, res) => {
   if (!req.session.user || req.session.user.role != "admin") 
    return res.status(401).json({ error: 'Unauthorized' });
  try{
  const {classId} = req.body ; 
  const result = await deleteClassById(classId) ;
  if(!result.success){
    req.session.deleteClassError = null ;
    req.session.deleteClassError = result.message ;
    req.session.deleteErrorClassId = req.body.classId; 
    return res.redirect('/admin');
  }
  else 
    res.redirect('/admin') ;

 }catch(err){
    req.session.deleteClassError = 'حدث خطأ أثناء حذف الصف';
    res.redirect('/admin');
 }

})

//لاضافة معلم جديد الى قاعدة البيانات 
app.post('/admin/insertClass' , async (req, res ) => {

if (!req.session.user || req.session.user.role != "admin") 
  return res.status(401).json({ error: 'Unauthorized' });

try{
   const { className , gradeId , TeacherId , engTeacherId } = req.body; 
   //لو ما دخل معلم انجليزي بحطه null
   const englishTeacherId = engTeacherId && engTeacherId.trim() !== "" ? engTeacherId : null;
   const result = await insertClass(className , gradeId , TeacherId , englishTeacherId ) ;

   if(!result.success){
    req.session.insertClassError = null ;
    req.session.insertClassError = result.message ;
    return res.redirect('/admin')
  }
   else{
     req.session.insertClassError = null ;
     return res.redirect('/admin')
   }

}catch(err){
  console.error('Error loading /admin/insertClass :', err);
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