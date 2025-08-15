import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../CustomSwal.css';
import '../MobileDateFix.css';
import { tasklistAPI } from '../services/apiService';
import ProjectImage from '../components/ProjectImage';

const EditForm = ({ projectId, isOpen, onClose, onSuccess }) => {
  const [originalFormData, setOriginalFormData] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    lastName: '',
    department: '',
    position: '',
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
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [beforeImagePreview, setBeforeImagePreview] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);
  const [originalBeforeImage, setOriginalBeforeImage] = useState(null);
  const [originalAfterImage, setOriginalAfterImage] = useState(null);
  const [isBeforeImageModified, setIsBeforeImageModified] = useState(false);
  const [isAfterImageModified, setIsAfterImageModified] = useState(false);

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
    { value: '', label: '--เลือก--' },
    { value: 'ส1', label: 'ส1 : สะสาง' },
    { value: 'ส2', label: 'ส2 : สะดวก' },
    { value: 'ส3', label: 'ส3 : สะอาด' },
    { value: 'ส4', label: 'ส4 : สร้างมาตรฐาน' },
    { value: 'ส5', label: 'ส5 : สร้างวินัย' },
  ];

  const improveTopics = [
    { value: '', label: '--เลือก--' },
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

  // Load form data when component mounts or projectId changes
  useEffect(() => {
    const loadFormData = async () => {
      if (!projectId || !isOpen) return;
      
      try {
        setIsLoading(true);
        const response = await tasklistAPI.getById(projectId);
        if (response.data && response.data.success) {
          const taskData = response.data.data;
          
          // Format dates for input fields (expected format: YYYY-MM-DD)
          const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            try {
              const date = new Date(dateString);
              return date.toISOString().split('T')[0];
            } catch (error) {
              return '';
            }
          };

          const loadedFormData = {
            employeeId: taskData.employeeId || '',
            fullName: `${taskData.firstName || ''} ${taskData.lastName || ''}`,
            lastName: taskData.lastName || '',
            department: taskData.department || '',
            position: taskData.position || '',
            fiveSGroupName: taskData.fiveSGroupName || '',
            projectArea: taskData.projectArea || '',
            projectName: taskData.projectName || '',
            projectStartDate: formatDateForInput(taskData.projectStartDate),
            projectEndDate: formatDateForInput(taskData.projectEndDate),
            problemsEncountered: taskData.problemsEncountered || '',
            solutionApproach: taskData.solutionApproach || '',
            standardCertification: taskData.standardCertification || '',
            resultsAchieved: taskData.resultsAchieved || '',
            beforeProjectImage: null, // Handle file uploads separately
            afterProjectImage: null,  // Handle file uploads separately
            fiveSType: taskData.fiveSType || '',
            improvementTopic: taskData.improvementTopic || '',
            SGS_Smart: taskData.SGS_Smart || '',
            SGS_Strong: taskData.SGS_Strong || '',
            SGS_Green: taskData.SGS_Green || '',
          };

          // Enhanced image state initialization to ensure proper preservation
          // Store original images to prevent accidental loss during edits
          const originalBefore = taskData.beforeProjectImage || taskData.beforeImagePath;
          const originalAfter = taskData.afterProjectImage || taskData.afterImagePath;
          
          setBeforeImagePreview(originalBefore);
          setAfterImagePreview(originalAfter);
          setOriginalBeforeImage(originalBefore);
          setOriginalAfterImage(originalAfter);
          
          // Initialize modification flags to false - images preserved by default
          setIsBeforeImageModified(false);
          setIsAfterImageModified(false);
          
          console.log('Edit form loaded with images:', {
            hasBeforeImage: !!originalBefore,
            hasAfterImage: !!originalAfter,
            projectName: taskData.projectName
          });

          setOriginalFormData(taskData);
          setFormData(loadedFormData);
        } else {
          throw new Error('Failed to fetch form data');
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        await Swal.fire({
          icon: 'error',
          title: 'ไม่พบข้อมูล',
          text: 'ไม่พบฟอร์มที่ต้องการแก้ไข',
          confirmButtonText: 'ตกลง',
        });
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [projectId, isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target.result;
          setFormData(prev => ({
            ...prev,
            [name]: imageData
          }));
          if (name === 'beforeProjectImage') {
            setBeforeImagePreview(imageData);
            setIsBeforeImageModified(true);
          } else if (name === 'afterProjectImage') {
            setAfterImagePreview(imageData);
            setIsAfterImageModified(true);
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageRemove = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: null
    }));
    if (field === 'beforeProjectImage') {
      setBeforeImagePreview(null);
      setIsBeforeImageModified(true);
    } else if (field === 'afterProjectImage') {
      setAfterImagePreview(null);
      setIsAfterImageModified(true);
    }
  };

  const handleSaveUpdate = async () => {
    try {
      setIsUpdating(true);
      
      // Validate required fields
      const requiredFields = {
        projectName: 'ชื่อโครงการ',
        projectStartDate: 'วันที่เริ่มโครงการ',
        projectEndDate: 'วันที่จบโครงการ',
        problemsEncountered: 'ปัญหาที่เจอ',
        solutionApproach: 'แนวทางแก้ไข',
        resultsAchieved: 'ผลลัพธ์ที่ได้',
        fiveSType: 'ส. ที่ใช้ในการปรับปรุง',
        improvementTopic: 'หัวข้อที่ปรับปรุง',
        SGS_Smart: 'S : Smart',
        SGS_Strong: 'S : Strong',
        SGS_Green: 'G : Green',
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !formData[key] || formData[key] === '')
        .map(([, label]) => label);

      if (missingFields.length > 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'ข้อมูลไม่ครบถ้วน',
          html: `กรุณากรอกข้อมูลให้ครบถ้วน:<br/>- ${missingFields.join('<br/>- ')}`,
          confirmButtonText: 'ตกลง',
        });
        return;
      }

      // Enhanced logic to preserve original images when no changes are made
      // If image modification flag is false, use original image to maintain existing data
      // This prevents accidental image removal when editing other fields
      const beforeImage = isBeforeImageModified 
        ? formData.beforeProjectImage 
        : originalBeforeImage;
      const afterImage = isAfterImageModified 
        ? formData.afterProjectImage 
        : originalAfterImage;

      // Console log for debugging image preservation logic
      console.log('Image preservation check:', {
        isBeforeImageModified,
        isAfterImageModified,
        originalBeforeExists: !!originalBeforeImage,
        originalAfterExists: !!originalAfterImage,
        finalBeforeImage: !!beforeImage,
        finalAfterImage: !!afterImage
      });

      // Prepare data for API call
      const updateData = {
        employeeId: formData.employeeId,
        firstName: formData.fullName.split(' ')[0] || '',
        lastName: formData.lastName,
        department: formData.department,
        position: formData.position,
        fiveSGroupName: formData.fiveSGroupName,
        projectArea: formData.projectArea,
        projectName: formData.projectName,
        projectStartDate: formData.projectStartDate,
        projectEndDate: formData.projectEndDate,
        problemsEncountered: formData.problemsEncountered,
        solutionApproach: formData.solutionApproach,
        standardCertification: formData.standardCertification,
        resultsAchieved: formData.resultsAchieved,
        fiveSType: formData.fiveSType,
        improvementTopic: formData.improvementTopic,
        SGS_Smart: formData.SGS_Smart,
        SGS_Strong: formData.SGS_Strong,
        SGS_Green: formData.SGS_Green,
      };

      // Only include image fields if they have been modified
      // This prevents overwriting existing images when editing other fields
      if (isBeforeImageModified) {
        updateData.beforeProjectImage = beforeImage;
        console.log('Including beforeProjectImage in update:', !!beforeImage);
      }
      
      if (isAfterImageModified) {
        updateData.afterProjectImage = afterImage;
        console.log('Including afterProjectImage in update:', !!afterImage);
      }

      console.log('Final updateData keys:', Object.keys(updateData));

      const response = await tasklistAPI.update(projectId, updateData);
      
      if (response.data && response.data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'อัพเดตเรียบร้อย!',
          text: 'บันทึกการแก้ไขเรียบร้อยแล้ว',
          showConfirmButton: false,
          timer: 1500,
        });
        // Reset image states after successful update
        setBeforeImagePreview(null);
        setAfterImagePreview(null);
        setOriginalBeforeImage(null);
        setOriginalAfterImage(null);
        setIsBeforeImageModified(false);
        setIsAfterImageModified(false);
        
        onSuccess(); // Refresh data in parent component
        onClose(); // Close modal
      } else {
        throw new Error('Failed to update form data');
      }
    } catch (error) {
      console.error('Error saving update:', error);
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกการแก้ไขได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    // Reset image states when canceling
    setBeforeImagePreview(null);
    setAfterImagePreview(null);
    setOriginalBeforeImage(null);
    setOriginalAfterImage(null);
    setIsBeforeImageModified(false);
    setIsAfterImageModified(false);
    onClose();
  };

  const getUserRole = () => {
    try {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        return userData.role;
      }
    } catch (error) {
      console.error('Error getting user role:', error);
    }
    return null;
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'WAITING': { text: 'รอดำเนินการ', color: 'bg-blue-100 text-blue-800' },
      'APPROVED': { text: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800' },
      'BEST_KAIZEN': { text: 'The Best Kaizen', color: 'bg-yellow-100 text-yellow-800' },
      'EDIT': { text: 'แก้ไข', color: 'bg-orange-100 text-orange-800' },
      'DELETED': { text: 'ลบแล้ว', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (!isOpen) return null;

  const statusInfo = originalFormData ? getStatusDisplay(originalFormData.status) : null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">กำลังโหลดข้อมูล...</span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">แก้ไขโครงการ</h2>
                <p className="text-blue-100 text-sm opacity-90">ปรับปรุงข้อมูลโครงการ</p>
                {statusInfo && (
                  <span className={`inline-flex px-3 py-1 mt-2 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Step 1: ข้อมูลพื้นฐาน */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <h3 className="text-lg font-bold">ข้อมูลพื้นฐาน</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ตำแหน่ง</label>
                      <p className="text-gray-900 font-medium text-sm">{formData.position}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ชื่อกลุ่ม 5ส</label>
                      <input
                        type="text"
                        name="fiveSGroupName"
                        value={formData.fiveSGroupName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">พื้นที่จัดทำโครงการ</label>
                      <input
                        type="text"
                        name="projectArea"
                        value={formData.projectArea}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: รายละเอียดโครงการ */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <h3 className="text-lg font-bold">รายละเอียดโครงการ</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ชื่อโครงการ</label>
                      <input
                        type="text"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">วันที่เริ่มโครงการ</label>
                        <input
                          type="date"
                          name="projectStartDate"
                          value={formData.projectStartDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">วันที่จบโครงการ</label>
                        <input
                          type="date"
                          name="projectEndDate"
                          value={formData.projectEndDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ปัญหาที่เจอ</label>
                      <textarea
                        name="problemsEncountered"
                        value={formData.problemsEncountered}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">แนวทางแก้ไข</label>
                      <textarea
                        name="solutionApproach"
                        value={formData.solutionApproach}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ผลลัพธ์ที่ได้</label>
                      <textarea
                        name="resultsAchieved"
                        value={formData.resultsAchieved}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Images */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-3 uppercase tracking-wide">รูปก่อนจัดทำโครงการ</label>
                        <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center min-h-[200px] flex items-center justify-center">
                          {beforeImagePreview ? (
                            <div className="relative w-full">
                              <ProjectImage
                                src={beforeImagePreview}
                                alt="รูปก่อนจัดทำโครงการ"
                                className="w-full h-64 object-cover rounded-lg shadow-md"
                              />
                              <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleImageRemove('beforeProjectImage')}
                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-colors"
                                  title="ลบรูปภาพ"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => document.getElementById('beforeImageInput').click()}
                                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-lg transition-colors"
                                  title="เปลี่ยนรูปภาพ"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-500 mb-3">คลิกเพื่อเพิ่มรูปภาพ</p>
                              <button
                                type="button"
                                onClick={() => document.getElementById('beforeImageInput').click()}
                                className="px-6 py-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium"
                              >
                                เลือกรูปภาพ
                              </button>
                            </div>
                          )}
                          <input
                            id="beforeImageInput"
                            type="file"
                            name="beforeProjectImage"
                            onChange={handleInputChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-3 uppercase tracking-wide">รูปหลังจัดทำโครงการ</label>
                        <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center min-h-[200px] flex items-center justify-center">
                          {afterImagePreview ? (
                            <div className="relative w-full">
                              <ProjectImage
                                src={afterImagePreview}
                                alt="รูปหลังจัดทำโครงการ"
                                className="w-full h-64 object-cover rounded-lg shadow-md"
                              />
                              <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleImageRemove('afterProjectImage')}
                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-colors"
                                  title="ลบรูปภาพ"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => document.getElementById('afterImageInput').click()}
                                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-lg transition-colors"
                                  title="เปลี่ยนรูปภาพ"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-500 mb-3">คลิกเพื่อเพิ่มรูปภาพ</p>
                              <button
                                type="button"
                                onClick={() => document.getElementById('afterImageInput').click()}
                                className="px-6 py-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium"
                              >
                                เลือกรูปภาพ
                              </button>
                            </div>
                          )}
                          <input
                            id="afterImageInput"
                            type="file"
                            name="afterProjectImage"
                            onChange={handleInputChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: ประเภทของกิจกรรม 5ส */}
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <h3 className="text-lg font-bold">ประเภทของกิจกรรม 5ส</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ส. ที่ใช้ในการปรับปรุง</label>
                      <select
                        name="fiveSType"
                        value={formData.fiveSType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        {s5Options.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">หัวข้อที่ปรับปรุง</label>
                      <select
                        name="improvementTopic"
                        value={formData.improvementTopic}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        {improveTopics.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* SGS Way */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                      <label className="block text-sm font-bold text-blue-600 mb-3">ส่งเสริมอัตลักษณ์ SGS Way ด้าน</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">S : Smart</span>
                          <select
                            name="SGS_Smart"
                            value={formData.SGS_Smart}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            required
                          >
                            {sgsSmartOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">G : Green</span>
                          <select
                            name="SGS_Green"
                            value={formData.SGS_Green}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            required
                          >
                            {sgsGreenOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">S : Strong</span>
                          <select
                            name="SGS_Strong"
                            value={formData.SGS_Strong}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            required
                          >
                            {sgsStrongOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 border-t border-gray-200 p-6 -mx-6">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                  disabled={isUpdating}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveUpdate}
                  disabled={isUpdating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      กำลังอัปเดต...
                    </>
                  ) : (
                    'ยืนยันการแก้ไข'
                  )}
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditForm;