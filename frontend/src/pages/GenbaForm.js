import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../CustomSwal.css';
import '../MobileDateFix.css';

const GenbaForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    lastName: '',
    department: '',
    fiveSGroupName: '',
    projectArea: '',
    projectName: '',
    projectStartDate: '',
    projectEndDate: '',
    problemsEncountered: '',
    solutionApproach: '',
    standardCertification: '',
    resultsAchieved: '',
    beforeProjectImage: null,
    afterProjectImage: null,
    fiveSType: '',
    improvementTopic: '',
    SGS_Smart: '',
    SGS_Strong: '',
    SGS_Green: '',
  });

  const departments = [
    'HR & AD',
    'AF',
    'PC',
    'PD',
    'QA',
    'SD',
    'TD',
    'IT & DM'
  ];

  const s5Options = [
    { value: 'ส1', label: 'ส1 : สะสาง' },
    { value: 'ส2', label: 'ส2 : สะดวก' },
    { value: 'ส3', label: 'ส3 : สะอาด' },
    { value: 'ส4', label: 'ส4 : สร้างมาตรฐาน' },
    { value: 'ส5', label: 'ส5 : สร้างวินัย' },
  ];
  const improveTopics = [
    { value: 'Safety', label: 'Safety (ความปลอดภัย)' },
    { value: 'Env', label: 'Env. (สิ่งแวดล้อม)' },
    { value: 'Quality', label: 'Quality (คุณภาพ)' },
    { value: 'Cost', label: 'Cost (ต้นทุน)' },
    { value: 'Delivery', label: 'Delivery (การส่งมอบ)' },
  ];
  
  const sgsSmartOptions = [
    { value: '', label: '--ตัวเลือก--' },
    { value: 'People', label: 'People (เพิ่มทักษะการทำงาน)' },
    { value: 'Factory', label: 'Factory (ใช้เทคโนโลยีเพิ่มประสิทธิภาพการทำงาน)' },
  ];
  
  const sgsStrongOptions = [
    { value: '', label: '--ตัวเลือก--' },
    { value: 'Energy_3R', label: 'Energy (ลดการใช้พลังงาน) , 3R ( Reduce,Reuse,Recycle )' },
    { value: 'Workplace', label: 'Workplace (ปรับปรุงการทำงานให้ปลอดภัย)' },
  ];
  
  const sgsGreenOptions = [
    { value: '', label: '--ตัวเลือก--' },
    { value: 'Teamwork', label: 'Teamwork (ปรับปรุงงานร่วมกับต่างหน่วยงาน)' },
    { value: 'Branding', label: 'Branding (ปรับปรุงคุณภาพของผลิตภัณฑ์ หรือ ส่งมอบตรงเวลา)' },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    }
  };

  // Image compression utility
  const compressImage = (file, quality = 0.8, maxWidth = 1024, maxHeight = 768) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Image decode utility for display
  const decodeImage = (base64String) => {
    if (!base64String) return null;
    // If it's already a data URL, return it
    if (base64String.startsWith('data:image/')) {
      return base64String;
    }
    // If it's a base64 string without data URL prefix, add it
    return `data:image/jpeg;base64,${base64String}`;
  };

  // Form submission function
  const submitFormData = async () => {
    try {
      const projectData = {
        projectName: formData.projectName,
        employeeId: formData.employeeId,
        position: 'เจ้าหน้าที่',
        department: formData.department,
        fiveSGroupName: formData.fiveSGroupName,
        projectArea: formData.projectArea,
        projectStartDate: formData.projectStartDate,
        projectEndDate: formData.projectEndDate,
        problemsEncountered: formData.problemsEncountered,
        solutionApproach: formData.solutionApproach,
        resultsAchieved: formData.resultsAchieved,
        fiveSType: formData.fiveSType,
        improvementTopic: formData.improvementTopic,
        SGS_Smart: formData.SGS_Smart,
        SGS_Strong: formData.SGS_Strong,
        SGS_Green: formData.SGS_Green,
        status: 'EDIT',
        formType: 'genba'
      };

      // Set images to null for now (will be implemented later)
      projectData.beforeProjectImage = null;
      projectData.afterProjectImage = null;
      
      // Compress images if present (for future use)
      // if (formData.beforeProjectImage) {
      //   projectData.beforeProjectImage = await compressImage(formData.beforeProjectImage, 0.7, 800, 600);
      // }
      // if (formData.afterProjectImage) {
      //   projectData.afterProjectImage = await compressImage(formData.afterProjectImage, 0.7, 800, 600);
      // }

      const response = await fetch('/api/tasklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
      });

      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend server ไม่ทำงาน หรือไม่ได้ตั้งค่าอย่างถูกต้อง');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to submit form');
      }

      const result = await response.json();
      console.log('Form submitted successfully:', result);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  const handleCheck = async () => {
    if (!formData.employeeId.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกรหัสพนักงาน',
        text: 'กรุณากรอกรหัสพนักงานก่อนกด Check',
        confirmButtonText: 'ตกลง',
        customClass: {
          container: 'custom-swal-container',
          title: 'custom-swal-title',
          confirmButton: 'custom-swal-confirm-button',
        }
      });
      return;
    }

    try {
      const response = await fetch(`/api/employees/${formData.employeeId}`);
      
      // Check if response is ok and content type is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Backend may not be running on port 3001.');
      }
      
      const data = await response.json();

      if (data.success && data.data) {
        const employee = data.data;
        setFormData(prev => ({
          ...prev,
          fullName: `${employee.firstName} ${employee.lastName}`,
          department: employee.department,
          fiveSGroupName: employee.fiveSArea,
          projectArea: employee.projectArea,
        }));
        Swal.fire({
          icon: 'success',
          title: 'พบข้อมูลพนักงาน',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'ไม่พบข้อมูล',
          text: 'ไม่พบรหัสพนักงานนี้ในระบบ',
          confirmButtonText: 'ตกลง',
          customClass: {
            container: 'custom-swal-container',
            title: 'custom-swal-title',
            confirmButton: 'custom-swal-confirm-button',
          }
        });
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      
      let errorMessage = 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้';
      if (error.message.includes('non-JSON response')) {
        errorMessage = 'Backend server ไม่ทำงาน กรุณาเริ่ม backend server ก่อน (npm run dev ในโฟลเดอร์ backend)';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        confirmButtonText: 'ตกลง',
        customClass: {
          container: 'custom-swal-container',
          title: 'custom-swal-title',
          confirmButton: 'custom-swal-confirm-button',
        }
      });
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      const requiredFields = {
        employeeId: 'รหัสพนักงาน',
        fullName: 'ชื่อ นามสกุล',
        department: 'แผนก',
        fiveSGroupName: 'ชื่อกลุ่ม 5 ส',
        projectArea: 'พื้นที่จัดทำโครงการ',
        projectName: 'ชื่อโครงการ',
        projectStartDate: 'วันที่เริ่มทำโครงการ',
        projectEndDate: 'วันที่จบโครงการ',
        problemsEncountered: 'ปัญหาที่เจอ',
        solutionApproach: 'แนวทางแก้ไข',
        resultsAchieved: 'ผลลัพธ์ที่ได้',
        fiveSType: 'ส. ที่ใช้ในการปรับปรุง',
        improvementTopic: 'หัวข้อที่ปรับปรุง',
        SGS_Smart: 'S : Smart',
        SGS_Green: 'G : Green',
        SGS_Strong: 'S : Strong',
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !formData[key] || formData[key] === '')
        .map(([, label]) => label);
      
      if (missingFields.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'ข้อมูลไม่ครบถ้วน',
          html: `กรุณากรอกข้อมูลให้ครบถ้วน:<br/>- ${missingFields.join('<br/>- ')}`,
          confirmButtonText: 'ตกลง',
          customClass: {
            container: 'custom-swal-container',
            title: 'custom-swal-title',
            htmlContainer: 'custom-swal-html-container',
            confirmButton: 'custom-swal-confirm-button',
            icon: 'custom-swal-icon',
          }
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ!',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            container: 'custom-swal-container',
            title: 'custom-swal-title',
            icon: 'custom-swal-icon',
          }
        });

        // Submit form data to backend with image compression
        await submitFormData();
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else {
    window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Steps */}
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-8">GENBA FORM</h1>
            <div className="flex items-center justify-between lg:block lg:space-y-6 lg:items-start">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center lg:flex-row lg:items-start lg:space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${step===1?'bg-blue-600 text-white':'bg-gray-300 text-gray-600'} rounded-full flex items-center justify-center text-sm font-semibold`}>
                    1
                  </div>
                </div>
                <div className="mt-2 text-center lg:mt-0 lg:text-left">
                  <h3 className={`text-xs lg:text-lg font-medium ${step===1?'text-blue-600':'text-gray-600'}`}>กรอกข้อมูลทั่วไป</h3>
                </div>
              </div>
              
              {/* Connecting Line */}
              <div className={`flex-1 h-0.5 mx-2 ${step > 1 ? 'bg-blue-600' : 'bg-gray-300'} lg:hidden`}></div>
              <div className={`ml-4 w-0.5 h-8 ${step>1?'bg-blue-600':'bg-gray-300'} hidden lg:block`}></div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center lg:flex-row lg:items-start lg:space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${step===2?'bg-blue-600 text-white':'bg-gray-300 text-gray-600'} rounded-full flex items-center justify-center text-sm font-semibold`}>
                    2
                  </div>
                </div>
                <div className="mt-2 text-center lg:mt-0 lg:text-left">
                  <h3 className={`text-xs lg:text-lg font-medium ${step===2?'text-blue-600':'text-gray-600'}`}>รายละเอียด</h3>
                </div>
              </div>

              {/* Connecting Line */}
              <div className={`flex-1 h-0.5 mx-2 ${step > 2 ? 'bg-blue-600' : 'bg-gray-300'} lg:hidden`}></div>
              <div className={`ml-4 w-0.5 h-8 ${step > 2 ? 'bg-blue-600' : 'bg-gray-300'} hidden lg:block`}></div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center lg:flex-row lg:items-start lg:space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'} rounded-full flex items-center justify-center text-sm font-semibold`}>
                    3
                  </div>
                </div>
                <div className="mt-2 text-center lg:mt-0 lg:text-left">
                  <h3 className={`text-xs lg:text-lg font-medium ${step === 3 ? 'text-blue-600' : 'text-gray-600'}`}>ประเภทของกิจกรรม 5 ส</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {step === 1 && (
              <>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">ข้อมูลทั่วไป</h2>
            <p className="text-gray-600 mb-6">กรุณากรอกข้อมูลรายละเอียดของบุคคล และตรวจสอบความถูกต้อง</p>
            <div className="space-y-6">
              {/* Location Field with Check Button */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสพนักงาน</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder=""
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleCheck}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Check
                  </button>
                </div>
              </div>
              {/* Name and Surname Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ นามสกุล</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder=""
                        readOnly // Make this field read-only
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">แผนก</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none bg-no-repeat"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: `right 0.5rem center`,
                          backgroundSize: `1.5em 1.5em`,
                        }}
                        disabled // Make this field disabled
                  >
                    <option value="">-- เลือกแผนก --</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Participants and Position Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อกลุ่ม 5 ส</label>
                  <input
                    type="text"
                    name="fiveSGroupName"
                    value={formData.fiveSGroupName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder=""
                        readOnly // Make this field read-only
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">พื้นที่จัดทำโครงการ</label>
                  <input
                    type="text"
                    name="projectArea"
                    value={formData.projectArea}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder=""
                        readOnly // Make this field read-only
                  />
                </div>
              </div>
            </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-bold text-blue-600 mb-2">รายละเอียดโครงการ</h2>
                <p className="text-gray-600 mb-6">กรุณากรอกข้อมูลรายละเอียดโครงการของตนเอง และตรวจสอบความถูกต้อง</p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโครงการ</label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มทำโครงการ</label>
                      <div className="relative">
                        <input
                          type="date"
                          name="projectStartDate"
                          value={formData.projectStartDate}
                          onChange={handleInputChange}
                          onClick={(e) => e.target.showPicker && e.target.showPicker()}
                          className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base cursor-pointer"
                          style={{
                            minHeight: '44px',
                            fontSize: '16px'
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">วันที่จบโครงการ</label>
                      <div className="relative">
                        <input
                          type="date"
                          name="projectEndDate"
                          value={formData.projectEndDate}
                          onChange={handleInputChange}
                          onClick={(e) => e.target.showPicker && e.target.showPicker()}
                          className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base cursor-pointer"
                          style={{
                            minHeight: '44px',
                            fontSize: '16px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ปัญหาที่เจอ</label>
                      <textarea
                        name="problemsEncountered"
                        value={formData.problemsEncountered}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">แนวทางแก้ไข</label>
                      <textarea
                        name="solutionApproach"
                        value={formData.solutionApproach}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">การรับรองมาตรฐาน</label>
                      <textarea
                        name="standardCertification"
                        value={formData.standardCertification}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ผลลัพธ์ที่ได้</label>
                      <textarea
                        name="resultsAchieved"
                        value={formData.resultsAchieved}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">รูปก่อนจัดทำโครงการ <span className="text-gray-400 text-xs">(สามารถเพิ่มภายหลัง)</span></label>
                      <div className="border-2 border-dashed border-gray-400 rounded-md p-4 flex flex-col items-center justify-center">
                        <input
                          type="file"
                          name="beforeProjectImage"
                          accept="image/jpeg,image/png"
                          onChange={handleInputChange}
                          className="hidden"
                          id="beforeImg"
                        />
                        <label htmlFor="beforeImg" className="cursor-pointer flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-4h6v4a1 1 0 01-1 1z" /></svg>
                          <span className="text-gray-500 text-sm">Choose a file or drag & drop it here<br/>JPEG, PNG formats, up to 5 MB</span>
                          <span className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md">Browse files</span>
                        </label>
                        {formData.beforeProjectImage && <span className="mt-2 text-xs text-green-600">{formData.beforeProjectImage.name}</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">รูปหลังจัดทำโครงการ <span className="text-gray-400 text-xs">(สามารถเพิ่มภายหลัง)</span></label>
                      <div className="border-2 border-dashed border-gray-400 rounded-md p-4 flex flex-col items-center justify-center">
                        <input
                          type="file"
                          name="afterProjectImage"
                          accept="image/jpeg,image/png"
                          onChange={handleInputChange}
                          className="hidden"
                          id="afterImg"
                        />
                        <label htmlFor="afterImg" className="cursor-pointer flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4 4h-4a1 1 0 01-1-1v-4h6v4a1 1 0 01-1 1z" /></svg>
                          <span className="text-gray-500 text-sm">Choose a file or drag & drop it here<br/>JPEG, PNG formats, up to 5 MB</span>
                          <span className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md">Browse files</span>
                        </label>
                        {formData.afterProjectImage && <span className="mt-2 text-xs text-green-600">{formData.afterProjectImage.name}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-bold text-blue-600 mb-2">ประเภทของกิจกรรม 5ส</h2>
                <p className="text-gray-600 mb-6">กรุณากรอกข้อมูลรายละเอียดโครงการของตนเอง และตรวจสอบความถูกต้อง</p>
                <div className="space-y-8">
                  {/* ส. ที่ใช้ในการปรับปรุง */}
                  <div>
                    <span className="font-semibold">ส. ที่ใช้ในการปรับปรุง :</span>
                    <div className="flex flex-wrap gap-6 mt-2">
                      {s5Options.map(opt => (
                        <label key={opt.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="fiveSType"
                            value={opt.value}
                            checked={formData.fiveSType === opt.value}
                            onChange={handleInputChange}
                            className="h-5 w-5 text-blue-600 border-gray-300"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* หัวข้อที่ปรับปรุง */}
                  <div>
                    <span className="font-semibold">หัวข้อที่ปรับปรุง :</span>
                    <div className="flex flex-wrap gap-6 mt-2">
                      {improveTopics.map(opt => (
                        <label key={opt.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="improvementTopic"
                            value={opt.value}
                            checked={formData.improvementTopic === opt.value}
                            onChange={handleInputChange}
                            className="h-5 w-5 text-blue-600 border-gray-300"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* SGS Way */}
                  <div>
                    <span className="font-semibold text-blue-600">ส่งเสริมอัตลักษณ์ SGS Way ด้าน :</span>
                    <div className="mt-4 space-y-6">
                      <div>
                        <span className="font-semibold">S : Smart</span>
                        <select
                          name="SGS_Smart"
                          value={formData.SGS_Smart}
                          onChange={handleInputChange}
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md mt-2 appearance-none bg-white bg-no-repeat"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: `right 0.5rem center`,
                            backgroundSize: `1.5em 1.5em`,
                          }}
                        >
                          {sgsSmartOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="font-semibold">G : Green</span>
                        <select
                          name="SGS_Green"
                          value={formData.SGS_Green}
                          onChange={handleInputChange}
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md mt-2 appearance-none bg-white bg-no-repeat"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: `right 0.5rem center`,
                            backgroundSize: `1.5em 1.5em`,
                          }}
                        >
                          {sgsGreenOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="font-semibold">S : Strong</span>
                        <select
                          name="SGS_Strong"
                          value={formData.SGS_Strong}
                          onChange={handleInputChange}
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md mt-2 appearance-none bg-white bg-no-repeat"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: `right 0.5rem center`,
                            backgroundSize: `1.5em 1.5em`,
                          }}
                        >
                          {sgsStrongOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* Action Buttons */}
            <div className="flex justify-between mt-12">
              <button
                onClick={handleBack}
                className="px-8 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {step === 3 ? 'ยืนยัน' : 'ถัดไป'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenbaForm;