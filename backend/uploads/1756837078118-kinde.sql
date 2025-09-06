-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: kindergarten
-- ------------------------------------------------------
-- Server version	8.0.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `absences`
--

DROP TABLE IF EXISTS `absences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `absences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_absences_students_idx` (`student_id`),
  CONSTRAINT `fk_absences_students` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `absences`
--

LOCK TABLES `absences` WRITE;
/*!40000 ALTER TABLE `absences` DISABLE KEYS */;
INSERT INTO `absences` VALUES (1,1,'2025-06-03'),(2,2,'2025-06-10'),(3,1,'2025-06-21'),(4,2,'2025-07-15'),(5,2,'2025-08-11');
/*!40000 ALTER TABLE `absences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `type` enum('main','english') NOT NULL DEFAULT 'main',
  `category` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES (1,'الرسم بالألوان','نشاط يتيح للأطفال التعبير عن مشاعرهم بالرسم باستخدام ألوان شمعية أو مائية.','fa-paint-brush','main',NULL),(2,'القصة المصورة','قراءة قصة قصيرة مع عرض صور مشوّقة لمساعدة الطفل على فهم الأحداث.','fa-book-open','main',NULL),(3,'أغاني الحروف والكلمات','نشاط بالانجليزي لتعلم الحروف والكلمات','fa-solid fa-music','english',NULL),(4,'أغاني الحروف ','نشاط لتعلم الحروف والكلمات','fa-solid fa-music','main',NULL);
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_experience`
--

DROP TABLE IF EXISTS `class_experience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_experience` (
  `id` int NOT NULL AUTO_INCREMENT,
  `experience_name` varchar(255) DEFAULT NULL,
  `class_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `class_experience_fk_idx` (`class_id`),
  CONSTRAINT `class_experience_fk` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_experience`
--

LOCK TABLES `class_experience` WRITE;
/*!40000 ALTER TABLE `class_experience` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_experience` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` int DEFAULT NULL,
  `grade_level_id` int NOT NULL,
  `class_name` varchar(45) NOT NULL,
  `english_teacher_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teacher_id_idx` (`teacher_id`),
  KEY `fk_class_grade_levels_idx` (`grade_level_id`),
  KEY `fk_classes_english_teachers_idx` (`english_teacher_id`),
  CONSTRAINT `fk_classes_english_teachers` FOREIGN KEY (`english_teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_classes_grade_levels` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_classes_teachers` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,1,1,'المستقبل',3),(2,7,1,'الزهور',20),(3,13,1,'السنافر',3),(4,8,2,'الفراشات',NULL),(5,2,2,'النور',NULL),(6,15,2,'المرح',20),(7,16,3,'العباقرة',20),(8,17,3,'النجوم',20),(9,18,3,'الورود',3);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_activities`
--

DROP TABLE IF EXISTS `daily_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL,
  `class_id` int NOT NULL,
  `date` date NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_daily_activities_activities_idx` (`activity_id`),
  KEY `fk_daily_activities_classes_idx` (`class_id`),
  CONSTRAINT `fk_daily_activities_activities` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_daily_activities_classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=288 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_activities`
--

