import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { tasklistAPI } from '../services/apiService';
import ProjectImage from '../components/ProjectImage';
import EditForm from './EditForm';
import SkeletonLoader from '../components/SkeletonLoader';

const Tasklist = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('genba');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isManageDropdownOpen, setIsManageDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(''); // Department filter for Admin
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  
  // Date filter states
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get current user data
  const getCurrentUser = () => {
    try {
      const userDataStr = localStorage.getItem('user');
      if (userDataStr) {
        return JSON.parse(userDataStr);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  };

  // Fetch data from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        sortBy: 'created_date',
        sortOrder: sortOrder === 'newest' ? 'desc' : 'asc',
        limit: '1000' // Get all tasks for client-side filtering
      };
      
      const currentUser = getCurrentUser();
      const userRole = getUserRole();
      
      let response;
      
      // Use hierarchy endpoint for Supervisor and Manager
      if (currentUser && (userRole === 'Supervisor' || userRole === 'Manager') && currentUser.employeeId) {
        response = await tasklistAPI.getHierarchyTasks(currentUser.employeeId, params);
      } else {
        // Use regular endpoint for Admin and User
        response = await tasklistAPI.getAll(params);
      }
      
      if (response.data && response.data.success) {
        const tasks = response.data.data.projects || [];
        setAllTasks(tasks);
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTasks();
  }, [sortOrder]);

  // Close department dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDepartmentDropdownOpen && !event.target.closest('.department-dropdown')) {
        setIsDepartmentDropdownOpen(false);
      }
    };

    if (isDepartmentDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDepartmentDropdownOpen]);

  // Get user role from localStorage
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

  // Helper function to check if date is within selected month
  const isWithinDateRange = useCallback((item) => {
    if (!item.createdDate) return false;
    
    const createdDate = new Date(item.createdDate);
    const selectedYear = selectedMonth.getFullYear();
    const selectedMonthNum = selectedMonth.getMonth();
    
    // Check if project is within selected month
    const itemYear = createdDate.getFullYear();
    const itemMonth = createdDate.getMonth();
    
    return itemYear === selectedYear && itemMonth === selectedMonthNum;
  }, [selectedMonth]);

  // Filter และ search ข้อมูล
  useEffect(() => {
    let filtered = allTasks;
    const userRole = getUserRole();

    // Apply date filter first
    filtered = filtered.filter(item => isWithinDateRange(item));

    // Admin role filtering
    if (userRole === 'Admin') {
      // For Admin: show APPROVED and BEST_KAIZEN projects, but filter by formType according to activeFilter
      if (activeFilter === 'genba') {
        filtered = filtered.filter(item => 
          item.formType === 'genba' && item.status === 'APPROVED'
        );
      } else if (activeFilter === 'suggestion') {
        filtered = filtered.filter(item => 
          item.formType === 'suggestion' && item.status === 'APPROVED'
        );
      } else if (activeFilter === 'best_kaizen') {
        filtered = filtered.filter(item => 
          item.status === 'BEST_KAIZEN'
        );
      } else {
        // Default: show all APPROVED and BEST_KAIZEN
        filtered = filtered.filter(item => 
          item.status === 'APPROVED' || item.status === 'BEST_KAIZEN'
        );
      }
    } else {
      // Filter ตาม type และ status for non-admin users
      if (activeFilter !== 'all') {
        if (activeFilter === 'genba') {
          filtered = filtered.filter(item => 
            item.formType === 'genba' && 
            (item.status === 'WAITING' || item.status === 'EDIT')
          );
        } else if (activeFilter === 'suggestion') {
          filtered = filtered.filter(item => 
            item.formType === 'suggestion' && 
            (item.status === 'WAITING' || item.status === 'EDIT')
          );
        } else if (activeFilter === 'best_kaizen') {
          filtered = filtered.filter(item => 
            item.status === 'BEST_KAIZEN'
          );
        } else if (activeFilter === 'approved') {
          filtered = filtered.filter(item => 
            item.status === 'APPROVED'
          );
        }
      }
    }

    // Search ตามชื่อโครงการ
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeId.includes(searchTerm)
      );
    }

    // Department filter for Admin users
    if (getUserRole() === 'Admin' && selectedDepartment) {
      filtered = filtered.filter(item =>
        item.department === selectedDepartment
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [searchTerm, activeFilter, allTasks, selectedDepartment, selectedMonth, isWithinDateRange]);

  // Get filter counts based on status requirements
  const getFilterCounts = () => {
    const userRole = getUserRole();
    // Filter tasks by selected month first
    const dateFilteredTasks = allTasks.filter(item => isWithinDateRange(item));
    
    if (userRole === 'Admin') {
      // Admin sees APPROVED projects for genba/suggestion, and BEST_KAIZEN projects
      return {
        genba: dateFilteredTasks.filter(item => 
          item.formType === 'genba' && item.status === 'APPROVED'
        ).length,
        suggestion: dateFilteredTasks.filter(item => 
          item.formType === 'suggestion' && item.status === 'APPROVED'
        ).length,
        best_kaizen: dateFilteredTasks.filter(item => 
          item.status === 'BEST_KAIZEN'
        ).length,
        approved: 0, // Remove approved filter for Admin
      };
    } else {
      // Non-admin users see all filter counts
      return {
        genba: dateFilteredTasks.filter(item => 
          item.formType === 'genba' && 
          (item.status === 'WAITING' || item.status === 'EDIT')
        ).length,
        suggestion: dateFilteredTasks.filter(item => 
          item.formType === 'suggestion' && 
          (item.status === 'WAITING' || item.status === 'EDIT')
        ).length,
        best_kaizen: dateFilteredTasks.filter(item => 
          item.status === 'BEST_KAIZEN'
        ).length,
        approved: dateFilteredTasks.filter(item => 
          item.status === 'APPROVED'
        ).length,
      };
    }
  };

  const filterCounts = getFilterCounts();

  // Get unique departments for Admin filter with counts
  const getDepartmentCounts = () => {
    const userRole = getUserRole();
    if (userRole !== 'Admin') return {};
    
    // Count departments based on current filter
    let tasksToCount = allTasks.filter(item => 
      item.status === 'APPROVED' || item.status === 'BEST_KAIZEN'
    );
    
    // Apply active filter
    if (activeFilter === 'genba') {
      tasksToCount = tasksToCount.filter(item => 
        item.formType === 'genba' && item.status === 'APPROVED'
      );
    } else if (activeFilter === 'suggestion') {
      tasksToCount = tasksToCount.filter(item => 
        item.formType === 'suggestion' && item.status === 'APPROVED'
      );
    } else if (activeFilter === 'best_kaizen') {
      tasksToCount = tasksToCount.filter(item => 
        item.status === 'BEST_KAIZEN'
      );
    }
    
    const departmentCounts = {};
    tasksToCount.forEach(item => {
      const dept = item.department || 'ไม่ระบุ';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });
    
    return departmentCounts;
  };

  const departmentCounts = getDepartmentCounts();
  const uniqueDepartments = Object.keys(departmentCounts).sort();

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedItems([]); // Clear selections when changing pages
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedItems([]);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSelectedItems([]);
    }
  };

  // Handle checkbox selection
  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Handle select all (only current page)
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(currentData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handle bulk actions
  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) return;

    // Separate APPROVED and non-APPROVED projects
    const alreadyApprovedItems = [];
    const notApprovedItems = [];
    
    selectedItems.forEach(id => {
      const item = allTasks.find(task => task.id === id);
      if (item?.status === 'APPROVED') {
        alreadyApprovedItems.push(id);
      } else {
        notApprovedItems.push(id);
      }
    });

    // Handle case where all selected items are already APPROVED
    if (alreadyApprovedItems.length === selectedItems.length) {
      const bestKaizenResult = await Swal.fire({
        title: 'The Best Kaizen',
        text: `โครงการที่เลือกทั้งหมด ${selectedItems.length} รายการได้รับการอนุมัติแล้ว ต้องการให้เป็น The Best Kaizen ทันทีหรือไม่?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ใช่, เป็น The Best Kaizen',
        cancelButtonText: 'ยกเลิก'
      });

      if (bestKaizenResult.isConfirmed) {
        try {
          await Promise.all(
            alreadyApprovedItems.map(id => tasklistAPI.update(id, { status: 'BEST_KAIZEN' }))
          );
          await Swal.fire({
            title: 'เปลี่ยนสถานะเรียบร้อย!',
            text: `โครงการ ${selectedItems.length} รายการได้รับสถานะ The Best Kaizen เรียบร้อยแล้ว`,
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
          setSelectedItems([]);
          await fetchTasks(); // Refresh data
        } catch (error) {
          await Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเปลี่ยนสถานะโครงการได้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonColor: '#3b82f6'
          });
        }
      }
      return;
    }

    // Handle mixed case (some APPROVED, some not)
    if (alreadyApprovedItems.length > 0 && notApprovedItems.length > 0) {
      const mixedResult = await Swal.fire({
        title: 'โครงการมีสถานะแตกต่างกัน',
        html: `
          <p>โครงการที่เลือกมี:</p>
          <p>• ${alreadyApprovedItems.length} รายการที่อนุมัติแล้ว</p>
          <p>• ${notApprovedItems.length} รายการที่ยังไม่อนุมัติ</p>
          <br/>
          <p>ต้องการดำเนินการอย่างไร?</p>
        `,
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'อนุมัติทั้งหมดและถาม Best Kaizen',
        denyButtonText: 'เปลี่ยนที่อนุมัติแล้วเป็น Best Kaizen',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#22c55e',
        denyButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280'
      });

      if (mixedResult.isConfirmed) {
        // Process all items normally (ask for Best Kaizen)
        const bestKaizenResult = await Swal.fire({
          title: 'The Best Kaizen',
          text: `ต้องการให้โครงการทั้งหมด ${selectedItems.length} รายการ เป็น The Best Kaizen หรือไม่?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#f59e0b',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'ใช่, เป็น The Best Kaizen',
          cancelButtonText: 'ไม่, อนุมัติปกติ'
        });

        const status = bestKaizenResult.isConfirmed ? 'BEST_KAIZEN' : 'APPROVED';
        const statusText = bestKaizenResult.isConfirmed ? 'The Best Kaizen' : 'อนุมัติ';

        try {
          await Promise.all(
            selectedItems.map(id => tasklistAPI.update(id, { status: status }))
          );
          await Swal.fire({
            title: `${statusText}เรียบร้อย!`,
            text: `โครงการ ${selectedItems.length} รายการได้รับสถานะ ${statusText} เรียบร้อยแล้ว`,
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
          setSelectedItems([]);
          await fetchTasks(); // Refresh data
        } catch (error) {
          await Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถอนุมัติโครงการได้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonColor: '#3b82f6'
          });
        }
      } else if (mixedResult.isDenied) {
        // Only convert already approved items to Best Kaizen
        try {
          await Promise.all(
            alreadyApprovedItems.map(id => tasklistAPI.update(id, { status: 'BEST_KAIZEN' }))
          );
          await Swal.fire({
            title: 'เปลี่ยนสถานะเรียบร้อย!',
            text: `โครงการที่อนุมัติแล้ว ${alreadyApprovedItems.length} รายการได้รับสถานะ The Best Kaizen เรียบร้อยแล้ว`,
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
          setSelectedItems([]);
          await fetchTasks(); // Refresh data
        } catch (error) {
          await Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเปลี่ยนสถานะโครงการได้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonColor: '#3b82f6'
          });
        }
      }
      return;
    }

    // Normal flow for non-APPROVED projects only
    const approvalResult = await Swal.fire({
      title: 'อนุมัติโครงการ',
      text: `คุณต้องการอนุมัติโครงการ ${selectedItems.length} รายการใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'อนุมัติ',
      cancelButtonText: 'ยกเลิก'
    });

    if (approvalResult.isConfirmed) {
      // Then ask if these should be "The Best Kaizen"
      const bestKaizenResult = await Swal.fire({
        title: 'The Best Kaizen',
        text: `ต้องการให้โครงการทั้งหมด ${selectedItems.length} รายการ เป็น The Best Kaizen หรือไม่?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ใช่, เป็น The Best Kaizen',
        cancelButtonText: 'ไม่, อนุมัติปกติ'
      });

      const status = bestKaizenResult.isConfirmed ? 'BEST_KAIZEN' : 'APPROVED';
      const statusText = bestKaizenResult.isConfirmed ? 'The Best Kaizen' : 'อนุมัติ';

      try {
        // Use Promise.all with the specific status
        await Promise.all(
          selectedItems.map(id => tasklistAPI.update(id, { status: status }))
        );
        await Swal.fire({
          title: `${statusText}เรียบร้อย!`,
          text: `โครงการ ${selectedItems.length} รายการได้รับสถานะ ${statusText} เรียบร้อยแล้ว`,
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        setSelectedItems([]);
        await fetchTasks(); // Refresh data
      } catch (error) {
        await Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถอนุมัติโครงการได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  };

  const handleBulkCancelBestKaizen = async () => {
    if (selectedItems.length === 0) return;

    // Filter only BEST_KAIZEN items
    const bestKaizenItems = selectedItems.filter(id => {
      const item = allTasks.find(task => task.id === id);
      return item?.status === 'BEST_KAIZEN';
    });

    if (bestKaizenItems.length === 0) {
      await Swal.fire({
        title: 'ไม่พบรายการ',
        text: 'ไม่มีโครงการที่มีสถานะ "The Best Kaizen" ในรายการที่เลือก',
        icon: 'info',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'ยกเลิก Best Kaizen',
      text: `คุณต้องการยกเลิกสถานะ "The Best Kaizen" ของโครงการ ${bestKaizenItems.length} รายการ และเปลี่ยนกลับเป็น "อนุมัติ" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ยกเลิก Best Kaizen',
      cancelButtonText: 'ไม่ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        // Use Promise.all to update all selected BEST_KAIZEN items to APPROVED
        await Promise.all(
          bestKaizenItems.map(id => tasklistAPI.update(id, { status: 'APPROVED' }))
        );
        await Swal.fire({
          title: 'ยกเลิกเรียบร้อย!',
          text: `ยกเลิกสถานะ The Best Kaizen ของโครงการ ${bestKaizenItems.length} รายการเรียบร้อยแล้ว โครงการทั้งหมดได้รับสถานะ "อนุมัติ"`,
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        setSelectedItems([]);
        await fetchTasks(); // Refresh data
      } catch (error) {
        await Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถยกเลิกสถานะได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    const result = await Swal.fire({
      title: 'ลบโครงการ',
      text: `คุณต้องการลบโครงการ ${selectedItems.length} รายการใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await tasklistAPI.bulkDelete(selectedItems);
        await Swal.fire({
          title: 'ลบเรียบร้อย!',
          text: `ลบโครงการ ${selectedItems.length} รายการเรียบร้อยแล้ว`,
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        setSelectedItems([]);
        await fetchTasks(); // Refresh data
      } catch (error) {
        await Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบโครงการได้ กรุณาลองใหม่อีกครั้ง',
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  };

  // Handle individual actions
  const handleIndividualAction = async (action, item) => {
    if (action === 'approve') {
      // Check if the project is already APPROVED
      if (item.status === 'APPROVED') {
        // If already approved, directly ask if they want to make it Best Kaizen
        const bestKaizenResult = await Swal.fire({
          title: 'The Best Kaizen',
          text: `โครงการ "${item.projectName}" ได้รับการอนุมัติแล้ว ต้องการให้เป็น The Best Kaizen ทันทีหรือไม่?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#f59e0b',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'ใช่, เป็น The Best Kaizen',
          cancelButtonText: 'ยกเลิก'
        });

        if (bestKaizenResult.isConfirmed) {
          try {
            await tasklistAPI.update(item.id, { status: 'BEST_KAIZEN' });
            await Swal.fire({
              title: 'เปลี่ยนสถานะเรียบร้อย!',
              text: 'โครงการได้รับสถานะ The Best Kaizen เรียบร้อยแล้ว',
              icon: 'success',
              confirmButtonColor: '#3b82f6'
            });
            await fetchTasks(); // Refresh data
          } catch (error) {
            await Swal.fire({
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถเปลี่ยนสถานะโครงการได้ กรุณาลองใหม่อีกครั้ง',
              icon: 'error',
              confirmButtonColor: '#3b82f6'
            });
          }
        }
      } else {
        // Normal approval flow for non-APPROVED projects
        // First, ask if they want to approve the project
        const approvalResult = await Swal.fire({
          title: 'อนุมัติโครงการ',
          text: `คุณต้องการอนุมัติโครงการ "${item.projectName}" ใช่หรือไม่?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#22c55e',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'อนุมัติ',
          cancelButtonText: 'ยกเลิก'
        });

        if (approvalResult.isConfirmed) {
          // Then ask if this should be "The Best Kaizen"
          const bestKaizenResult = await Swal.fire({
            title: 'The Best Kaizen',
            text: `ต้องการให้โครงการ "${item.projectName}" เป็น The Best Kaizen หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ใช่, เป็น The Best Kaizen',
            cancelButtonText: 'ไม่, อนุมัติปกติ'
          });

          const status = bestKaizenResult.isConfirmed ? 'BEST_KAIZEN' : 'APPROVED';
          const statusText = bestKaizenResult.isConfirmed ? 'The Best Kaizen' : 'อนุมัติ';

          try {
            await tasklistAPI.update(item.id, { status: status });
            await Swal.fire({
              title: `${statusText}เรียบร้อย!`,
              text: `โครงการได้รับสถานะ ${statusText} เรียบร้อยแล้ว`,
              icon: 'success',
              confirmButtonColor: '#3b82f6'
            });
            await fetchTasks(); // Refresh data
          } catch (error) {
            await Swal.fire({
              title: 'เกิดข้อผิดพลาด',
              text: 'ไม่สามารถอนุมัติโครงการได้ กรุณาลองใหม่อีกครั้ง',
              icon: 'error',
              confirmButtonColor: '#3b82f6'
            });
          }
        }
      }
    } else if (action === 'edit') {
      const userRole = getUserRole();
      
      // Check edit permissions based on user role and item status
      // Admin and Manager can edit projects in ANY status - completely unrestricted
      if (userRole === 'Admin' || userRole === 'Manager') {
        // Admin and Manager can edit all status projects regardless of status
        // This is separate from approval workflow - just editing permission
      } else if (userRole === 'Supervisor') {
        // Supervisor can only edit WAITING status projects
        if (item.status !== 'WAITING') {
          await Swal.fire({
            title: 'ไม่สามารถแก้ไขได้',
            text: 'Supervisor สามารถแก้ไขได้เฉพาะโครงการที่มีสถานะ "WAITING" เท่านั้น',
            icon: 'warning',
            confirmButtonColor: '#3b82f6'
          });
          return;
        }
      } else {
        // User role can only edit WAITING status projects
        if (item.status !== 'WAITING') {
          await Swal.fire({
            title: 'ไม่สามารถแก้ไขได้',
            text: 'User สามารถแก้ไขได้เฉพาะโครงการที่มีสถานะ "WAITING" เท่านั้น',
            icon: 'warning',
            confirmButtonColor: '#3b82f6'
          });
          return;
        }
      }
      
      // Open edit modal with the item ID
      setEditingProjectId(item.id);
      setShowEditModal(true);
    } else if (action === 'cancel_best_kaizen') {
      const result = await Swal.fire({
        title: 'ยกเลิก Best Kaizen',
        text: `คุณต้องการยกเลิกสถานะ "The Best Kaizen" ของโครงการ "${item.projectName}" และเปลี่ยนกลับเป็น "อนุมัติ" ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ยกเลิก Best Kaizen',
        cancelButtonText: 'ไม่ยกเลิก'
      });

      if (result.isConfirmed) {
        try {
          await tasklistAPI.update(item.id, { status: 'APPROVED' });
          await Swal.fire({
            title: 'ยกเลิกเรียบร้อย!',
            text: 'ยกเลิกสถานะ The Best Kaizen เรียบร้อยแล้ว โครงการได้รับสถานะ "อนุมัติ"',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
          await fetchTasks(); // Refresh data
        } catch (error) {
          await Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถยกเลิกสถานะได้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonColor: '#3b82f6'
          });
        }
      }
    } else if (action === 'view') {
      await handleViewDetails(item);
    } else if (action === 'delete') {
      const result = await Swal.fire({
        title: 'ลบโครงการ',
        text: `คุณต้องการลบโครงการ "${item.projectName}" ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        try {
          await tasklistAPI.delete(item.id);
          await Swal.fire({
            title: 'ลบเรียบร้อย!',
            text: 'ลบโครงการเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
          await fetchTasks(); // Refresh data
        } catch (error) {
          await Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถลบโครงการได้ กรุณาลองใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonColor: '#3b82f6'
          });
        }
      }
    }
  };

  // Handle view details
  const handleViewDetails = async (item) => {
    try {
      setLoadingDetail(true);
      const response = await tasklistAPI.getById(item.id);
      
      if (response.data && response.data.success) {
        const projectData = response.data.data;
        
        // Ensure image paths are properly set - support both field name variations
        if (!projectData.beforeImagePath && projectData.beforeProjectImage) {
          projectData.beforeImagePath = projectData.beforeProjectImage;
        }
        if (!projectData.afterImagePath && projectData.afterProjectImage) {
          projectData.afterImagePath = projectData.afterProjectImage;
        }
        
        console.log('Project data loaded:', {
          id: projectData.id,
          projectName: projectData.projectName,
          beforeImage: projectData.beforeImagePath || projectData.beforeProjectImage,
          afterImage: projectData.afterImagePath || projectData.afterProjectImage
        });
        
        setSelectedProject(projectData);
        setShowDetailModal(true);
      } else {
        throw new Error('Failed to fetch project details');
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดรายละเอียดโครงการได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'APPROVED':
          return 'bg-green-100 text-green-800';
        case 'BEST_KAIZEN':
          return 'bg-yellow-100 text-yellow-800';
        case 'WAITING':
          return 'bg-blue-100 text-blue-800';
        case 'EDIT':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusText = () => {
      switch (status) {
        case 'BEST_KAIZEN':
          return 'BEST KAIZEN';
        default:
          return status;
      }
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-24 justify-center ${getStatusStyle()}`}>
        {getStatusText()}
      </span>
    );
  };

  // Type badge component - same style as Search History
  const TypeBadge = ({ formType }) => {
    const baseClass = "inline-block w-24 text-center px-2 py-1 rounded-full text-xs font-medium";
    switch (formType) {
      case 'genba':
        return <span className={baseClass + " bg-blue-100 text-blue-800"}>GENBA</span>;
      case 'suggestion':
        return <span className={baseClass + " bg-purple-100 text-purple-800"}>SUGGESTION</span>;
      default:
        return <span className={baseClass + " bg-gray-100 text-gray-800"}>{formType}</span>;
    }
  };

  // Action dropdown component
  const ActionDropdown = ({ item, index, totalItems }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
    
    // Check if this is one of the last 2 items to position dropdown upward
    const isNearBottom = index >= totalItems - 2;

    // Get button position when opening dropdown
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

    // Close dropdown when clicking outside
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
        <button
          onClick={handleToggleDropdown}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {/* Portal-like dropdown with fixed positioning */}
        {isOpen && (
          <>
            {/* Overlay to catch clicks */}
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
            
            {/* Dropdown menu */}
            <div 
              className="fixed w-32 bg-white rounded-md shadow-xl border border-gray-200 z-[9999]"
              style={{
                top: isNearBottom ? 'auto' : `${buttonPosition.top + 32}px`,
                bottom: isNearBottom ? `${window.innerHeight - buttonPosition.top + 8}px` : 'auto',
                right: `${buttonPosition.right}px`
              }}
            >
              <div className="py-1">
                {item.status === 'BEST_KAIZEN' ? (
                  <button
                    onClick={() => {
                      handleIndividualAction('cancel_best_kaizen', item);
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100"
                  >
                    ยกเลิก Best Kaizen
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleIndividualAction('approve', item);
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    อนุมัติ
                  </button>
                )}
                
                {/* Show edit option based on role permissions */}
                {(() => {
                  const userRole = getUserRole();
                  const canEdit = 
                    (userRole === 'Admin') || // Admin can edit all status
                    (userRole === 'Manager' && item.status === 'WAITING') || // Manager can only edit WAITING
                    (userRole === 'Supervisor' && item.status === 'WAITING') || // Supervisor can only edit WAITING
                    (userRole === 'User' && item.status === 'WAITING') || // User can only edit WAITING
                    (!userRole && item.status === 'WAITING'); // Default case for User role
                  
                  return canEdit && (
                    <button
                      onClick={() => {
                        handleIndividualAction('edit', item);
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                    >
                      แก้ไข
                    </button>
                  );
                })()}
                
                <button
                  onClick={() => {
                    handleIndividualAction('view', item);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  ดูรายละเอียด
                </button>
                <button
                  onClick={() => {
                    handleIndividualAction('delete', item);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  ลบ
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength = 20) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Helper functions for modal
  const getS5Label = (value) => {
    const s5Options = [
      { value: 'ส1', label: 'ส1 : สะสาง' },
      { value: 'ส2', label: 'ส2 : สะดวก' },
      { value: 'ส3', label: 'ส3 : สะอาด' },
      { value: 'ส4', label: 'ส4 : สร้างมาตรฐาน' },
      { value: 'ส5', label: 'ส5 : สร้างวินัย' },
    ];
    return s5Options.find(opt => opt.value === value)?.label || value || 'ไม่ระบุ';
  };

  const getImproveTopicLabel = (value) => {
    const improveTopics = [
      { value: 'Safety', label: 'Safety (ความปลอดภัย)' },
      { value: 'Env', label: 'Env. (สิ่งแวดล้อม)' },
      { value: 'Quality', label: 'Quality (คุณภาพ)' },
      { value: 'Cost', label: 'Cost (ต้นทุน)' },
      { value: 'Delivery', label: 'Delivery (การส่งมอบ)' },
    ];
    return improveTopics.find(opt => opt.value === value)?.label || value || 'ไม่ระบุ';
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
    return sgsOptions[type]?.find(opt => opt.value === value)?.label || value || 'ไม่ระบุ';
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุ';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Project Detail Modal Component - Enhanced version similar to Search History
  const ProjectDetailModal = () => {
    if (!showDetailModal || !selectedProject) return null;

    const isGenbaForm = selectedProject.formType === 'genba';
    const isBestKaizenForm = selectedProject.formType === 'best_kaizen';

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

    const statusInfo = getStatusDisplay(selectedProject.status);

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowDetailModal(false);
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
                    {isGenbaForm ? 'GENBA FORM' : 
                     selectedProject.formType === 'suggestion' ? 'SUGGESTION FORM' :
                     isBestKaizenForm ? 'THE BEST KAIZEN' : 'รายละเอียดโครงการ'}
                  </h2>
                  <p className="text-blue-100 text-sm opacity-90">
                    {isGenbaForm ? 'ฟอร์มปรับปรุง Genba' : 
                     selectedProject.formType === 'suggestion' ? 'ฟอร์มข้อเสนอแนะ' :
                     isBestKaizenForm ? 'ฟอร์ม The Best Kaizen' : 'รายละเอียดโครงการ'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
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
                        <p className="text-gray-900 font-medium text-sm">{selectedProject.employeeId || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ชื่อ นามสกุล</label>
                        <p className="text-gray-900 font-medium text-sm">
                          {selectedProject.firstName || ''} {selectedProject.lastName || ''}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ตำแหน่ง</label>
                        <p className="text-gray-900 font-medium text-sm">{selectedProject.position || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">แผนก</label>
                        <p className="text-gray-900 font-medium text-sm">{selectedProject.department || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ชื่อกลุ่ม 5ส</label>
                        <p className="text-gray-900 font-medium text-sm">{selectedProject.fiveSGroupName || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">สถานะ</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="sm:col-span-2 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">พื้นที่จัดทำโครงการ</label>
                        <p className="text-gray-900 font-medium text-sm">{selectedProject.projectArea || 'ไม่ระบุ'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: รายละเอียดโครงการ */}
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
                        <p className="text-gray-900 font-medium text-sm">{selectedProject.projectName || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">วันที่เริ่มทำโครงการ</label>
                          <div className="bg-gray-50 rounded-md p-2 border">
                            <p className="text-gray-900 font-medium text-sm">{formatDisplayDate(selectedProject.projectStartDate)}</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">วันที่จบโครงการ</label>
                          <div className="bg-gray-50 rounded-md p-2 border">
                            <p className="text-gray-900 font-medium text-sm">{formatDisplayDate(selectedProject.projectEndDate)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ปัญหาที่เจอ</label>
                          <p className="text-gray-900 font-medium text-sm leading-relaxed">{selectedProject.problemsEncountered || 'ไม่ระบุ'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">แนวทางแก้ไข</label>
                          <p className="text-gray-900 font-medium text-sm leading-relaxed">{selectedProject.solutionApproach || 'ไม่ระบุ'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">การรับรองมาตรฐาน</label>
                          <p className="text-gray-900 font-medium text-sm leading-relaxed">{selectedProject.standardCertification || '-'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">ผลลัพธ์ที่ได้</label>
                          <p className="text-gray-900 font-medium text-sm leading-relaxed">{selectedProject.resultsAchieved || 'อยู่ระหว่างการประเมินผล'}</p>
                        </div>
                      </div>
                      
                      {/* Dates Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">วันที่สร้าง</label>
                          <div className="bg-gray-50 rounded-md p-2 border">
                            <p className="text-gray-900 font-medium text-sm">{selectedProject.createdDateTh || 'ไม่ระบุ'}</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">วันที่ส่ง</label>
                          <div className="bg-gray-50 rounded-md p-2 border">
                            <p className="text-gray-900 font-medium text-sm">{selectedProject.submittedDateTh || 'ไม่ระบุ'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Images */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <label className="block text-xs font-semibold text-blue-600 mb-3 uppercase tracking-wide">รูปก่อนจัดทำโครงการ</label>
                          <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
                            {(selectedProject.beforeImagePath || selectedProject.beforeProjectImage) ? (
                              <ProjectImage 
                                src={selectedProject.beforeImagePath || selectedProject.beforeProjectImage}
                                alt="รูปก่อนจัดทำโครงการ"
                                className="w-full object-cover rounded-lg shadow-md"
                                height="200px"
                                onError={(error) => {
                                  console.warn('Before image load error:', error);
                                }}
                              />
                            ) : (
                              <div>
                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-gray-500">ไม่มีรูปภาพ</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {isGenbaForm && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <label className="block text-xs font-semibold text-blue-600 mb-3 uppercase tracking-wide">รูปหลังจัดทำโครงการ</label>
                            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
                              {(selectedProject.afterImagePath || selectedProject.afterProjectImage) ? (
                                <ProjectImage 
                                  src={selectedProject.afterImagePath || selectedProject.afterProjectImage}
                                  alt="รูปหลังจัดทำโครงการ"
                                  className="w-full object-cover rounded-lg shadow-md"
                                  height="200px"
                                  onError={(error) => {
                                    console.warn('After image load error:', error);
                                  }}
                                />
                              ) : (
                                <div>
                                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-sm text-gray-500">ไม่มีรูปภาพ</p>
                                </div>
                              )}
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
                          {getS5Label(selectedProject.fiveSType)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <label className="block text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">หัวข้อที่ปรับปรุง</label>
                        <p className="text-gray-900 font-medium text-sm text-green-600">
                          {getImproveTopicLabel(selectedProject.improvementTopic)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                        <label className="block text-sm font-bold text-blue-600 mb-3">ส่งเสริมอัตลักษณ์ SGS Way ด้าน</label>
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <span className="block text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">S : Smart</span>
                            <p className="text-gray-900 font-medium text-sm">
                              {getSGSLabel(selectedProject.SGS_Smart, 'Smart')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <span className="block text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">G : Green</span>
                            <p className="text-gray-900 font-medium text-sm">
                              {getSGSLabel(selectedProject.SGS_Green, 'Green')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                            <span className="block text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">S : Strong</span>
                            <p className="text-gray-900 font-medium text-sm">
                              {getSGSLabel(selectedProject.SGS_Strong, 'Strong')}
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
                  onClick={() => setShowDetailModal(false)}
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-8">TASK DAILY</h1>
        <SkeletonLoader rows={10} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-blue-600 mb-8">TASK DAILY</h1>

      {/* Search Bar */}
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
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveFilter('genba')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeFilter === 'genba'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          GENBA
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{filterCounts.genba}</span>
        </button>
        <button
          onClick={() => setActiveFilter('suggestion')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeFilter === 'suggestion'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          SUGGESTION FORM
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{filterCounts.suggestion}</span>
        </button>
        <button
          onClick={() => setActiveFilter('best_kaizen')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeFilter === 'best_kaizen'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          THE BEST KAIZEN
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{filterCounts.best_kaizen}</span>
        </button>
        {getUserRole() !== 'Admin' && (
          <button
            onClick={() => setActiveFilter('approved')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeFilter === 'approved'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            APPROVED
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{filterCounts.approved}</span>
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Month Picker */}
        <div className="relative month-picker-dropdown">
          <button
            onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {selectedMonth.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}
          </button>
          
          {isMonthPickerOpen && (
            <div className="absolute left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-20 p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-semibold">
                  {selectedMonth.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}
                </span>
                <button
                  onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedMonth(new Date());
                    setIsMonthPickerOpen(false);
                  }}
                  className="flex-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  เดือนปัจจุบัน
                </button>
                <button
                  onClick={() => setIsMonthPickerOpen(false)}
                  className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  ปิด
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Left side - Manage dropdown */}
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
                {/* Show cancel Best Kaizen if any selected items have BEST_KAIZEN status */}
                {selectedItems.some(id => {
                  const item = allTasks.find(task => task.id === id);
                  return item?.status === 'BEST_KAIZEN';
                }) && (
                  <button
                    onClick={handleBulkCancelBestKaizen}
                    className="block w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100"
                  >
                    ยกเลิก Best Kaizen
                  </button>
                )}
                {/* Show approve only for non-BEST_KAIZEN items */}
                {selectedItems.some(id => {
                  const item = allTasks.find(task => task.id === id);
                  return item?.status !== 'BEST_KAIZEN';
                }) && (
                  <button
                    onClick={handleBulkApprove}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    อนุมัติ
                  </button>
                )}
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

        {/* Department Filter Dropdown for Admin */}
        {getUserRole() === 'Admin' && (
          <div className="relative department-dropdown">
            <button
              onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {selectedDepartment ? selectedDepartment : 'ทุกแผนก'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDepartmentDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedDepartment('');
                      setIsDepartmentDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    ทุกแผนก ({Object.values(departmentCounts).reduce((a, b) => a + b, 0)})
                  </button>
                  {uniqueDepartments.map((department) => (
                    <button
                      key={department}
                      onClick={() => {
                        setSelectedDepartment(department);
                        setIsDepartmentDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {department} ({departmentCounts[department] || 0})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sort button */}
        <button
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          {sortOrder === 'newest' ? 'ใหม่ไปเก่า' : 'เก่าไปใหม่'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={fetchTasks}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === currentData.length && currentData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-sm">ชื่อโครงการ</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">รหัสพนักงาน</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">ตำแหน่ง</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">แผนก</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">ชื่อกลุ่ม 5ส</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">วันที่สร้าง</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">วันที่ส่ง</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">สถานะ</th>
                <th className="px-4 py-3 text-center font-semibold text-sm"></th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-sm" title={item.projectName}>{truncateText(item.projectName, 20)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{item.employeeId}</td>
                  <td className="px-4 py-3 text-sm">{item.firstName} {item.lastName}</td>
                  <td className="px-4 py-3 text-sm">{item.position}</td>
                  <td className="px-4 py-3 text-sm">{item.department}</td>
                  <td className="px-4 py-3 text-sm">{item.fiveSGroupName}</td>
                  <td className="px-4 py-3 text-sm">{item.createdDateTh}</td>
                  <td className="px-4 py-3 text-sm">{item.submittedDateTh}</td>
                  <td className="px-4 py-3">
                    <TypeBadge formType={item.formType} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ActionDropdown item={item} index={index} totalItems={currentData.length} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {currentData.length === 0 && totalItems === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-600 font-medium">ไม่พบข้อมูลโครงการ</p>
              <p className="text-sm text-gray-400 mt-1">ลองปรับเปลี่ยนการค้นหาหรือตัวกรองข้อมูล</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            แสดง {startIndex + 1} ถึง {Math.min(endIndex, totalItems)} จาก {totalItems} รายการ
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page numbers */}
            {(() => {
              const pageNumbers = [];
              const maxVisiblePages = 5;
              let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
              let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
              
              // Adjust start page if we're near the end
              if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }
              
              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 rounded ${
                      i === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              return pageNumbers;
            })()}
            
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Project Detail Modal */}
      <ProjectDetailModal />

      {/* Edit Form Modal */}
      <EditForm
        projectId={editingProjectId}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProjectId(null);
        }}
        onSuccess={() => {
          fetchTasks(); // Refresh the task list
        }}
      />

      {/* Loading overlay for detail modal */}
      {loadingDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">กำลังโหลดรายละเอียด...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasklist;