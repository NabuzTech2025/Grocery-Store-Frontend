import { useState, useEffect } from "react";
import {
  getAllergyItems,
  addAllergyItemsToProduct,
  removeAllergyItemFromProduct,
  getProduct,
  getAllergyProductLinks,
} from "../../api/AdminServices";

const ItemAllergyPage = () => {
  const [allergyId, setAllergyId] = useState("");
  const [productId, setProductId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Fixed items per page
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Data lists
  const [allergyList, setAllergyList] = useState([]);
  const [productList, setProductList] = useState([]);

  // Fetch data with pagination
  const fetchData = async (page = 1, limit = 500, search = "") => {
    try {
      setLoading(true);
      const store_id = localStorage.getItem("store_id") || "13";

      // Fetch allergies (for dropdown)
      try {
        const allergiesResponse = await getAllergyItems(store_id);
        if (allergiesResponse && allergiesResponse.length > 0) {
          setAllergyList(allergiesResponse);
        }
      } catch (error) {
        console.error("Error fetching allergies:", error);
      }

      // Fetch products (for dropdown)
      try {
        const productsResponse = await getProduct(store_id);
        if (productsResponse?.data?.length > 0) {
          setProductList(productsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }

      // Fetch allergy-product links with pagination
      try {
        const offset = (page - 1) * limit;
        const linksResponse = await getAllergyProductLinks(
          store_id,
          false, // include_unlinked
          limit, // limit
          offset // offset
        );

        if (linksResponse && Array.isArray(linksResponse)) {
          // Map the API response
          const mappedItems = linksResponse.map((item) => ({
            id: `${item.product_id}-${item.allergy_item_id}`,
            product_id: item.product_id,
            allergy_id: item.allergy_item_id,
            product: item.product_name,
            allergy: item.allergy_name,
          }));

          // Filter by search term if provided
          let filteredItems = mappedItems;
          if (search) {
            filteredItems = mappedItems.filter(
              (item) =>
                item.product.toLowerCase().includes(search.toLowerCase()) ||
                item.allergy.toLowerCase().includes(search.toLowerCase())
            );
          }

          setItems(filteredItems);
          setTotalItems(filteredItems.length);
          setTotalPages(Math.ceil(filteredItems.length / limit));
        } else {
          setItems([]);
          setTotalItems(0);
          setTotalPages(0);
        }
      } catch (error) {
        console.error("Error fetching allergy links:", error);
        setItems([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      fetchData(1, itemsPerPage, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, itemsPerPage]);

  // Initial load and page changes
  useEffect(() => {
    fetchData(currentPage, itemsPerPage, searchTerm);
  }, [currentPage]);

  // Handle form submission with detailed debugging
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form submitted with:", { productId, allergyId, editingItem });

    // Validation
    if (!productId || !allergyId) {
      alert("Please select both product and allergy");
      return;
    }

    try {
      setLoading(true);

      const productName = productList.find(
        (p) => p.id === parseInt(productId)
      )?.name;
      const allergyName = allergyList.find(
        (a) => a.id === parseInt(allergyId)
      )?.name;

      console.log("Found names:", { productName, allergyName });

      if (editingItem) {
        console.log("Editing existing item:", editingItem);

        // For edit, remove old and add new if different
        if (
          editingItem.product_id !== parseInt(productId) ||
          editingItem.allergy_id !== parseInt(allergyId)
        ) {
          console.log("Removing old association:", {
            product_id: editingItem.product_id,
            allergy_id: editingItem.allergy_id,
          });

          await removeAllergyItemFromProduct(
            editingItem.product_id,
            editingItem.allergy_id
          );

          console.log("Adding new association:", {
            product_id: parseInt(productId),
            allergy_id: parseInt(allergyId),
          });

          await addAllergyItemsToProduct(parseInt(productId), [
            parseInt(allergyId),
          ]);
          alert("Item updated successfully!");
        }
      } 

      else {
        console.log("Adding new item:", {
          product_id: parseInt(productId),
          allergy_id: parseInt(allergyId),
        });

        // Check if association already exists
        const existingItem = items.find(
          (item) =>
            item.product_id === parseInt(productId) &&
            item.allergy_id === parseInt(allergyId)
        );

        if (existingItem) {
          alert("This product-allergy association already exists!");
          return;
        }

        const result = await addAllergyItemsToProduct(parseInt(productId), [
          parseInt(allergyId),
        ]);
        console.log("Add result:", result);

        alert("Item added successfully!");
      }

      // Refresh data after successful operation
      await fetchData(currentPage, itemsPerPage, searchTerm);
    } catch (error) {
      console.error("Error submitting item:", error);

      // More detailed error logging
      if (error.response) {
        console.error("Response error:", error.response.data);
        console.error("Status:", error.response.status);
        alert(
          `Failed to save item: ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        console.error("Request error:", error.request);
        alert("Network error. Please check your connection.");
      } else {
        console.error("Error:", error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }

    closeModal();
  };

  // Handle delete with confirmation
  const handleDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      setLoading(true);
      console.log("Deleting item:", item);

      await removeAllergyItemFromProduct(item.product_id, item.allergy_id);

      // Refresh data after successful deletion
      await fetchData(currentPage, itemsPerPage, searchTerm);

      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const closeModal = () => {
    setShowModal(false);
    setAllergyId("");
    setProductId("");
    setEditingItem(null);
  };

  const openAddModal = () => {
    console.log("Opening add modal");
    setEditingItem(null);
    setAllergyId("");
    setProductId("");
    setShowModal(true);
  };

  const openEditModal = (item) => {
    console.log("Opening edit modal for:", item);
    setEditingItem(item);
    setProductId(item.product_id?.toString() || "");
    setAllergyId(item.allergy_id?.toString() || "");
    setShowModal(true);
  };

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Allergy Mapping</h2>
        <button
          className="btn btn-primary"
          onClick={openAddModal}
          disabled={loading}
        >
          <i className="fas fa-plus me-2"></i>
          Add New
        </button>
      </div>

      {/* Search Bar */}
      <div className="card-body d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Product Allergies ({totalItems} total)</h5>
        <div className="d-flex align-items-center">
          <input
            type="text"
            className="form-control"
            placeholder="Search products or allergies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "60px" }}>#</th>
                    <th>Product Name</th>
                    <th>Allergy Name</th>
                    <th style={{ width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center p-4">
                        {searchTerm
                          ? "No items found matching your search"
                          : "No items found"}
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{item.product}</td>
                        <td>{item.allergy}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEditModal(item)}
                              disabled={loading}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(item)}
                              disabled={loading}
                            >
                              <i className="fas fa-trash"></i>
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
        </div>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            {/* Previous button */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
            </li>

            {/* First page */}
            {currentPage > 3 && (
              <>
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </button>
                </li>
                {currentPage > 4 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}
              </>
            )}

            {/* Page numbers */}
            {getPageNumbers().map((pageNum) => (
              <li
                key={pageNum}
                className={`page-item ${
                  currentPage === pageNum ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              </li>
            ))}

            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}
                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </li>
              </>
            )}

            {/* Next button */}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>

          {/* Page info */}
          <div className="text-center mt-2">
            <small className="text-muted">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              entries
            </small>
          </div>
        </nav>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingItem
                      ? "Edit Product Allergy"
                      : "Add Product Allergy"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Select Product *</label>
                    <select
                      className="form-select"
                      value={productId}
                      onChange={(e) => {
                        console.log("Product selected:", e.target.value);
                        setProductId(e.target.value);
                      }}
                      required
                    >
                      <option value="">Choose a product...</option>
                      {productList.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Select Allergy *</label>
                    <select
                      className="form-select"
                      value={allergyId}
                      onChange={(e) => {
                        console.log("Allergy selected:", e.target.value);
                        setAllergyId(e.target.value);
                      }}
                      required
                    >
                      <option value="">Choose an allergy...</option>
                      {allergyList.map((allergy) => (
                        <option key={allergy.id} value={allergy.id}>
                          {allergy.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !productId || !allergyId}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {editingItem ? "Updating..." : "Adding..."}
                      </>
                    ) : editingItem ? (
                      "Update"
                    ) : (
                      "Add"
                    )}
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

export default ItemAllergyPage;
