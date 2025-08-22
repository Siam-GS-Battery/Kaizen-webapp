# Data Dictionary - Kaizen Web Application

## Overview
This document provides detailed specifications for all database tables and fields in the Kaizen Web Application. Each table includes field definitions, data types, constraints, and business rules.

---

## 1. USERS Table
**Purpose**: Store employee information and user account details

| Field Name | Data Type | Size | Constraints | Description | Example |
|------------|-----------|------|-------------|-------------|---------|
| user_id | UUID | - | PRIMARY KEY, NOT NULL | Unique identifier for user | `123e4567-e89b-12d3-a456-426614174000` |
| employee_id | VARCHAR | 20 | UNIQUE, NOT NULL | รหัสพนักงาน | `241303` |
| first_name | VARCHAR | 100 | NOT NULL | ชื่อ | `ภัณฑิรา` |
| last_name | VARCHAR | 100 | NOT NULL | นามสกุล | `ศรีพิมพ์เมือง` |
| department | VARCHAR | 20 | NOT NULL | แผนก | `IT & DM` |
| five_s_area | VARCHAR | 100 | NOT NULL | ชื่อกลุ่ม 5ส | `5ส ณ บางปูใหม่` |
| project_area | VARCHAR | 100 | NOT NULL | พื้นที่จัดทำโครงการ | `IT` |
| role | ENUM | - | NOT NULL | บทบาทผู้ใช้งาน | `Admin`, `Manager`, `Supervisor`, `User` |
| created_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | วันที่สร้างข้อมูล | `2025-01-15 10:30:00` |
| updated_at | TIMESTAMP | - | ON UPDATE CURRENT_TIMESTAMP | วันที่แก้ไขล่าสุด | `2025-01-20 14:15:30` |
| is_active | BOOLEAN | - | DEFAULT TRUE | สถานะใช้งาน | `true`/`false` |

**Business Rules:**
- employee_id ต้องไม่ซ้ำกันในระบบ
- role กำหนดสิทธิ์การเข้าถึงระบบ
- เฉพาะ Admin, Manager, Supervisor เท่านั้นที่สามารถ login ได้

---

## 2. SESSIONS Table
**Purpose**: Manage user login sessions and security

| Field Name | Data Type | Size | Constraints | Description | Example |
|------------|-----------|------|-------------|-------------|---------|
| session_id | VARCHAR | 255 | PRIMARY KEY, NOT NULL | รหัส session | `sess_123abc456def` |
| user_id | UUID | - | FOREIGN KEY, NOT NULL | รหัสผู้ใช้ | `123e4567-e89b-12d3-a456-426614174000` |
| login_time | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | เวลาเข้าสู่ระบบ | `2025-01-15 09:00:00` |
| last_activity | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | กิจกรรมล่าสุด | `2025-01-15 09:30:00` |
| logout_time | TIMESTAMP | - | NULL | เวลาออกจากระบบ | `2025-01-15 17:00:00` |
| ip_address | VARCHAR | 45 | NULL | IP Address | `192.168.1.100` |
| is_active | BOOLEAN | - | DEFAULT TRUE | สถานะเซสชัน | `true`/`false` |

**Business Rules:**
- Session timeout หลังจากไม่มีกิจกรรม 30 นาที
- ระบบจะ auto-logout เมื่อ session หมดอายุ
- Track IP address เพื่อความปลอดภัย

---

## 3. PROJECTS Table
**Purpose**: Store project form data from Genba and Suggestion forms

