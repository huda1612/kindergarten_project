import mysql from 'mysql2'
import bcrypt from 'bcrypt' 

const pool = mysql.createPool({
  host: '127.0.0.1' ,
  user: 'root',
<<<<<<< HEAD
  password: '1234',
=======
  password: 'fatimaharir_22085',
>>>>>>> b9ede2161d276761550b4d0b0c69864aa1f397dc
  database: 'kindergarten'
  
}).promise();

//تابع لتنفيذ الاستعلامات مع التحقق من ان الاستعلام ما رمى غلط لتجنب التكرار 
export async function executeQuery(query, params = []) {
  try {
    const [rows] = await pool.query(query, params);
    return rows;
  } catch (err) {
    // نطبع الخطأ لسهولة التتبع ونرميه مجددًا ليتم التعامل معه في الطبقات الأعلى
    console.error('Database query error:', err); 
    throw err; 
  }
}

//*********************************************************LOGIN FUNCTIONS SECTION********************************************************************
//a function for the authentication when the user log in 
export async function authentication( username , password ){
    
    const [result] = await pool.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);

    //check the username 
    if(result.length === 0){
        return false; 
    }

    else {    
    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    //check the password 
    if(!match){
        return false;
    }
    else{
       // console.log(user); //added for teest 
       return user ;
    }}
  }

//تابع ليطلع الرقم للاستاذ او للطالب حسب اسم المستخدم 
export async function getTheId( userId ){
  const result = await executeQuery("SELECT role FROM users WHERE id=?", [userId]);
  if(result.length === 0 )
      return -1 ;
  const role = result[0].role;
    
  if (role === "student") {
    const rows = await executeQuery("SELECT id FROM students WHERE user_id = ?", [userId]);
    return rows.length > 0 ? rows[0].id : -1;
    } 
  else if (role === "teacher") {
    const rows = await executeQuery("SELECT id FROM teachers WHERE user_id = ?", [userId]);
    return rows.length > 0 ? rows[0].id : -1;  
    }
    
  return -1 ;
  }

  export async function getTeacherRole( teacherId ){
    const result = await executeQuery(`
      SELECT role FROM teachers WHERE id = ?
      `,[teacherId]) ;
    return result[0].role ; 
  }

//*********************************************************LOGIN FUNCTIONS ENDS*************************************************************************



//*********************************************************REGISTER FUNCTIONS *************************************************************************

//تابع لانشاء حساب جديد
//this func will return a object in this form { success : ... , message : ... }
export async function register( id, firstName, lastName, username, password1, password2, role ) {
  
  //التحقق من صحة الدور 
  if (role != 'teacher' && role != 'student') 
    return { success: false, message: "نوع الدور غير صحيح" };

  if (role === 'admin') {
  const [adminExists] = await executeQuery("SELECT id FROM users WHERE role = 'admin'");
  if (adminExists) throw new Error("يوجد مدير بالفعل، لا يمكن إنشاء مدير آخر.");
}
  
  //تحقق من وجود الرقم التعريفي والتحقق من عدم وجود حساب بهذا الرقم 
  const validId = await idCheck(id, role);
  if (validId != "ok")
    return {success: false, message: validId }

  //تحقق من تطابق الاسم الاول والاخير مع الشخص اللي هذا رقمه
  const nameValidation = await nameCheck(id, role, firstName, lastName);
  if( nameValidation != "ok")
    return {success: false, message: nameValidation }
  
  //تحقق من ان اسم المستخدم غير مستخدم من قبل 
  const usernameCheck = await executeQuery(
    `SELECT username FROM users WHERE username = ?` ,[username]
  )
  if(usernameCheck.length != 0)
    return {success: false, message: "اسم المستخدم مستخدم من قبل، يرجى تغييره" } ; 

  // التحقق من أن اسم المستخدم لا يحتوي رموز أو فراغات
  const usernamePattern = /^[a-zA-Z0-9_]+$/;
  if (!usernamePattern.test(username)) {
    return { success: false, message: "اسم المستخدم يجب أن يحتوي فقط على أحرف إنجليزية أو أرقام أو (_) بدون فراغات أو رموز خاصة" };
  }
  //التحقق ان طول اسم المستخدم اكثر من 3 واقل من 20 
  if(username.length < 3 || username.length > 20)
    return { success: false, message: "اسم المستخدم يجب ان يكون طوله أكثر من 3 رموز وأقل من 20 رمز" };

  //تحقق من تطابق كلمتي السر 
  if(password1 != password2)
    return {success : false , message : "كلمتا السر غير متطابقتين "} ; 

  //تحقق ان كلمة السر 4 احرف عالاقل
  if (password1.length < 4 )
    return {success : false , message : "كلمة السر قصيرة جداً (الحد الأدنى 4 أحرف) "} ;

  //انشاء الحساب 
  const hashPassword = await bcrypt.hash(password1, 10) ; 
  const insertUser = await executeQuery(
      `INSERT INTO users (username , password , role) VALUES (? , ? , ?) ` ,
      [username , hashPassword , role]
  ) ;
 //وضع رقم الحساب بسطر المستخدم
  await executeQuery(
  `UPDATE ${role + 's'}
  SET user_id = ?
  WHERE id = ?` ,
  [insertUser.insertId , id]) ; 

  return {success : true, message : "تم انشاء الحساب بنجاح"}

}

