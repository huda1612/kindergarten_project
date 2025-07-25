import {executeQuery} from './database.js'


//****************************************************************TEACHERS*************************************************************************************
//تابع يرد بيانات جميع المعلمين بالروضة 
//لكل معلم {id :... , first_name :... , last_name :...  , class_name: .... , phone:.... }
export async function getAllMainTeachersData() {
    //برد كل المعلمين حتى لو ما عندهم صف محدد ممكن اسم الصف يكون null
    const result = await executeQuery(`
        SELECT t.id, t.first_name, t.last_name,t.certificate , t.description , t.phone, c.class_name 
        FROM teachers t
        LEFT JOIN classes c ON t.id = c.teacher_id
         WHERE t.role ='main'
        `)
    return result ; 
}

//بده تعديل لاتأكد من البيانات المدخله ان صح 
export async function insertTeacher(first_name , last_name , phone , role ,  certificate , description){
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/; // يقبل الحروف العربية والانجليزية ومسافات فقط
     if (
    typeof first_name !== 'string' ||
    typeof last_name !== 'string' ||
    first_name.trim() === '' ||
    last_name.trim() === '' ||
    !nameRegex.test(first_name) ||
    !nameRegex.test(last_name) ||
    (phone && isNaN(phone)) // إذا موجود، لازم يكون رقم
    ) {
      return {success : false , message : "البيانات المدخلة غير صالحة"}
    }
    //التحقق من الدور 
    if(role != 'english' && role != 'main')
      return {success : false , message : "دور المعلمة غير صالح"}
    
    if (!isNaN(certificate) && certificate.trim() !== "") {
      return {success : false , message :"حقل الشهادة لا يجب أن يكون أرقام فقط"};
    }

    if (!isNaN(description) && description.trim() !== "") {
        return {success : false , message :"الوصف لا يجب أن يكون أرقام فقط"};
    }

    if(phone && phone.trim() != '' ){
    //للتأكد من ان رقم الهاتف غير موجود مسبقا
    const checkPhone = await executeQuery(`
        SELECT id , phone FROM teachers WHERE phone = ?
        ` ,[phone]) ;
    if(checkPhone.length != 0 )
        return {success : false , message :"رقم الهاتف هذا موجود مسبقا "} ;
    
   //التأكد من طول الرقم
   const phoneStr = phone.toString(); 

    if (phoneStr.length < 5 || phoneStr.length > 15) 
        return { success: false, message: "رقم الهاتف يجب أن يكون بين 5 و 15 خانة" };

    }

    await executeQuery(`
       INSERT INTO teachers (first_name , last_name , phone , role , certificate , description )
       VALUES (?, ?, ? , ? , ? , ?) `, [first_name , last_name , phone , role ,  certificate , description]);
    return {success : true , message : "ok" }
}

export async function updateClassTeacher(oldTeacherId , newTeacherId)
{
    return await executeQuery(`
        UPDATE classes SET teacher_id = ? 
        WHERE teacher_id = ? 
        ` , [newTeacherId , oldTeacherId]) ;
}

export async function updateTeacherById(teacherId ,first_name , last_name , phone , certificate , description ) {
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/; // يقبل الحروف العربية والانجليزية ومسافات فقط
     if (
    typeof first_name !== 'string' ||
    typeof last_name !== 'string' ||
    first_name.trim() === '' ||
    last_name.trim() === '' ||
    !nameRegex.test(first_name) ||
    !nameRegex.test(last_name) ||
    (phone && isNaN(phone)) // إذا موجود، لازم يكون رقم
    ) {
      return {success : false , message : "البيانات المدخلة غير صالحة"}
    }

    if (!isNaN(certificate) && certificate.trim() !== "") {
      return {success : false , message :"حقل الشهادة لا يجب أن يكون أرقام فقط"};
    }

    if (!isNaN(description) && description.trim() !== "") {
        return {success : false , message :"الوصف لا يجب أن يكون أرقام فقط"};
    }

    
    if(phone && phone.trim() != '' ){
    //للتأكد من ان رقم الهاتف غير موجود مسبقا
    const checkPhone = await executeQuery(`
        SELECT id , phone FROM teachers WHERE phone = ?
        ` ,[phone]) ;
    if(checkPhone.length != 0 && checkPhone[0].id != teacherId )
        return {success : false , message :"رقم الهاتف هذا موجود مسبقا "} ;
    
   //التأكد من طول الرقم
   const phoneStr = phone.toString(); 

    if (phoneStr.length < 5 || phoneStr.length > 15) 
        return { success: false, message: "رقم الهاتف يجب أن يكون بين 5 و 15 خانة" };


    }
    await executeQuery(`
        UPDATE teachers SET first_name = ? , last_name = ? , phone = ? ,  certificate =?  , description =?
        WHERE id = ? 
        `,[first_name , last_name , phone ,  certificate , description , teacherId ]);

    return {success : true , message : "ok" } ;

}

