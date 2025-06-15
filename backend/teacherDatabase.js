import {executeQuery} from './database.js'

//تابع يرد اسم المعلم من معرفه
export async function getTeacherFullName(teacherId) {
  const rows = await executeQuery('SELECT first_name , last_name FROM teachers WHERE id = ?', [teacherId]);
  if (rows.length === 0) return "unknown";
  return rows[0].first_name  +" "+ rows[0].last_name  ;
}

export async function getTeacherNameWithNikname(studentId) {
  const rows = await executeQuery('SELECT gender FROM students where id = ? ', [studentId]  );
  const full_name =await getTeacherFullName(studentId) ; 
  if(rows[0].gender== "male")
    return "الاستاذ" +" "+ full_name ;
  else 
    return "الاستاذة" +" "+ full_name ;
}

//تابع لاعرف عدد الطلاب اللي بصف معلم محدد
export async function getStudentCountForTeacher(teacherId) {
   const rows = await executeQuery(
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
  const rows = await executeQuery(`SELECT COUNT(*) AS absence_count
     FROM absences
     WHERE date = CURDATE()
     AND student_id IN (
       SELECT id FROM students
       WHERE class_id = (
         SELECT id FROM classes
         WHERE teacher_id = ?))`,[teacherId]) ;
   return rows[0].absence_count;
  
  
}

  //تابع لاعادة عدد الانشطة اليوم في صف الاستاذ المحدد
  export async function getTodayActivityCount(teacherId) {
    const rows = await executeQuery(
    `SELECT COUNT(*) AS activity_count
     FROM daily_activities
     WHERE class_id = (
       SELECT id FROM classes WHERE teacher_id = ?) 
     AND date = CURDATE()`,  [teacherId]); 
    return rows[0].activity_count;
}

//تابع لرد قائمة الاطفال بصف المعلم 
export async function getStudentsByTeacher(teacherId) {
  const rows = await executeQuery(`
    SELECT students.id , students.first_name , students.last_name , DATE(students.birth_date) AS birth_date 
    FROM students
    JOIN classes ON students.class_id = classes.id
    WHERE classes.teacher_id = ? ` , [teacherId]) ;
    // هالاستعلام رح يرد مصفوفة اغراض كل غرض بعبر عن سطر وفيه رقم الطالب و الاسم الاول والاسم الاخير وتاريخ ميلاده
    //لو المعلم ما اله اي طالب رح يرد التابع مصفوفه فاضيه ولازم عالج هالحاله بالسيرفر 
     const formattedRows = rows.map(row => ({
    ...row,
    birth_date: row.birth_date instanceof Date
      ? row.birth_date.toISOString().split('T')[0]
      : row.birth_date
  }));

  return formattedRows;
}

//تابع لرد رقم الصف للمعلم
export async function getClassIdByTeacherId(teacherId) {
  const rows = await executeQuery(
    `SELECT id FROM classes WHERE teacher_id = ? LIMIT 1` , [teacherId] );
     if (rows.length === 0) {
      return null ; // ما لاقى صف للمعلم
    }
  return rows[0].id;

}

