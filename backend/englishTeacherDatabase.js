import {executeQuery} from './database.js'

export async function getEnglishTeacherClasses(teacherId) {
    //التأكد انها معلمة انجليزي 
    try{
    const [check] = await executeQuery(`
        SELECT role FROM teachers WHERE id = ? 
        `, [teacherId]);
    if(check.role != 'english')
        throw new Error(" ليست معلمة انجليزي");

    //بجيب الصفوف اللي عم تدرسها

    const classes = await executeQuery(`
        SELECT id , class_name FROM classes WHERE english_teacher_id = ?
        ` ,[teacherId]) ;
    //الناتج[{id : .... , class_name = ....} , .....]

    if(!classes)
        return [];
    return classes ; 

    }catch(err){
    console.error("فشل احضار الصفوف :", err.message);
    throw err;
  }
}

export async function getStudentCountForClass(ClassId) {
   const rows = await executeQuery(
    `SELECT COUNT(*) AS student_count
     FROM students
     WHERE class_id = ? 
     `,[ClassId]
  );
  return rows[0].student_count;
}

export async function getTodayAbsenceCountByClassId(ClassId) {
  const rows = await executeQuery(`SELECT COUNT(*) AS absence_count
     FROM absences
     WHERE date = CURDATE()
     AND student_id IN (
       SELECT id FROM students
       WHERE class_id = ?)`,[ClassId]) ;
   return rows[0].absence_count;
}


export async function getStudentsByClassId(ClassId) {
  const rows = await executeQuery(`
    SELECT id , first_name , last_name , DATE(students.birth_date) AS birth_date 
    FROM students
    WHERE class_id  = ? ` , [ClassId]) ;
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

//عرض عدد انشطه الانجليزي لصف معلمه الانجليزي 
  export async function getTodayEnglishActivityCount(classId) {
    const rows = await executeQuery(
    `SELECT COUNT(*) AS activity_count
     FROM daily_activities
     JOIN activities ON daily_activities.activity_id = activities.id
     WHERE daily_activities.class_id = ? 
       AND daily_activities.date = CURDATE()
       AND activities.type = 'english' `,  [classId]); 
    return rows[0].activity_count || 0 ;
}


//تابع لرد قائمة اسماء الانشطه الممكنه 
export async function getEnglishActivityNames(){
  const rows = await executeQuery('SELECT name , icon FROM activities where type="english"')
  //برد مصفوفة فيها كل كائن عباره عن اسم وايقونه 

return rows ;
}