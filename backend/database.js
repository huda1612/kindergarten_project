import mysql from 'mysql2'
import bcrypt from 'bcrypt' 

const pool = mysql.createPool({
  host: '127.0.0.1' ,
  user: 'root',
  password: '1234',
  database: 'kindergarten'
  
}).promise();

//a function for the authentication when the user log in 
export async function authentication( username , password ){
    
    const [result] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    //check the username 
    if(result.length == 0){
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
    }

    }

}

//تابع ليطلع الرقم للاستاذ او للطالب حسب اسم المستخدم 
export async function getTheId( userId ){
    const [result] = await pool.query("SELECT role FROM users WHERE id=? " , [userId]) ;
    if(result.length == 0 )
        return -1 ;
    
    const role = result[0].role;
    
  if (role === "student") {
    const [rows] = await pool.query("SELECT id FROM students WHERE user_id = ?", [userId]);
    return rows.length > 0 ? rows[0].id : -1;
    } 
  else if (role === "teacher") {
    const [rows] = await pool.query("SELECT id FROM teachers WHERE user_id = ?", [userId]);
    return rows.length > 0 ? rows[0].id : -1;  
    }
  return -1 ;
}

//*********************************************************TEACHER FUNCTIONS SECTION********************************************************************
//تابع يرد اسم المعلم من معرفه
export async function getTeacherName(teacherId) {
  const [rows] = await pool.query('SELECT first_name FROM teachers where id = ? ', [teacherId]  );
  if(rows.length == 0 )
    return "unknown" ; 
  return rows[0].first_name ; 

}

//تابع لاعرف عدد الطلاب اللي بصف معلم محدد
export async function getStudentCountForTeacher(teacherId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS student_count
     FROM students
     WHERE class_id = (
       SELECT id FROM classes WHERE teacher_id = ?
     )`, 
    [teacherId]
  );

  return rows[0].student_count;
}

//تابع لاعادة عدد الغيابات اليوم عند الاستاذ بصفه 
export async function getTodayAbsenceCount(teacherId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS absence_count
     FROM absences
     WHERE date = CURDATE()
     AND student_id IN (
       SELECT id FROM students
       WHERE class_id = (
         SELECT id FROM classes
         WHERE teacher_id = ?
       )
     )`,
    [teacherId]
  );


  return rows[0].absence_count;
}


  //تابع لاعادة عدد الانشطة اليوم في صف الاستاذ المحدد
  export async function getTodayActivityCount(teacherId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS activity_count
     FROM daily_activities
     WHERE class_id = (
       SELECT id FROM classes WHERE teacher_id = ?
     )
     AND date = CURDATE()`,
    [teacherId]
  );

  return rows[0].activity_count;
}


//*********************************************************TEACHER FUNCTIONS END********************************************************************


//*********************************************************STUDENT FUNCTIONS************************************************************************

//تابع يرد اسم الطالب من معرفه
export async function getStudentName(studentId) {
  const [rows] = await pool.query('SELECT first_name FROM students where id = ? ', [studentId]  );
  if(rows.length == 0 )
    return "unknown" ; 
  return rows[0].first_name ; 
}


//*********************************************************STUDENT FUNCTIONS END********************************************************************



