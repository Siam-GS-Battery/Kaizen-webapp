import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../CustomSwal.css';
import { employeeData } from '../data/employeeData';
import sessionManager from '../utils/sessionManager';

const SearchHistory = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedFormData, setSelectedFormData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock data for demonstration - มีข้อมูลสำหรับผู้ใช้หลายคน
  const allMockData = [
    // User 241303 - รัชนก ราชรามทอง (User)
    {
      id: 1,
      projectName: 'ปรับปรุงระบบการจัดการข้อมูลดิจิทัล',
      startDate: '01/12/2658',
      department: 'IT & DM',
      partner: '5ส ณ บางปูใหม่',
      status: 'APPROVED',
      createdDate: '01/12/2658',
      formType: 'genba',
      formData: {
        employeeId: '241303',
        fullName: 'รัชนก ราชรามทอง',
        department: 'IT & DM',
        fiveSGroupName: '5ส ณ บางปูใหม่',
        projectArea: 'IT',
        projectName: 'ปรับปรุงระบบการจัดการข้อมูลดิจิทัล',
        projectStartDate: '2023-12-01',
        projectEndDate: '2024-02-01',
        problemsEncountered: 'ระบบการจัดการข้อมูลดิจิทัลยังไม่เป็นระเบียบ ทำให้การค้นหาและเข้าถึงข้อมูลทำได้ยาก',
        solutionApproach: 'จัดระเบียบระบบไฟล์และโฟลเดอร์ตามหลัก 5ส พร้อมสร้างระบบการตั้งชื่อไฟล์ที่เป็นมาตรฐาน',
        standardCertification: 'ได้รับการรับรองจากหัวหน้าแผนก IT & DM',
        resultsAchieved: 'ลดเวลาการค้นหาไฟล์ได้ 60% และเพิ่มประสิทธิภาพการทำงานของทีม',
        beforeProjectImage: 'digital_before.jpg',
        afterProjectImage: 'digital_after.jpg',
        fiveSType: 'ส2',
        improvementTopic: 'Delivery',
        SGS_Smart: 'Factory',
        SGS_Green: 'Branding',
        SGS_Strong: 'Workplace'
      }
    },
    {
      id: 2,
      projectName: 'จัดระเบียบสถานที่ทำงาน IT',
      startDate: '15/11/2658',
      department: 'IT & DM',
      partner: '5ส ณ บางปูใหม่',
      status: 'WAITING',
      createdDate: '15/11/2658',
      formType: 'suggestion',
      formData: {
        employeeId: '241303',
        fullName: 'รัชนก ราชรามทอง',
        department: 'IT & DM',
        fiveSGroupName: '5ส ณ บางปูใหม่',
        projectArea: 'IT',
        projectName: 'จัดระเบียบสถานที่ทำงาน IT',
        projectStartDate: '2023-11-15',
        projectEndDate: '2023-12-15',
        problemsEncountered: 'สถานที่ทำงานไม่เป็นระเบียบ อุปกรณ์วางไม่เป็นที่',
        solutionApproach: 'จัดทำตู้เก็บของและป้ายบอกตำแหน่ง',
        standardCertification: 'อยู่ระหว่างการตรวจสอบ',
        resultsAchieved: 'คาดว่าจะเพิ่มประสิทธิภาพได้ 40%',
        beforeProjectImage: 'workspace_before.jpg',
        fiveSType: 'ส1',
        improvementTopic: 'Workplace'
      }
    },
    {
      id: 3,
      projectName: 'พัฒนาระบบการทำงานแบบอัตโนมัติ',
      startDate: '15/10/2658',
      department: 'IT & DM',
      partner: '5ส ณ บางปูใหม่',
      status: 'APPROVED',
      createdDate: '15/10/2658',
      formType: 'suggestion',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: '251307',
        fullName: 'ภัณฑิรา ศรีพิมพ์เมือง',
        department: 'IT & DM',
        fiveSGroupName: '5ส ณ บางปูใหม่',
        projectArea: 'IT',
        // Step 2: รายละเอียด
        projectName: 'พัฒนาระบบการทำงานแบบอัตโนมัติ',
        projectStartDate: '2023-10-15',
        projectEndDate: '2023-12-15',
        problemsEncountered: 'งานประจำที่ต้องทำซ้ำๆ ทำให้เสียเวลาและเกิดข้อผิดพลาดได้ง่าย',
        solutionApproach: 'พัฒนาโปรแกรมอัตโนมัติสำหรับงานประจำที่ทำซ้ำ เพื่อลดเวลาและความผิดพลาด',
        standardCertification: 'ผ่านการทดสอบและได้รับการอนุมัติจากผู้จัดการฝ่าย',
        resultsAchieved: 'ลดเวลาการทำงานประจำได้ 70% และลดข้อผิดพลาดได้ 90%',
        beforeProjectImage: 'automation_before.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส4',
        improvementTopic: 'Cost',
        SGS_Smart: 'People',
        SGS_Green: 'Teamwork',
        SGS_Strong: 'Energy_3R'
      }
    },
    {
      id: 8,
      projectName: 'ปรับปรุงพื้นที่ทำงาน IT',
      startDate: '01/08/2658',
      department: 'IT & DM',
      partner: '5ส ณ บางปูใหม่',
      status: 'APPROVED',
      createdDate: '01/08/2658',
      formType: 'genba',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: '251307',
        fullName: 'ภัณฑิรา ศรีพิมพ์เมือง',
        department: 'IT & DM',
        fiveSGroupName: '5ส ณ บางปูใหม่',
        projectArea: 'IT',
        // Step 2: รายละเอียด
        projectName: 'ปรับปรุงพื้นที่ทำงาน IT',
        projectStartDate: '2023-08-01',
        projectEndDate: '2023-09-30',
        problemsEncountered: 'พื้นที่ทำงาน IT ไม่เป็นระเบียบ สายไฟรก และอุปกรณ์วางไม่เป็นที่',
        solutionApproach: 'จัดระเบียบพื้นที่ทำงาน จัดสายไฟ และสร้างป้ายบอกตำแหน่งอุปกรณ์',
        standardCertification: 'ได้รับการรับรองจากหัวหน้าแผนกและทีมงาน',
        resultsAchieved: 'เพิ่มความปลอดภัยและความเป็นระเบียบของพื้นที่ทำงาน',
        beforeProjectImage: 'it_workspace_before.jpg',
        afterProjectImage: 'it_workspace_after.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส1',
        improvementTopic: 'Safety',
        SGS_Smart: 'Factory',
        SGS_Green: 'Branding',
        SGS_Strong: 'Workplace'
      }
    },
    {
      id: 4,
      projectName: 'ชื่อโครงการ THAILAND 5.0',
      startDate: '15/09/2658',
      department: 'IT & DM',
      partner: '5ส ณ บางปูใหม่',
      status: 'APPROVED',
      createdDate: '15/09/2658',
      formType: 'genba',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: '241303',
        fullName: 'รัชนก ราชรามทอง',
        department: 'IT DEVELOPMENT',
        fiveSGroupName: '5ส ณ บางปูใหม่',
        projectArea: 'บางปูใหม่',
        // Step 2: รายละเอียด
        projectName: 'ชื่อโครงการ THAILAND 5.0',
        projectStartDate: '2023-09-15',
        projectEndDate: '2023-12-15',
        problemsEncountered: 'พบว่าพื้นที่ทำงานไม่เป็นระเบียบ ส่งผลให้เสียเวลาในการหาเครื่องมือ',
        solutionApproach: 'จัดระเบียบพื้นที่ทำงานตามหลัก 5ส และสร้างป้ายบอกตำแหน่ง',
        standardCertification: 'ได้รับการรับรองจากหัวหน้าแผนกและผู้จัดการ',
        resultsAchieved: 'ลดเวลาการหาเครื่องมือได้ 50% และเพิ่มประสิทธิภาพการทำงาน',
        beforeProjectImage: 'before.jpg',
        afterProjectImage: 'after.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส1',
        improvementTopic: 'Quality',
        SGS_Smart: 'People',
        SGS_Green: 'Teamwork',
        SGS_Strong: 'Workplace'
      }
    },
    {
      id: 5,
      projectName: 'ปรับปรุงระบบการจัดการบุคลากร',
      startDate: '01/10/2658',
      department: 'HR & AD',
      partner: '5ส ณ บางปูใหม่',
      status: 'WAITING',
      createdDate: '01/10/2658',
      formType: 'suggestion',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: '241304',
        fullName: 'สมชาย ใจดี',
        department: 'HR & AD',
        fiveSGroupName: '5ส ณ บางปูใหม่',
        projectArea: 'HR',
        // Step 2: รายละเอียด
        projectName: 'ปรับปรุงระบบการจัดการบุคลากร',
        projectStartDate: '2023-10-01',
        projectEndDate: '2023-11-30',
        problemsEncountered: 'การจัดการข้อมูลบุคลากรยังไม่เป็นระบบ ทำให้การติดตามผลงานยาก',
        solutionApproach: 'จัดทำระบบฐานข้อมูลบุคลากรใหม่ พร้อมการติดตามผลงาน',
        standardCertification: 'ผ่านการตรวจสอบจากหัวหน้าแผนก HR',
        resultsAchieved: 'เพิ่มประสิทธิภาพในการจัดการบุคลากรได้ 50%',
        beforeProjectImage: 'hr_before.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส2',
        improvementTopic: 'Delivery',
        SGS_Smart: 'Factory',
        SGS_Green: 'Branding',
        SGS_Strong: 'Energy_3R'
      }
    },
    {
      id: 6,
      projectName: 'ปรับปรุงกระบวนการผลิต',
      startDate: '20/08/2658',
      department: 'IT & DM',
      partner: '5ส ณ โรงงาน A',
      status: 'APPROVED',
      createdDate: '20/08/2658',
      formType: 'genba',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: '241303',
        fullName: 'รัชนก ราชรามทอง',
        department: 'IT & DM',
        fiveSGroupName: '5ส ณ โรงงาน A',
        projectArea: 'โรงงาน A',
        // Step 2: รายละเอียด
        projectName: 'ปรับปรุงกระบวนการผลิต',
        projectStartDate: '2023-08-20',
        projectEndDate: '2023-10-20',
        problemsEncountered: 'กระบวนการผลิตมีขั้นตอนที่ซ้ำซ้อน ทำให้เสียเวลา',
        solutionApproach: 'ปรับปรุงขั้นตอนการทำงาน ลดขั้นตอนที่ไม่จำเป็น',
        standardCertification: 'ได้รับการอนุมัติจากผู้จัดการฝ่ายผลิต',
        resultsAchieved: 'ลดเวลาการผลิตได้ 30% และเพิ่มคุณภาพสินค้า',
        beforeProjectImage: 'production_before.jpg',
        afterProjectImage: 'production_after.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส4',
        improvementTopic: 'Cost',
        SGS_Smart: 'Factory',
        SGS_Green: 'Branding',
        SGS_Strong: 'Workplace'
      }
    },
    {
      id: 7,
      projectName: 'ปรับปรุงระบบควบคุมการผลิต',
      startDate: '05/11/2658',
      department: 'PC',
      partner: '5ส ณ โรงงาน B',
      status: 'WAITING',
      createdDate: '05/11/2658',
      formType: 'suggestion',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: '241305',
        fullName: 'นภัสกร สมบูรณ์',
        department: 'PC',
        fiveSGroupName: '5ส ณ โรงงาน B',
        projectArea: 'Production Control',
        // Step 2: รายละเอียด
        projectName: 'ปรับปรุงระบบควบคุมการผลิต',
        projectStartDate: '2023-11-05',
        projectEndDate: '2023-12-05',
        problemsEncountered: 'ระบบควบคุมการผลิตยังไม่มีประสิทธิภาพ ทำให้เกิดความล่าช้า',
        solutionApproach: 'ปรับปรุงระบบติดตามและควบคุมการผลิตแบบเรียลไทม์',
        standardCertification: 'อยู่ระหว่างการตรวจสอบจากผู้จัดการ',
        resultsAchieved: 'คาดว่าจะเพิ่มประสิทธิภาพได้ 35%',
        beforeProjectImage: 'control_before.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส3',
        improvementTopic: 'Quality',
        SGS_Smart: 'People',
        SGS_Green: 'Teamwork',
        SGS_Strong: 'Energy_3R'
      }
    },
    // User 251308 - อนุชา มั่นคง (Supervisor)
    {
      id: 9,
      projectName: 'ยกระดับมาตรฐานคุณภาพสินค้า',
      startDate: '01/09/2658',
      department: 'QA',
      partner: '5ส ณ คลังสินค้า',
      status: 'APPROVED',
      createdDate: '01/09/2658',
      formType: 'genba',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: '251308',
        fullName: 'อนุชา มั่นคง',
        department: 'QA',
        fiveSGroupName: '5ส ณ คลังสินค้า',
        projectArea: 'Quality',
        // Step 2: รายละเอียด
        projectName: 'ยกระดับมาตรฐานคุณภาพสินค้า',
        projectStartDate: '2023-09-01',
        projectEndDate: '2023-11-01',
        problemsEncountered: 'มาตรฐานคุณภาพของสินค้าไม่เป็นไปตามเกณฑ์ที่กำหนด มีสินค้าที่ผ่านการตรวจสอบไม่ครบ',
        solutionApproach: 'ปรับปรุงกระบวนการตรวจสอบคุณภาพและสร้างระบบติดตามคุณภาพแบบเรียลไทม์',
        standardCertification: 'ได้รับการรับรองจากหัวหน้าแผนก QA และทีมคุณภาพ',
        resultsAchieved: 'เพิ่มมาตรฐานคุณภาพของสินค้าขึ้น 85% และลดความผิดพลาดในการตรวจสอบ',
        beforeProjectImage: 'quality_before.jpg',
        afterProjectImage: 'quality_after.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส4',
        improvementTopic: 'Quality',
        SGS_Smart: 'Factory',
        SGS_Green: 'Branding',
        SGS_Strong: 'Workplace'
      }
    },
    // User 261402 - วิชัย เจริญ (Manager)
    {
      id: 10,
      projectName: 'เพิ่มประสิทธิภาพการขายและการตลาด',
      startDate: '10/10/2658',
      department: 'SD',
      partner: '5ส ณ โรงงาน A',
      status: 'APPROVED',
      createdDate: '10/10/2658',
      formType: 'suggestion',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: '261402',
        fullName: 'วิชัย เจริญ',
        department: 'SD',
        fiveSGroupName: '5ส ณ โรงงาน A',
        projectArea: 'Sales',
        // Step 2: รายละเอียด
        projectName: 'เพิ่มประสิทธิภาพการขายและการตลาด',
        projectStartDate: '2023-10-10',
        projectEndDate: '2023-12-10',
        problemsEncountered: 'กระบวนการขายและการติดตามลูกค้ายังไม่มีประสิทธิภาพ ทำให้สูญเสียโอกาสในการขาย',
        solutionApproach: 'จัดทำระบบ CRM ใหม่ และปรับปรุงกระบวนการติดตามลูกค้าให้เป็นระบบ',
        standardCertification: 'ได้รับการอนุมัติจากผู้อำนวยการฝ่ายขาย',
        resultsAchieved: 'เพิ่มยอดขายได้ 45% และเพิ่มความพึงพอใจของลูกค้า',
        beforeProjectImage: 'sales_before.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส2',
        improvementTopic: 'Delivery',
        SGS_Smart: 'People',
        SGS_Green: 'Branding',
        SGS_Strong: 'Energy_3R'
      }
    },
    // User 241306 - สุดา แก้วใส (User)
    {
      id: 11,
      projectName: 'จัดระเบียบระบบการเงินและบัญชี',
      startDate: '25/09/2658',
      department: 'AF',
      partner: '5ส ณ บางปูใหม่',
      status: 'WAITING',
      createdDate: '25/09/2658',
      formType: 'suggestion',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: '241306',
        fullName: 'สุดา แก้วใส',
        department: 'AF',
        fiveSGroupName: '5ส ณ บางปูใหม่',
        projectArea: 'Accounting',
        // Step 2: รายละเอียด
        projectName: 'จัดระเบียบระบบการเงินและบัญชี',
        projectStartDate: '2023-09-25',
        projectEndDate: '2023-11-25',
        problemsEncountered: 'เอกสารทางการเงินและบัญชีไม่เป็นระเบียบ ทำให้การตรวจสอบและรายงานใช้เวลานาน',
        solutionApproach: 'จัดระเบียบระบบเก็บเอกสารและสร้างแม่แบบการรายงานมาตรฐาน',
        standardCertification: 'อยู่ระหว่างการตรวจสอบจากหัวหน้าแผนกบัญชี',
        resultsAchieved: 'คาดว่าจะลดเวลาการทำงานได้ 40% และเพิ่มความแม่นยำ',
        beforeProjectImage: 'accounting_before.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส1',
        improvementTopic: 'Cost',
        SGS_Smart: 'People',
        SGS_Green: 'Teamwork',
        SGS_Strong: 'Workplace'
      }
    },
    // User 251309 - ธนาคาร ศรีสุข (Supervisor)
    {
      id: 12,
      projectName: 'พัฒนาระบบเทคนิคการผลิต',
      startDate: '15/08/2658',
      department: 'TD',
      partner: '5ส ณ โรงงาน B',
      status: 'APPROVED',
      createdDate: '15/08/2658',
      formType: 'genba',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: '251309',
        fullName: 'ธนาคาร ศรีสุข',
        department: 'TD',
        fiveSGroupName: '5ส ณ โรงงาน B',
        projectArea: 'Technical',
        // Step 2: รายละเอียด
        projectName: 'พัฒนาระบบเทคนิคการผลิต',
        projectStartDate: '2023-08-15',
        projectEndDate: '2023-10-15',
        problemsEncountered: 'เทคนิคการผลิตยังไม่ทันสมัย ทำให้ประสิทธิภาพการผลิตต่ำ',
        solutionApproach: 'นำเทคโนโลยีใหม่มาใช้ในการผลิต และฝึกอบรมพนักงานให้มีทักษะที่ทันสมัย',
        standardCertification: 'ผ่านการทดสอบและได้รับการรับรองจากผู้เชียวชาญด้านเทคนิค',
        resultsAchieved: 'เพิ่มประสิทธิภาพการผลิตได้ 60% และลดการใช้ทรัพยากร',
        beforeProjectImage: 'technical_before.jpg',
        afterProjectImage: 'technical_after.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส5',
        improvementTopic: 'Quality',
        SGS_Smart: 'Factory',
        SGS_Green: 'Teamwork',
        SGS_Strong: 'Energy_3R'
      }
    },
    // User 261401 - มนตรี ธนวัฒน์ (Manager)
    {
      id: 13,
      projectName: 'ปรับปรุงกระบวนการจัดการผลิตภัณฑ์',
      startDate: '01/07/2658',
      department: 'PD',
      partner: '5ส ณ โรงงาน A',
      status: 'APPROVED',
      createdDate: '01/07/2658',
      formType: 'genba',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: '261401',
        fullName: 'มนตรี ธนวัฒน์',
        department: 'PD',
        fiveSGroupName: '5ส ณ โรงงาน A',
        projectArea: 'Production',
        // Step 2: รายละเอียด
        projectName: 'ปรับปรุงกระบวนการจัดการผลิตภัณฑ์',
        projectStartDate: '2023-07-01',
        projectEndDate: '2023-09-01',
        problemsEncountered: 'กระบวนการจัดการผลิตภัณฑ์มีความซับซ้อนและไม่เป็นระบบ ทำให้เกิดความล่าช้า',
        solutionApproach: 'ปรับปรุงขั้นตอนการทำงานให้เป็นระบบและใช้เทคโนโลยีช่วยในการติดตาม',
        standardCertification: 'ได้รับการรับรองจากคณะกรรมการบริหารโรงงาน',
        resultsAchieved: 'ลดเวลาการผลิตได้ 40% และเพิ่มคุณภาพผลิตภัณฑ์',
        beforeProjectImage: 'production_mgmt_before.jpg',
        afterProjectImage: 'production_mgmt_after.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส4',
        improvementTopic: 'Cost',
        SGS_Smart: 'Factory',
        SGS_Green: 'Branding',
        SGS_Strong: 'Workplace'
      }
    },
    // User admin - Admin
    {
      id: 14,
      projectName: 'ปรับปรุงระบบการจัดการองค์กร',
      startDate: '01/06/2658',
      department: 'Admin',
      partner: 'กลุ่มวางแผนการผลิต',
      status: 'APPROVED',
      createdDate: '01/06/2658',
      formType: 'genba',
      formData: {
        // Step 1: ข้อมูลทั่วไป
        employeeId: 'admin',
        fullName: 'admin admin',
        department: 'Admin',
        fiveSGroupName: 'กลุ่มวางแผนการผลิต',
        projectArea: 'ออฟฟิศฝ่ายวางแผน',
        // Step 2: รายละเอียด
        projectName: 'ปรับปรุงระบบการจัดการองค์กร',
        projectStartDate: '2023-06-01',
        projectEndDate: '2023-08-01',
        problemsEncountered: 'ระบบการจัดการองค์กรยังไม่เป็นระบบ ทำให้การประสานงานระหว่างแผนกไม่มีประสิทธิภาพ',
        solutionApproach: 'จัดทำระบบการจัดการองค์กรแบบดิจิทัลและปรับปรุงกระบวนการสื่อสาร',
        standardCertification: 'ได้รับการอนุมัติจากผู้บริหารระดับสูง',
        resultsAchieved: 'เพิ่มประสิทธิภาพการทำงานระหว่างแผนกได้ 70% และลดเวลาการประสานงาน',
        beforeProjectImage: 'admin_before.jpg',
        afterProjectImage: 'admin_after.jpg',
        // Step 3: ประเภทของกิจกรรม 5ส
        fiveSType: 'ส2',
        improvementTopic: 'Delivery',
        SGS_Smart: 'People',
        SGS_Green: 'Teamwork',
        SGS_Strong: 'Workplace'
      }
    }
  ];

  // ตรวจสอบสิทธิ์ผู้ใช้และแสดงข้อมูลอัตโนมัติสำหรับผู้ใช้ที่ล็อกอิน
  useEffect(() => {
    const session = sessionManager.getCurrentSession();
    const currentIsLoggedIn = session && sessionManager.isSessionValid();
    
    if (currentIsLoggedIn) {
      const employee = employeeData.find(emp => emp.employeeId === session.employeeId);
      if (employee) {
        setUserRole(employee.role);
        setIsLoggedIn(true);
        setEmployeeId(session.employeeId);
        
        // แสดงข้อมูลอัตโนมัติสำหรับผู้ใช้ที่ล็อกอินแล้ว
        const filteredResults = allMockData.filter(item => 
          item.formData.employeeId === session.employeeId
        );
        setSearchResults(filteredResults);
        setHasSearched(true);
      }
    } else {
      // ถ้าไม่มี session และก่อนหน้านี้เคยล็อกอินอยู่ ให้รีเซ็ตข้อมูล
      if (isLoggedIn) {
        setUserRole(null);
        setIsLoggedIn(false);
        setEmployeeId('');
        setSearchResults([]);
        setHasSearched(false);
      }
    }
  }, [isLoggedIn, allMockData]);

  const handleSearch = () => {
    if (employeeId.trim()) {
      // Filter data by employee ID สำหรับผู้ใช้ที่ไม่ได้ล็อกอิน
      const filteredResults = allMockData.filter(item => 
        item.formData.employeeId === employeeId.trim()
      );
      setSearchResults(filteredResults);
      setHasSearched(true);
      
      // แสดงข้อความเมื่อไม่พบข้อมูล
      if (filteredResults.length === 0) {
        console.log('No data found for employee ID:', employeeId.trim());
      }
    } else {
      // กรณีไม่กรอกรหัสพนักงาน
      setSearchResults([]);
      setHasSearched(true);
    }
  };

  const handleRequestEdit = async (_item) => {
    const { value: reason } = await Swal.fire({
      title: 'เหตุผลในการแก้ไข',
      input: 'textarea',
      inputPlaceholder: 'กรุณากรอกเหตุผลในการขอแก้ไข...',
      inputAttributes: {
        'aria-label': 'กรอกเหตุผลในการแก้ไข'
      },
      showCancelButton: true,
      confirmButtonText: 'ส่งคำขอ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      inputValidator: (value) => {
        if (!value) {
          return 'กรุณากรอกเหตุผลในการแก้ไข!'
        }
      }
    });

    if (reason) {
      await Swal.fire({
        title: 'ส่งคำขอเรียบร้อยแล้ว!',
        text: 'คำขอแก้ไขได้ถูกส่งไปยังหัวหน้าเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const handleViewForm = (item) => {
    setSelectedFormData(item);
    setShowFormModal(true);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // fallback to original string
    }
  };

  const renderFormModal = () => {
    if (!selectedFormData) return null;

    const isGenbaForm = selectedFormData.formType === 'genba';
    const formData = selectedFormData.formData;

    const getS5Label = (value) => {
      const s5Options = [
        { value: 'ส1', label: 'ส1 : สะสาง' },
        { value: 'ส2', label: 'ส2 : สะดวก' },
        { value: 'ส3', label: 'ส3 : สะอาด' },
        { value: 'ส4', label: 'ส4 : สร้างมาตรฐาน' },
        { value: 'ส5', label: 'ส5 : สร้างวินัย' },
      ];
      return s5Options.find(opt => opt.value === value)?.label || value;
    };

    const getImproveTopicLabel = (value) => {
      const improveTopics = [
        { value: 'Safety', label: 'Safety (ความปลอดภัย)' },
        { value: 'Env', label: 'Env. (สิ่งแวดล้อม)' },
        { value: 'Quality', label: 'Quality (คุณภาพ)' },
        { value: 'Cost', label: 'Cost (ต้นทุน)' },
        { value: 'Delivery', label: 'Delivery (การส่งมอบ)' },
      ];
      return improveTopics.find(opt => opt.value === value)?.label || value;
    };

    const getSGSLabel = (value, type) => {
      const sgsOptions = {
        Smart: [
          { value: 'People', label: 'People (เพิ่มทักษะการทำงาน)' },
          { value: 'Factory', label: 'Factory (ใช้เทคโนโลยีเพิ่มประสิทธิภาพการทำงาน)' },
        ],
        Strong: [
          { value: 'Energy_3R', label: 'Energy (ลดการใช้พลังงาน) , 3R ( Reduce,Reuse,Recycle )' },
          { value: 'Workplace', label: 'Workplace (ปรับปรุงการทำงานให้ปลอดภัย)' },
        ],
        Green: [
          { value: 'Teamwork', label: 'Teamwork (ปรับปรุงงานร่วมกับต่างหน่วยงาน)' },
          { value: 'Branding', label: 'Branding (ปรับปรุงคุณภาพของผลิตภัณฑ์ หรือ ส่งมอบตรงเวลา)' },
        ]
      };
      return sgsOptions[type]?.find(opt => opt.value === value)?.label || value;
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowFormModal(false);
        }}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-sm sm:max-w-4xl w-full max-h-[85vh] sm:max-h-[95vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 sm:p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">
                    {isGenbaForm ? 'GENBA FORM' : 'SUGGESTION FORM'}
                  </h2>
                  <p className="text-blue-100 text-sm opacity-90">
                    {isGenbaForm ? 'ฟอร์มปรับปรุง Genba' : 'ฟอร์มข้อเสนอแนะ'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 sm:p-6">

              {/* Step Progress Indicator */}
              <div className="mb-6">
                {/* Desktop Progress */}
                <div className="hidden sm:flex items-center justify-center bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                        1
                      </div>
                      <span className="ml-3 text-blue-700 font-semibold">ข้อมูลทั่วไป</span>
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                        2
                      </div>
                      <span className="ml-3 text-blue-700 font-semibold">รายละเอียด</span>
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                        3
                      </div>
                      <span className="ml-3 text-blue-700 font-semibold">ประเภท 5ส</span>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Progress */}
                <div className="sm:hidden bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg mb-1">
                        1
                      </div>
                      <span className="text-blue-700 font-medium text-[10px] text-center leading-tight">ข้อมูล<br/>ทั่วไป</span>
                    </div>
                    <div className="flex-1 h-1 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mx-2"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg mb-1">
                        2
                      </div>
                      <span className="text-blue-700 font-medium text-[10px] text-center leading-tight">รายละเอียด</span>
                    </div>
                    <div className="flex-1 h-1 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mx-2"></div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg mb-1">
                        3
                      </div>
                      <span className="text-blue-700 font-medium text-[10px] text-center leading-tight">ประเภท<br/>5ส</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Step 1: ข้อมูลทั่วไป */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold">1</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold">ข้อมูลทั่วไป</h3>
                    </div>
                  </div>
                  <div className="p-3 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">รหัสพนักงาน</label>
                        <p className="text-gray-900 font-medium text-sm">{formData.employeeId}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ชื่อ นามสกุล</label>
                        <p className="text-gray-900 font-medium text-sm">{formData.fullName}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">แผนก</label>
                        <p className="text-gray-900 font-medium text-sm">{formData.department}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ชื่อกลุ่ม 5ส</label>
                        <p className="text-gray-900 font-medium text-sm">{formData.fiveSGroupName}</p>
                      </div>
                      <div className="sm:col-span-2 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">พื้นที่จัดทำโครงการ</label>
                        <p className="text-gray-900 font-medium text-sm">{formData.projectArea}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: รายละเอียด */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold">2</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold">รายละเอียดโครงการ</h3>
                    </div>
                  </div>
                  <div className="p-3 sm:p-6">
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ชื่อโครงการ</label>
                        <p className="text-gray-900 font-medium text-sm">{formData.projectName}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">วันที่เริ่มทำโครงการ</label>
                          <div className="bg-gray-50 rounded-md p-2 border">
                            <p className="text-gray-900 font-medium text-sm">{formatDisplayDate(formData.projectStartDate)}</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">วันที่จบโครงการ</label>
                          <div className="bg-gray-50 rounded-md p-2 border">
                            <p className="text-gray-900 font-medium text-sm">{formatDisplayDate(formData.projectEndDate)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ปัญหาที่เจอ</label>
                          <p className="text-gray-900 font-medium text-sm leading-relaxed">{formData.problemsEncountered}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">แนวทางแก้ไข</label>
                          <p className="text-gray-900 font-medium text-sm leading-relaxed">{formData.solutionApproach}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">การรับรองมาตรฐาน</label>
                          <p className="text-gray-900 font-medium text-sm leading-relaxed">{formData.standardCertification}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ผลลัพธ์ที่ได้</label>
                          <p className="text-gray-900 font-medium text-sm leading-relaxed">{formData.resultsAchieved}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-3 uppercase tracking-wide">รูปก่อนจัดทำโครงการ</label>
                          <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-gray-500">{formData.beforeProjectImage || 'ไม่มีรูปภาพ'}</p>
                          </div>
                        </div>
                        {isGenbaForm && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <label className="block text-xs font-semibold text-blue-600 mb-3 uppercase tracking-wide">รูปหลังจัดทำโครงการ</label>
                            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
                              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-500">{formData.afterProjectImage || 'ไม่มีรูปภาพ'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: ประเภทของกิจกรรม 5ส */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold">3</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold">ประเภทของกิจกรรม 5ส</h3>
                    </div>
                  </div>
                  <div className="p-3 sm:p-6">
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ส. ที่ใช้ในการปรับปรุง</label>
                        <p className="text-gray-900 font-medium text-sm text-blue-600">
                          {getS5Label(formData.fiveSType)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">หัวข้อที่ปรับปรุง</label>
                        <p className="text-gray-900 font-medium text-sm text-green-600">
                          {getImproveTopicLabel(formData.improvementTopic)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                        <label className="block text-sm font-bold text-blue-600 mb-3">ส่งเสริมอัตลักษณ์ SGS Way ด้าน</label>
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <span className="block text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">S : Smart</span>
                            <p className="text-gray-900 font-medium text-sm">
                              {getSGSLabel(formData.SGS_Smart, 'Smart')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <span className="block text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">G : Green</span>
                            <p className="text-gray-900 font-medium text-sm">
                              {getSGSLabel(formData.SGS_Green, 'Green')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <span className="block text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">S : Strong</span>
                            <p className="text-gray-900 font-medium text-sm">
                              {getSGSLabel(formData.SGS_Strong, 'Strong')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-6">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowFormModal(false)}
                  className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-gray-500 text-lg">ไม่มีข้อมูล</p>
      <p className="text-gray-400 text-sm mt-2">กรุณากรอกรหัสพนักงานเพื่อค้นหาข้อมูล</p>
    </div>
  );

  const getStatusBadge = (status) => {
    const baseClass = "inline-block w-24 text-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'APPROVED':
        return <span className={baseClass + " bg-green-100 text-green-800"}>APPROVED</span>;
      case 'WAITING':
        return <span className={baseClass + " bg-yellow-100 text-yellow-800"}>WAITING</span>;
      default:
        return <span className={baseClass + " bg-gray-100 text-gray-800"}>{status}</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">SEARCH HISTORY</h1>

      {/* Search Section - แสดงเฉพาะผู้ใช้ที่ไม่ได้ล็อกอิน */}
      {!isLoggedIn && (
        <div className="mb-8">
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="รหัสพนักงาน"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* User Info Section สำหรับผู้ใช้ที่ล็อกอินแล้ว */}
      {isLoggedIn && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800">ผู้ใช้งาน: {employeeId}</h3>
              <p className="text-blue-600 text-sm">สิทธิ์: {userRole}</p>
              <p className="text-blue-500 text-xs">แสดงประวัติการส่งฟอร์มของคุณโดยอัตโนมัติ</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && (
        <>
          {searchResults.length > 0 ? (
            <>
              {/* Data Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input type="checkbox" className="rounded" />
                      </th>
                      <th className="px-4 py-3 text-left">ชื่อโครงการ</th>
                      <th className="px-4 py-3 text-left">วันที่เริ่มการโครงการ</th>
                      <th className="px-4 py-3 text-left">แผนก</th>
                      <th className="px-4 py-3 text-left">ชื่อกลุ่ม 5ส</th>
                      <th className="px-4 py-3 text-left">สถานะ</th>
                      <th className="px-4 py-3 text-left">วันที่สร้าง</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-4 py-3">{item.projectName}</td>
                        <td className="px-4 py-3">{item.startDate}</td>
                        <td className="px-4 py-3">{item.department}</td>
                        <td className="px-4 py-3">{item.partner}</td>
                        <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                        <td className="px-4 py-3">{item.createdDate}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRequestEdit(item)}
                              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full p-2 shadow-sm transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                              title="Request to Edit"
                            >
                              {/* New Pen Icon */}
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12.004 20.995h7.5M16.504 3.495a2.121 2.121 0 113 3l-11 11-4 1 1-4 11-11z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleViewForm(item)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-2 shadow-sm transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                              title="View Form"
                            >
                              {/* Eye Icon */}
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    แสดงหน้า 1 to 1 of {searchResults.length} รายการ
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                    <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
            </>
          ) : (
            renderEmptyState()
          )}
        </>
      )}

      {!hasSearched && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 text-lg">ค้นหาประวัติการส่งฟอร์ม</p>
          <p className="text-gray-400 text-sm mt-2">กรุณากรอกรหัสพนักงานเพื่อเริ่มค้นหา</p>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && renderFormModal()}
    </div>
  );
};

export default SearchHistory;