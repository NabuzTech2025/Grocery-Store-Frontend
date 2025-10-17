import { useEffect, useState } from 'react';
import { getTax, addTax, updateTax, deleteTax } from "@/api/AdminServices";
import { FaSearch, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import Swal from 'sweetalert2';

const TaxTable = ({ reload, onSuccess }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState("");
  const [description, setDescription] = useState("");
  const [currentTaxId, setCurrentTaxId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isEditMode, setIsEditMode] = useState(false);

  // Search functionality
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.percentage && item.percentage.toString().includes(searchTerm))
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, data]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openAddModal = () => {
    setIsEditMode(false);
    setName("");
    setPercentage("");
    setDescription("");
    setCurrentTaxId(null);
    setShowModal(true);
  };

  const openEditModal = (tax) => {
    setIsEditMode(true);
    setName(tax.name);
    setPercentage(tax.percentage);
    setDescription(tax.description || "");
    setCurrentTaxId(tax.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setName("");
    setPercentage("");
    setDescription("");
    setCurrentTaxId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        percentage: parseFloat(percentage),
        description,
        store_id: parseInt(localStorage.getItem('store_id')),
      };

      if (isEditMode) {
        await updateTax(currentTaxId, payload);
        onSuccess('Tax updated successfully! ✅');
      } else {
        await addTax(payload);
        onSuccess('Tax added successfully! ✅');
      }

      closeModal();
      fetchTaxes();
    } catch (error) {
      console.error("Error saving tax:", error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to save tax', 'error');
    }
  };

  const handleDelete = async (taxId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteTax(taxId);
        onSuccess('Tax deleted successfully!');
        fetchTaxes();
      } catch (error) {
        console.error("Failed to delete tax:", error);
        Swal.fire('Error', error.response?.data?.detail || 'Failed to delete tax', 'error');
      }
    }
  };

  const toggleStatus = async (taxId, currentStatus) => {
    try {
      const payload = {
        isActive: !currentStatus
      };
      
      await updateTax(taxId, payload);
      onSuccess(`Tax ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchTaxes();
    } catch (error) {
      console.error("Failed to change status:", error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to change tax status', 'error');
    }
  };

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const response = await getTax(parseInt(localStorage.getItem('store_id')));
      setData(response.data || []);
      setFilteredData(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching taxes:", error);
      setLoading(false);
      Swal.fire('Error', 'Failed to fetch taxes', 'error');
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, [reload]);

  return (
    <div className="col-sm-12">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Tax List</h5>
          <div className="d-flex gap-2">
            <div className="search-box" style={{ width: '300px' }}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search taxes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="input-group-text">
                  <FaSearch />
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <table className="table table-striped table-bordered nowrap">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Percentage</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((item, index) => (
                        <tr key={item.id}>
                          <td>{indexOfFirstItem + index + 1}</td>
                          <td>{item.name}</td>
                          <td>{item.percentage}%</td>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <button
                                type="button"
                                className="btn btn-dark btn-sm"
                                onClick={() => openEditModal(item)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          {searchTerm ? 'No matching taxes found' : 'No taxes available'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {filteredData.length > itemsPerPage && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
                    </div>
                    <nav>
                      <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => paginate(currentPage - 1)}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => paginate(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        })}
                        
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => paginate(currentPage + 1)}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{isEditMode ? 'Edit Tax' : 'Add New Tax'}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="col-form-label">Tax Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="col-form-label">Percentage:</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        min="0"
                        max="100"
                        step="0.01"
                        required
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEditMode ? 'Update Tax' : 'Add Tax'}
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

export default TaxTable;