| Field Name | Data Type | Size | Constraints | Description | Example |
|------------|-----------|------|-------------|-------------|---------|
| project_id | UUID | - | PRIMARY KEY, NOT NULL | รหัสโครงการ | `proj_123e4567-e89b-12d3` |
| employee_id | VARCHAR | 20 | FOREIGN KEY, NOT NULL | รหัสพนักงานผู้สร้าง | `241303` |
| project_name | VARCHAR | 255 | NOT NULL | ชื่อโครงการ | `ปรับปรุงกระบวนการจัดเก็บสินค้า` |
| project_start_date | DATE | - | NOT NULL | วันที่เริ่มโครงการ | `2025-06-01` |
| project_end_date | DATE | - | NOT NULL | วันที่จบโครงการ | `2025-06-15` |
| problems_encountered | TEXT | - | NOT NULL | ปัญหาที่เจอ | `พบปัญหาการจัดเก็บสินค้าไม่เป็นระบบ...` |
| solution_approach | TEXT | - | NOT NULL | แนวทางแก้ไข | `ใช้หลัก 5ส ในการจัดระเบียบพื้นที่...` |
| standard_certification | TEXT | - | NULL | การรับรองมาตรฐาน | `ISO 9001:2015` |
| results_achieved | TEXT | - | NOT NULL | ผลลัพธ์ที่ได้ | `ลดเวลาในการค้นหาสินค้าได้ 50%...` |
| five_s_type | ENUM | - | NOT NULL | ส. ที่ใช้ในการปรับปรุง | `ส1`, `ส2`, `ส3`, `ส4`, `ส5` |
| improvement_topic | ENUM | - | NOT NULL | หัวข้อที่ปรับปรุง | `Safety`, `Env`, `Quality`, `Cost`, `Delivery` |
| sgs_smart | ENUM | - | NOT NULL | SGS Smart | `People`, `Factory` |
| sgs_strong | ENUM | - | NOT NULL | SGS Strong | `Energy_3R`, `Workplace` |
| sgs_green | ENUM | - | NOT NULL | SGS Green | `Teamwork`, `Branding` |
| form_type | ENUM | - | NOT NULL | ประเภทฟอร์ม | `genba`, `suggestion`, `best_kaizen` |
| created_date | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | วันที่สร้าง | `2025-06-19 10:00:00` |
| submitted_date | TIMESTAMP | - | NULL | วันที่ส่ง | `2025-06-19 15:30:00` |
| created_by | VARCHAR | 20 | FOREIGN KEY, NOT NULL | ผู้สร้าง | `241303` |

**Business Rules:**
- project_end_date ต้องมากกว่า project_start_date
- Genba form ต้องมีรูป before และ after
- Suggestion form มีรูป before อย่างเดียว
- Best Kaizen คือโครงการที่ได้รับการอนุมัติแล้ว

---

## 4. PROJECT_IMAGES Table
**Purpose**: Store project images with AWS S3 integration

| Field Name | Data Type | Size | Constraints | Description | Example |
|------------|-----------|------|-------------|-------------|---------|
| image_id | UUID | - | PRIMARY KEY, NOT NULL | รหัสรูปภาพ | `img_123e4567-e89b-12d3` |
| project_id | UUID | - | FOREIGN KEY, NOT NULL | รหัสโครงการ | `proj_123e4567-e89b-12d3` |
| image_type | ENUM | - | NOT NULL | ประเภทรูปภาพ | `before`, `after` |
| file_name | VARCHAR | 255 | NOT NULL | ชื่อไฟล์ | `warehouse_before_001.jpg` |
| file_path | VARCHAR | 500 | NOT NULL | เส้นทางไฟล์ | `/projects/before/proj_123/img_456.jpg` |
| s3_key | VARCHAR | 500 | NOT NULL | AWS S3 Key | `kaizen-images/projects/before/proj_123/img_456.jpg` |
| file_size | BIGINT | - | NOT NULL | ขนาดไฟล์ (bytes) | `2048576` |
| mime_type | VARCHAR | 100 | NOT NULL | ประเภทไฟล์ | `image/jpeg`, `image/png` |
| uploaded_at | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | วันที่อัปโหลด | `2025-06-19 11:15:00` |

**Business Rules:**
- รองรับเฉพาะ JPEG และ PNG
- ขนาดไฟล์สูงสุด 5 MB
- Genba form: ต้องมี before และ after
- Suggestion form: ต้องมี before อย่างเดียว

