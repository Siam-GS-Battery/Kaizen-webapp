import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';

const Home = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth();
    return currentMonth === 0 ? 11 : currentMonth - 1; // Previous month, handle January wrap-around
  });
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);

  // Get current date and format Thai months
  const getCurrentDate = () => {
    const now = new Date();
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const englishMonths = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    
    const day = now.getDate();
    const month = now.getMonth();
    const nextMonth = (month + 1) % 12;
    const thaiYear = now.getFullYear() + 543; // Convert to Buddhist Era
    
    return {
      day,
      thaiMonth: thaiMonths[month],
      nextThaiMonth: thaiMonths[nextMonth],
      englishMonth: englishMonths[month],
      thaiYear,
      formattedDate: `วันที่ ${day} ${thaiMonths[month]} ${thaiYear}`,
      thaiMonths,
      englishMonths
    };
  };

  const currentDate = getCurrentDate();

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await apiService.get('/health');
        setApiStatus(response.data);
      } catch (error) {
        setApiStatus({ status: 'Error', message: 'API connection failed' });
      }
    };

    checkApiHealth();
  }, []);

  const departmentData = [
    { name: 'HR & AD', employees: 20, submitted: 20, completion: 100 },
    { name: 'AF', employees: 21, submitted: 21, completion: 100 },
    { name: 'PC', employees: 19, submitted: 19, completion: 100 },
    { name: 'PD', employees: 22, submitted: 23, completion: 100 },
    { name: 'QA', employees: 10, submitted: 10, completion: 100 },
    { name: 'SD', employees: 16, submitted: 10, completion: 62 },
    { name: 'TD', employees: 15, submitted: 14, completion: 93 },
    { name: 'IT & DM', employees: 8, submitted: 8, completion: 100 }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with curved background */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 lg:py-48 relative z-10">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mb-4 sm:mb-6 leading-tight">
              ยินดีต้อนรับสู่เว็บไซต์ KAIZEN ONLINE
            </h1>
            <p className="text-lg sm:text-xl mb-2 sm:mb-4">
              กำหนดการส่งเอกสารประจำเดือน {currentDate.nextThaiMonth}
            </p>
            <p className="text-base sm:text-lg mb-8 sm:mb-12">
              วันที่ 31 กรกฎาคม 2568
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8 sm:mb-16">
              <Link 
                to="/genba-form"
                className="w-48 sm:w-auto border border-white px-4 sm:px-8 py-2 sm:py-3 rounded hover:bg-white hover:text-blue-600 transition-colors font-medium text-sm sm:text-base text-center"
              >
                GENBA FORM
              </Link>
              <span className="text-lg font-medium hidden sm:inline">OR</span>
              <Link
                to="/suggestion-form"
                className="w-48 sm:w-auto bg-white text-blue-600 px-4 sm:px-8 py-2 sm:py-3 rounded hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base"
              >
                SUGGESTION FORM
              </Link>
            </div>
          </div>
        </div>
        
        {/* Curved bottom with better curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,120 900,120 1200,0 L1200,120 L0,120 Z" fill="#f9fafb"></path>
          </svg>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
                จำนวนการส่ง KAIZEN
              </h2>
              <p className="text-sm sm:text-base text-gray-600">SORT BY DEPARTMENT</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 hover:bg-blue-200 px-3 sm:px-4 py-2 rounded text-sm sm:text-base transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 sm:px-4 py-2 rounded text-sm sm:text-base transition-colors"
                  onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                >
                  <span>{currentDate.englishMonths[selectedMonth]}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isMonthDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1 max-h-60 overflow-y-auto">
                      {currentDate.englishMonths.map((month, index) => (
                        <button
                          key={index}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            selectedMonth === index ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                          onClick={() => {
                            setSelectedMonth(index);
                            setIsMonthDropdownOpen(false);
                          }}
                        >
                          {month} ({currentDate.thaiMonths[index]})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-sm sm:text-base">Department</th>
                      <th className="px-2 sm:px-4 py-3 text-center text-sm sm:text-base">Employee count</th>
                      <th className="px-2 sm:px-4 py-3 text-center text-sm sm:text-base">Submitted Count</th>
                      <th className="px-2 sm:px-4 py-3 text-center text-sm sm:text-base">Completion Rate</th>
                    </tr>
                  </thead>
                <tbody>
                  {departmentData.map((dept, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-2 sm:px-4 py-3 font-medium text-sm sm:text-base">{dept.name}</td>
                      <td className="px-2 sm:px-4 py-3 text-center text-sm sm:text-base">{dept.employees}</td>
                      <td className="px-2 sm:px-4 py-3 text-center text-sm sm:text-base">{dept.submitted}</td>
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{width: `${dept.completion}%`}}
                            ></div>
                          </div>
                          <span className="text-xs sm:text-sm">{dept.completion}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">แผนภูมิความสำเร็จ</h3>
                <p className="text-sm text-gray-600">เปอร์เซ็นต์การส่ง KAIZEN ประจำเดือน{currentDate.thaiMonths[selectedMonth]} {currentDate.thaiYear}</p>
              </div>
              
              <div className="relative">
                {/* Chart container */}
                <div className="h-80 relative bg-gray-50 rounded-lg">
                  {/* Y-axis labels */}
                  <div className="absolute left-2 top-4 bottom-16 flex flex-col justify-between text-xs text-gray-500">
                    <span className="leading-none">100%</span>
                    <span className="leading-none">75%</span>
                    <span className="leading-none">50%</span>
                    <span className="leading-none">25%</span>
                    <span className="leading-none">0%</span>
                  </div>
                  
                  {/* Chart area with exact 240px height */}
                  <div className="absolute left-12 right-4 top-4 bottom-16 bg-white rounded border" style={{height: '240px'}}>
                    {/* Grid lines positioned exactly */}
                    {[0, 60, 120, 180, 240].map((px, index) => {
                      const value = [0, 25, 50, 75, 100][index];
                      return (
                        <div 
                          key={value} 
                          className="absolute w-full border-t border-gray-300 border-dashed opacity-50"
                          style={{ 
                            bottom: `${px}px`,
                            left: 0,
                            right: 0
                          }}
                        ></div>
                      );
                    })}
                    
                    {/* Bars container */}
                    <div className="absolute inset-0 flex items-end justify-evenly">
                      {departmentData.map((dept, index) => {
                        const colors = [
                          'from-blue-500 to-blue-600',
                          'from-indigo-500 to-indigo-600',
                          'from-purple-500 to-purple-600',
                          'from-pink-500 to-pink-600',
                          'from-red-500 to-red-600',
                          'from-orange-500 to-orange-600',
                          'from-yellow-500 to-yellow-600',
                          'from-green-500 to-green-600'
                        ];
                        
                        return (
                          <div key={index} className="flex flex-col items-center group cursor-pointer relative">
                            {/* Hover tooltip */}
                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                              <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                {dept.name}: {dept.completion}%
                              </span>
                            </div>
                            
                            {/* Bar */}
                            <div 
                              className={`bg-gradient-to-t ${colors[index]} rounded-t-md shadow-lg hover:shadow-xl transition-all duration-300 hover:brightness-110 relative`}
                              style={{
                                width: '32px',
                                height: `${(dept.completion * 240) / 100}px`,
                                minHeight: dept.completion > 0 ? '4px' : '1px'
                              }}
                            >
                              {/* Value inside bar for high values */}
                              {dept.completion >= 30 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold transform -rotate-90 whitespace-nowrap">
                                    {dept.completion}%
                                  </span>
                                </div>
                              )}
                              
                              {/* Value above bar for low values */}
                              {dept.completion < 30 && dept.completion > 0 && (
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                                  <span className="text-gray-700 text-xs font-bold whitespace-nowrap">
                                    {dept.completion}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="absolute left-12 right-4 bottom-0 h-16 flex justify-evenly items-start pt-2">
                    {departmentData.map((dept, index) => (
                      <div key={index} className="text-xs text-gray-700 font-medium text-center flex-1">
                        <div className="transform -rotate-45 origin-top whitespace-nowrap">
                          {dept.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                  {departmentData.map((dept, index) => {
                    const colors = [
                      'bg-blue-500',
                      'bg-indigo-500',
                      'bg-purple-500',
                      'bg-pink-500',
                      'bg-red-500',
                      'bg-orange-500',
                      'bg-yellow-500',
                      'bg-green-500'
                    ];
                    
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                        <span className="text-xs text-gray-600">{dept.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 text-center">
                  📊 แผนภูมิแสดงเปอร์เซ็นต์การส่ง KAIZEN ประจำเดือน{currentDate.thaiMonths[selectedMonth]}ของแต่ละหน่วยงาน
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* News Section */}
        <div className="mb-12 mt-20">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
              อัปเดตข่าวสาร และ กิจกรรมของคุณ KAIZEN TEAM
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              กิจกรรมต่างๆ ของคุณหลังจากเป็นสมาชิกแล้ว สำหรับการสร้างความร่วมมือในการปฏิบัติงาน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Large featured card */}
            <div className="md:col-span-2 lg:col-span-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
              <div className="relative h-64 sm:h-72">
                <img 
                  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="KAIZEN Awards Ceremony"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center mb-2">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">🏆 ข่าวด่วน</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold leading-tight mb-2">
                    ประกาศรางวัล KAIZEN AWARDS ประจำเดือน{currentDate.thaiMonths[selectedMonth]} {currentDate.thaiYear}
                  </h3>
                  <p className="text-sm opacity-90 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    25 กรกฎาคม 2568
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed mt-4">
                  🎉 ขอแสดงความยินดีกับ <strong>คุณสมชาย วงศ์ดี</strong> แผนกผลิต และ <strong>คุณนิรันดร์ สุขใส</strong> แผนก QA 
                  ที่ได้รับรางวัล KAIZEN ยอดเยี่ยมประจำเดือน จากโครงการ "ลดของเสียในกระบวนการผลิต" 
                  สามารถลดของเสียลง <span className="font-semibold text-green-600">25%</span> และปรับปรุงระบบตรวจสอบคุณภาพ 
                  ส่งผลให้ประหยัดต้นทุนได้ <span className="font-semibold text-blue-600">150,000 บาทต่อเดือน</span>
                </p>
              </div>
            </div>

            {/* Small cards column 1 */}
            <div className="flex flex-col h-full">
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex-1 mb-4">
                <div className="relative h-32">
                  <img 
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="5S Workshop"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h4 className="font-semibold text-sm mb-1">Workshop: 5S Implementation</h4>
                  <p className="text-xs text-gray-600 mb-2 flex-1">อบรมเชิงปฏิบัติการการนำหลัก 5S มาใช้ในสถานที่ทำงาน</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">📅 30 กรกฎาคม 2568</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex-1">
                <div className="relative h-32">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="Innovation Contest"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h4 className="font-semibold text-sm mb-1">KAIZEN Innovation Contest 2568</h4>
                  <p className="text-xs text-gray-600 mb-2 flex-1">ประกวดนวัตกรรม KAIZEN รางวัลรวม 100,000 บาท</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">📅 ถึง 31 ก.ค. 68</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Small cards column 2 */}
            <div className="flex flex-col h-full">
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex-1 mb-4">
                <div className="relative h-32">
                  <img 
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                    alt="Green Project"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h4 className="font-semibold text-sm mb-1">Green KAIZEN Project</h4>
                  <p className="text-xs text-gray-600 mb-2 flex-1">โครงการ KAIZEN เพื่อสิ่งแวดล้อม ลดกระดาษ 40%</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">📅 28 กรกฎาคม 2568</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex-1">
                <div className="relative h-32">
                  <img 
                    src="https://media.licdn.com/dms/image/v2/C5112AQEiXaxe_MaTcg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1564711868005?e=2147483647&v=beta&t=GgdWQK4TRaOowCGAL3OFFfL9XjBjBs0rld4SevgM4HE" 
                    alt="IT Success Story"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h4 className="font-semibold text-sm mb-1">KAIZEN Success Story</h4>
                  <p className="text-xs text-gray-600 mb-2 flex-1">แผนก IT ปรับปรุงระบบ backup จาก 4 ชม. → 45 นาที</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">📅 26 กรกฎาคม 2568</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;