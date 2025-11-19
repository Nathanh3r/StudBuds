// app/discover/page.jsx
'use client';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../components/PageHeader';
import LoadingScreen from '../components/LoadingScreen';
import ClassCard from '../components/ClassCard';

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
  const [selectedType, setSelectedType] = useState('all'); // all, catalog, user-created
  const [departments, setDepartments] = useState([]);
  
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
      console.log('All classes:', data);
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
    // Search filter
    const matchesSearch = 
      cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.description && cls.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Department filter
    const matchesDepartment = 
      selectedDepartment === 'all' || 
      cls.department === selectedDepartment;
    
    // Type filter
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

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <PageHeader
            title="Discover Courses"
            subtitle={`Browse ${allClasses.length} available courses and join study groups`}
          />

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="all">All Courses</option>
                  <option value="catalog">UCR Catalog Only</option>
                  <option value="user-created">User Created Only</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{paginatedClasses.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{filteredClasses.length}</span> courses
                {(searchTerm || selectedDepartment !== 'all' || selectedType !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedDepartment('all');
                      setSelectedType('all');
                    }}
                    className="ml-3 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </p>
            </div>
          </div>

          {/* Classes Grid */}
          {paginatedClasses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedDepartment !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No courses available yet'}
              </p>
              {(searchTerm || selectedDepartment !== 'all' || selectedType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDepartment('all');
                    setSelectedType('all');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedClasses.map((course) => (
                  <ClassCard key={course._id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ← Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => {
                        // Add ellipsis
                        const prevPage = arr[idx - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-lg font-medium transition ${
                                currentPage === page
                                  ? 'bg-indigo-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
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
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next →
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