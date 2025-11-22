// app/discover/page.jsx
'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../components/LoadingScreen';
import ClassCard from '../components/ClassCard';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function DiscoverPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { isCollapsed } = useSidebar();
  const router = useRouter();
  
  // Data states
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (token) {
      fetchClasses();
    }
  }, [token]);

  const fetchClasses = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${baseUrl}/classes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAllClasses(data.classes || []);
      
      // Extract unique departments
      const uniqueDepts = [...new Set(
        data.classes
          .filter(c => c.department)
          .map(c => c.department)
      )].sort();
      setDepartments(uniqueDepts);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter classes
  const filteredClasses = allClasses.filter(cls => {
    const matchesSearch = 
      cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.description && cls.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = 
      selectedDepartment === 'all' || 
      cls.department === selectedDepartment;
    
    let matchesType = true;
    if (selectedType === 'catalog') {
      matchesType = !cls.isUserCreated;
    } else if (selectedType === 'user-created') {
      matchesType = cls.isUserCreated;
    }
    
    return matchesSearch && matchesDepartment && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, selectedType]);

  const hasActiveFilters = selectedDepartment !== 'all' || selectedType !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('all');
    setSelectedType('all');
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto px-8 pt-8 pb-16">
         <PageHeader
            title="Discover Courses"
            subtitle={`Browse ${allClasses.length} courses and start your learning journey`}
          />
          {/* Search and Filters */}
          <div className="mb-12">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search courses by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-indigo-300 focus:outline-none transition text-lg"
              />
            </div>

            {/* Filter Toggle and Active Filters */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  showFilters || hasActiveFilters
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" strokeWidth={2} />
                <span className="font-medium">Filters</span>
                {hasActiveFilters && (
                  <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {[selectedDepartment !== 'all', selectedType !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </button>

              <p className="text-sm text-gray-400">
                <span className="font-semibold text-gray-900">{filteredClasses.length}</span> courses
              </p>
            </div>

            {/* Collapsible Filters */}
            {showFilters && (
              <div className="mt-4 p-6 bg-gray-50 rounded-2xl border-2 border-gray-100 animate-slideDown">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-300 focus:outline-none transition bg-white"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-300 focus:outline-none transition bg-white"
                    >
                      <option value="all">All Courses</option>
                      <option value="catalog">UCR Catalog Only</option>
                      <option value="user-created">User Created Only</option>
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Classes Grid */}
          {paginatedClasses.length === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-20 text-center">
              <Search className="w-20 h-20 mx-auto mb-6 text-gray-300" strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                No courses found
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                {searchTerm || hasActiveFilters
                  ? 'Try adjusting your search or filters'
                  : 'No courses available yet'}
              </p>
              {(searchTerm || hasActiveFilters) && (
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium px-8 py-4 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {paginatedClasses.map((course) => (
                  <ClassCard key={course._id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" strokeWidth={2} />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => {
                        const prevPage = arr[idx - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex items-center gap-2">
                            {showEllipsis && (
                              <span className="px-2 text-gray-400">···</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[48px] h-12 px-4 rounded-xl font-medium transition-all ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                  : 'border-2 border-gray-100 text-gray-600 hover:border-indigo-200 hover:bg-indigo-50'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl border-2 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" strokeWidth={2} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}