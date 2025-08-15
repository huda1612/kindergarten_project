// 1. Import required packages
import express from 'express'
import cors from 'cors'
import path from 'path'
import multer from 'multer'
import fs from "fs/promises"; 
import iconv from'iconv-lite';//لتزبيط اسم الملف العربي لما بينرفع



import { fileURLToPath } from 'url'
import {authentication , getTheId , getTeacherRole , getTodayActivityListByClass,deleteDailyActivity , insertTodayDailyActivity , register , getFlieListByClass ,deleteFile} from './database.js'
import {getTeacherFullName , getTeacherNameWithNikname, getStudentCountForTeacher , getTodayAbsenceCount , getTodayActivityCount , getStudentsByTeacher , getActivityNames, saveClassFile } from './teacherDatabase.js'
import {getStudentFullName , getStudentNameWithNikname ,getClassNameByStudentId, getAbsenceCountByStudentId, insertNote , getTodayNoteByStudentId , insertAbsence , getTeacherNameByStudentId ,  getNotesByStudentIdInDateRange} from './studentDatabase.js'
import {getAllMainTeachersData , insertTeacher , updateClassTeacher , deleteTeacherById , updateTeacherById ,getAllEngTeachersData, getEnglishTeachersWithClasses ,    getGradeLevels , getAllClassesData , updateClassNameById , updateClassTeacherById , updateClassEnglishTeacherById , deleteClassById , insertClass} from './adminDatabase.js'
import { getAllClasses , getMaxGradeLevel, getClassInfo, getStudentsByClass, deleteStudent, addStudent, transferStudentToClass, updateStudent, promoteEntireClass } from './classDatabase.js';
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
  // جلب درجة الصف
  let gradeLevelId = null;
  let gradeLevelName = null;
  try {
    const classId = await getClassIdFromSession(req.session.user);
    const classInfo = classId ? await getClassInfo(classId) : null;
    gradeLevelId = classInfo?.grade_level_id ?? null;
    gradeLevelName = classInfo?.grade_level_name ?? null;
  } catch (e) { console.warn('تعذر جلب درجة الصف:', e); }

  res.render('student', { full_name, name_With_Nikname, class_Name, teacher_Name, absenceCount, today_Note, gradeLevelId, gradeLevelName })
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
    console.log("🚀 الأنشطة المرسلة للواجهة:", activity_names);
    const classId = await getClassIdFromSession(req.session.user);
    let className = null;
    if (classId) {
      const classInfo = await getClassInfo(classId);
      className = classInfo?.class_name || null;
    }
    res.render('teacher', { classId , className, full_name, name_With_Nikname, student_count, absence_count, attendance_count, activity_count, students, activities: activity_names })
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
   const classInfo = await getClassInfo(classId);
   const className = classInfo?.class_name || null;
   res.render('englishTeacher',{ classId, className, name_With_Nikname, student_count, absence_count, attendance_count , activity_count, students,activities: activity_names })
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
app.get('/api/getTodayActivityList', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { date } = req.query; // إضافة استقبال التاريخ من الطلب
    const classId = await getClassIdFromSession(req.session.user);
    if (!classId)
      return res.status(404).json({ error: 'لا يوجد صف مرتبط بهذا المستخدم' });

    // إذا كان هناك تاريخ محدد، استخدمه، وإلا استخدم اليوم الحالي
    const targetDate = date || new Date().toISOString().split('T')[0];
    const role = req.session.user.role || req.session.user.type || "student";

    if (role === 'student') {
      const [mainActivities, englishActivities] = await Promise.all([
        getTodayActivityListByClass(classId, targetDate, 'main'),
        getTodayActivityListByClass(classId, targetDate, 'english'),
      ]);

      return res.json({
        dailyActivitiesMain: mainActivities,
        dailyActivitiesEnglish: englishActivities,
        role,
      });
    }

    const type = req.session.user.teacherRole === 'english' ? 'english' : 'main';
    const TodayActivity = await getTodayActivityListByClass(classId, targetDate, type);

    res.json({
      dailyActivities: TodayActivity,
      role,
    });

  } catch (err) {
    console.error('Error loading /api/getTodayActivityList :', err);
    res.status(500).send('حدث خطأ في قاعدة البيانات');
  }
});

