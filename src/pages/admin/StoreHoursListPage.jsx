import { useState, useEffect } from 'react';
import StoreHoursTable from '../../components/Admin/StoreHoursTable';
import { getStoreHours, addStoreHour } from "@/api/AdminServices";
import Swal from 'sweetalert2';

const StoreHoursListPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [reloadTable, setReloadTable] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const daysOfWeek = [
    { name: "Monday", short: "M", value: 0 },
    { name: "Tuesday", short: "T", value: 1 },
    { name: "Wednesday", short: "W", value: 2 },
    { name: "Thursday", short: "T", value: 3 },
    { name: "Friday", short: "F", value: 4 },
    { name: "Saturday", short: "S", value: 5 },
    { name: "Sunday", short: "S", value: 6 }
  ];

  const openAddModal = () => {
    setName("");
    setOpeningTime("");
    setClosingTime("");
    setSelectedDays([]);
    setSelectAll(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setName("");
    setOpeningTime("");
    setClosingTime("");
    setSelectedDays([]);
    setSelectAll(false);
  };

  const toggleDaySelection = (dayValue) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter(d => d !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedDays([]);
    } else {
      setSelectedDays(daysOfWeek.map(day => day.value));
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const store_id = parseInt(localStorage.getItem('store_id'));
    
    if (selectedDays.length === 0) {
      Swal.fire('Error', 'Please select at least one day', 'error');
      return;
    }

    try {
      const payload = selectedDays.map(day => ({
        name,
        day_of_week: day,
        opening_time: openingTime,
        closing_time: closingTime,
        store_id: store_id,
      }));

      // Send all selected days in one API call
      await Promise.all(payload.map(item => addStoreHour(store_id, item)));
      
      setSuccessMsg('Store hours added successfully! ✅');
      setReloadTable(prev => !prev);
      closeModal();
    } catch (error) {
      console.error("Failed to add store hours:", error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to add store hours', 'error');
    }
  };

  const handleSuccess = (message) => {
    setSuccessMsg(message);
  };

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  return (
    <div>
      {/* Success Message */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-10">
              <div className="page-header-title">
                <h2 className="mb-0">Store Hours Management</h2>
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

      {/* Table */}
      <div className="row">
        <div className="col-md-12">
          <StoreHoursTable reload={reloadTable} onSuccess={handleSuccess} />
        </div>
      </div>

      {/* Add Store Hours Modal */}
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
            <h5 className="modal-title">Add Store Hours</h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeModal}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {/* Name Field */}
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            {/* Time Fields */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Opening Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Closing Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Days Selection */}
            <div className="row mb-3">
              <div className="col-md-12">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label">Select Days</label>
                  <div className="form-check">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      id="selectAllDays"
                      checked={selectAll}
                      onChange={toggleSelectAll}
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
                    >
                      {day.short}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Close
            </button>
            <button type="submit" className="btn btn-primary">
              Save Store Hours
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

export default StoreHoursListPage;