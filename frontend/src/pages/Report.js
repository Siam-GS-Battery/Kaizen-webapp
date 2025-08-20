import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { reportsAPI, tasklistAPI } from '../services/apiService';
import ProjectImage from '../components/ProjectImage';
import Swal from 'sweetalert2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Report = () => {
  // Status badge component (matching Tasklist styling)
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
        case 'APPROVED':
          return 'APPROVED';
        case 'BEST_KAIZEN':
          return 'BEST KAIZEN';
        case 'WAITING':
          return 'WAITING';
        case 'EDIT':
          return 'แก้ไข';
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

  // Type badge component (matching Tasklist styling)
  const TypeBadge = ({ formType }) => {
    const baseClass = "inline-block w-24 text-center px-3 py-1 rounded-full text-xs font-medium";
    switch (formType) {
      case 'genba':
        return <span className={baseClass + " bg-blue-100 text-blue-800"}>GENBA</span>;
      case 'suggestion':
        return <span className={baseClass + " bg-purple-100 text-purple-800"}>SUGGESTION</span>;
      default:
        return <span className={baseClass + " bg-gray-100 text-gray-800"}>{formType}</span>;
    }
  };

  // Get current month in English format
  const getCurrentMonth = () => {
    const months = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    const currentDate = new Date();
    return months[currentDate.getMonth()];
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedProjectDepartment, setSelectedProjectDepartment] = useState('ALL');
  const [allData, setAllData] = useState({});
  const [projectData, setProjectData] = useState({
    genbaProjects: [],
    suggestionProjects: [],
    bestKaizenProjects: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Load data from API on component mount
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentYear = new Date().getFullYear();
        const response = await reportsAPI.getMonthlyReports({ year: currentYear });
        setAllData(response.data.data);
      } catch (err) {
        console.error('Error fetching reports data:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน');
        // Fallback to hardcoded data if API fails
        setAllData({
          JUNE: {
            totalEmployees: 646,
            submittedReports: 643,
            notSubmittedReports: 3,
            successRate: 97,
            departments: [
              { name: 'HR & AD', code: 'HR&AD', employees: 20, submitted: 20, rate: 100 },
              { name: 'AF', code: 'AF', employees: 21, submitted: 21, rate: 100 },
              { name: 'PC', code: 'PC', employees: 13, submitted: 13, rate: 100 },
              { name: 'PD', code: 'PD', employees: 27, submitted: 23, rate: 85.2 },
              { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
              { name: 'SD', code: 'SD', employees: 16, submitted: 10, rate: 62.5 },
              { name: 'TD', code: 'TD', employees: 15, submitted: 14, rate: 93.3 },
              { name: 'IT & DM', code: 'IT&DM', employees: 8, submitted: 8, rate: 100 }
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  // Refetch project data when month or department changes
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const params = { 
          year: currentYear,
          month: selectedMonth 
        };
        if (selectedProjectDepartment !== 'ALL') {
          params.department = selectedProjectDepartment;
        }
        
        const projectResponse = await reportsAPI.getProjectData(params);
        setProjectData(projectResponse.data.data);
      } catch (projectErr) {
        console.warn('Could not fetch project data for month:', selectedMonth, projectErr);
        // Set empty fallback project data on error
        setProjectData({
          genbaProjects: [],
          suggestionProjects: [],
          bestKaizenProjects: []
        });
      }
    };

    if (selectedMonth) {
      fetchProjectData();
    }
  }, [selectedMonth, selectedProjectDepartment]);

  const getFilteredData = () => {
    if (!allData || !allData[selectedMonth]) {
      return {
        totalEmployees: 0,
        submittedReports: 0,
        notSubmittedReports: 0,
        successRate: 0,
        departments: []
      };
    }
    
    const monthData = allData[selectedMonth];
    
    if (selectedDepartment === 'ALL') {
      return monthData;
    } else {
      const dept = monthData.departments.find(d => d.code === selectedDepartment);
      if (dept) {
        return {
          totalEmployees: dept.employees,
          submittedReports: dept.submitted,
          notSubmittedReports: dept.employees - dept.submitted,
          successRate: Math.round(dept.rate),
          departments: [dept]
        };
      }
    }
    return monthData;
  };

  const filteredData = getFilteredData();

  // Get unique departments from project data
  const getProjectDepartments = () => {
    const allProjects = [
      ...projectData.genbaProjects,
      ...projectData.suggestionProjects,
      ...projectData.bestKaizenProjects
    ];
    const departments = [...new Set(allProjects.map(project => project.department))];
    return departments.sort();
  };

  const getMonthNameThai = (month) => {
    const monthMap = {
      'JANUARY': 'มกราคม',
      'FEBRUARY': 'กุมภาพันธ์',
      'MARCH': 'มีนาคม',
      'APRIL': 'เมษายน',
      'MAY': 'พฤษภาคม',
      'JUNE': 'มิถุนายน',
      'JULY': 'กรกฎาคม',
      'AUGUST': 'สิงหาคม',
      'SEPTEMBER': 'กันยายน',
      'OCTOBER': 'ตุลาคม',
      'NOVEMBER': 'พฤศจิกายน',
      'DECEMBER': 'ธันวาคม'
    };
    return monthMap[month] || month;
  };

  // Handle view details function
  const handleViewDetails = async (item) => {
    try {
      setLoadingDetail(true);
      const response = await tasklistAPI.getById(item.id);
      
      if (response.data && response.data.success) {
        const projectData = response.data.data;
        
        // Ensure image paths are properly set
        if (!projectData.beforeImagePath && projectData.beforeProjectImage) {
          projectData.beforeImagePath = projectData.beforeProjectImage;
        }
        if (!projectData.afterImagePath && projectData.afterProjectImage) {
          projectData.afterImagePath = projectData.afterProjectImage;
        }
        
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

  const pieChartData = {
    labels: ['จำนวนเรื่องที่ส่งแล้ว', 'จำนวนเรื่องที่ยังไม่ส่ง'],
    datasets: [
      {
        data: [filteredData.submittedReports, filteredData.notSubmittedReports],
        backgroundColor: ['#2563eb', '#93c5fd'],
        borderWidth: 0,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
    },
    maintainAspectRatio: false,
  };

  const barChartData = {
    labels: filteredData.departments.map(dept => dept.code),
    datasets: [
      {
        label: 'เปอร์เซ็นต์การส่ง Kaizen',
        data: filteredData.departments.map(dept => dept.rate),
        backgroundColor: [
          'rgb(59, 130, 246)', // blue-500
          'rgb(99, 102, 241)', // indigo-500
          'rgb(168, 85, 247)', // purple-500
          'rgb(236, 72, 153)', // pink-500
          'rgb(239, 68, 68)',  // red-500
          'rgb(249, 115, 22)', // orange-500
          'rgb(234, 179, 8)',  // yellow-500
          'rgb(34, 197, 94)'   // green-500
        ],
        borderRadius: 6,
        hoverBackgroundColor: [
          'rgb(37, 99, 235)', // blue-600
          'rgb(79, 70, 229)', // indigo-600
          'rgb(147, 51, 234)', // purple-600
          'rgb(219, 39, 119)', // pink-600
          'rgb(220, 38, 38)',  // red-600
          'rgb(234, 88, 12)',  // orange-600
          'rgb(202, 138, 4)',  // yellow-600
          'rgb(22, 163, 74)'   // green-600
        ],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          font: {
            size: 12
          },
          color: 'rgb(107, 114, 128)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          },
          color: 'rgb(107, 114, 128)'
        }
      }
    },
    maintainAspectRatio: false,
    animation: {
      duration: 500
    },
    hover: {
      mode: 'index',
      intersect: false
    }
  };

  const lineChartData = {
    labels: filteredData.departments.map(dept => dept.code),
    datasets: [
      {
        label: 'จำนวนเรื่องที่ส่งแล้ว',
        data: filteredData.departments.map(dept => dept.submitted),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'จำนวนเรื่องที่ยังไม่ส่ง',
        data: filteredData.departments.map(dept => dept.employees - dept.submitted),
        borderColor: '#d1d5db',
        backgroundColor: 'rgba(209, 213, 219, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          ผลสรุปประจำเดือน{getMonthNameThai(selectedMonth)} {new Date().getFullYear() + 543}
          {selectedDepartment !== 'ALL' && ` - ${selectedDepartment}`}
        </h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{filteredData.totalEmployees}</div>
            <div className="text-sm">
              {selectedDepartment === 'ALL' ? 'จำนวนพนักงานทั้งหมด' : 'จำนวนพนักงานในแผนก'}
            </div>
          </div>
          <div className="bg-green-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{filteredData.submittedReports}</div>
            <div className="text-sm">จำนวนเรื่องที่ส่งแล้ว</div>
          </div>
          <div className="bg-red-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{filteredData.notSubmittedReports}</div>
            <div className="text-sm">จำนวนเรื่องที่ยังไม่ส่ง</div>
          </div>
          <div className="bg-purple-600 rounded-lg p-6 text-white">
            <div className="text-3xl font-bold">{filteredData.successRate}%</div>
            <div className="text-sm">เปอร์เซ็นต์ความสำเร็จ</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Month Filter */}
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-6 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M7%207l3-3%203%203m0%206l-3%203-3-3%22%20stroke%3D%22%236b7280%22%20fill%3D%22none%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-no-repeat bg-[right_12px_center]"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          {/* Department Filter for Reports */}
          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-6 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M7%207l3-3%203%203m0%206l-3%203-3-3%22%20stroke%3D%22%236b7280%22%20fill%3D%22none%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-no-repeat bg-[right_12px_center]"
          >
            <option value="ALL">ทั้งหมด</option>
            {allData[selectedMonth]?.departments?.map(dept => (
              <option key={dept.code} value={dept.code}>{dept.name}</option>
            )) || []}
          </select>

        </div>


        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">แผนภาพเปรียบเทียบจำนวนเรื่องที่ถูกส่งและยังไม่ถูกส่ง</h3>
            <div className="h-64">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">เปอร์เซ็นต์การส่ง Kaizen ประจำเดือน{getMonthNameThai(selectedMonth)}ของแต่ละหน่วยงาน</h3>
            <div className="h-64">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Line Chart and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">จำนวนการส่ง KAIZEN</h3>
            <p className="text-sm text-gray-600 mb-4">SORT BY DEPARTMENT</p>
            <div className="h-64">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Department Table */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">จำนวนการส่ง KAIZEN</h3>
                <p className="text-sm text-gray-600">SORT BY DEPARTMENT</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Employee count</th>
                    <th className="px-4 py-3 text-left">Submitted count</th>
                    <th className="px-4 py-3 text-left">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.departments.map((dept, index) => (
                    <tr key={dept.code} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3">{dept.code}</td>
                      <td className="px-4 py-3">{dept.employees}</td>
                      <td className="px-4 py-3">{dept.submitted}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="mr-2">{dept.rate}%</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${dept.rate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Project Tables Section */}
        <div className="mt-8 space-y-6">
          {/* Project Department Filter */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">รายการโครงการประจำเดือน{getMonthNameThai(selectedMonth)}</h2>
            <select 
              value={selectedProjectDepartment} 
              onChange={(e) => setSelectedProjectDepartment(e.target.value)}
              className="px-4 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M7%207l3-3%203%203m0%206l-3%203-3-3%22%20stroke%3D%22%236b7280%22%20fill%3D%22none%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-no-repeat bg-[right_8px_center]"
            >
              <option value="ALL">แผนกทั้งหมด</option>
              {getProjectDepartments().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          {/* Genba Projects Table */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">โครงการ Genba ประจำเดือน{getMonthNameThai(selectedMonth)} ({projectData.genbaProjects.length} รายการ)</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="bg-blue-600 text-white">
                  <tr>
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
                  {projectData.genbaProjects.map((project, index) => (
                    <tr key={project.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3">{project.projectName}</td>
                      <td className="px-4 py-3">{project.employeeId}</td>
                      <td className="px-4 py-3">{project.fullName}</td>
                      <td className="px-4 py-3">{project.position}</td>
                      <td className="px-4 py-3">{project.department}</td>
                      <td className="px-4 py-3">{project.group5s}</td>
                      <td className="px-4 py-3">{new Date(project.createdDate).toLocaleDateString('th-TH')}</td>
                      <td className="px-4 py-3">{new Date(project.submittedDate).toLocaleDateString('th-TH')}</td>
                      <td className="px-4 py-3">
                        <TypeBadge formType={project.formType} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewDetails(project)}
                          className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {projectData.genbaProjects.length === 0 && (
                    <tr>
                      <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                        ไม่มีโครงการ Genba ในเดือนนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Suggestion Projects Table */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-4 text-green-600">โครงการ Suggestion ประจำเดือน{getMonthNameThai(selectedMonth)} ({projectData.suggestionProjects.length} รายการ)</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="bg-green-600 text-white">
                  <tr>
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
                  {projectData.suggestionProjects.map((project, index) => (
                    <tr key={project.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3">{project.projectName}</td>
                      <td className="px-4 py-3">{project.employeeId}</td>
                      <td className="px-4 py-3">{project.fullName}</td>
                      <td className="px-4 py-3">{project.position}</td>
                      <td className="px-4 py-3">{project.department}</td>
                      <td className="px-4 py-3">{project.group5s}</td>
                      <td className="px-4 py-3">{new Date(project.createdDate).toLocaleDateString('th-TH')}</td>
                      <td className="px-4 py-3">{new Date(project.submittedDate).toLocaleDateString('th-TH')}</td>
                      <td className="px-4 py-3">
                        <TypeBadge formType={project.formType} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewDetails(project)}
                          className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {projectData.suggestionProjects.length === 0 && (
                    <tr>
                      <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                        ไม่มีโครงการ Suggestion ในเดือนนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Best Kaizen Projects Table */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-4 text-purple-600">โครงการ Best Kaizen ประจำเดือน{getMonthNameThai(selectedMonth)} ({projectData.bestKaizenProjects.length} รายการ)</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="bg-purple-600 text-white">
                  <tr>
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
                  {projectData.bestKaizenProjects.map((project, index) => (
                    <tr key={project.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3 font-medium">{project.projectName}</td>
                      <td className="px-4 py-3">{project.employeeId}</td>
                      <td className="px-4 py-3">{project.fullName}</td>
                      <td className="px-4 py-3">{project.position}</td>
                      <td className="px-4 py-3">{project.department}</td>
                      <td className="px-4 py-3">{project.group5s}</td>
                      <td className="px-4 py-3">{new Date(project.createdDate).toLocaleDateString('th-TH')}</td>
                      <td className="px-4 py-3">{new Date(project.submittedDate).toLocaleDateString('th-TH')}</td>
                      <td className="px-4 py-3">
                        <TypeBadge formType={project.formType} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewDetails(project)}
                          className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {projectData.bestKaizenProjects.length === 0 && (
                    <tr>
                      <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                        ไม่มีโครงการ Best Kaizen ในเดือนนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Project Detail Modal */}
        {showDetailModal && selectedProject && (
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
                        {selectedProject.formType === 'genba' ? 'GENBA FORM' : 
                         selectedProject.formType === 'suggestion' ? 'SUGGESTION FORM' :
                         selectedProject.formType === 'best_kaizen' ? 'THE BEST KAIZEN' : 'รายละเอียดโครงการ'}
                      </h2>
                      <p className="text-blue-100 text-sm opacity-90">
                        {selectedProject.formType === 'genba' ? 'ฟอร์มปรับปรุง Genba' : 
                         selectedProject.formType === 'suggestion' ? 'ฟอร์มข้อเสนอแนะ' :
                         selectedProject.formType === 'best_kaizen' ? 'ฟอร์ม The Best Kaizen' : 'รายละเอียดโครงการ'}
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
                            <StatusBadge status={selectedProject.status} />
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
                            {selectedProject.formType === 'genba' && (
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
        )}

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
    </div>
  );
};

export default Report;