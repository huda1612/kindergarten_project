import mysql from 'mysql2'
import bcrypt from 'bcrypt' 

const pool = mysql.createPool({
  host: '127.0.0.1' ,
  user: 'root',
  password: '1234',
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

//*********************************************************LOGIN FUNCTIONS ENDS*************************************************************************


//*********************************************************CLASS FUNCTIONS SECTION******************************************************************

export async function getTodayActivityListByClass(classId) {
  const rows = await executeQuery(`
      SELECT a.name, a.description, a.icon
      FROM daily_activities d
      JOIN activities a ON d.activity_id = a.id
      WHERE d.class_id = ? AND d.date = CURRENT_DATE `, [classId]);
      return rows;
}
//تابع لاضافة نشاط يومي جديد للصف
export async function insertTodayDailyActivity(activityName, classId ) {
  try{
    const [activity] = await executeQuery(
            'SELECT id FROM activities WHERE name = ?',
            [activityName]
        );
        if (!activity) throw new Error("النشاط غير موجود");

        const activityId = activity.id;

    const existing = await executeQuery(
      'SELECT id FROM daily_activities WHERE activity_id = ? AND class_id = ? AND date = CURRENT_DATE',
      [activityId, classId] );
    if (existing.length > 0) throw new Error("النشاط مسجل بالفعل اليوم لهذا الصف");

    return await executeQuery(`
      INSERT INTO daily_activities (activity_id, class_id, date)
      VALUES (?, ?, CURRENT_DATE) `, [activityId, classId]);
    }catch(err){
    console.error("فشل إضافة النشاط:", err.message);
    throw err;
  }
}

//*********************************************************CLASS FUNCTIONS END**********************************************************************




