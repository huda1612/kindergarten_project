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
        t.phone ,
        t.description ,
        t.certificate
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

export async function updateClassEnglishTeacherById(classId  , newTeacherId) {
    //اتأكد ان المعلمه الجديده موجوده اصلا
    const teacherExist =await executeQuery(`
        SELECT id , role from teachers WHERE id = ? 
        `,[newTeacherId ])
    if(teacherExist.length === 0)
        return {success : false , message : "هذه المعلمة غير موجودة"} ;
    else //اذا موجوده اتأكد  انها معلمة انجليزي
    {
        if(teacherExist[0].role != 'english')
            return {success : false , message : "هذه المعلمة ليست معلمة انجليزي"} ;

    }


    //هلأ منحدث المعلمة 
    await executeQuery(`
        UPDATE classes SET  english_teacher_id = ? 
        WHERE id = ? 
        ` , [newTeacherId , classId]) ;

    return {success:true , message :"ok"}
    
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
        return {success : false , message : "هذه المربية غير موجودة"} ;

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

//****************************************************************GUARDIANS*************************************************************************************

// جلب جميع أولياء الأمور مع معلومات أبنائهم
export async function getAllGuardiansData() {
    const result = await executeQuery(`
        SELECT 
            g.id,
            g.first_name,
            g.last_name,
            g.phone,
            g.email,
            g.address,
            COUNT(gs.student_id) as children_count,
            GROUP_CONCAT(
                CONCAT(s.first_name, ' ', s.last_name, ' (', CASE gs.relation 
                    WHEN 'parent' THEN 'أب/أم'
                    WHEN 'guardian' THEN 'ولي أمر'
                    WHEN 'uncle' THEN 'عم'
                    WHEN 'aunt' THEN 'عمة'
                    WHEN 'grandparent' THEN 'أبو/أم'
                    WHEN 'other' THEN gs.relation
                    ELSE gs.relation
                END, ')') 
                SEPARATOR ', '
            ) as children_names
        FROM guardians g
        LEFT JOIN guardians_students gs ON g.id = gs.guardian_id
        LEFT JOIN students s ON gs.student_id = s.id
        GROUP BY g.id, g.first_name, g.last_name, g.phone, g.email, g.address
        ORDER BY g.first_name, g.last_name
    `);
    return result;
}

// إضافة ولي أمر جديد
export async function insertGuardian(first_name, last_name, phone, email, address) {
    // التحقق من صحة البيانات
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (
        typeof first_name !== 'string' ||
        typeof last_name !== 'string' ||
        first_name.trim() === '' ||
        last_name.trim() === '' ||
        !nameRegex.test(first_name) ||
        !nameRegex.test(last_name)
    ) {
        return { success: false, message: "البيانات المدخلة غير صالحة" };
    }

    // التحقق من رقم الهاتف
    if (phone && phone.trim() !== '') {
        if (isNaN(phone)) {
            return { success: false, message: "رقم الهاتف يجب أن يكون أرقام فقط" };
        }
        
        const phoneStr = phone.toString();
        if (phoneStr.length < 5 || phoneStr.length > 15) {
            return { success: false, message: "رقم الهاتف يجب أن يكون بين 5 و 15 خانة" };
        }

        // التحقق من عدم تكرار رقم الهاتف
        const checkPhone = await executeQuery(`
            SELECT id FROM guardians WHERE phone = ?
        `, [phone]);
        if (checkPhone.length !== 0) {
            return { success: false, message: "رقم الهاتف هذا موجود مسبقاً" };
        }
    }

    // التحقق من البريد الإلكتروني
    if (email && email.trim() !== '') {
        if (!emailRegex.test(email)) {
            return { success: false, message: "البريد الإلكتروني غير صالح" };
        }

        // التحقق من عدم تكرار البريد الإلكتروني
        const checkEmail = await executeQuery(`
            SELECT id FROM guardians WHERE email = ?
        `, [email]);
        if (checkEmail.length !== 0) {
            return { success: false, message: "البريد الإلكتروني هذا موجود مسبقاً" };
        }
    }

    try {
        const insertResult = await executeQuery(`
            INSERT INTO guardians (first_name, last_name, phone, email, address)
            VALUES (?, ?, ?, ?, ?)
        `, [first_name, last_name, phone || null, email || null, address || null]);
        
        // Retrieve the ID of the newly inserted guardian
        const newGuardianId = insertResult.insertId;

        return { success: true, message: "تم إضافة ولي الأمر بنجاح", guardianId: newGuardianId };
    } catch (error) {
        console.error('Error inserting guardian:', error);
        return { success: false, message: "حدث خطأ أثناء إضافة ولي الأمر" };
    }
}

// تحديث بيانات ولي الأمر
export async function updateGuardianById(guardianId, first_name, last_name, phone, email, address) {
    // التحقق من صحة البيانات
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (
        typeof first_name !== 'string' ||
        typeof last_name !== 'string' ||
        first_name.trim() === '' ||
        last_name.trim() === '' ||
        !nameRegex.test(first_name) ||
        !nameRegex.test(last_name)
    ) {
        return { success: false, message: "البيانات المدخلة غير صالحة" };
    }

    // التحقق من وجود ولي الأمر
    const guardianExists = await executeQuery(`
        SELECT id FROM guardians WHERE id = ?
    `, [guardianId]);
    if (guardianExists.length === 0) {
        return { success: false, message: "ولي الأمر غير موجود" };
    }

    // التحقق من رقم الهاتف
    if (phone && phone.trim() !== '') {
        if (isNaN(phone)) {
            return { success: false, message: "رقم الهاتف يجب أن يكون أرقام فقط" };
        }
        
        const phoneStr = phone.toString();
        if (phoneStr.length < 5 || phoneStr.length > 15) {
            return { success: false, message: "رقم الهاتف يجب أن يكون بين 5 و 15 خانة" };
        }

        // التحقق من عدم تكرار رقم الهاتف (باستثناء ولي الأمر الحالي)
        const checkPhone = await executeQuery(`
            SELECT id FROM guardians WHERE phone = ? AND id != ?
        `, [phone, guardianId]);
        if (checkPhone.length !== 0) {
            return { success: false, message: "رقم الهاتف هذا موجود مسبقاً" };
        }
    }

    // التحقق من البريد الإلكتروني
    if (email && email.trim() !== '') {
        if (!emailRegex.test(email)) {
            return { success: false, message: "البريد الإلكتروني غير صالح" };
        }

        // التحقق من عدم تكرار البريد الإلكتروني (باستثناء ولي الأمر الحالي)
        const checkEmail = await executeQuery(`
            SELECT id FROM guardians WHERE email = ? AND id != ?
        `, [email, guardianId]);
        if (checkEmail.length !== 0) {
            return { success: false, message: "البريد الإلكتروني هذا موجود مسبقاً" };
        }
    }

    try {
        await executeQuery(`
            UPDATE guardians 
            SET first_name = ?, last_name = ?, phone = ?, email = ?, address = ?
            WHERE id = ?
        `, [first_name, last_name, phone || null, email || null, address || null, guardianId]);
        
        return { success: true, message: "تم تحديث بيانات ولي الأمر بنجاح" };
    } catch (error) {
        console.error('Error updating guardian:', error);
        return { success: false, message: "حدث خطأ أثناء تحديث بيانات ولي الأمر" };
    }
}

// حذف ولي أمر
export async function deleteGuardianById(guardianId) {
    try {
        // التحقق من وجود ولي الأمر
        const guardianExists = await executeQuery(`
            SELECT id FROM guardians WHERE id = ?
        `, [guardianId]);
        if (guardianExists.length === 0) {
            return { success: false, message: "ولي الأمر غير موجود" };
        }

        // حذف العلاقات مع الطلاب أولاً
        await executeQuery(`
            DELETE FROM guardians_students WHERE guardian_id = ?
        `, [guardianId]);

        // حذف ولي الأمر
        await executeQuery(`
            DELETE FROM guardians WHERE id = ?
        `, [guardianId]);

        return { success: true, message: "تم حذف ولي الأمر بنجاح" };
    } catch (error) {
        console.error('Error deleting guardian:', error);
        return { success: false, message: "حدث خطأ أثناء حذف ولي الأمر" };
    }
}

// جلب قائمة الطلاب مع حالة ربطهم بولي أمر محدد
export async function getStudentsWithLinkingStatus(guardianId) {
    const result = await executeQuery(`
        SELECT 
            s.id,
            s.first_name,
            s.last_name,
            c.class_name,
            gs.relation, -- إضافة عمود العلاقة
            CASE 
                WHEN gs.guardian_id = ? THEN TRUE
                ELSE FALSE
            END as linked_to_current_guardian
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN guardians_students gs ON s.id = gs.student_id AND gs.guardian_id = ?
        ORDER BY s.first_name, s.last_name
    `, [guardianId, guardianId]);
    return result;
}

// ربط طالب بولي أمر
export async function linkStudentToGuardian(studentId, guardianId, relation = 'parent') {
    try {
        // التحقق من وجود الطالب وولي الأمر
        const studentExists = await executeQuery(`
            SELECT id FROM students WHERE id = ?
        `, [studentId]);
        if (studentExists.length === 0) {
            return { success: false, message: "الطالب غير موجود" };
        }

        const guardianExists = await executeQuery(`
            SELECT id FROM guardians WHERE id = ?
        `, [guardianId]);
        if (guardianExists.length === 0) {
            return { success: false, message: "ولي الأمر غير موجود" };
        }

        // التحقق من عدم وجود ربط مسبق لنفس العلاقة (يمكن أن يكون للطالب أكثر من ولي أمر، ولكن ليس نفس ولي الأمر مرتين)
        const existingLink = await executeQuery(`
            SELECT student_id FROM guardians_students WHERE student_id = ? AND guardian_id = ?
        `, [studentId, guardianId]);
        if (existingLink.length !== 0) {
            // إذا كان الربط موجوداً، نقوم بتحديث العلاقة بدلاً من إرجاع خطأ
            await executeQuery(`
                UPDATE guardians_students SET relation = ? WHERE student_id = ? AND guardian_id = ?
            `, [relation, studentId, guardianId]);
            return { success: true, message: "تم تحديث علاقة الطالب بولي الأمر بنجاح" };
        }

        // إنشاء الربط
        await executeQuery(`
            INSERT INTO guardians_students (student_id, guardian_id, relation)
            VALUES (?, ?, ?)
        `, [studentId, guardianId, relation]);

        return { success: true, message: "تم ربط الطالب بولي الأمر بنجاح" };
    } catch (error) {
        console.error('Error linking student to guardian:', error);
        return { success: false, message: "حدث خطأ أثناء ربط الطالب بولي الأمر" };
    }
}

// إلغاء ربط طالب من ولي أمر
export async function unlinkStudentFromGuardian(studentId, guardianId) {
    try {
        await executeQuery(`
            DELETE FROM guardians_students 
            WHERE student_id = ? AND guardian_id = ?
        `, [studentId, guardianId]);

        return { success: true, message: "تم إلغاء ربط الطالب من ولي الأمر بنجاح" };
    } catch (error) {
        console.error('Error unlinking student from guardian:', error);
        return { success: false, message: "حدث خطأ أثناء إلغاء ربط الطالب من ولي الأمر" };
    }
}