LOCK TABLES `daily_activities` WRITE;
/*!40000 ALTER TABLE `daily_activities` DISABLE KEYS */;
INSERT INTO `daily_activities` VALUES (1,1,1,'2025-07-15',NULL),(2,2,1,'2025-07-15',NULL),(3,1,2,'2025-07-15','نشاط للرسم '),(5,1,1,'2025-07-16',NULL),(6,3,1,'2025-07-16','ؤ'),(23,1,1,'2025-07-17','رسم الحيوانات'),(25,2,1,'2025-07-17','قصة ليلى والذئب'),(27,3,1,'2025-07-17','اغنية الحروف الابجدية'),(28,1,1,'2025-08-14','رسم بالالوان '),(29,2,1,'2025-08-14','قصة ليلى والذئب '),(30,4,1,'2025-08-14','اغنية الابجدية'),(31,1,1,'2025-08-23',NULL),(32,2,1,'2025-08-23',NULL),(33,3,1,'2025-08-23',NULL),(34,4,1,'2025-08-23',NULL),(35,1,1,'2025-08-22',NULL),(36,2,1,'2025-08-22',NULL),(37,3,1,'2025-08-22',NULL),(38,4,1,'2025-08-22',NULL),(39,1,1,'2025-08-21',NULL),(40,2,1,'2025-08-21',NULL),(41,3,1,'2025-08-21',NULL),(42,4,1,'2025-08-21',NULL),(43,1,1,'2025-08-20',NULL),(44,2,1,'2025-08-20',NULL),(45,3,1,'2025-08-20',NULL),(46,4,1,'2025-08-20',NULL),(51,1,1,'2025-08-18',NULL),(52,2,1,'2025-08-18',NULL),(53,3,1,'2025-08-18',NULL),(54,4,1,'2025-08-18',NULL),(55,1,1,'2025-08-17',NULL),(56,2,1,'2025-08-17',NULL),(57,3,1,'2025-08-17',NULL),(58,4,1,'2025-08-17',NULL),(59,1,2,'2025-08-23',NULL),(60,2,2,'2025-08-23',NULL),(61,3,2,'2025-08-23',NULL),(62,4,2,'2025-08-23',NULL),(63,1,2,'2025-08-22',NULL),(64,2,2,'2025-08-22',NULL),(65,3,2,'2025-08-22',NULL),(66,4,2,'2025-08-22',NULL),(67,1,2,'2025-08-21',NULL),(68,2,2,'2025-08-21',NULL),(69,3,2,'2025-08-21',NULL),(70,4,2,'2025-08-21',NULL),(71,1,2,'2025-08-20',NULL),(72,2,2,'2025-08-20',NULL),(73,3,2,'2025-08-20',NULL),(74,4,2,'2025-08-20',NULL),(286,1,1,'2025-08-19','نشاط رسم الحواس الخمسة تم إعطاؤه للطلاب بعد درس الحواس '),(287,2,1,'2025-08-19','تم اعطاء الطلاب قصة قصيرة بعد الدرس تحكي عن فوائد الحواس الخمسة وتعلمهم التفريق بينهم ');
/*!40000 ALTER TABLE `daily_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `daily_activity_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `path` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `description` text,
  `type` enum('main','english') NOT NULL DEFAULT 'main',
  PRIMARY KEY (`id`),
  KEY `fk_files_classes_idx` (`class_id`),
  KEY `fk_files_daily_activities_idx` (`daily_activity_id`),
  CONSTRAINT `fk_files_classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_files_daily_activities` FOREIGN KEY (`daily_activity_id`) REFERENCES `daily_activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES (2,1,NULL,'style admin.txt','uploads\\1752776871331-style admin.txt','2025-07-16','تجربه2','main'),(14,1,NULL,'index.html','uploads\\1752816161796-index.html','2025-07-18','م','main'),(15,1,NULL,'style.css','uploads\\1752816308881-style.css','2025-07-18','','main'),(23,1,NULL,'صفحة الادمن.txt','uploads\\1752818755037-صفحة الادمن.txt','2025-07-18','','main'),(24,1,NULL,'الملفات.txt','uploads\\1752819513548-الملفات.txt','2025-07-18','','english'),(26,1,NULL,'student.ejs','uploads\\1753902472195-student.ejs','2025-07-30','ملف الوظيفه','main'),(28,1,28,'1753903213917.png','uploads\\1755188802552-1753903213917.png','2025-08-14','صورة','main'),(30,1,55,'تلوين الحيوانات.pdf','uploads\\1755427334700-تلوين الحيوانات.pdf','2025-08-17','ملف يحتوي على ورقة تلوين القطة التي تم إعطاؤها في الصف اليوم','main');
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grade_levels`
--

DROP TABLE IF EXISTS `grade_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grade_levels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `min_age` int DEFAULT NULL,
  `max_age` int DEFAULT NULL,
  `level_order` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `level_order_UNIQUE` (`level_order`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade_levels`
--

LOCK TABLES `grade_levels` WRITE;
/*!40000 ALTER TABLE `grade_levels` DISABLE KEYS */;
INSERT INTO `grade_levels` VALUES (1,'مرحلة أولى','في هذه المرحلة، نوفّر بيئة دافئة وآمنة تساعد الطفل على التأقلم مع الجو المدرسي. نركّز على تطوير المهارات الحسية والحركية، وتعزيز الشعور بالاستقلال والثقة من خلال اللعب الموجه والأنشطة الاجتماعية التي تزرع بذور الفضول والاستكشاف.',2,4,1),(2,'مرحلة ثانية','هنا يبدأ الطفل بالتعبير عن نفسه والتفاعل مع محيطه بشكل أعمق. نقدم برامج تدمج التعليم باللعب لتنمية مهارات التواصل، التمييز البصري والسمعي، والتعرف على الحروف والأرقام بأساليب ممتعة ومحفّزة، مع التركيز على تنمية الإبداع والتعاون.',3,5,2),(3,'مرحلة ثالثة','نجهّز الطفل للانتقال السلس إلى المرحلة الابتدائية من خلال مناهج تركز على القراءة المبكرة، الكتابة، والمهارات الحسابية. ندمج الأنشطة التعليمية بالتجريب والمشاركة، وننمي لديه حبّ التعلم، المسؤولية، والانضباط الذاتي بطريقة مشوّقة ومحببة.',4,6,3);
/*!40000 ALTER TABLE `grade_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guardians`
--

DROP TABLE IF EXISTS `guardians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guardians` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guardians`
--

LOCK TABLES `guardians` WRITE;
/*!40000 ALTER TABLE `guardians` DISABLE KEYS */;
INSERT INTO `guardians` VALUES (1,'ليان','بدر','03948348',NULL,NULL),(2,'أحمد','الخطيب','0991111111','ahmad1@example.com',NULL),(3,'محمد','الرفاعي','0991111112','mohammad2@example.com',NULL),(4,'خالد','العنزي','0991111113','khaled3@example.com',NULL),(5,'سامي','الدسوقي','0991111114','sami4@example.com',NULL),(6,'يوسف','الصالح','0991111115','yousef5@example.com',NULL),(7,'ماهر','الحموي','0991111116','maher6@example.com',NULL),(8,'رامي','الحايك','0991111117','rami7@example.com',NULL),(9,'حسام','العابد','0991111118','hossam8@example.com',NULL),(10,'عماد','السرحان','0991111119','emad9@example.com',NULL),(11,'فارس','الطراونة','0991111120','fares10@example.com',NULL),(12,'ليلى','الشريف','0991111121','laila11@example.com',NULL),(13,'منى','العساف','0991111122','mona12@example.com',NULL),(14,'إيمان','الخوالدة','0991111123','eman13@example.com',NULL),(15,'نسرين','العكاوي','0991111124','nasreen14@example.com',NULL),(16,'هبة','الشامي','0991111125','heba15@example.com',NULL),(17,'سعاد','الحمصي','0991111126','souad16@example.com',NULL),(18,'منى','العطار','0991111127','mona17@example.com',NULL),(19,'جمال','السيوفي','0991111128','jamal18@example.com',NULL),(20,'زياد','الحوراني','0991111129','ziad19@example.com',NULL),(21,'رائد','الزعبي','0991111130','raed20@example.com',NULL);
/*!40000 ALTER TABLE `guardians` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guardians_students`
--

DROP TABLE IF EXISTS `guardians_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guardians_students` (
  `guardian_id` int NOT NULL,
  `student_id` int NOT NULL,
  `relation` varchar(45) NOT NULL,
  PRIMARY KEY (`guardian_id`,`student_id`),
  KEY `fk_parents_students_students_idx` (`student_id`),
  CONSTRAINT `fk_guardians_students_guardians` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`),
  CONSTRAINT `fk_guardians_students_students` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guardians_students`
--

LOCK TABLES `guardians_students` WRITE;
/*!40000 ALTER TABLE `guardians_students` DISABLE KEYS */;
INSERT INTO `guardians_students` VALUES (1,142,'parent');
/*!40000 ALTER TABLE `guardians_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `content` text,
  `date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_notes_students_idx` (`student_id`),
  CONSTRAINT `fk_notes_students` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES (1,1,'كانت الطالبه نشيطة اليوم','2025-06-10'),(2,2,'هذا اول غياب للطالبه يرجى التبرير','2025-06-10'),(3,1,'الطالبة لم تركز اليوم في الدروس يرجى الانتباه','2025-06-21'),(4,2,'الطالبه تغيب لاول مره اليوم','2025-06-21'),(5,1,'الطالبة كانت نشيطة اليوم','2025-07-15'),(6,2,'يرجى تبرير الغياب الاخير للطالبة','2025-07-15');
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `class_id` int NOT NULL,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('female','male') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_students_users_idx` (`user_id`),
  KEY `fk_students_classes_idx` (`class_id`),
  CONSTRAINT `fk_students_classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_students_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=182 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,6,1,'هدى','أحمد','2020-06-04','female'),(2,3,1,'ريم','الراجح','2020-01-27','female'),(3,5,2,'نور','محمد','2020-01-27','female'),(25,NULL,1,'ليان','حسن','2021-09-10','female'),(26,NULL,1,'علي','صالح','2021-12-05','male'),(27,NULL,1,'سارة','ناصر','2022-02-20','female'),(28,NULL,1,'آدم','خليل','2021-11-15','male'),(29,NULL,1,'مايا','فهد','2022-04-10','female'),(30,NULL,1,'يوسف','طارق','2021-08-25','male'),(31,NULL,1,'هنا','جابر','2022-01-30','female'),(32,NULL,1,'عمر','رامي','2021-10-12','male'),(33,NULL,1,'نور','سامي','2022-03-05','female'),(34,NULL,1,'زيد','عثمان','2021-09-20','male'),(35,NULL,1,'لين','محمود','2022-05-01','female'),(36,NULL,1,'خالد','فارس','2021-12-28','male'),(37,NULL,1,'آية','رانيا','2022-06-15','female'),(38,NULL,1,'إبراهيم','حسين','2021-11-08','male'),(39,NULL,1,'سلمى','طه','2022-04-22','female'),(40,NULL,1,'عثمان','كريم','2021-08-30','male'),(41,NULL,1,'ليلى','عدنان','2022-02-14','female'),(42,NULL,1,'رامي','صلاح','2021-10-05','male'),(43,NULL,1,'دينا','فراس','2022-01-18','female'),(44,NULL,1,'بلال','أمير','2021-09-28','male'),(45,NULL,2,'مريم','شريف','2020-09-14','female'),(46,NULL,2,'حسن','أكرم','2019-11-20','male'),(47,NULL,2,'جنى','إبراهيم','2021-02-08','female'),(48,NULL,2,'كريم','إياد','2020-10-25','male'),(49,NULL,2,'رهف','أحمد','2019-03-12','female'),(50,NULL,2,'سامي','مراد','2018-12-30','male'),(51,NULL,2,'لينا','جواد','2020-01-22','female'),(52,NULL,2,'زيد','مروان','2019-09-05','male'),(53,NULL,2,'هبة','فؤاد','2021-04-28','female'),(54,NULL,2,'ياسين','رامز','2019-11-10','male'),(55,NULL,2,'سندس','أمجد','2020-05-15','female'),(56,NULL,2,'مازن','عادل','2018-08-18','male'),(57,NULL,2,'هدى','تامر','2020-02-25','female'),(58,NULL,2,'إيهاب','وائل','2019-10-02','male'),(59,NULL,2,'فرح','خالد','2020-03-19','female'),(60,NULL,2,'نادر','عماد','2019-12-12','male'),(61,NULL,2,'جود','رامي','2021-01-05','female'),(62,NULL,2,'أيهم','قاسم','2019-09-27','male'),(63,NULL,2,'صفاء','مأمون','2020-04-03','female'),(64,NULL,2,'أدهم','ياسر','2019-11-22','male'),(65,NULL,3,'ليان','مروان','2022-01-15','female'),(66,NULL,3,'رائد','حسام','2021-09-20','male'),(67,NULL,3,'سارة','علاء','2022-04-05','female'),(68,NULL,3,'مازن','حمدي','2021-11-30','male'),(69,NULL,3,'نور','سالم','2022-06-18','female'),(70,NULL,3,'إياد','باسل','2021-10-12','male'),(71,NULL,3,'تالا','محمود','2022-02-27','female'),(72,NULL,3,'قصي','رامي','2021-12-08','male'),(73,NULL,3,'هناء','حسين','2022-03-22','female'),(74,NULL,3,'عمر','جمال','2021-09-28','male'),(75,NULL,3,'لين','فادي','2022-05-14','female'),(76,NULL,3,'خالد','منير','2021-11-05','male'),(77,NULL,3,'سلمى','شاكر','2022-01-30','female'),(78,NULL,3,'يزن','هيثم','2021-10-18','male'),(79,NULL,3,'رنا','فارس','2022-07-09','female'),(80,NULL,3,'عبدالله','كمال','2021-12-25','male'),(81,NULL,3,'جنى','إيهاب','2022-02-11','female'),(82,NULL,3,'حمزة','ليث','2021-09-07','male'),(83,NULL,3,'فرح','أمين','2022-04-28','female'),(84,NULL,3,'يوسف','وائل','2021-11-16','male'),(85,NULL,4,'مها','أكرم','2021-01-10','female'),(86,NULL,4,'فارس','حسن','2020-09-18','male'),(87,NULL,4,'ليان','محمود','2021-05-03','female'),(88,NULL,4,'آدم','إياد','2020-11-22','male'),(89,NULL,4,'سارة','فؤاد','2021-07-15','female'),(90,NULL,4,'قصي','رامي','2021-03-27','male'),(91,NULL,4,'جود','سامر','2020-12-09','female'),(92,NULL,4,'إياد','منير','2021-04-21','male'),(93,NULL,4,'تالين','عماد','2020-08-30','female'),(94,NULL,4,'كرم','جابر','2021-06-05','male'),(95,NULL,4,'سلمى','وائل','2020-09-25','female'),(96,NULL,4,'ياسين','طه','2021-02-11','male'),(97,NULL,4,'هبة','شاكر','2020-10-07','female'),(98,NULL,4,'رامي','أمين','2021-05-28','male'),(99,NULL,4,'نور','باسل','2020-12-19','female'),(100,NULL,4,'أحمد','جمال','2021-07-01','male'),(101,NULL,5,'مريم','شريف','2020-10-14','female'),(102,NULL,5,'أيهم','عادل','2021-01-19','male'),(103,NULL,5,'رهف','خالد','2020-11-05','female'),(104,NULL,5,'زيد','فارس','2021-06-12','male'),(105,NULL,5,'هناء','حسام','2020-09-03','female'),(106,NULL,5,'إيهاب','مراد','2021-02-27','male'),(107,NULL,5,'فرح','رامي','2020-12-20','female'),(108,NULL,5,'عمر','سامي','2021-05-15','male'),(109,NULL,5,'جنى','هيثم','2020-08-29','female'),(110,NULL,5,'باسل','ناصر','2021-04-06','male'),(111,NULL,5,'لين','علاء','2020-10-22','female'),(112,NULL,5,'كرم','مأمون','2021-07-09','male'),(113,NULL,5,'سندس','رامز','2020-09-16','female'),(114,NULL,5,'مازن','يوسف','2021-03-11','male'),(115,NULL,5,'جود','فادي','2020-11-28','female'),(116,NULL,6,'ليلى','وائل','2021-01-22','female'),(117,NULL,6,'خالد','فؤاد','2020-10-30','male'),(118,NULL,6,'سارة','جواد','2021-05-07','female'),(119,NULL,6,'أنس','طارق','2020-09-11','male'),(120,NULL,6,'نور','حسن','2021-02-16','female'),(121,NULL,6,'إبراهيم','مروان','2020-12-27','male'),(122,NULL,6,'هيا','علي','2021-06-20','female'),(123,NULL,6,'بلال','هيثم','2020-08-25','male'),(124,NULL,6,'سلمى','كمال','2021-04-13','female'),(125,NULL,6,'أدهم','جمال','2020-11-02','male'),(126,NULL,6,'جنان','رامي','2021-03-25','female'),(127,NULL,6,'حسن','شاكر','2020-09-19','male'),(128,NULL,6,'رنا','عماد','2021-07-03','female'),(129,NULL,6,'إياد','ليث','2020-10-09','male'),(130,NULL,6,'سندس','علاء','2021-02-01','female'),(131,NULL,6,'فارس','جبر','2020-12-15','male'),(132,NULL,6,'تالا','مراد','2021-05-19','female'),(133,NULL,6,'حمزة','بكر','2020-08-31','male'),(134,NULL,7,'ليان','سامي','2020-01-12','female'),(135,NULL,7,'فارس','خالد','2019-09-18','male'),(136,NULL,7,'مها','رامي','2020-03-05','female'),(137,NULL,7,'آدم','إياد','2019-11-22','male'),(138,NULL,7,'سارة','فؤاد','2020-07-15','female'),(139,NULL,7,'قصي','منير','2020-02-27','male'),(140,NULL,7,'جود','سامر','2019-12-09','female'),(141,NULL,7,'إياد','عماد','2020-04-21','male'),(142,NULL,7,'تالا','جمال','2019-08-30','female'),(143,NULL,7,'كرم','جابر','2020-06-05','male'),(144,NULL,7,'سلمى','وائل','2019-09-25','female'),(145,NULL,7,'ياسين','طارق','2020-02-11','male'),(146,NULL,7,'هبة','شاكر','2019-10-07','female'),(147,NULL,7,'رامي','أمين','2020-05-28','male'),(148,NULL,7,'نور','باسل','2019-12-19','female'),(149,NULL,7,'أحمد','جمال','2020-07-01','male'),(150,NULL,7,'جنى','حسين','2020-03-18','female'),(151,NULL,7,'بلال','هيثم','2019-11-10','male'),(152,NULL,8,'مريم','شريف','2020-02-14','female'),(153,NULL,8,'أيهم','عادل','2019-10-19','male'),(154,NULL,8,'رهف','خالد','2020-01-05','female'),(155,NULL,8,'زيد','فارس','2019-11-12','male'),(156,NULL,8,'هناء','حسام','2020-03-18','female'),(157,NULL,8,'إيهاب','مراد','2019-09-03','male'),(158,NULL,8,'فرح','رامي','2020-05-14','female'),(159,NULL,8,'عمر','سامي','2019-12-27','male'),(160,NULL,8,'جنى','هيثم','2020-06-29','female'),(161,NULL,8,'باسل','ناصر','2019-08-22','male'),(162,NULL,8,'لين','علاء','2020-04-06','female'),(163,NULL,8,'كرم','مأمون','2019-10-09','male'),(164,NULL,8,'سندس','رامز','2020-07-19','female'),(165,NULL,8,'مازن','يوسف','2019-09-30','male'),(166,NULL,9,'ليلى','وائل','2020-01-22','female'),(167,NULL,9,'خالد','فؤاد','2019-10-30','male'),(168,NULL,9,'سارة','جواد','2020-05-07','female'),(169,NULL,9,'أنس','طارق','2019-09-11','male'),(170,NULL,9,'نور','حسن','2020-02-16','female'),(171,NULL,9,'إبراهيم','مروان','2019-12-27','male'),(172,NULL,9,'هيا','علي','2020-06-20','female'),(173,NULL,9,'بلال','هيثم','2019-08-25','male'),(174,NULL,9,'سلمى','كمال','2020-04-13','female'),(175,NULL,9,'أدهم','جمال','2019-11-02','male'),(176,NULL,9,'جنان','رامي','2020-03-25','female'),(177,NULL,9,'حسن','شاكر','2019-09-19','male'),(178,NULL,9,'رنا','عماد','2020-07-03','female'),(179,NULL,9,'إياد','ليث','2019-10-09','male'),(180,NULL,9,'سندس','علاء','2020-02-01','female'),(181,NULL,9,'حمزة','بكر','2019-08-31','male');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `certificate` varchar(255) DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `role` enum('main','english') NOT NULL DEFAULT 'main',
  PRIMARY KEY (`id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `fk_teachers_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,2,'سنا','أحمد','خبرة 6 سنوات في التدريس، تتميز بأسلوب تعليمي هادئ وصبور','بكالوريوس مناهج تعليم','34534','main'),(2,9,'لين','محمود','خبرة 5 سنوات، قدرة عالية على التواصل مع الأطفال وأولياء الأمور','بكالوريوس في رياض الأطفال','099237642','main'),(3,12,'لانا','محمد','خبرة 6 سنوات، تهتم بتطوير قدرات الأطفال بثقة وتشجيع','بكالوريوس تعليم لغة إنجليزية','78657645','english'),(7,13,'هديل','محمد','خبرة 7 سنوات، تجيد تنظيم الوقت وإدارة الصف بكفاءة	','بكالوريوس في رياض الأطفال','06938753','main'),(8,NULL,'فاطمة','عبد الله','خبرة 4 سنوات، تحرص على تطوير مهارات الأطفال الاجتماعية	','بكالوريوس في رياض الأطفال','898879','main'),(13,NULL,'هبه','احمد','خبرة 8 سنوات، تتميز بالالتزام والانضباط في العمل','بكالوريوس في رياض الأطفال','','main'),(15,NULL,'سارة','خالد','خبرة 5 سنوات، تهتم بخلق بيئة تعليمية مريحة وداعمة','بكالوريوس في رياض الأطفال','3242342','main'),(16,NULL,'براءه','حمد','تعتمد أسلوباً تفاعلياً يدمج بين التعلم واللعب،','بكالوريوس في رياض الأطفال','','main'),(17,NULL,'هلا','حمود','حريصة على متابعة التطور الفردي لكل طفل','دبلوم تعليم مبكر','','main'),(18,NULL,'بتول','عبد الغني','لديها خبرة سنتين في تدريس الأطفال والتعامل معهم تجيد التعامل مع مختلف شخصيات الأطفال','بكالوريوس معلم صف','89435784','main'),(20,NULL,'عبير','سليم','خبرة 5 سنوات في تعليم الأطفال، تتميز بمهارات تواصل ممتازة','بكالوريوس لغة إنجليزية','3294802','english'),(21,NULL,'رغد','محمد','لديها خبرة سنتين في تدريس الأطفال والتعامل معهم','دبلوم تعليم مبكر','032847283','main');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') NOT NULL DEFAULT 'student',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$.D/6szFwfkdSvUjXtIXC..8GqsM8y6Dh35SWvMdShhKzygBP9/0Ou','admin'),(2,'sana','$2b$10$.D/6szFwfkdSvUjXtIXC..8GqsM8y6Dh35SWvMdShhKzygBP9/0Ou','teacher'),(3,'reem','$2b$10$.D/6szFwfkdSvUjXtIXC..8GqsM8y6Dh35SWvMdShhKzygBP9/0Ou','student'),(5,'noor','$2b$10$HK4/dsfz.J1RkFKtPT.c7uAbE62UkrNzK.7zLwIYPpNjK4ET3BSFK','student'),(6,'huda','$2b$10$.D/6szFwfkdSvUjXtIXC..8GqsM8y6Dh35SWvMdShhKzygBP9/0Ou','student'),(9,'leen','$2b$10$V5WZnTqOwUv58PRr7yomQOm/QHz4sQopYIT4qIWt5Yhaq949B/Qv.','teacher'),(12,'lana','$2b$10$CKNGukNfihJmmfupASiRXOFpqei0QGroGiwckUxNuHRd6GOYQZYmS','teacher'),(13,'hadeel','$2b$10$my0ijWuOOPOtYtBk5BVDd.lUeFurXQdTxtmgvAMH.pG0srNn9MxtC','teacher');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-19 19:14:09
