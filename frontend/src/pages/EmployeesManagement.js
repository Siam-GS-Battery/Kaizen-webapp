import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { employeeAPI } from '../services/apiService';

// Force hot-reload cache clear

const EmployeesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isManageDropdownOpen, setIsManageDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userOptions, setUserOptions] = useState([]); // For dropdown options



  // Form data for adding/editing employees
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    department: '',
    fiveSArea: '',
    role: 'User',
    approver: '',
    password: '',
    resetPassword: false
  });



  // Department options
  const departments = ['IT & DM', 'HR & AD', 'AF', 'PC', 'PD', 'QA', 'SD', 'TD', 'Admin'];
  const roles = ['User', 'Supervisor', 'Manager', 'Admin'];
  const fiveSAreas = ['5ส ณ บางปูใหม่', '5ส ณ โรงงาน A', '5ส ณ โรงงาน B', '5ส ณ คลังสินค้า', 'กลุ่มวางแผนการผลิต'];

  // Fetch employees from API on component mount
  useEffect(() => {
    fetchEmployees();
    fetchUserOptions();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeAPI.getAll();
      if (response.data.success) {
        setEmployees(response.data.data);
      } else {
        throw new Error('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees. Please try again.');
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลพนักงานได้ กรุณาลองใหม่อีกครั้ง',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user options for dropdown
  const fetchUserOptions = async () => {
    try {
      const response = await employeeAPI.getUsersForDropdown();
      if (response.data.success) {
        setUserOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user options:', error);
      // Not critical error, just log it
    }
  };

  // Filter and search data
  useEffect(() => {
    let filtered = employees;

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
  }, [searchTerm, selectedDepartment, employees]);

  // Get department counts
  const getDepartmentCounts = () => {
    const counts = {};
    employees.forEach(emp => {
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
      role: 'User',
      approver: '',
      password: '',
      resetPassword: false
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
      approver: formData.get('approver'),
      password: formData.get('password'),
      resetPassword: formData.get('resetPassword') === 'on'
    };
  };



  // Handle add employee
  const handleAddEmployee = async (formElement) => {
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
      const newEmployeeData = {
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        department: data.department,
        fiveSArea: data.fiveSArea,
        projectArea: data.department, // Using department as project area for simplicity
        role: data.role
      };

      // Add password if provided
      if (data.password && data.password.trim()) {
        newEmployeeData.password = data.password.trim();
      }

      // Add approver if provided
      if (data.approver) {
        newEmployeeData.approver = data.approver;
      }

      const response = await employeeAPI.create(newEmployeeData);
      
      if (response.data.success) {
        // Refresh the employee list
        await fetchEmployees();
        setIsAddModalOpen(false);
        resetFormData();

        await Swal.fire({
          icon: 'success',
          title: 'เพิ่มพนักงานสำเร็จ',
          text: 'เพิ่มข้อมูลพนักงานเรียบร้อยแล้ว',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      let errorMessage = 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน';
      
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

  // Handle edit employee
  const handleEditEmployee = async (formElement) => {
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

      // Handle password updates
      if (data.resetPassword) {
        updateData.resetPassword = true;
      } else if (data.password && data.password.trim()) {
        updateData.password = data.password.trim();
      }

      // Handle approver updates
      if (data.approver !== undefined) {
        updateData.approver = data.approver || null;
      }

      const response = await employeeAPI.update(editingEmployee.employeeId, updateData);
      
      if (response.data.success) {
        // Refresh the employee list
        await fetchEmployees();
        setIsEditModalOpen(false);
        setEditingEmployee(null);
        resetFormData();

        await Swal.fire({
          icon: 'success',
          title: 'แก้ไขข้อมูลสำเร็จ',
          text: 'แก้ไขข้อมูลพนักงานเรียบร้อยแล้ว',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      let errorMessage = 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลพนักงาน';
      
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

  // Handle delete individual employee
  const handleDeleteEmployee = async (employee) => {
    const result = await Swal.fire({
      title: 'ลบพนักงาน',
      text: `คุณต้องการลบ ${employee.firstName} ${employee.lastName} ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const response = await employeeAPI.delete(employee.employeeId);
        
        if (response.data.success) {
          // Refresh the employee list
          await fetchEmployees();
          await Swal.fire({
            title: 'ลบเรียบร้อย!',
            text: 'ลบข้อมูลพนักงานเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        let errorMessage = 'เกิดข้อผิดพลาดในการลบพนักงาน';
        
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
      title: 'ลบพนักงาน',
      text: `คุณต้องการลบพนักงาน ${selectedItems.length} คนใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        // Delete employees one by one
        const deletePromises = selectedItems.map(employeeId => 
          employeeAPI.delete(employeeId)
        );
        
        await Promise.all(deletePromises);
        
        // Refresh the employee list
        await fetchEmployees();
        setSelectedItems([]);
        
        await Swal.fire({
          title: 'ลบเรียบร้อย!',
          text: `ลบข้อมูลพนักงาน ${selectedItems.length} คนเรียบร้อยแล้ว`,
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
      } catch (error) {
        console.error('Error bulk deleting employees:', error);
        await Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'เกิดข้อผิดพลาดในการลบพนักงานบางคน กรุณาลองใหม่อีกครั้ง',
          confirmButtonColor: '#3b82f6'
        });
        // Refresh the list to show current state
        await fetchEmployees();
        setSelectedItems([]);
      }
    }
  };

  // Open edit modal with useCallback
  const openEditModal = React.useCallback((employee) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      department: employee.department,
      fiveSArea: employee.fiveSArea,
      role: employee.role,
      approver: employee.approver || '',
      password: '',
      resetPassword: false
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
    setEditingEmployee(null);
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
        case 'User':
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
  const ActionDropdown = ({ employee, index, totalItems }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
    
    const isNearBottom = index >= totalItems - 2;

    const handleToggleDropdown = (e) => {
      e.stopPropagation();
      
      if (!isOpen) {
        const buttonRect = e.currentTarget.getBoundingClientRect();
        setButtonPosition({
          top: buttonRect.top + window.scrollY,
          right: window.innerWidth - buttonRect.right
        });
      }
      
      setIsOpen(!isOpen);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.action-dropdown')) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('click', handleClickOutside);
      }

      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div className="relative action-dropdown">
        {/* Edit and Delete buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(employee)}
            className="text-yellow-500 hover:text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-colors p-2 rounded-lg"
            title="แก้ไข"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteEmployee(employee)}
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

  // Controlled Input Component with ref support for focus management
  const ControlledInput = React.forwardRef(({ name, value, onChange, placeholder, disabled, className, type = "text", onKeyDown }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={className}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
      />
    );
  });

  // Controlled Select Component with ref support for focus management
  const ControlledSelect = React.forwardRef(({ name, value, onChange, className, children, onKeyDown }, ref) => {
    return (
      <select
        ref={ref}
        name={name}
        value={value || ''}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={className}
      >
        {children}
      </select>
    );
  });

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

  // Helper function to get role-based visibility
  const shouldShowApproverField = (role) => {
    // All roles except Admin should have an approver
    return role !== 'Admin';
  };

  // Add/Edit Modal Component - Redesigned with better UX
  const EmployeeModal = ({ isOpen, onClose, onSave, title, isEdit = false }) => {
    const [selectedRole, setSelectedRole] = useState(formData.role || 'User');
    
    // Reset selectedRole when modal opens/closes or form data changes
    React.useEffect(() => {
      if (isOpen) {
        setSelectedRole(formData.role || 'User');
      }
    }, [isOpen, formData.role]);
    
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

    const handleRoleChange = (e) => {
      const newRole = e.target.value;
      setSelectedRole(newRole);
      // Update formData to sync with the selected role
      setFormData(prev => ({...prev, role: newRole}));
    };

    // Get current role - use selectedRole for both ADD and EDIT since it's synchronized with formData
    const currentRole = selectedRole;

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
                  {isEdit ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่เข้าสู่ระบบ'}
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
                    <select
                      name="role"
                      value={currentRole}
                      onChange={handleRoleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors appearance-none"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
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

            {/* Security Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                ความปลอดภัย
              </h3>

              {isEdit && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="resetPassword"
                      id="resetPassword"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <label htmlFor="resetPassword" className="text-sm font-medium text-yellow-800 cursor-pointer">
                      รีเซ็ตรหัสผ่าน (ลบรหัสผ่านออกจากระบบ)
                    </label>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1 ml-6">
                    เมื่อเลือกตัวเลือกนี้ รหัสผ่านของพนักงานจะถูกลบออกจากระบบ
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isEdit ? 'รหัสผ่านใหม่' : 'รหัสผ่าน'} 
                    <span className="text-gray-500 font-normal">(ไม่บังคับ)</span>
                  </label>
                  <UncontrolledInput
                    name="password"
                    type="password"
                    defaultValue=""
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={isEdit ? "กรอกรหัสผ่านใหม่หากต้องการเปลี่ยน" : "กรอกรหัสผ่าน"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isEdit 
                      ? "หากไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นว่างไว้" 
                      : "หากไม่กรอกรหัสผ่าน พนักงานจะสามารถเข้าสู่ระบบได้โดยไม่ต้องใช้รหัสผ่าน"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                ข้อมูลการอนุมัติ <span className="text-sm text-gray-500 font-normal">(ไม่บังคับ)</span>
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {/* Approver field - Show for all roles except Admin */}
                {shouldShowApproverField(currentRole) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ผู้อนุมัติ (Approver)
                    </label>
                    <div className="relative">
                      <UncontrolledSelect
                        name="approver"
                        defaultValue={formData.approver}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors appearance-none"
                      >
                        <option value="">-- เลือกผู้อนุมัติ --</option>
                        {userOptions.filter(user => {
                          // Show users with higher authority than current role
                          if (currentRole === 'User') {
                            return ['Supervisor', 'Manager', 'Admin'].includes(user.role);
                          } else if (currentRole === 'Supervisor') {
                            return ['Manager', 'Admin'].includes(user.role);
                          } else if (currentRole === 'Manager') {
                            return user.role === 'Admin';
                          }
                          return false;
                        }).map(user => (
                          <option key={user.value} value={user.value}>
                            {user.label} ({user.role})
                          </option>
                        ))}
                      </UncontrolledSelect>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      เลือกผู้ที่จะทำหน้าที่อนุมัติงานของพนักงานคนนี้
                    </p>
                  </div>
                )}

                {/* Show informational text if approver field is not shown (Admin only) */}
                {!shouldShowApproverField(currentRole) && (
                  <div>
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium">Admin ไม่ต้องมีผู้อนุมัติ</p>
                      <p className="text-xs mt-1">สิทธิ์ Admin มีอำนาจสูงสุดในระบบ</p>
                    </div>
                  </div>
                )}
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
              {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มพนักงาน'}
            </button>
          </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-blue-600 mb-8">EMPLOYEES MANAGEMENT</h1>

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
          <p className="text-gray-600">กำลังโหลดข้อมูลพนักงาน...</p>
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
            onClick={fetchEmployees}
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
              {filteredData.map((employee, index) => (
                <tr key={employee.employeeId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="sticky left-0 z-20 px-4 py-3 whitespace-nowrap" style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                    <div className="flex items-center h-full pl-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(employee.employeeId)}
                        onChange={() => handleSelectItem(employee.employeeId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  <td className="sticky left-[56px] z-20 px-4 py-3 text-sm font-medium whitespace-nowrap min-w-[136px]" style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                    {employee.employeeId}
                  </td>
                  <td className="px-4 py-3 text-sm min-w-[180px]">{employee.firstName} {employee.lastName}</td>
                  <td className="px-4 py-3 text-sm min-w-[120px]">{employee.role}</td>
                  <td className="px-4 py-3 text-sm min-w-[100px]">{employee.department}</td>
                  <td className="px-4 py-3 text-sm min-w-[150px]">{employee.fiveSArea}</td>
                  <td className="px-4 py-3 min-w-[140px]">
                    <RoleBadge role={employee.role} />
                  </td>
                  <td className="px-4 py-3 text-center min-w-[100px]">
                    <ActionDropdown employee={employee} index={index} totalItems={filteredData.length} />
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

      {/* Add Employee Modal */}
      <EmployeeModal
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        onSave={handleAddEmployee}
        title="ADD MEMBER FORM"
      />

      {/* Edit Employee Modal */}
      <EmployeeModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSave={handleEditEmployee}
        title="EDIT MEMBER FORM"
        isEdit={true}
      />
    </div>
  );
};

export default EmployeesManagement;