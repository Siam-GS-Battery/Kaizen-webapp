import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { employeeAPI } from '../services/apiService';
import SkeletonLoader from '../components/SkeletonLoader';

// Force hot-reload cache clear

const AdminTeamSettings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isManageDropdownOpen, setIsManageDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // Form data for adding/editing admin team members
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    department: '',
    fiveSArea: '',
    role: 'Admin',
    subordinate: '',
    commander: ''
  });



  // Department options
  const departments = ['IT & DM', 'HR & AD', 'AF', 'PC', 'PD', 'QA', 'SD', 'TD', 'Admin'];
  const roles = ['Admin', 'Manager', 'Supervisor'];
  const fiveSAreas = ['5ส ณ บางปูใหม่', '5ส ณ โรงงาน A', '5ส ณ โรงงาน B', '5ส ณ คลังสินค้า', 'กลุ่มวางแผนการผลิต'];

  // Fetch admin team members from API on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeAPI.getAll();
      if (response.data.success) {
        // Filter to show only Admin team members (Admin, Manager, Supervisor)
        const adminTeamMembers = response.data.data.filter(emp => 
          emp.role === 'Admin' || emp.role === 'Manager' || emp.role === 'Supervisor'
        );
        setAdmins(adminTeamMembers);
      } else {
        throw new Error('Failed to fetch admin team members');
      }
    } catch (error) {
      console.error('Error fetching admin team members:', error);
      setError('Failed to load admin team members. Please try again.');
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลผู้จัดการทีมได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };


  // Filter and search data
  useEffect(() => {
    let filtered = admins;

    // Filter by department
    if (selectedDepartment !== 'ALL') {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }

    // Search by name or employee ID
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.includes(searchTerm)
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, selectedDepartment, admins]);

  // Get department counts
  const getDepartmentCounts = () => {
    const counts = {};
    admins.forEach(emp => {
      counts[emp.department] = (counts[emp.department] || 0) + 1;
    });
    return counts;
  };

  const departmentCounts = getDepartmentCounts();

  // Handle checkbox selection
  const handleSelectItem = (employeeId) => {
    setSelectedItems(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredData.map(emp => emp.employeeId));
    } else {
      setSelectedItems([]);
    }
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      employeeId: '',
      firstName: '',
      lastName: '',
      department: '',
      fiveSArea: '',
      role: 'Admin',
      subordinate: '',
      commander: ''
    });
  };

  // Handle form submission by reading form data directly
  const getFormData = (formElement) => {
    const formData = new FormData(formElement);
    return {
      employeeId: formData.get('employeeId'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      department: formData.get('department'),
      fiveSArea: formData.get('fiveSArea'),
      role: formData.get('role'),
      subordinate: formData.get('subordinate'),
      commander: formData.get('commander')
    };
  };



  // Handle add admin team member
  const handleAddAdmin = async (formElement) => {
    const data = getFormData(formElement);
    
    if (!data.employeeId || !data.firstName || !data.lastName || !data.department || !data.fiveSArea) {
      await Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    try {
      const newAdminData = {
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        department: data.department,
        fiveSArea: data.fiveSArea,
        projectArea: data.department, // Using department as project area for simplicity
        role: data.role
      };

      const response = await employeeAPI.create(newAdminData);
      
      if (response.data.success) {
        // Refresh the admin team list
        await fetchAdmins();
        setIsAddModalOpen(false);
        resetFormData();

        await Swal.fire({
          icon: 'success',
          title: 'เพิ่มผู้จัดการทีมสำเร็จ',
          text: 'เพิ่มข้อมูลผู้จัดการทีมเรียบร้อยแล้ว',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error) {
      console.error('Error adding admin team member:', error);
      let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มผู้จัดการทีม';
      
      if (error.response?.status === 409) {
        errorMessage = 'รหัสพนักงานนี้มีอยู่ในระบบแล้ว';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  // Handle edit admin team member
  const handleEditAdmin = async (formElement) => {
    const data = getFormData(formElement);
    
    if (!data.firstName || !data.lastName || !data.department || !data.fiveSArea) {
      await Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    try {
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        department: data.department,
        fiveSArea: data.fiveSArea,
        projectArea: data.department, // Using department as project area
        role: data.role
      };

      const response = await employeeAPI.update(editingAdmin.employeeId, updateData);
      
      if (response.data.success) {
        // Refresh the admin team list
        await fetchAdmins();
        setIsEditModalOpen(false);
        setEditingAdmin(null);
        resetFormData();

        await Swal.fire({
          icon: 'success',
          title: 'แก้ไขข้อมูลสำเร็จ',
          text: 'แก้ไขข้อมูลผู้จัดการทีมเรียบร้อยแล้ว',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error) {
      console.error('Error updating admin team member:', error);
      let errorMessage = 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้จัดการทีม';
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  // Handle delete individual admin team member
  const handleDeleteAdmin = async (admin) => {
    const result = await Swal.fire({
      title: 'ลบผู้จัดการทีม',
      text: `คุณต้องการลบ ${admin.firstName} ${admin.lastName} ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const response = await employeeAPI.delete(admin.employeeId);
        
        if (response.data.success) {
          // Refresh the admin team list
          await fetchAdmins();
          await Swal.fire({
            title: 'ลบเรียบร้อย!',
            text: 'ลบข้อมูลผู้จัดการทีมเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
        }
      } catch (error) {
        console.error('Error deleting admin team member:', error);
        let errorMessage = 'เกิดข้อผิดพลาดในการลบผู้จัดการทีม';
        
        if (error.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        }
        
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: errorMessage,
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    const result = await Swal.fire({
      title: 'ลบผู้จัดการทีม',
      text: `คุณต้องการลบผู้จัดการทีม ${selectedItems.length} คนใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        // Delete admin team members one by one
        const deletePromises = selectedItems.map(employeeId => 
          employeeAPI.delete(employeeId)
        );
        
        await Promise.all(deletePromises);
        
        // Refresh the admin team list
        await fetchAdmins();
        setSelectedItems([]);
        
        await Swal.fire({
          title: 'ลบเรียบร้อย!',
          text: `ลบข้อมูลผู้จัดการทีม ${selectedItems.length} คนเรียบร้อยแล้ว`,
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
      } catch (error) {
        console.error('Error bulk deleting admin team members:', error);
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'เกิดข้อผิดพลาดในการลบผู้จัดการทีมบางคน กรุณาลองใหม่อีกครั้ง',
          confirmButtonColor: '#3b82f6'
        });
        // Refresh the list to show current state
        await fetchAdmins();
        setSelectedItems([]);
      }
    }
  };

  // Open edit modal with useCallback
  const openEditModal = React.useCallback((admin) => {
    setEditingAdmin(admin);
    setFormData({
      employeeId: admin.employeeId,
      firstName: admin.firstName,
      lastName: admin.lastName,
      department: admin.department,
      fiveSArea: admin.fiveSArea,
      role: admin.role,
      subordinate: '',
      commander: ''
    });
    setIsEditModalOpen(true);
  }, []);

  // Modal close handlers 
  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    resetFormData();
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingAdmin(null);
    resetFormData();
  };

  // Add button handler
  const handleAddButtonClick = () => {
    resetFormData();
    setIsAddModalOpen(true);
  };

  // Role badge component
  const RoleBadge = ({ role }) => {
    const getRoleStyle = () => {
      switch (role) {
        case 'Admin':
          return 'bg-red-100 text-red-800';
        case 'Manager':
          return 'bg-purple-100 text-purple-800';
        case 'Supervisor':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-blue-100 text-blue-800';
      }
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-24 justify-center ${getRoleStyle()}`}>
        {role ? role.toUpperCase() : 'N/A'}
      </span>
    );
  };

  // Action dropdown component for individual actions
  const ActionDropdown = ({ admin }) => {
    return (
      <div className="relative action-dropdown">
        {/* Edit and Delete buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(admin)}
            className="text-yellow-500 hover:text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-colors p-2 rounded-lg"
            title="แก้ไข"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteAdmin(admin)}
            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors p-2 rounded-lg"
            title="ลบ"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };


  // Uncontrolled Input Component - no re-renders
  const UncontrolledInput = ({ name, defaultValue, placeholder, disabled, className, type = "text", autoFocus = false }) => {
    return (
      <input
        type={type}
        name={name}
        defaultValue={defaultValue || ''}
        disabled={disabled}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        autoFocus={autoFocus}
      />
    );
  };

  // Uncontrolled Select Component - no re-renders
  const UncontrolledSelect = ({ name, defaultValue, className, children }) => {
    return (
      <select
        name={name}
        defaultValue={defaultValue || ''}
        className={className}
      >
        {children}
      </select>
    );
  };

  // Add/Edit Modal Component - Redesigned with better UX
  const AdminModal = ({ isOpen, onClose, onSave, title, isEdit = false }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(e.target);
    };

    const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleOverlayClick}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
          {/* Modal Header - Improved Design */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {isEdit ? 'แก้ไขข้อมูลผู้จัดการทีม' : 'เพิ่มผู้จัดการทีมใหม่เข้าสู่ระบบ'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-red-200 transition-colors p-2 rounded-full hover:bg-black hover:bg-opacity-20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body - Improved Layout */}
          <div className="p-6 space-y-6">
            {/* Basic Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                ข้อมูลพื้นฐาน
              </h3>
              
              {/* Employee ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสพนักงาน <span className="text-red-500">*</span>
                </label>
                <UncontrolledInput
                  name="employeeId"
                  defaultValue={formData.employeeId}
                  disabled={isEdit}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  placeholder="กรุณากรอกรหัสพนักงาน เช่น EMP001"
                  autoFocus={!isEdit}
                />
              </div>

              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <UncontrolledInput
                    name="firstName"
                    defaultValue={formData.firstName}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="กรุณากรอกชื่อ"
                    autoFocus={isEdit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <UncontrolledInput
                    name="lastName"
                    defaultValue={formData.lastName}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="กรุณากรอกนามสกุล"
                  />
                </div>
              </div>
            </div>

            {/* Work Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
                ข้อมูลการทำงาน
              </h3>

              {/* Department and Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    แผนก <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UncontrolledSelect
                      name="department"
                      defaultValue={formData.department}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors appearance-none"
                    >
                      <option value="">-- เลือกแผนก --</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </UncontrolledSelect>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ตำแหน่งงาน <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UncontrolledSelect
                      name="role"
                      defaultValue={formData.role}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors appearance-none"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </UncontrolledSelect>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5S Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อกลุ่ม 5ส <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UncontrolledSelect
                    name="fiveSArea"
                    defaultValue={formData.fiveSArea}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors appearance-none"
                  >
                    <option value="">-- เลือกกลุ่ม 5ส --</option>
                    {fiveSAreas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </UncontrolledSelect>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                ข้อมูลเสริม <span className="text-sm text-gray-500 font-normal">(ไม่บังคับ)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subordinate
                  </label>
                  <div className="relative">
                    <UncontrolledSelect
                      name="subordinate"
                      defaultValue={formData.subordinate}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors appearance-none"
                    >
                      <option value="">-- เลือก Subordinate --</option>
                      {/* Add subordinate options as needed */}
                    </UncontrolledSelect>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commander
                  </label>
                  <div className="relative">
                    <UncontrolledSelect
                      name="commander"
                      defaultValue={formData.commander}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors appearance-none"
                    >
                      <option value="">-- เลือก Commander --</option>
                      {/* Add commander options as needed */}
                    </UncontrolledSelect>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer - Improved Design */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มผู้จัดการทีม'}
            </button>
          </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">ADMIN TEAM SETTINGS</h1>
        <SkeletonLoader rows={10} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-blue-600 mb-8">ADMIN TEAM SETTINGS</h1>

      {/* Search Bar and Add Button */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button
          onClick={handleAddButtonClick}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Filter Tabs and Sort */}
      <div className="flex flex-wrap items-center gap-4 mb-6 border-b border-gray-200 pb-4">
        <button
          onClick={() => setSelectedDepartment('ALL')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            selectedDepartment === 'ALL'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          ALL
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{filteredData.length}</span>
        </button>

        {/* Sort by Department Dropdown */}
        <div className="relative">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Sort by Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept} ({departmentCounts[dept] || 0})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Manage dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsManageDropdownOpen(!isManageDropdownOpen)}
            disabled={selectedItems.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              selectedItems.length > 0
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            จัดการ
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isManageDropdownOpen && selectedItems.length > 0 && (
            <div className="absolute left-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={handleBulkDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  ลบ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลผู้จัดการทีม...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAdmins}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden relative">
        <div className="overflow-x-auto relative">
          {/* Sticky Column Shadow Overlay */}
          <div className="absolute top-0 left-[192px] bottom-0 w-4 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0))' }}></div>
          
          <table className="w-full min-w-[1000px] text-sm relative">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="sticky left-0 z-20 bg-blue-600 px-4 py-3 text-left text-sm whitespace-nowrap">
                  <div className="flex items-center h-full pl-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </th>
                <th className="sticky left-[56px] z-20 bg-blue-600 px-4 py-3 text-left font-semibold text-sm whitespace-nowrap min-w-[136px]">รหัสพนักงาน</th>
                <th className="px-4 py-3 text-left font-semibold text-sm min-w-[180px]">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3 text-left font-semibold text-sm min-w-[120px]">ตำแหน่งงาน</th>
                <th className="px-4 py-3 text-left font-semibold text-sm min-w-[100px]">แผนก</th>
                <th className="px-4 py-3 text-left font-semibold text-sm min-w-[150px]">ชื่อกลุ่ม 5ส</th>
                <th className="px-4 py-3 text-left font-semibold text-sm min-w-[140px]">สิทธิ์การเข้าถึง</th>
                <th className="px-4 py-3 text-center font-semibold text-sm min-w-[100px]"></th>
              </tr>
            </thead>
            <tbody className="relative">
              {filteredData.map((admin, index) => (
                <tr key={admin.employeeId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="sticky left-0 z-20 px-4 py-3 whitespace-nowrap" style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                    <div className="flex items-center h-full pl-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(admin.employeeId)}
                        onChange={() => handleSelectItem(admin.employeeId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  <td className="sticky left-[56px] z-20 px-4 py-3 text-sm font-medium whitespace-nowrap min-w-[136px]" style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                    {admin.employeeId}
                  </td>
                  <td className="px-4 py-3 text-sm min-w-[180px]">{admin.firstName} {admin.lastName}</td>
                  <td className="px-4 py-3 text-sm min-w-[120px]">{admin.role}</td>
                  <td className="px-4 py-3 text-sm min-w-[100px]">{admin.department}</td>
                  <td className="px-4 py-3 text-sm min-w-[150px]">{admin.fiveSArea}</td>
                  <td className="px-4 py-3 min-w-[140px]">
                    <RoleBadge role={admin.role} />
                  </td>
                  <td className="px-4 py-3 text-center min-w-[100px]">
                    <ActionDropdown admin={admin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            แสดงหน้า 1 to 1 of {filteredData.length} รายการ
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Add Admin Modal */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        onSave={handleAddAdmin}
        title="ADD ADMIN TEAM MEMBER"
      />

      {/* Edit Admin Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSave={handleEditAdmin}
        title="EDIT ADMIN TEAM MEMBER"
        isEdit={true}
      />
    </div>
  );
};

export default AdminTeamSettings;