---

## 5. PROJECT_STATUS_TRANSITIONS Table
**Purpose**: Track all status changes for complete audit trail

| Field Name | Data Type | Size | Constraints | Description | Example |
|------------|-----------|------|-------------|-------------|---------|
| transition_id | UUID | - | PRIMARY KEY, NOT NULL | รหัสการเปลี่ยนสถานะ | `trans_123e4567-e89b` |
| project_id | UUID | - | FOREIGN KEY, NOT NULL | รหัสโครงการ | `proj_123e4567-e89b-12d3` |
| status_from | ENUM | - | NULL | สถานะเดิม | `DRAFT`, `WAITING`, `EDIT`, `APPROVED`, `REJECTED`, `DELETED` |
| status_to | ENUM | - | NOT NULL | สถานะใหม่ | `DRAFT`, `WAITING`, `EDIT`, `APPROVED`, `REJECTED`, `DELETED` |
| changed_by | VARCHAR | 20 | FOREIGN KEY, NOT NULL | ผู้เปลี่ยนสถานะ | `251307` |
| comment | TEXT | - | NULL | หมายเหตุ | `ต้องปรับปรุงรายละเอียดผลลัพธ์` |
| transition_date | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | วันที่เปลี่ยนสถานะ | `2025-06-20 09:30:00` |

**Business Rules:**
- status_from เป็น NULL สำหรับการสร้างโครงการใหม่
- บันทึกทุกการเปลี่ยนแปลงสถานะ
- comment จำเป็นสำหรับ REJECTED และ EDIT status

---

## 6. PROJECT_HISTORY Table
**Purpose**: Maintain complete history of all project activities

| Field Name | Data Type | Size | Constraints | Description | Example |
|------------|-----------|------|-------------|-------------|---------|
| history_id | UUID | - | PRIMARY KEY, NOT NULL | รหัสประวัติ | `hist_123e4567-e89b` |
| project_id | UUID | - | FOREIGN KEY, NOT NULL | รหัสโครงการ | `proj_123e4567-e89b-12d3` |
| employee_id | VARCHAR | 20 | FOREIGN KEY, NOT NULL | รหัสพนักงาน | `241303` |
| action | ENUM | - | NOT NULL | การกระทำ | `CREATED`, `SUBMITTED`, `APPROVED`, `REJECTED`, `EDITED`, `DELETED` |
| description | TEXT | - | NULL | รายละเอียด | `โครงการได้รับการอนุมัติจาก Manager` |
| action_date | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | วันที่ทำการ | `2025-06-20 10:00:00` |
| performed_by | VARCHAR | 20 | FOREIGN KEY, NOT NULL | ผู้ทำการ | `261401` |

**Business Rules:**
- บันทึกทุกการกระทำที่เกี่ยวข้องกับโครงการ
- ใช้สำหรับ audit trail และรายงาน
- employee_id คือเจ้าของโครงการ, performed_by คือผู้ทำการ

---

## 7. DEPARTMENTS Table
**Purpose**: Master data for departments

| Field Name | Data Type | Size | Constraints | Description | Example |
|------------|-----------|------|-------------|-------------|---------|
| department_id | UUID | - | PRIMARY KEY, NOT NULL | รหัสแผนก | `dept_123e4567-e89b` |
| department_code | VARCHAR | 20 | UNIQUE, NOT NULL | รหัสแผนก | `IT_DM` |
| department_name | VARCHAR | 100 | NOT NULL | ชื่อแผนก | `IT & DM` |
| description | TEXT | - | NULL | รายละเอียด | `Information Technology & Digital Marketing` |
| is_active | BOOLEAN | - | DEFAULT TRUE | สถานะใช้งาน | `true`/`false` |

---

## 8. FIVE_S_GROUPS Table
**Purpose**: Master data for 5S groups

