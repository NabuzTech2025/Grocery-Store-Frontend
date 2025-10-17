 import { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  getAllergyItems,
  addAllergyItem,
  updateAllergyItem,
  deleteAllergyItem,
} from "@/api/AdminServices";

function AllergyPage() {
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    store_id: localStorage.getItem("store_id") || "1",
  });

  // Fetch allergies
  const fetchAllergies = async () => {
    try {
      setLoading(true);
      const store_id = localStorage.getItem("store_id") || "1";
      const response = await getAllergyItems(store_id);
      console.log("Fetch Allergy API Response:", response);
      if (response && response.length > 0) {
        setAllergies(response);
      }
    } catch (error) {
      console.error("Error fetching allergies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllergies();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add Allergy 1
  const handleAddAllergy = async (e) => {
    e.preventDefault();
    try {
      const response = await addAllergyItem(formData);
      console.log("Add Allergy API Response:", response);
      if (response) {
        setAllergies([...allergies, response]);
        setShowAddModal(false);
        setFormData({
          name: "",
          description: "",
          store_id: localStorage.getItem("store_id") || "1",
        });
        alert("Allergy added successfully!");
      }
    } catch (error) {
      console.error("Error adding allergy:", error);
      alert("Failed to add allergy. Using static demo.");
      setAllergies([...allergies, { id: Date.now(), ...formData }]);
      setShowAddModal(false);
    }
  };
  // const handleAddAllergy = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const plainDescription = formData.description.replace(/<[^>]+>/g, ""); // remove tags
  //     const payload = { ...formData, description: plainDescription };

  //     const response = await addAllergyItem(payload);
  //     console.log("Add Allergy API Response:", response);

  //     if (response) {
  //       setAllergies([...allergies, { ...response, description: formData.description }]);
  //       setShowAddModal(false);
  //       setFormData({ name: "", description: "", store_id: localStorage.getItem("store_id") || "1" });
  //       alert("Allergy added successfully!");
  //     }
  //   } catch (error) {
  //     console.error("Error adding allergy:", error);
  //     alert("Failed to add allergy. Using static demo.");
  //     setAllergies([...allergies, { id: Date.now(), ...formData }]);
  //     setShowAddModal(false);
  //   }
  // };

  // // Edit Allergy 1
  const handleEditAllergy = async (e) => {
    e.preventDefault();
    try {
      const response = await updateAllergyItem(editingAllergy.id, formData);
      console.log("Edit Allergy API Response:", response);
      if (response) {
        setAllergies(
          allergies.map((allergy) =>
            allergy.id === editingAllergy.id ? response : allergy
          )
        );
        setShowEditModal(false);
        setEditingAllergy(null);
        setFormData({
          name: "",
          description: "",
          store_id: localStorage.getItem("store_id") || "1",
        });
        alert("Allergy updated successfully!");
      }
    } catch (error) {
      console.error("Error updating allergy:", error);
      alert("Failed to update allergy. Using static demo.");
      setAllergies(
        allergies.map((allergy) =>
          allergy.id === editingAllergy.id
            ? { ...editingAllergy, ...formData }
            : allergy
        )
      );
      setShowEditModal(false);
    }
  };

  // Add Allergy 1
  // const handleAddAllergy = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const payload = {
  //       ...formData,
  //       description: formData.description.replace(/<[^>]+>/g, ""), // Strip HTML tags
  //     };
  //     const response = await addAllergyItem(payload);
  //     console.log("Add Allergy API Response:", response);
  //     if (response) {
  //       setAllergies([...allergies, response]);
  //       setShowAddModal(false);
  //       setFormData({ name: "", description: "", store_id: localStorage.getItem("store_id") || "1" });
  //       alert("Allergy added successfully!");
  //     }
  //   } catch (error) {
  //     console.error("Error adding allergy:", error);
  //     alert("Failed to add allergy. Using static demo.");
  //     setAllergies([...allergies, { id: Date.now(), ...formData }]);
  //     setShowAddModal(false);
  //   }
  // };
  // const handleEditAllergy = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const plainDescription = formData.description.replace(/<[^>]+>/g, "");
  //     const payload = { ...formData, description: plainDescription };

  //     const response = await updateAllergyItem(editingAllergy.id, payload);
  //     console.log("Edit Allergy API Response:", response);

  //     if (response) {
  //       setAllergies(allergies.map(allergy =>
  //         allergy.id === editingAllergy.id
  //           ? { ...response, description: formData.description }
  //           : allergy
  //       ));
  //       setShowEditModal(false);
  //       setEditingAllergy(null);
  //       setFormData({ name: "", description: "", store_id: localStorage.getItem("store_id") || "1" });
  //       alert("Allergy updated successfully!");
  //     }
  //   } catch (error) {
  //     console.error("Error updating allergy:", error);
  //     alert("Failed to update allergy. Using static demo.");
  //     setAllergies(allergies.map(allergy =>
  //       allergy.id === editingAllergy.id ? { ...editingAllergy, ...formData } : allergy
  //     ));
  //     setShowEditModal(false);
  //   }
  // };

  // Edit Allergy
  // const handleEditAllergy = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const payload = {
  //       ...formData,
  //       description: formData.description.replace(/<[^>]+>/g, ""), // Strip HTML tags
  //     };
  //     const response = await updateAllergyItem(editingAllergy.id, payload);
  //     console.log("Edit Allergy API Response:", response);
  //     if (response) {
  //       setAllergies(allergies.map(allergy => allergy.id === editingAllergy.id ? response : allergy));
  //       setShowEditModal(false);
  //       setEditingAllergy(null);
  //       setFormData({ name: "", description: "", store_id: localStorage.getItem("store_id") || "1" });
  //       alert("Allergy updated successfully!");
  //     }
  //   } catch (error) {
  //     console.error("Error updating allergy:", error);
  //     alert("Failed to update allergy. Using static demo.");
  //     setAllergies(allergies.map(allergy =>
  //       allergy.id === editingAllergy.id ? { ...editingAllergy, ...formData } : allergy
  //     ));
  //     setShowEditModal(false);
  //   }
  // };

  // Delete Allergy
  const handleDeleteAllergy = async (id) => {
    if (confirm("Are you sure you want to delete this allergy?")) {
      try {
        const response = await deleteAllergyItem(id);
        console.log("Delete Allergy API Response:", response);
        setAllergies(allergies.filter((allergy) => allergy.id !== id));
        alert("Allergy deleted successfully!");
      } catch (error) {
        console.error("Error deleting allergy:", error);
        alert("Failed to delete allergy. Removing from static list.");
        setAllergies(allergies.filter((allergy) => allergy.id !== id));
      }
    }
  };

  // Open Edit Modal
  const openEditModal = (allergy) => {
    setEditingAllergy(allergy);
    setFormData({
      name: allergy.name,
      description: allergy.description,
      store_id: allergy.store_id,
    });
    setShowEditModal(true);
  };

  // Filter Search
  const filteredAllergies = allergies.filter(
    (allergy) =>
      allergy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (allergy.description &&
        allergy.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredAllergies.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const currentAllergies = filteredAllergies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Allergy Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus me-2"></i>Add New
        </button>
      </div>

      {/* Table */}
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Allergy List</h5>
          <div className="d-flex align-items-center">
            <input
              type="text"
              className="form-control"
              placeholder="Search allergies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "300px" }}
            />
          </div>
        </div>
      </div>

      {/* ✅ Table Section */}
      <div className="card-body p-0 mt-3">
        {loading ? (
          <div className="text-center p-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th style={{ width: "100px" }}>ALLERGY NAME</th>
                  <th style={{ width: "400px" }}>DESCRIPTION</th>
                  <th style={{ width: "150px" }} className="text-end">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentAllergies.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center p-4">
                      No allergies found
                    </td>
                  </tr>
                ) : (
                  currentAllergies.map((allergy, index) => (
                    <tr key={allergy.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{allergy.name}</td>
                      <td style={{ whiteSpace: "pre-line" }}>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: allergy.description || "No description",
                          }}
                        />
                      </td>
                      <td className="text-end">
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm"
                            style={{
                              backgroundColor: "deepskyblue",
                              color: "white",
                            }}
                            onClick={() => openEditModal(allergy)}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteAllergy(allergy.id)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ✅ Pagination Always at Bottom */}
        <div className="card-footer mt-3">
          {filteredAllergies.length > itemsPerPage && (
            <nav>
              <ul className="pagination justify-content-center mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (num) => (
                    <li
                      key={num}
                      className={`page-item ${
                        currentPage === num ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(num)}
                      >
                        {num}
                      </button>
                    </li>
                  )
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
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Allergy</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddAllergy}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Allergy Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <ReactQuill
                      theme="snow"
                      value={formData.description}
                      onChange={(value) =>
                        setFormData({ ...formData, description: value })
                      }
                      placeholder="Write detailed description..."
                      style={{ height: "150px", marginBottom: "40px" }}
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "ordered" }, { list: "bullet" }],
                        ],
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Allergy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Allergy</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleEditAllergy}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Allergy Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <ReactQuill
                      theme="snow"
                      value={formData.description}
                      onChange={(value) =>
                        setFormData({ ...formData, description: value })
                      }
                      placeholder="Write detailed allergy description..."
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "ordered" }, { list: "bullet" }],
                        ],
                      }}
                      style={{ height: "150px", marginBottom: "40px" }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Allergy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllergyPage;
