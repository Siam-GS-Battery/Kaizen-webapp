# คู่มือทดสอบฟังก์ชันรูปภาพ (Image Functionality Test Guide)

## ✅ สิ่งที่ได้ปรับปรุงแล้ว (Completed Improvements)

### 1. **EditForm.js (Task Daily - Edit Form)**
- ✅ เพิ่มระบบจัดการรูปภาพแบบครบวงจร
- ✅ รองรับการอัปโหลดรูปภาพใหม่
- ✅ รองรับการลบรูปภาพ
- ✅ รองรับการเปลี่ยนรูปภาพ
- ✅ แสดงปุ่มควบคุมบนรูปภาพ (ลบ/เปลี่ยน)
- ✅ เก็บสถานะการแก้ไขรูปภาพเพื่อป้องกันการสูญหาย

### 2. **Backend Storage Integration**
- ✅ ตรวจสอบแล้วว่า Supabase Storage Bucket "project-images" ทำงานปกติ
- ✅ เพิ่ม debug logging เพื่อติดตามการอัปโหลด
- ✅ รองรับการแปลง base64 เป็น Buffer สำหรับการจัดเก็บ

### 3. **Image State Management**
- ✅ เพิ่มตัวแปรติดตามสถานะรูปภาพต้นฉบับ
- ✅ เพิ่ม flags สำหรับติดตามการแก้ไขรูปภาพ
- ✅ ป้องกันการสูญหายรูปภาพเมื่อแก้ไขข้อมูลอื่น

## 🧪 วิธีทดสอบ (Testing Steps)

### 1. **ทดสอบการแก้ไขโครงการที่มีรูปภาพอยู่แล้ว**
```
1. เข้าหน้า Task Daily
2. คลิกปุ่มแก้ไขโครงการที่มีรูปภาพ
3. ตรวจสอบว่ารูปภาพแสดงผลถูกต้อง
4. ลองแก้ไขข้อมูลอื่นๆ (ไม่แตะรูปภาพ)
5. บันทึก - รูปภาพต้องยังคงอยู่
```

### 2. **ทดสอบการเพิ่มรูปภาพใหม่**
```
1. แก้ไขโครงการที่ไม่มีรูปภาพ
2. คลิกปุ่ม "เลือกรูปภาพ"
3. เลือกไฟล์รูปภาพ
4. ตรวจสอบว่ารูปภาพแสดง preview
5. บันทึก
6. เปิดดูรายละเอียดอีกครั้ง - รูปภาพต้องแสดง
```

### 3. **ทดสอบการเปลี่ยนรูปภาพ**
```
1. แก้ไขโครงการที่มีรูปภาพ
2. คลิกปุ่มสีน้ำเงิน (เปลี่ยนรูปภาพ) บนรูปภาพ
3. เลือกรูปภาพใหม่
4. บันทึก
5. ตรวจสอบว่ารูปภาพเปลี่ยนเป็นรูปใหม่
```

### 4. **ทดสอบการลบรูปภาพ**
```
1. แก้ไขโครงการที่มีรูปภาพ
2. คลิกปุ่มสีแดง (ลบ) บนรูปภาพ
3. รูปภาพต้องหายไป
4. บันทึก
5. เปิดดูอีกครั้ง - รูปภาพต้องไม่แสดง
```

## 🔍 การตรวจสอบ Backend Logs

เมื่อทดสอบการอัปโหลดรูปภาพ ให้ดู console log ของ backend:

```bash
# Backend logs จะแสดง:
Update request for project: [ID]
Has beforeProjectImage: true/false
Has afterProjectImage: true/false
beforeProjectImage type: string
beforeProjectImage starts with: data:image/...
```

## 📝 หมายเหตุสำคัญ

1. **รูปภาพจะถูกจัดเก็บใน Supabase Storage** ไม่ใช่ในฐานข้อมูลโดยตรง
2. **URL ของรูปภาพ** จะอยู่ในรูปแบบ: `https://[project-id].supabase.co/storage/v1/object/public/project-images/...`
3. **ขนาดไฟล์สูงสุด** ที่รองรับคือ 5MB
4. **รูปแบบไฟล์ที่รองรับ**: JPEG, PNG, GIF, WebP

## 🚨 Troubleshooting

### ปัญหา: รูปภาพไม่บันทึก
- ตรวจสอบ Network tab ใน Browser DevTools
- ดูว่า Request body มี `beforeProjectImage` หรือ `afterProjectImage` หรือไม่
- ตรวจสอบ Backend logs

### ปัญหา: รูปภาพไม่แสดง
- ตรวจสอบ URL ของรูปภาพใน Browser DevTools (Elements tab)
- ลองเปิด URL รูปภาพโดยตรงในแท็บใหม่
- ตรวจสอบ CORS settings ของ Supabase Storage

### ปัญหา: รูปภาพหายเมื่อแก้ไขข้อมูลอื่น
- ตรวจสอบว่า `isBeforeImageModified` และ `isAfterImageModified` ทำงานถูกต้อง
- ดู Console logs ที่แสดง "Image preservation check"

## ✅ Summary

ระบบรูปภาพได้รับการปรับปรุงให้มีฟังก์ชันครบถ้วนแล้ว:
1. ✅ Upload รูปภาพใหม่
2. ✅ แสดง preview รูปภาพ
3. ✅ เปลี่ยนรูปภาพ
4. ✅ ลบรูปภาพ
5. ✅ รักษารูปภาพเดิมเมื่อแก้ไขข้อมูลอื่น
6. ✅ จัดเก็บใน Supabase Storage

หากพบปัญหาเพิ่มเติม กรุณาแจ้งพร้อม:
- Screenshot ของปัญหา
- Console logs จาก Browser
- Backend logs
- Network request/response