| Field Name | Data Type | Size | Constraints | Description | Example |
|------------|-----------|------|-------------|-------------|---------|
| group_id | UUID | - | PRIMARY KEY, NOT NULL | รหัสกลุ่ม | `group_123e4567-e89b` |
| group_name | VARCHAR | 100 | UNIQUE, NOT NULL | ชื่อกลุ่ม 5ส | `5ส ณ บางปูใหม่` |
| description | TEXT | - | NULL | รายละเอียด | `กลุ่ม 5ส ประจำสำนักงานบางปูใหม่` |
| location | VARCHAR | 200 | - | สถานที่ | `อาคารสำนักงานบางปู` |
| is_active | BOOLEAN | - | DEFAULT TRUE | สถานะใช้งาน | `true`/`false` |

---

## 9. PROJECT_AREAS Table
**Purpose**: Master data for project areas

| Field Name | Data Type | Size | Constraints | Description | Example |
|------------|-----------|------|-------------|-------------|---------|
| area_id | UUID | - | PRIMARY KEY, NOT NULL | รหัสพื้นที่ | `area_123e4567-e89b` |
| area_name | VARCHAR | 100 | UNIQUE, NOT NULL | ชื่อพื้นที่โครงการ | `IT` |
| department_id | UUID | - | FOREIGN KEY, NULL | รหัสแผนก | `dept_123e4567-e89b` |
| description | TEXT | - | NULL | รายละเอียด | `พื้นที่โครงการฝ่าย IT` |
| is_active | BOOLEAN | - | DEFAULT TRUE | สถานะใช้งาน | `true`/`false` |

---

## 10. ADMIN_USERS Table
**Purpose**: Manage admin role assignments

| Field Name | Data Type | Size | Constraints | Description | Example |
|------------|-----------|------|-------------|-------------|---------|
| admin_id | UUID | - | PRIMARY KEY, NOT NULL | รหัส admin | `admin_123e4567-e89b` |
| user_id | UUID | - | FOREIGN KEY, NOT NULL | รหัสผู้ใช้ | `123e4567-e89b-12d3-a456-426614174000` |
| assigned_by | UUID | - | FOREIGN KEY, NOT NULL | ผู้มอบหมาย | `456e7890-f12c-34e5-b678-901234567890` |
| assigned_date | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | วันที่มอบหมาย | `2025-01-15 10:00:00` |
| is_active | BOOLEAN | - | DEFAULT TRUE | สถานะใช้งาน | `true`/`false` |

**Business Rules:**
- เฉพาะ Admin เท่านั้นที่สามารถมอบหมาย Admin ใหม่ได้
- ระบบต้องมี Admin อย่างน้อย 1 คนเสมอ
- การยกเลิก Admin ต้องได้รับการอนุมัติ

---

## Data Types Reference

### ENUM Values

**role**: `Admin`, `Manager`, `Supervisor`, `User`

**five_s_type**: `ส1`, `ส2`, `ส3`, `ส4`, `ส5`

**improvement_topic**: `Safety`, `Env`, `Quality`, `Cost`, `Delivery`

**sgs_smart**: `People`, `Factory`

**sgs_strong**: `Energy_3R`, `Workplace`

**sgs_green**: `Teamwork`, `Branding`

**form_type**: `genba`, `suggestion`, `best_kaizen`

**image_type**: `before`, `after`

**project_status**: `DRAFT`, `WAITING`, `EDIT`, `APPROVED`, `REJECTED`, `DELETED`

**history_action**: `CREATED`, `SUBMITTED`, `APPROVED`, `REJECTED`, `EDITED`, `DELETED`

### Constraints Summary

- **PRIMARY KEY**: Unique identifier for each record
- **FOREIGN KEY**: References to other tables
- **UNIQUE**: Must be unique across all records
- **NOT NULL**: Cannot be empty
- **DEFAULT**: Default value when not specified

### Index Recommendations

For optimal performance, create indexes on:
- All foreign key fields
- employee_id in USERS table
- project_id in related tables
- created_date, submitted_date in PROJECTS table
- transition_date in PROJECT_STATUS_TRANSITIONS table