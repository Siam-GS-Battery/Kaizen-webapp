# Database Update Required

## การเพิ่มฟิลด์ standard_certification (การรับรองมาตรฐาน)

กรุณาเพิ่มคอลัมน์ใหม่ในตาราง projects โดยทำตามขั้นตอนดังนี้:

### ขั้นตอนที่ 1: เข้าสู่ Supabase Dashboard
1. ไปที่ https://supabase.com/dashboard
2. เลือกโปรเจคของคุณ
3. ไปที่เมนู "SQL Editor" ทางด้านซ้าย

### ขั้นตอนที่ 2: รัน SQL Command
คัดลอกและรันคำสั่ง SQL ด้านล่างนี้:

```sql
-- เพิ่มคอลัมน์ standard_certification
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS standard_certification TEXT DEFAULT '-';

-- อัพเดทข้อมูลเก่าให้มีค่าเริ่มต้นเป็น '-'
UPDATE projects 
SET standard_certification = '-' 
WHERE standard_certification IS NULL;
```

### ขั้นตอนที่ 3: ตรวจสอบ
หลังจากรันคำสั่งแล้ว คุณสามารถตรวจสอบได้โดย:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name = 'standard_certification';
```

## การทำงานของระบบหลังอัพเดท

หลังจากเพิ่มคอลัมน์แล้ว:
- เมื่อผู้ใช้ไม่กรอกข้อมูลในช่อง "การรับรองมาตรฐาน" ระบบจะบันทึกเป็น "-" โดยอัตโนมัติ
- ข้อมูลเก่าทั้งหมดจะถูกอัพเดทให้มีค่าเป็น "-" 
- ทั้งฟอร์ม Genba และ Suggestion จะทำงานได้ตามปกติ

## หมายเหตุ
- การเปลี่ยนแปลงนี้จะมีผลทันทีหลังจากรัน SQL
- ไม่จำเป็นต้อง restart backend หรือ frontend