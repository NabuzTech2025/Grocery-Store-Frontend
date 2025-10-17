import { useEffect, useState } from "react";
import {
  getStoreHours,
  addStoreHour,
  updateStoreHour,
  deleteStoreHour,
} from "@/api/AdminServices";
import { FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";

const StoreHoursTable = ({ reload, onSuccess }) => {
  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const daysOfWeek = [
    { name: "Monday", short: "M", value: 0 },
    { name: "Tuesday", short: "T", value: 1 },
    { name: "Wednesday", short: "W", value: 2 },
    { name: "Thursday", short: "T", value: 3 },
    { name: "Friday", short: "F", value: 4 },
    { name: "Saturday", short: "S", value: 5 },
    { name: "Sunday", short: "S", value: 6 },
  ];

  const getDayName = (dayValue) => {
    const day = daysOfWeek.find((d) => d.value === dayValue);
    return day ? day.name : "";
  };

  const groupStoreHours = (storeHours) => {
    const grouped = {};

    storeHours.forEach((hour) => {
      const key = `${hour.name}-${hour.opening_time}-${hour.closing_time}`;
      if (!grouped[key]) {
        grouped[key] = {
          name: hour.name,
          opening_time: hour.opening_time,
          closing_time: hour.closing_time,
          days: [],
          ids: [],
        };
      }
      grouped[key].days.push(hour.day_of_week);
      grouped[key].ids.push(hour.id);
    });

    return Object.values(grouped);
  };

  const formatDaysDisplay = (days) => {
    const dayNames = days.map((day) => getDayName(day));
    return dayNames.join(", ");
  };

  useEffect(() => {
    const grouped = groupStoreHours(data);
    setGroupedData(grouped);

    if (searchTerm === "") {
      setFilteredData(grouped);
    } else {
      const filtered = grouped.filter((item) => {
        const dayNames = item.days.map((day) => getDayName(day)).join(" ");
        return (
          (item.name &&
            item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          dayNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.opening_time.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.closing_time.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, data]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openAddModal = () => {
    setIsEditMode(false);
    setName("");
    setOpeningTime("");
    setClosingTime("");
    setCurrentId(null);
    setSelectedDays([]);
    setSelectAll(false);
    setShowModal(true);
  };

  const openEditModal = (hourGroup) => {
    setIsEditMode(true);
    setName(hourGroup.name || "");
    setOpeningTime(hourGroup.opening_time);
    setClosingTime(hourGroup.closing_time);
    setCurrentId(hourGroup.ids[0]);
    setSelectedDays([...hourGroup.days]);
    setSelectAll(hourGroup.days.length === daysOfWeek.length);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setName("");
    setOpeningTime("");
    setClosingTime("");
    setCurrentId(null);
    setSelectedDays([]);
    setSelectAll(false);
  };

  const toggleDaySelection = (dayValue) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
    setSelectAll(selectedDays.length + 1 === daysOfWeek.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedDays([]);
    } else {
      setSelectedDays(daysOfWeek.map((day) => day.value));
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const store_id = parseInt(localStorage.getItem("store_id"));

    if (selectedDays.length === 0) {
      Swal.fire("Error", "Please select at least one day", "error");
      return;
    }

    try {
      if (isEditMode) {
        const hourGroup = groupedData.find((group) =>
          group.ids.includes(currentId)
        );
        if (hourGroup) {
          await Promise.all(hourGroup.ids.map((id) => deleteStoreHour(id)));

          const payload = selectedDays.map((day) => ({
            name,
            day_of_week: day,
            opening_time: openingTime,
            closing_time: closingTime,
            store_id: store_id,
          }));

          await Promise.all(
            payload.map((item) => addStoreHour(store_id, item))
          );
          onSuccess("Store hours updated successfully! ✅");
        }
      } else {
        const payload = selectedDays.map((day) => ({
          name,
          day_of_week: day,
          opening_time: openingTime,
          closing_time: closingTime,
          store_id: store_id,
        }));

        await Promise.all(payload.map((item) => addStoreHour(store_id, item)));
        onSuccess("Store hours added successfully! ✅");
      }

      closeModal();
      fetchStoreHours();
    } catch (error) {
      console.error("Error saving store hours:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to save store hours",
        "error"
      );
    }
  };

  const handleDelete = async (ids) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(ids.map((id) => deleteStoreHour(id)));
        onSuccess("Store hours deleted successfully!");
        fetchStoreHours();
      } catch (error) {
        console.error("Failed to delete store hours:", error);
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to delete store hours",
          "error"
        );
      }
    }
  };

  const fetchStoreHours = async () => {
    try {
      setLoading(true);
      const response = await getStoreHours(localStorage.getItem("store_id"));
      setData(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching store hours:", error);
      setLoading(false);
      Swal.fire("Error", "Failed to fetch store hours", "error");
    }
  };

  useEffect(() => {
    fetchStoreHours();
  }, [reload]);

  return (
    <div className="col-sm-12">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Store Hours List</h5>
          <div className="d-flex gap-2">
            <div className="search-box" style={{ width: "300px" }}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search store hours..."
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
                      <th>TimeZone Title</th>
                      <th>Days</th>
                      <th>Opening time</th>
                      <th>Closing time</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((item, index) => (
                        <tr
                          key={`${item.name}-${item.opening_time}-${item.closing_time}`}
                        >
                          <td>{indexOfFirstItem + index + 1}</td>
                          <td>{item.name}</td>
                          <td>
                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex gap-1">
                                {daysOfWeek.map((day) => (
                                  <button
                                    key={day.value}
                                    type="button"
                                    className={`btn btn-icon btn-sm ${
                                      item.days.includes(day.value)
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                    }`}
                                    style={{ pointerEvents: "none" }}
                                  >
                                    {day.short}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td>{item.opening_time}</td>
                          <td>{item.closing_time}</td>
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
                                onClick={() => handleDelete(item.ids)}
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
                          {searchTerm
                            ? "No matching store hours found"
                            : "No store hours available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {filteredData.length > itemsPerPage && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {indexOfFirstItem + 1} to{" "}
                      {Math.min(indexOfLastItem, filteredData.length)} of{" "}
                      {filteredData.length} entries
                    </div>
                    <nav>
                      <ul className="pagination mb-0">
                        <li
                          className={`page-item ${
                            currentPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => paginate(currentPage - 1)}
                          >
                            Previous
                          </button>
                        </li>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
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
                              <li
                                key={pageNum}
                                className={`page-item ${
                                  currentPage === pageNum ? "active" : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() => paginate(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          }
                        )}

                        <li
                          className={`page-item ${
                            currentPage === totalPages ? "disabled" : ""
                          }`}
                        >
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
                  <h5 className="modal-title">
                    {isEditMode ? "Edit Store Hours" : "Add New Store Hours"}
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
                    <label className="form-label">TimeZone Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

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

                  <div className="row mb-3">
                    <div className="col-md-12">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label">
                          {isEditMode ? "Selected Days" : "Select Days"}
                        </label>
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="selectAllDays"
                            checked={selectAll}
                            onChange={toggleSelectAll}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="selectAllDays"
                          >
                            Select all
                          </label>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        {daysOfWeek.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            className={`btn btn-icon ${
                              selectedDays.includes(day.value)
                                ? "btn-primary"
                                : "btn-outline-primary"
                            }`}
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
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEditMode ? "Update" : "Save"}
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

export default StoreHoursTable;
