import { useState, useEffect } from 'react';
import { 
  getCategory, 
  getCategoryAvailabilities, 
  createBulkCategoryAvailabilities,
  updateCategoryAvailability,
  deleteCategoryAvailability,
  replaceCategoryAvailabilities 
} from "@/api/AdminServices";
import Swal from 'sweetalert2';

const CategoriesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [availabilityList, setAvailabilityList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectAllDays, setSelectAllDays] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [reloadTable, setReloadTable] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const daysOfWeek = [
    { name: "Monday", short: "M", value: 0 },
    { name: "Tuesday", short: "T", value: 1 },
    { name: "Wednesday", short: "W", value: 2 },
    { name: "Thursday", short: "T", value: 3 },
    { name: "Friday", short: "F", value: 4 },
    { name: "Saturday", short: "S", value: 5 },
    { name: "Sunday", short: "S", value: 6 }
  ];

  // Load data on component mount
  useEffect(() => {
    loadCategories();
    loadCategoryAvailabilities();
  }, [reloadTable]);

  const loadCategories = async () => {
    try {
      const store_id = localStorage.getItem('store_id');
      const response = await getCategory(store_id);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadCategoryAvailabilities = async () => {
    try {
      const response = await getCategoryAvailabilities();
      setAvailabilityList(response || []);
    } catch (error) {
      console.error("Failed to load category availabilities:", error);
    }
  };

  // Group availabilities by category, start_time, and end_time
  const getGroupedAvailabilities = () => {
    const grouped = {};
    
    availabilityList.forEach(item => {
      const key = `${item.category_id}_${item.start_time}_${item.end_time}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          id: item.id,
          category_id: item.category_id,
          start_time: item.start_time,
          end_time: item.end_time,
          isActive: item.isActive, // ✅ ensure isActive included
          days: [],
          items: []
        };
      }
      
      grouped[key].days.push(item.day_of_week);
      grouped[key].items.push(item);
    });
    
    return Object.values(grouped);
  };

  // Handle category selection
  const handleCategorySelection = (categoryId) => {
    const category = categories.find(c => c.id === parseInt(categoryId));
    if (category) {
      setSelectedCategories(prev => {
        const exists = prev.find(item => item.id === category.id);
        if (exists) {
          return prev.filter(item => item.id !== category.id);
        } else {
          return [...prev, category];
        }
      });
    }
  };

  // Remove selected category from list
  const removeSelectedCategory = (categoryId) => {
    setSelectedCategories(prev => prev.filter(item => item.id !== categoryId));
  };

  const openAddModal = () => {
    setSelectedCategories([]);
    setSelectedDays([]);
    setSelectAllDays(false);
    setStartTime("");
    setEndTime("");
    setIsActive(true);
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (groupedItem) => {
    setEditingItem(groupedItem);
    
    const category = categories.find(c => c.id === groupedItem.category_id);
    if (category) {
      setSelectedCategories([category]);
    }
    
    setSelectedDays(groupedItem.days);
    setStartTime(formatTimeForInput(groupedItem.start_time));
    setEndTime(formatTimeForInput(groupedItem.end_time));
    setIsActive(groupedItem.isActive); // ✅ fixed (dynamic from DB)
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategories([]);
    setSelectedDays([]);
    setSelectAllDays(false);
    setStartTime("");
    setEndTime("");
    setIsActive(true);
    setEditingItem(null);
  };

  const toggleDaySelection = (dayValue) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter(d => d !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
  };

  const toggleSelectAllDays = () => {
    if (selectAllDays) {
      setSelectedDays([]);
    } else {
      setSelectedDays(daysOfWeek.map(day => day.value));
    }
    setSelectAllDays(!selectAllDays);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedCategories.length === 0) {
      Swal.fire('Error', 'Please select at least one category', 'error');
      return;
    }

    if (selectedDays.length === 0) {
      Swal.fire('Error', 'Please select at least one day', 'error');
      return;
    }

    setLoading(true);

    try {
      const formatTimeForBackend = (timeString) => {
        if (!timeString) return null;
        return `${timeString}:00.000000`;
      };

      if (editingItem) {
        for (const item of editingItem.items) {
          await deleteCategoryAvailability(item.id);
        }
        
        const availabilityData = [];
        selectedCategories.forEach(category => {
          selectedDays.forEach(day => {
            availabilityData.push({
              category_id: category.id,
              day_of_week: day,
              start_time: formatTimeForBackend(startTime),
              end_time: formatTimeForBackend(endTime),
              label: "Auto Generated",
              isActive: isActive
            });
          });
        });

        await createBulkCategoryAvailabilities(availabilityData);
        setSuccessMsg('Category availability updated successfully!');
      } else {
        const availabilityData = [];
        
        selectedCategories.forEach(category => {
          selectedDays.forEach(day => {
            availabilityData.push({
              category_id: category.id,
              day_of_week: day,
              start_time: formatTimeForBackend(startTime),
              end_time: formatTimeForBackend(endTime),
              label: "Auto Generated",
              isActive: isActive
            });
          });
        });

        await createBulkCategoryAvailabilities(availabilityData);
        setSuccessMsg(`${availabilityData.length} category availabilities added successfully!`);
      }
      
      setReloadTable(prev => !prev);
      closeModal();
    } catch (error) {
      console.error("Failed to save category availability:", error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save category availability', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupedItem) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will delete ${groupedItem.items.length} availability entries for this category!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        for (const item of groupedItem.items) {
          await deleteCategoryAvailability(item.id);
        }
        setSuccessMsg('Category availability deleted successfully!');
        setReloadTable(prev => !prev);
      } catch (error) {
        console.error("Failed to delete category availability:", error);
        Swal.fire('Error', 'Failed to delete category availability', 'error');
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getDaysDisplay = (dayOfWeek) => {
    const day = daysOfWeek.find(d => d.value === dayOfWeek);
    return day ? day.short : '';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
  };

  // Filter and pagination for grouped data
  const groupedAvailabilities = getGroupedAvailabilities();
  const filteredGroupedList = groupedAvailabilities.filter(item => {
    const categoryName = getCategoryName(item.category_id).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return categoryName.includes(searchLower);
  });

  const totalPages = Math.ceil(filteredGroupedList.length / itemsPerPage);
  const paginatedItems = filteredGroupedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  return (
    <div>
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-10">
              <div className="page-header-title">
                <h2 className="mb-0">Categories Availability Management</h2>
              </div>
            </div>
            <div className="col-2 text-end">
              <div className="btn-group">
                <button 
                  className="btn btn-primary" 
                  type="button" 
                  onClick={openAddModal}
                >
                  Add New
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Category Availability List</h5>
                <div className="col-md-4">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search category availability..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-outline-secondary" type="button">
                      🔍
                    </button>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover table-bordered" style={{ border: '2px solid #dee2e6' }}>
                  <thead className="table-light">
                    <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                      <th style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>#</th>
                      <th style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>CATEGORY NAME</th>
                      <th style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>DAYS</th>
                      <th style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>OPENING TIME</th>
                      <th style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>CLOSING TIME</th>
                      <th style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>STATUS</th>
                      <th style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.length > 0 ? (
                      paginatedItems.map((groupedItem, index) => (
                        <tr key={`${groupedItem.category_id}_${groupedItem.start_time}_${groupedItem.end_time}`} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', padding: '12px' }}>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td style={{ border: '1px solid #dee2e6', textAlign: 'left', verticalAlign: 'middle', padding: '12px' }}>
                            {getCategoryName(groupedItem.category_id)}
                          </td>
                          <td style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', padding: '12px' }}>
                            <div className="d-flex gap-2 flex-wrap justify-content-center">
                              {groupedItem.days.sort((a, b) => a - b).map(dayValue => (
                                <span key={dayValue} title={daysOfWeek.find(d => d.value === dayValue)?.name}>
                                  {getDaysDisplay(dayValue)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', padding: '12px', fontSize: '15px', fontWeight: '500' }}>
                            {formatTime(groupedItem.start_time)}
                          </td>
                          <td style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', padding: '12px', fontSize: '15px', fontWeight: '500' }}>
                            {formatTime(groupedItem.end_time)}
                          </td>
                          <td style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', padding: '12px' }}>
                            {groupedItem.isActive ? (
                              <span className="badge bg-success" style={{ fontSize: '13px', padding: '6px 12px' }}>
                                Active
                              </span>
                            ) : (
                              <span className="badge bg-secondary" style={{ fontSize: '13px', padding: '6px 12px' }}>
                                Inactive
                              </span>
                            )}
                          </td>
                          <td style={{ border: '1px solid #dee2e6', textAlign: 'center', verticalAlign: 'middle', padding: '12px' }}>
                            <div className="d-flex gap-2 justify-content-center">
                              <button 
                                className="btn btn-sm btn-dark"
                                onClick={() => openEditModal(groupedItem)}
                                style={{ minWidth: '60px' }}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(groupedItem)}
                                style={{ minWidth: '60px' }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center" style={{ border: '1px solid #dee2e6', padding: '20px' }}>
                          No category availability found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <li
                        key={num}
                        className={`page-item ${currentPage === num ? "active" : ""}`}
                      >
                        <button className="page-link" onClick={() => setCurrentPage(num)}>
                          {num}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingItem ? "Edit Category Availability" : "Add Category Availability"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Select Categories</label>
                    <select
                      className="form-select"
                      onChange={(e) => handleCategorySelection(e.target.value)}
                      value=""
                    >
                      <option value="">Click to {editingItem ? 'change' : 'add'} categories...</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCategories.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Selected Categories ({selectedCategories.length})</label>
                      <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {selectedCategories.map((category) => (
                          <div key={category.id} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                            <span>{category.name}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => removeSelectedCategory(category.id)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Opening Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Closing Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-12">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label">Select Days</label>
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input" 
                            id="selectAllDays"
                            checked={selectAllDays}
                            onChange={toggleSelectAllDays}
                          />
                          <label className="form-check-label" htmlFor="selectAllDays">
                            Select all
                          </label>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        {daysOfWeek.map(day => (
                          <button
                            key={day.value}
                            type="button"
                            className={`btn btn-icon ${selectedDays.includes(day.value) ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => toggleDaySelection(day.value)}
                            title={day.name}
                          >
                            {day.short}
                          </button>
                        ))}
                      </div>
                      {selectedDays.length > 0 && (
                        <small className="text-muted mt-1">
                          {selectedDays.length} day{selectedDays.length > 1 ? 's' : ''} selected
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading || selectedCategories.length === 0}
                  >
                    {loading ? (editingItem ? 'Updating...' : 'Adding...') : 
                     (editingItem ? 'Update' : `Add (${selectedCategories.length * selectedDays.length})`)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
