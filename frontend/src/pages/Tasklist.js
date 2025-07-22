import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { tasklistData } from '../data/tasklistData';

const Tasklist = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isManageDropdownOpen, setIsManageDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [filteredData, setFilteredData] = useState(tasklistData);

  // Filter และ search ข้อมูล
  useEffect(() => {
    let filtered = tasklistData;

    // Filter ตาม type และ status
    if (activeFilter !== 'all') {
      if (activeFilter === 'genba') {
        filtered = filtered.filter(item => 
          item.formType === 'genba' && 
          (item.สถานะ === 'WAITING' || item.สถานะ === 'EDIT')
        );
      } else if (activeFilter === 'suggestion') {
        filtered = filtered.filter(item => 
          item.formType === 'suggestion' && 
          (item.สถานะ === 'WAITING' || item.สถานะ === 'EDIT')
        );
      } else if (activeFilter === 'best_kaizen') {
        filtered = filtered.filter(item => 
          item.formType === 'best_kaizen' && 
          item.สถานะ === 'APPROVED'
        );
      }
    }

    // Search ตามชื่อโครงการ
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.ชื่อโครงการ.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ชื่อ.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.นามสกุล.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.รหัสพนักงาน.includes(searchTerm)
      );
    }

    // Sort ตามวันที่
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdDate);
      const dateB = new Date(b.createdDate);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredData(filtered);
  }, [searchTerm, activeFilter, sortOrder]);

  // Get filter counts based on status requirements
  const getFilterCounts = () => {
    return {
      genba: tasklistData.filter(item => 
        item.formType === 'genba' && 
        (item.สถานะ === 'WAITING' || item.สถานะ === 'EDIT')
      ).length,
      suggestion: tasklistData.filter(item => 
        item.formType === 'suggestion' && 
        (item.สถานะ === 'WAITING' || item.สถานะ === 'EDIT')
      ).length,
      best_kaizen: tasklistData.filter(item => 
        item.formType === 'best_kaizen' && 
        item.สถานะ === 'APPROVED'
      ).length,
    };
  };

  const filterCounts = getFilterCounts();

  // Handle checkbox selection
  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(filteredData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handle bulk actions
  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) return;

    const result = await Swal.fire({
      title: 'อนุมัติโครงการ',
      text: `คุณต้องการอนุมัติโครงการ ${selectedItems.length} รายการใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'อนุมัติ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: 'อนุมัติเรียบร้อย!',
        text: `อนุมัติโครงการ ${selectedItems.length} รายการเรียบร้อยแล้ว`,
        icon: 'success',
        confirmButtonColor: '#3b82f6'
      });
      setSelectedItems([]);
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
      await Swal.fire({
        title: 'ลบเรียบร้อย!',
        text: `ลบโครงการ ${selectedItems.length} รายการเรียบร้อยแล้ว`,
        icon: 'success',
        confirmButtonColor: '#3b82f6'
      });
      setSelectedItems([]);
    }
  };

  // Handle individual actions
  const handleIndividualAction = async (action, item) => {
    if (action === 'approve') {
      const result = await Swal.fire({
        title: 'อนุมัติโครงการ',
        text: `คุณต้องการอนุมัติโครงการ "${item.ชื่อโครงการ}" ใช่หรือไม่?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'อนุมัติ',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        await Swal.fire({
          title: 'อนุมัติเรียบร้อย!',
          text: 'อนุมัติโครงการเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
      }
    } else if (action === 'edit') {
      await Swal.fire({
        title: 'แก้ไขโครงการ',
        text: 'ฟีเจอร์การแก้ไขยังอยู่ในระหว่างการพัฒนา',
        icon: 'info',
        confirmButtonColor: '#3b82f6'
      });
    } else if (action === 'delete') {
      const result = await Swal.fire({
        title: 'ลบโครงการ',
        text: `คุณต้องการลบโครงการ "${item.ชื่อโครงการ}" ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      });

      if (result.isConfirmed) {
        await Swal.fire({
          title: 'ลบเรียบร้อย!',
          text: 'ลบโครงการเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
      }
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'APPROVED':
          return 'bg-green-100 text-green-800';
        case 'WAITING':
          return 'bg-yellow-100 text-yellow-800';
        case 'EDIT':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-20 justify-center ${getStatusStyle()}`}>
        {status}
      </span>
    );
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
                <button
                  onClick={() => {
                    handleIndividualAction('approve', item);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  อนุมัติ
                </button>
                <button
                  onClick={() => {
                    handleIndividualAction('edit', item);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  แก้ไข
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
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
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
                <button
                  onClick={handleBulkApprove}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  อนุมัติ
                </button>
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
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
                <th className="px-4 py-3 text-left font-semibold text-sm">สถานะ</th>
                <th className="px-4 py-3 text-center font-semibold text-sm"></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
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
                    <span className="font-medium text-sm">{item.ชื่อโครงการ}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{item.รหัสพนักงาน}</td>
                  <td className="px-4 py-3 text-sm">{item.ชื่อ} {item.นามสกุล}</td>
                  <td className="px-4 py-3 text-sm">{item.ตำแหน่ง}</td>
                  <td className="px-4 py-3 text-sm">{item.แผนก}</td>
                  <td className="px-4 py-3 text-sm">{item.ชื่อกลุ่ม5ส}</td>
                  <td className="px-4 py-3 text-sm">{item.วันที่สร้าง}</td>
                  <td className="px-4 py-3 text-sm">{item.วันที่ส่ง}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.สถานะ} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ActionDropdown item={item} index={index} totalItems={filteredData.length} />
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
    </div>
  );
};

export default Tasklist;