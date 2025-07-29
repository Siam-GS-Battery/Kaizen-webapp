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
  const [selectedMonth, setSelectedMonth] = useState('JUNE');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  
  const allData = {
    JANUARY: {
      totalEmployees: 630,
      submittedReports: 600,
      notSubmittedReports: 30,
      successRate: 95,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 18, rate: 90 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 19, rate: 90.5 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 12, rate: 92.3 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 20, rate: 74.1 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 9, rate: 90 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 8, rate: 50 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 12, rate: 80 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 7, rate: 87.5 }
      ]
    },
    FEBRUARY: {
      totalEmployees: 635,
      submittedReports: 610,
      notSubmittedReports: 25,
      successRate: 96,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 19, rate: 95 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 20, rate: 95.2 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 12, rate: 92.3 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 22, rate: 81.5 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 9, rate: 56.3 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 13, rate: 86.7 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 8, rate: 100 }
      ]
    },
    MARCH: {
      totalEmployees: 640,
      submittedReports: 620,
      notSubmittedReports: 20,
      successRate: 97,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 19, rate: 95 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 21, rate: 100 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 13, rate: 100 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 24, rate: 88.9 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 10, rate: 62.5 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 14, rate: 93.3 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 8, rate: 100 }
      ]
    },
    APRIL: {
      totalEmployees: 642,
      submittedReports: 625,
      notSubmittedReports: 17,
      successRate: 97,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 20, rate: 100 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 21, rate: 100 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 13, rate: 100 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 22, rate: 81.5 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 9, rate: 56.3 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 14, rate: 93.3 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 8, rate: 100 }
      ]
    },
    MAY: {
      totalEmployees: 645,
      submittedReports: 630,
      notSubmittedReports: 15,
      successRate: 98,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 20, rate: 100 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 21, rate: 100 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 13, rate: 100 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 25, rate: 92.6 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 11, rate: 68.8 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 14, rate: 93.3 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 8, rate: 100 }
      ]
    },
    JUNE: {
      totalEmployees: 646,
      submittedReports: 643,
      notSubmittedReports: 3,
      successRate: 97,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 20, rate: 100 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 21, rate: 100 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 13, rate: 100 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 23, rate: 85.2 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 10, rate: 62.5 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 14, rate: 93.3 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 8, rate: 100 }
      ]
    },
    JULY: {
      totalEmployees: 648,
      submittedReports: 635,
      notSubmittedReports: 13,
      successRate: 98,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 20, rate: 100 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 21, rate: 100 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 13, rate: 100 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 24, rate: 88.9 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 12, rate: 75 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 15, rate: 100 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 8, rate: 100 }
      ]
    },
    AUGUST: {
      totalEmployees: 650,
      submittedReports: 640,
      notSubmittedReports: 10,
      successRate: 98,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 20, rate: 100 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 21, rate: 100 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 13, rate: 100 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 25, rate: 92.6 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 13, rate: 81.3 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 15, rate: 100 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 8, rate: 100 }
      ]
    },
    SEPTEMBER: {
      totalEmployees: 652,
      submittedReports: 645,
      notSubmittedReports: 7,
      successRate: 99,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 20, rate: 100 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 21, rate: 100 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 13, rate: 100 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 26, rate: 96.3 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 14, rate: 87.5 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 15, rate: 100 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 8, rate: 100 }
      ]
    },
    OCTOBER: {
      totalEmployees: 655,
      submittedReports: 650,
      notSubmittedReports: 5,
      successRate: 99,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 20, rate: 100 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 21, rate: 100 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 13, rate: 100 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 26, rate: 96.3 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 15, rate: 93.8 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 15, rate: 100 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 8, rate: 100 }
      ]
    },
    NOVEMBER: {
      totalEmployees: 658,
      submittedReports: 652,
      notSubmittedReports: 6,
      successRate: 99,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 20, rate: 100 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 21, rate: 100 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 13, rate: 100 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 25, rate: 92.6 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 14, rate: 87.5 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 15, rate: 100 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 8, rate: 100 }
      ]
    },
    DECEMBER: {
      totalEmployees: 660,
      submittedReports: 655,
      notSubmittedReports: 5,
      successRate: 99,
      departments: [
        { name: 'HR & AD', code: 'HR & AD', employees: 20, submitted: 20, rate: 100 },
        { name: 'AF', code: 'AF', employees: 21, submitted: 21, rate: 100 },
        { name: 'PC', code: 'PC', employees: 13, submitted: 13, rate: 100 },
        { name: 'PD', code: 'PD', employees: 27, submitted: 26, rate: 96.3 },
        { name: 'QA', code: 'QA', employees: 10, submitted: 10, rate: 100 },
        { name: 'SD', code: 'SD', employees: 16, submitted: 15, rate: 93.8 },
        { name: 'TD', code: 'TD', employees: 15, submitted: 15, rate: 100 },
        { name: 'IT & DM', code: 'IT & DM', employees: 8, submitted: 8, rate: 100 }
      ]
    }
  };

  const getFilteredData = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          ผลสรุปประจำเดือน{getMonthNameThai(selectedMonth)} 2568
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
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-6 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M7%207l3-3%203%203m0%206l-3%203-3-3%22%20stroke%3D%22%236b7280%22%20fill%3D%22none%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-no-repeat bg-[right_12px_center]"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-6 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M7%207l3-3%203%203m0%206l-3%203-3-3%22%20stroke%3D%22%236b7280%22%20fill%3D%22none%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-no-repeat bg-[right_12px_center]"
          >
            <option value="ALL">ทั้งหมด</option>
            {allData[selectedMonth].departments.map(dept => (
              <option key={dept.code} value={dept.code}>{dept.name}</option>
            ))}
          </select>
          {/* <button className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button> */}
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
      </div>
    </div>
  );
};

export default Report;