app.get('/api/student/weekly-notes', async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'student' || !req.session.user.student_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const studentId = req.session.user.student_id;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    const fmt = (d) => d.toISOString().split('T')[0];
    const rows = await getNotesByStudentIdInDateRange(studentId, fmt(startDate), fmt(endDate));

    const map = new Map(rows.map(r => [r.date, r.content]));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = fmt(d);
      days.push({ date: key, content: map.get(key) || null });
    }

    res.json({ days });
  } catch (err) {
    console.error('Error /api/student/weekly-notes:', err);
    res.status(500).json({ error: 'حدث خطأ في قاعدة البيانات' });
  }
});

//لجلب انشطة اليوم لمعلم الانجليزي فقط
app.post('/api/getTodayEnglishActivityList' , async (req, res ) => {
  if (!req.session.user || req.session.user.role ==='student' || req.session.user.teacherRole ==='main') {
    return res.status(401).json({ error: 'Unauthorized' });
    }
  try{
     const { classId, date }= req.body ;
     console.log(classId);
     const TodayActivity = await getTodayActivityListByClass(classId, date, 'english') ;
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
  
const {activityName, description , date} = req.body;  //بدي من الفرونت يبعتولي بس اسم النشاط اللي بده المعلم يضيفه

    if (!activityName || !description  || !date)
      return res.status(400).json({ success: false, message: 'البيانات ناقصة' });

    await insertTodayDailyActivity(activityName, classId, description , date);

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
  
  const {activityName, description, classId, date} = req.body; 
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  if (!activityName || !classId)
    return res.status(400).json({ success: false, message: 'البيانات ناقصة' });
  //بدي جيب رقم الصف من الفرونت 
  await insertTodayDailyActivity(activityName, classId, description || '', targetDate);

    res.json({ success: true });
  } catch (err) {
    console.error('Error in /teacher/addActivity:', err);
    res.status(500).json({ success: false, message: `${err.message}` });
  }
});

