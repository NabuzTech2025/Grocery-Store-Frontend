import { useEffect, useState } from "react";
import {
  getCategory,
  getTax,
  getCategoryByID,
  updateCategory,
  deleteCategory,
  changeCategoryStatus,
  uploadImage,
} from "../../api/AdminServices";
import { FaSearch, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { CgAdd } from "react-icons/cg";
import Swal from "sweetalert2";

const CategoryTable = ({ reload, onSuccess }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [taxList, setTaxList] = useState([]);
  const [selectedTaxId, setSelectedTaxId] = useState("");
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

  // Search functionality
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description &&
            item.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (item.tax?.name &&
            item.tax.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const openModal = async (id) => {
    try {
      const [resTax, resCategory] = await Promise.all([
        getTax(localStorage.getItem("store_id")),
        getCategoryByID(id),
      ]);

      setName(resCategory.data.name);
      setDescription(resCategory.data.description);
      setCurrentCategoryId(id);
      setImagePreview(
        resCategory.data.image_url
          ? `${imageBaseUrl}${resCategory.data.image_url}`
          : ""
      );

      if (resCategory.data.tax) {
        setSelectedTaxId(resCategory.data.tax.id);
      }

      setTaxList(resTax.data);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setName("");
    setDescription("");
    setSelectedTaxId("");
    setCurrentCategoryId(null);
    setSelectedImage(null);
    setImagePreview("");
    setUploadingImage(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingImage(true);

    let imageUrl = imagePreview.includes(imageBaseUrl)
      ? imagePreview.replace(imageBaseUrl, "")
      : "";

    // Upload image if a new one is selected
    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append("file", selectedImage);
        const imageResponse = await uploadImage(formData);
        console.log("imageResponse ======>", imageResponse);
        if (imageResponse.statusText === "OK" && imageResponse.data?.url) {
          imageUrl = imageResponse.data.url;
          console.log("Image uploaded successfully. URL:", imageUrl);
        } else {
          throw new Error("Invalid response format - missing image_url");
        }
      } catch (error) {
        console.error("Failed to upload image:", error);
        Swal.fire("Error", `Failed to upload image: ${error.message}`, "error");
        setUploadingImage(false);
        return;
      }
    }

    // Proceed with category update
    const payload = {
      name,
      store_id: parseInt(localStorage.getItem("store_id")),
      tax_id: selectedTaxId,
      image_url: imageUrl,
      description,
    };

    try {
      await updateCategory(currentCategoryId, payload);
      onSuccess("Category updated successfully! ✅");
      closeModal();
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      Swal.fire("Error", "Failed to update category", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (categoryId) => {
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
        await deleteCategory(categoryId);
        onSuccess("Category deleted successfully!");
        fetchCategories();
      } catch (error) {
        console.error("Failed to delete category:", error);
        Swal.fire("Error", "Failed to delete category", "error");
      }
    }
  };

  const toggleStatus = async (
    categoryId,
    currentStatus,
    categoryName,
    tax_id,
    description,
    image_url
  ) => {
    try {
      const payload = {
        isActive: !currentStatus,
        name: categoryName,
        store_id: parseInt(localStorage.getItem("store_id")),
        tax_id: tax_id,
        image_url: image_url,
        description: description,
      };
      await changeCategoryStatus(categoryId, payload);
      onSuccess(
        `Category ${!currentStatus ? "activated" : "deactivated"} successfully!`
      );
      fetchCategories();
    } catch (error) {
      console.error("Failed to change status:", error);
      Swal.fire("Error", "Failed to change category status", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const store_id = parseInt(localStorage.getItem("store_id"));
      console.log("store_idstore_id", store_id);
      const response = await getCategory(localStorage.getItem("store_id"));
      setData(response.data || []);
      setFilteredData(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [reload]);

  return (
    <div className="col-sm-12">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Category List</h5>
          <div className="search-box" style={{ width: "300px" }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="input-group-text">
                <FaSearch />
              </span>
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
                <table className="table table-striped table-bordered nowrap dataTable">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Tax</th>
                      <th>Status</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((item, index) => (
                        <tr key={item.id}>
                          <td>{indexOfFirstItem + index + 1}</td>
                          <td>
                            {item.image_url ? (
                              <img
                                src={
                                  `${item.image_url.split("?")[0]}` ||
                                  "/assets/images/no-image.png"
                                }
                                alt={item.name}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "50%",
                                }}
                              />
                            ) : (
                              <span className="text-muted">No image</span>
                            )}
                          </td>
                          <td>{item.name}</td>
                          <td>
                            {" "}
                            {item.description.length > 20
                              ? `${item.description.slice(0, 20)}...`
                              : item.description}
                          </td>
                          <td>
                            {item.tax?.name || "-"}
                            {item.tax?.percentage !== undefined
                              ? ` (${item.tax.percentage}%)`
                              : ""}
                          </td>
                          <td>
                            <span
                              onClick={() =>
                                toggleStatus(
                                  item.id,
                                  item.isActive,
                                  item.name,
                                  item.tax.id,
                                  item.description,
                                  item.image_url
                                )
                              }
                              className={`badge ${
                                item.isActive ? "bg-success" : "bg-secondary"
                              }`}
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <button
                                type="button"
                                className="btn btn-dark btn-sm"
                                onClick={() => openModal(item.id)}
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
                              {/* <button
                                type="button"
                                className="btn btn-sm btn-outline-light"
                                onClick={() => toggleStatus(item.id, item.isActive, item.name)}
                                title={item.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {item.isActive ? (
                                  <FaToggleOn size={18} className="text-success" />
                                ) : (
                                  <FaToggleOff size={18} className="text-secondary" />
                                )}
                              </button> */}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          {searchTerm
                            ? "No matching categories found"
                            : "No categories available"}
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

      {/* Edit Modal */}
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
                <div className="modal-header d-flex justify-content-between align-items-center">
                  <h5 className="modal-title mb-0">Edit Category</h5>
                  <div className="d-flex align-items-center">
                    {imagePreview ? (
                      <div className="position-relative me-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            border: "2px solid #f0f0f0",
                          }}
                        />
                        <label
                          htmlFor="image-upload"
                          className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                        >
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="image-upload"
                        className="btn btn-sm btn-outline-secondary mb-0"
                      >
                        <CgAdd />
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="col-form-label pt-0">
                      Category Name:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="col-form-label pt-0">Tax</label>
                    <select
                      className="form-select"
                      value={selectedTaxId}
                      onChange={(e) => setSelectedTaxId(e.target.value)}
                    >
                      <option value="">Select Tax</option>
                      {taxList.map((tax) => (
                        <option key={tax.id} value={tax.id}>
                          {tax.name} ({tax.percentage}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="col-form-label">Description:</label>
                    <textarea
                      className="form-control"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
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
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Uploading..." : "Save Changes"}
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

export default CategoryTable;
