import {executeQuery} from './database.js'

//عدد الانشطه خلال الاسبوع الحالي 
//لشرط الأول: date >= بداية الأسبوع (السبت الحالي)
//الشرط الثاني: date < بداية الأسبوع + 7 أيام (أي قبل السبت القادم)

export async function weekActivityCount() {
    const result = await executeQuery(`
        SELECT COUNT(*) AS activity_count
        FROM daily_activities
        WHERE date >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 2) % 7 DAY)
        AND date < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 2) % 7 DAY), INTERVAL 7 DAY);
        `)
    return result[0].activity_count ; 
}

//العدد الكلي لجميع المعلمات
export async function allTeachersCount(){
    const [result] = await executeQuery(`
     SELECT COUNT(*) AS teachers_count
     FROM teachers;
    `)
    return result.teachers_count ; 
}

//العدد الكلي لجميع الطلاب
export async function allStudentsCount(){
    const [result] = await executeQuery(`
     SELECT COUNT(*) AS students_count
     FROM students ;
    `)
    return result.students_count ; 
}

//عدد الصفوف الكلي بالروضه
export async function allClassesCount(){
    const [result] = await executeQuery(`
     SELECT COUNT(*) AS classes_count
     FROM classes ;
    `)
    return result.classes_count ; 
}

//تابع لحساب نسبة الحضور خلال الششهر الحالي
//اخدت ايام الغياب هالشهر لكل الطلاب و عدد ايام الحضور الممكنه بهالشهر لكل الطلاب وطرحتهم و قسمتهم عالعدد الكلي 
//وضربته ب100 لحوله لنسبة
export async function getMonthAttendanceRate() {
  // احصل على عدد الطلاب
  const studentsResult = await executeQuery(`SELECT COUNT(*) AS total_students FROM students`);
  const totalStudents = studentsResult[0]?.total_students || 0;
  // عدد أيام الشهر الحالي
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  // احصل على عدد أيام الغياب (لكل الطلاب)
  const absenceResult = await executeQuery(`
    SELECT COUNT(DISTINCT student_id, date) AS total_absence_days
    FROM absences
    WHERE YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())
  `);
  const totalAbsenceDays = absenceResult[0]?.total_absence_days || 0;
  // حساب إجمالي أيام الحضور الممكنه(ايام الدراسه) وهو (عدد الطلاب × عدد أيام الشهر)
  const totalPossibleAttendance = totalStudents * daysInMonth;
  // لحساب معدل الحضور كنسبة مئوية
  const attendanceRate = ((totalPossibleAttendance - totalAbsenceDays) / totalPossibleAttendance) * 100;
  return attendanceRate.toFixed(2);
}

//تابع يرد كل الانشطه بالروضه
export async function getAllActivities(){

  const rows = await executeQuery('SELECT name , description , icon , type FROM activities')

return rows ;
}


export async function getGradeLevelsWithClassCount() {
    const grades = await executeQuery(`
        SELECT id , name , description , min_age , max_age FROM grade_levels 
        `) ;

    //استخدمت الpromise لان تابع الماب متزامن
    const gradesWithCounts = await Promise.all(
    grades.map(async (grade) => {
      const countResult = await gradeLevelClassCount(grade.id);
      return {
        id: grade.id,
        name: grade.name,
        description: grade.description,
        min_age : grade.min_age ,
        max_age : grade.max_age ,
        class_count: countResult.count 
      };
    })
  );
  return gradesWithCounts;
    
}

async function gradeLevelClassCount(gradeId) {
  const [result] = await executeQuery(`
    SELECT COUNT(*) AS count FROM classes 
    WHERE grade_level_id = ?
    ` , [gradeId])
    return result ; 
}