//تابع لحذف معلم 
export async function deleteTeacherById(teacherId) {
    try{
    //نتأكد من وجود المعلمة اصلا 
    const exist = await executeQuery(`
        SELECT id FROM teachers WHERE id = ? ` , [teacherId]) ; 
    if(exist.length == 0)
        return {success : false , Message :"هذه المعلمة غير موجودة" }; 
    
    //نتأكد اول انه ما عم يدرس اي صف كمعلم اساسي
    const check = await executeQuery(`
        SELECT * FROM classes WHERE teacher_id = ? ` , [teacherId]) ; 
    
    if(check.length != 0 )
        return {success : false , Message : "لا يمكن حذف المربية لوجود صف مرتبط بها"}; 

    //لو كان معلمة انجليزي بفك ربطها مع صفوفها
    const roleresult = await executeQuery(`SELECT role FROM teachers WHERE id = ? ` , [teacherId]) ;
    const role = roleresult[0].role ;
    if(role === 'english'){
        await executeQuery(`
        UPDATE classes SET english_teacher_id = null WHERE english_teacher_id=? ` , [teacherId]) ; 
    }

    //لجيب رقم حسابه 
    const userId = await executeQuery(`
        SELECT user_id FROM teachers WHERE id = ? 
        ` , [teacherId]) ;

    if(userId.length != 0)
    {//حذف حساب المعلمة قبل حذفها
    await executeQuery(`
        DELETE FROM users WHERE id = ?
        ` , [userId[0].user_id]) ;}
    
    //حذف المعلمة
    await executeQuery(`
        DELETE FROM teachers WHERE id = ?
        ` , [teacherId]) ;
  

    return {success : true , Message : 'ok'}
    
    }catch(err){console.log("فشل حذف المعلمة")
                return {success : false , Message : "فشل حذف المعلمة"}; 

    }
}
//****************************************************************ENGTEACHERS*************************************************************************************
export async function getAllEngTeachersData() {
    //برد كل المعلمين حتى لو ما عندهم صف محدد ممكن اسم الصف يكون null
    const result = await executeQuery(`
      SELECT 
        t.id ,
        t.first_name,
        t.last_name,
        t.phone
      FROM teachers t
      WHERE t.role = 'english'
      ORDER BY t.id
        `)
    return result ; 
}

export async function getEnglishTeachersWithClasses() {
  // 1. جلب جميع معلمات الإنجليزي
  const englishTeachers = await executeQuery(`
    SELECT id AS teacher_id
    FROM teachers
    WHERE role = 'english'
  `);

  if (englishTeachers.length === 0) return [];

  // 2. جلب الصفوف المرتبطة بهؤلاء المعلمات
  const classes = await executeQuery(`
    SELECT english_teacher_id, class_name
    FROM classes
    WHERE english_teacher_id IS NOT NULL
  `);

  // 3. تجهيز الناتج
  return englishTeachers.map(t => ({
    teacher_id: t.teacher_id,
    classes: classes
      .filter(c => c.english_teacher_id === t.teacher_id)
      .map(c => c.class_name)
  }));
}


//****************************************************************CLASSES*************************************************************************************


export async function getGradeLevels() {
    return await executeQuery(`
        SELECT id , name  FROM grade_levels 
        `) ;
}

//تابع لرد كل الصفوف 
//بمشي على كل صف ولو كان بطابق الغراد ليفيل باخذه وبعرضه 
//بدي من كل صف اسمه واسم مرحلته و عدد الطلاب فيه و اسم المعلمة المشرف الكامل 
/*
{
  id: 3,                       // رقم الصف
  class_name: "التمهيدي ب",     // اسم الصف
  grade_level_id: 2,          // رقم المرحلة (مثلاً: 2 = مرحلة 4 سنوات)
  teacher_id: 5,              // رقم المعلمة المسؤول عن الصف
  first_name: "ندى",          // الاسم الأول للمعلم
  last_name: "خليل",          // الاسم الأخير للمعلم
  student_count: 18           // عدد الطلاب في الصف
}

 */
export async function getAllClassesData() {
  const classes = await executeQuery(`
    SELECT 
      c.id AS id,
      c.class_name,
      c.grade_level_id,
      t.id AS teacher_id,          -- رقم المعلمة
      t.first_name,
      t.last_name,
      COUNT(s.id) AS student_count
    FROM classes c
    LEFT JOIN teachers t ON c.teacher_id = t.id
    LEFT JOIN students s ON s.class_id = c.id
    GROUP BY c.id, c.class_name, c.grade_level_id, t.id, t.first_name, t.last_name
  `);

  return classes;
}

