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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `absences`
--

LOCK TABLES `absences` WRITE;
/*!40000 ALTER TABLE `absences` DISABLE KEYS */;
INSERT INTO `absences` VALUES (1,1,'2025-06-03'),(2,2,'2025-06-10'),(3,1,'2025-06-21');
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES (1,'الرسم بالألوان','نشاط يتيح للأطفال التعبير عن مشاعرهم بالرسم باستخدام ألوان شمعية أو مائية.','fa-paint-brush','main'),(2,'القصة المصورة','قراءة قصة قصيرة مع عرض صور مشوّقة لمساعدة الطفل على فهم الأحداث.','fa-book-open','main');
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,1,1,'A1',3),(2,7,2,'B1',NULL),(4,2,1,'A2',3),(12,13,3,'c3',12),(13,8,2,'t',NULL);
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
  `description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_daily_activities_activities_idx` (`activity_id`),
  KEY `fk_daily_activities_classes_idx` (`class_id`),
  CONSTRAINT `fk_daily_activities_activities` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_daily_activities_classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_activities`
--

LOCK TABLES `daily_activities` WRITE;
/*!40000 ALTER TABLE `daily_activities` DISABLE KEYS */;
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
  `daily_activities_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `path` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `description` text,
  `type` enum('main','english') NOT NULL DEFAULT 'main',
  PRIMARY KEY (`id`),
  KEY `fk_files_classes_idx` (`class_id`),
  KEY `fk_files_daily_activities_idx` (`daily_activities_id`),
  CONSTRAINT `fk_files_classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_files_daily_activities` FOREIGN KEY (`daily_activities_id`) REFERENCES `daily_activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
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
INSERT INTO `grade_levels` VALUES (1,'مرحلة أولى','هذه المرحلة الاولى للاطفال',2,4,1),(2,'مرحلة ثانية','المرحلة الثانية للاطفال ',3,5,2),(3,'مرحلة ثالثة','المرحلة  الثالثة للاطفال ',4,6,3);
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
  `phone` varchar(10) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guardians`
--

LOCK TABLES `guardians` WRITE;
/*!40000 ALTER TABLE `guardians` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES (1,1,'كانت الطالبه نشيطة اليوم','2025-06-10'),(2,2,'هذا اول غياب للطالبه يرجى التبرير','2025-06-10'),(3,1,'الطالبة لم تركز اليوم في الدروس يرجى الانتباه','2025-06-21'),(4,2,'الطالبه تغيب لاول مره اليوم','2025-06-21');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,6,1,'هدى','أحمد','2020-06-04','female'),(2,3,1,'ريم','الراجح','2020-01-27','female'),(3,5,2,'نور','محمد','2020-01-27','female');
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
  `phone` varchar(10) DEFAULT NULL,
  `role` enum('main','english') NOT NULL DEFAULT 'main',
  PRIMARY KEY (`id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `fk_teachers_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,2,'سنا','أحمد','11111','main'),(2,9,'لين','محمود','','main'),(3,12,'لانا','محمد','56755466','english'),(7,NULL,'هديل','محمد','','main'),(8,NULL,'فاطمة','عبد الله','898879','main'),(12,NULL,'عبير','عبد الغني ','5674567','english'),(13,NULL,'هبه','احمد','','main');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$.D/6szFwfkdSvUjXtIXC..8GqsM8y6Dh35SWvMdShhKzygBP9/0Ou','admin'),(2,'sana','$2b$10$.D/6szFwfkdSvUjXtIXC..8GqsM8y6Dh35SWvMdShhKzygBP9/0Ou','teacher'),(3,'reem','$2b$10$.D/6szFwfkdSvUjXtIXC..8GqsM8y6Dh35SWvMdShhKzygBP9/0Ou','student'),(5,'noor','$2b$10$HK4/dsfz.J1RkFKtPT.c7uAbE62UkrNzK.7zLwIYPpNjK4ET3BSFK','student'),(6,'huda','$2b$10$.D/6szFwfkdSvUjXtIXC..8GqsM8y6Dh35SWvMdShhKzygBP9/0Ou','student'),(9,'leen','$2b$10$V5WZnTqOwUv58PRr7yomQOm/QHz4sQopYIT4qIWt5Yhaq949B/Qv.','teacher'),(12,'lana','$2b$10$CKNGukNfihJmmfupASiRXOFpqei0QGroGiwckUxNuHRd6GOYQZYmS','teacher');
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

-- Dump completed on 2025-07-15 10:29:31