app.post('/api/deleteDailyActivity', async (req, res) => {
  console.log("start delete");

  if (!req.session.user || req.session.user.role !== 'teacher' ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }


  try {
    const classId = await getClassIdFromSession(req.session.user);
    console.log("عم يشوف ال id");

    if (!classId) {
      return res.status(404).json({ error: 'لا يوجد صف مرتبط بهذا المستخدم' });
    }

    const { activityName,date } = req.body;

    if (!activityName || !date) {
      return res.status(400).json({ error: 'اسم النشاط أو التتاريخ غير موجود في الطلب' });
    }

    await deleteDailyActivity(classId, activityName, date);
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

    const { activityName , classId, date } = req.body;
const targetDate = date || new Date().toISOString().split('T')[0];

if (!activityName) {
  return res.status(400).json({ error: 'اسم النشاط غير موجود في الطلب' });
}

await deleteDailyActivity(classId, activityName, targetDate);
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

//لتغيير مربية الصف
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

//لتغيير معلمة الانجليزي للصف 
app.post('/admin/updateClassEnglishTeacherByClassId', async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin") 
    return res.status(401).json({ error: 'Unauthorized' });
  try{
  const {classId , newTeacherId} = req.body ;
  const result = await updateClassEnglishTeacherById(classId , newTeacherId) ;
 
 if(result.success){
   req.session.editClassEnglishTeacherId = null ;
   req.session.editClassEnglishTeacherId = null ;
   res.redirect('/admin');}
  else 
  {
    req.session.editClassEnglishTeacherId = null ;
    req.session.editClassEnglishTeacherId = result.message ;
    return res.redirect('/admin');
  }

  }catch(err){
    console.error('Error loading /admin/updateClassEnglishTeacherByClassId :', err);
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

//*****************************************************************for class page************************************************************************************************************ */

// عرض صفحة الصف
app.get('/admin/class/:classId', async (req, res) => {
  try {
    // Authorization: allow admin or this class's main teacher only
    if (!req.session.user) {
      return res.redirect('/login');
    }
    const user = req.session.user;
    const classIdNum = Number(req.params.classId);
    let allowed = false;
    if (user.role === 'admin') {
      allowed = true;
    } else if (user.role === 'teacher' && user.teacherRole === 'main') {
      const ownClassId = await getClassIdFromSession(user);
      if (Number(ownClassId) === classIdNum) allowed = true;
    }
    if (!allowed) {
      return res.redirect('/login');
    }

    const classId = req.params.classId;

    const students_data = await getStudentsByClass(classId);
    const classes = await getAllClasses();

    const classInfo = await getClassInfo(classId);
    const gradeLevelId = classInfo?.grade_level_id || 0;
    const className = classInfo?.class_name || `رقم ${classId}`;

    const maxLevel = await getMaxGradeLevel();
    const isMaxLevel = gradeLevelId >= maxLevel;

    const transferStudentError = req.session.transferStudentError || null;
    const transferStudentSuccess = req.session.transferStudentSuccess || null;

    req.session.transferStudentError = null;
    req.session.transferStudentSuccess = null;

    res.render('class', {
      students_data,
      classes,
      classId,
      className,
      gradeLevelId,
      isMaxLevel,
      session: {
        ...req.session,
        transferStudentError,
        transferStudentSuccess
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('حدث خطأ في السيرفر');
  }
});







// حذف طالب من صفحة الصف
app.post('/admin/class/:classId/deleteStudent', async (req, res) => {
  // Authorization: allow admin or this class's main teacher only
  if (!req.session.user) {
    return res.status(401).json({ error: 'غير مصرح' });
  }
  const user = req.session.user;
  const classIdParam = Number(req.params.classId);
  let allowed = false;
  if (user.role === 'admin') {
    allowed = true;
  } else if (user.role === 'teacher' && user.teacherRole === 'main') {
    const ownClassId = await getClassIdFromSession(user);
    if (Number(ownClassId) === classIdParam) allowed = true;
  }
  if (!allowed) {
    return res.status(401).json({ error: 'غير مصرح' });
  }

  const { studentId } = req.body;
  const classId = req.params.classId;

  try {
    const result = await deleteStudent(studentId);

    if (!result.success) {
      req.session.deleteStudentError = result.message;
      req.session.deleteErrorStudentId = studentId;
      return res.redirect(`/admin/class/${classId}`);
    }

    req.session.deleteStudentError = null;
    req.session.deleteErrorStudentId = null;
    return res.redirect(`/admin/class/${classId}`);
  } catch (error) {
    console.error("خطأ حذف الطالب:", error);
    req.session.deleteStudentError = 'حدث خطأ غير متوقع أثناء حذف الطالب';
    req.session.deleteErrorStudentId = studentId;
    return res.redirect(`/admin/class/${classId}`);
  }
});


// تحديد الطالب لتعديل بياناته
// تحديد الطالب لتعديل بياناته (فتح الحقول)
app.post('/admin/class/:classId/editStudent', async (req, res) => {
  // Authorization: allow admin or this class's main teacher only
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = req.session.user;
  const classIdParam = Number(req.params.classId);
  let allowed = false;
  if (user.role === 'admin') {
    allowed = true;
  } else if (user.role === 'teacher' && user.teacherRole === 'main') {
    const ownClassId = await getClassIdFromSession(user);
    if (Number(ownClassId) === classIdParam) allowed = true;
  }
  if (!allowed) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { editStudentId } = req.body;
  const classId = req.params.classId;
  req.session.editStudentId = parseInt(editStudentId);
  res.redirect(`/admin/class/${classId}`);
});

// تحديث بيانات الطالب
app.post('/admin/class/:classId/updateStudent', async (req, res) => {
  // Authorization: allow admin or this class's main teacher only
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = req.session.user;
  const classIdParam = Number(req.params.classId);
  let allowed = false;
  if (user.role === 'admin') {
    allowed = true;
  } else if (user.role === 'teacher' && user.teacherRole === 'main') {
    const ownClassId = await getClassIdFromSession(user);
    if (Number(ownClassId) === classIdParam) allowed = true;
  }
  if (!allowed) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const classId = req.params.classId;
  const { studentId, first_name, last_name, birth_date, gender } = req.body;

  try {
    const result = await updateStudent(studentId, {
      first_name,
      last_name,
      birth_date,
      gender,
      class_id: classId
    });

    if (result.success) {
      req.session.editStudentId = null;
      req.session.updateStudentError = null;
      res.redirect(`/admin/class/${classId}`);
    } else {
      req.session.updateStudentError = null;
      req.session.updateStudentError = result.message;
      return res.redirect(`/admin/class/${classId}`);
    }
  } catch (err) {
    console.error('Error loading /admin/class/:classId/updateStudent:', err);
    res.status(400).json({ error: err.message || "حدث خطأ في تحديث بيانات الطالب" });
  }
});

// إلغاء تعديل الطالب
app.post('/admin/class/:classId/cancelUpdateStudent', async (req, res) => {
  // Authorization: allow admin or this class's main teacher only
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = req.session.user;
  const classIdParam = Number(req.params.classId);
  let allowed = false;
  if (user.role === 'admin') {
    allowed = true;
  } else if (user.role === 'teacher' && user.teacherRole === 'main') {
    const ownClassId = await getClassIdFromSession(user);
    if (Number(ownClassId) === classIdParam) allowed = true;
  }
  if (!allowed) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const classId = req.params.classId;
  req.session.editStudentId = null;
  res.redirect(`/admin/class/${classId}`);
});


//إضافة طالب جديد
app.post('/admin/class/:classId/insertStudent', async (req, res) => {
  // Authorization: allow admin or this class's main teacher only
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = req.session.user;
  const classIdParam = Number(req.params.classId);
  let allowed = false;
  if (user.role === 'admin') {
    allowed = true;
  } else if (user.role === 'teacher' && user.teacherRole === 'main') {
    const ownClassId = await getClassIdFromSession(user);
    if (Number(ownClassId) === classIdParam) allowed = true;
  }
  if (!allowed) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const classId = req.params.classId;
    const { first_name, last_name, birth_date, gender, user_id } = req.body;

    const studentData = {
      first_name,
      last_name,
      birth_date,
      gender,
      class_id: classId,
      user_id: user_id || null,
    };

    const result = await addStudent(studentData);

    if (!result.success) {
      req.session.insertStudentError = null;
      req.session.insertStudentError = result.message;
      return res.redirect(`/admin/class/${classId}`);
    } else {
      req.session.insertStudentError = null;
      return res.redirect(`/admin/class/${classId}`);
    }
  } catch (err) {
    console.error('Error loading /admin/class/:classId/insertStudent :', err);
    res.status(400).json({ error: err.message || 'حدث خطأ في قاعدة البيانات' });
  }
});

//نقل  الطالب من صف إلى صف
app.post('/admin/class/:classId/transferStudent', async (req, res) => {
  if (!req.session.user || req.session.user.role != "admin")
    return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { studentId, newClassId } = req.body;
    const result = await transferStudentToClass(Number(studentId), Number(newClassId));

    if (!result.success) {
      // في حال فشل النقل، خزّن الرسالة في session لعرضها في الصفحة لاحقًا
      req.session.transferStudentError = result.message;
      return res.redirect(`/admin/class/${req.params.classId}`);
    }
    console.log("نقل الطالب:", { studentId, newClassId });

    // إذا نجح النقل، يمكن تخزين رسالة نجاح أيضًا إن أردت
    req.session.transferStudentSuccess = result.message;
    res.redirect(`/admin/class/${newClassId}`);
  } catch (err) {
    console.error("خطأ في الراوت:", err);
    req.session.transferStudentError = 'حدث خطأ أثناء نقل الطالب';
    res.redirect(`/admin/class/${req.params.classId}`);
  }
});

//ترقية الصف
app.post('/admin/class/:classId/promote', async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(401).send("Unauthorized");
  }

  const classId = Number(req.params.classId);
  if (isNaN(classId)) {
    req.session.promoteClassError = "رقم الصف غير صالح";
    return res.redirect(`/admin/class/${req.params.classId}`);
  }

  try {
    const result = await promoteEntireClass(classId);

    if (!result.success) {
      req.session.promoteClassError = result.message;
      return res.redirect(`/admin/class/${req.params.classId}`);
    }

    req.session.promoteClassSuccess = result.message;
    return res.redirect(`/admin/class/${result.newClassId || classId}`);
  } catch (err) {
    console.error("خطأ في ترقية الصف:", err);
    req.session.promoteClassError = "حدث خطأ أثناء ترقية الصف";
    return res.redirect(`/admin/class/${req.params.classId}`);
  }
});








//*********************************************************************the end of class page *********************************************************************************************** */


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