//تحقق من وجود الرقم التعريفي  و تحقق من عدم وجود حساب بهذا الرقم 
export async function idCheck(id , role) {
  const result = await executeQuery(
    `SELECT id , user_id FROM ${role + 's'} WHERE id = ?`,
    [id]
  );

  if (result.length === 0 ) 
    return "لا يوجد شخص بهذا الرقم" ;
  

  if (result[0].user_id !== null ) 
    return " تم إنشاء حساب مسبقاً لهذا الشخص " ;

  return "ok" ;
}

//تحقق من تطابق الاسم الاول والاخير مع الشخص اللي هذا رقمه
export async function nameCheck(id , role , firstName , lastName) {
  const result = await executeQuery(
    `SELECT first_name , last_name FROM ${role + 's'} WHERE id = ? `,
    [id]
  )
  if (result.length === 0 ) 
    return "لا يوجد شخص بهذا الرقم" ;
  
  if(firstName != result[0].first_name)
    return "الاسم الأول خاطئ" ;

  if(lastName != result[0].last_name)
    return "الاسم الأخير خاطئ" ;

  return "ok" ;
}



//*********************************************************REGISTER FUNCTIONS ENDS*************************************************************************




//*********************************************************CLASS FUNCTIONS SECTION******************************************************************


export async function getTodayActivityListByClass(classId, date = null, type = 'main') {
  const targetDate = date || 'CURRENT_DATE';
  let query, params;
  if (targetDate === 'CURRENT_DATE') {
    query = `
      SELECT d.id, a.name, d.description, a.icon, a.type
      FROM daily_activities d
      JOIN activities a ON d.activity_id = a.id
      WHERE d.class_id = ? AND d.date = CURRENT_DATE AND a.type = ?`;
    params = [classId, type];
  } else {
    query = `
      SELECT d.id, a.name, d.description, a.icon, a.type
      FROM daily_activities d
      JOIN activities a ON d.activity_id = a.id
      WHERE d.class_id = ? AND DATE(d.date) = ? AND a.type = ?`;
    params = [classId, targetDate, type];
  }
  const rows = await executeQuery(query, params);
  return rows;
}


export async function getFlieListByClass(classId , date ){
  const date2 = date ;
  const row = await executeQuery(`
   SELECT f.id, f.daily_activity_id , f.name , f.path , f.date , f.description , f.type,
   a.name AS activity_name
   FROM files f
   LEFT JOIN daily_activities d ON f.daily_activity_id = d.id
   LEFT JOIN activities a ON d.activity_id = a.id
   WHERE f.class_id = ?
   AND f.date >= ? AND f.date < DATE_ADD(?, INTERVAL 1 DAY)
    `,[classId , date , date2]);
  return row ;
}
//تابع لاضافة نشاط يومي جديد للصف
export async function insertTodayDailyActivity(activityName, classId , description , date) {
  try{
    const [activity] = await executeQuery(
            'SELECT id FROM activities WHERE name = ?',
            [activityName ]
        );
        if (!activity) throw new Error("النشاط غير موجود");

        const activityId = activity.id;

    const existing = await executeQuery(
      'SELECT id FROM daily_activities WHERE activity_id = ? AND class_id = ?  AND date = ?',
      [activityId, classId , date] );
    if (existing.length > 0) throw new Error("النشاط مسجل بالفعل اليوم لهذا الصف");

    return await executeQuery(`
      INSERT INTO daily_activities (activity_id, class_id, date , description )
      VALUES (?, ?,? , ?) `, [activityId, classId , date, description]);
    }catch(err){
    console.error("فشل إضافة النشاط:", err.message);
    throw err;
  }
}

//تابع حذف نشاط يومي 
// تابع حذف نشاط يومي حسب اسم النشاط و classId
export async function deleteDailyActivity(classId, activityName,date) {
  // 1. جيب ID النشاط من اسمه
  const activityRow = await executeQuery(`
    SELECT id FROM activities WHERE name = ?`,
    [activityName]
  );

  if (activityRow.length === 0) {
    throw new Error("النشاط غير موجود");
  }

  const activityId = activityRow[0].id;

  // 2. احذف من daily_activities
  await executeQuery(`
    DELETE FROM daily_activities WHERE class_id = ? AND DATE(date) = ? AND activity_id = ?`,
    [classId, date, activityId]
  );
}


export async function deleteFile( fileId , classId) {

  await executeQuery(`
    DELETE FROM files WHERE class_id = ? AND id = ? `,
    [classId, fileId]
  );
  return {success : true} ;
}


//*********************************************************CLASS FUNCTIONS END**********************************************************************