export async function updateClassNameById(classId  , class_name ) {
    //اتأكد ان اسم الصف ما مكرر
    const dupCheck = await executeQuery(`
        SELECT id , class_name FROM classes WHERE class_name = ? 
        `,[class_name ])
    if(dupCheck.length != 0 && dupCheck[0].id != classId )
        return {success : false , message :"هذا الاسم محجوز لصف اخر" }

    //نتأكد ان نمط الاسم صح 
    
    if(typeof class_name !== 'string' || class_name.trim() === '' )
        return {success : false , message :"اسم الصف المدخل غير صالح"}

    //منغير اسم الصف
     await executeQuery(`
        UPDATE classes SET class_name = ? 
        WHERE id = ? ` ,[class_name,classId])
    return {success:true , message :"ok"} 
}



export async function updateClassTeacherById(classId  , oldTeacherId , newTeacherId) {
    //اتأكد ان المعلمين الجديد والقديم موجودين اصلا
    const teacherExist =await executeQuery(`
        SELECT id from teachers WHERE id = ?
        `,[newTeacherId ])
    if(teacherExist.length === 0)
        return {success : false , message : "هذا المعلمة غير موجود"} ;

    /*
    //اتأكد ان المعلمة الجديد ما الها اي صف 
    const classCheck =await executeQuery(`
        SELECT * FROM classes WHERE teacher_id = ?
        `,[newTeacherId])
    if(classCheck.length != 0)
          return {success : false , message : "هذا المعلمة يدرس صف اخر" }

    */

   //خليه ما بقا بعلم صف لو كان بعلم
   const oldClassChange =await executeQuery(`
        SELECT * FROM classes WHERE teacher_id = ?
        `,[newTeacherId])
    if(oldClassChange.length != 0 )
    {
        await executeQuery(`
             UPDATE classes SET teacher_id = null
             WHERE teacher_id = ? 
        ` , [ newTeacherId]) ;

    }
    //هلأ منحدث المعلمة 
    await executeQuery(`
        UPDATE classes SET teacher_id = ? 
        WHERE id = ? 
        ` , [newTeacherId , classId]) ;

    return {success:true , message :"ok"}
    
}


export async function deleteClassById(classId) {

    //نتأكد من وجود الصف اصلا 
    const exist = await executeQuery(`
        SELECT id FROM classes WHERE id = ? ` , [classId]) ; 
    if(exist.length == 0)
        return {success : false , message :"هذا الصف غير موجود" }; 
    
    //نتأكد اول انه ما فيه اي طلاب 
    const studentCheck = await executeQuery(`
        SELECT * FROM students WHERE class_id  = ? ` , [classId]) ; 
    
    if(studentCheck.length != 0 )
        return {success : false , message : "لا يمكن حذف الصف لوجود طلاب فيه"}; 

    //حذف الصف
    await executeQuery(`
        DELETE FROM classes WHERE id = ?
        ` , [classId]) ;

    return {success : true , message : 'ok'}
    
}



export async function insertClass(className , gradeId , TeacherId , engTeacherId ){
    //نتأكد ان اسم الصف ما فاضي 
    if(className.trim() === '')
        return {success : false , message : "يرجى ادخال اسم الصف"}
    //نتأكد ان المرحله موجوده 
    const gradeExist = await executeQuery(`
        SELECT * FROM grade_levels WHERE id = ?
        `,[gradeId]) ; 
    if(gradeExist.length == 0 )
         return {success : false , message : "هذه المرحلة غير موجودة"}

    //التأكد من ان الاستاذ ما عم يدرس اي صف 
    const teacherCheck = await executeQuery(`
        SELECT * FROM classes WHERE teacher_id = ?
        `,[TeacherId]) ; 
    if(teacherCheck.length != 0 )
         return {success : false , message : "هذه المربية تدرس صف اخر"}

    if(!TeacherId)
        return {success : false , message : "لا يمكن اضافة صف بدون مربية"}
    // نتأكد من وجود معلم الانجليزي وانه بدرس انجليزي 

    if(engTeacherId){
     const engteacherExist = await executeQuery(`
        SELECT * FROM teachers WHERE id = ?
        `,[engTeacherId]) ; 
    if(engteacherExist.length === 0 || engteacherExist[0].role != 'english' )
        return {success : false , message : "معلمة الانجليزي غير صالحه او غير موجوده"}
    }

    //انشاء الصف
    await executeQuery(`
        INSERT INTO classes( teacher_id , grade_level_id , class_name , english_teacher_id) VALUES(? , ? , ? , ?)
        `,[TeacherId , gradeId , className ,engTeacherId]);             

    return {success : true , message :"ok"};


}

