import { useEffect, useState } from "react";
import {
  getCategory,
  getTax,
  getProduct,
  updateProduct,
  productDelete,
  changeProductStatus,
  uploadImage,
} from "@/api/AdminServices";
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaPowerOff,
  FaToggleOff,
  FaToggleOn,
} from "react-icons/fa";
import { CgAdd } from "react-icons/cg";
import Swal from "sweetalert2";
import { currentCurrency } from "../../utils/helper/currency_type";


const ProductTable = ({ reload, onSuccess }) => {
  // State variables
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategoryId, setCategoryId] = useState("");
  const [selectedTaxId, setSelectedTaxId] = useState("");
  const [selectedType, setSelectedType] = useState("simple");
  const [isActive, setIsActive] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [taxList, setTaxList] = useState([]);
  const [variants, setVariants] = useState([]);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Toggle variants visibility
  const toggleVariants = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleDecimalChange =
    (setter, maxDecimals = 2) =>
    (e) => {
      const val = e.target.value;
      const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);
      if (val === "" || regex.test(val)) {
        setter(val);
      }
    };

  // Search functionality
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.item_code &&
            item.item_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.category?.name &&
            item.category.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          item.type.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Fetch product data
  const fetchProducts = async () => {
    try {
      const response = await getProduct(localStorage.getItem("store_id"));
      setData(response.data || []);
      setFilteredData(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  // Handle image change
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

  // Open edit modal
  const openModal = async (id) => {
    try {
      const [resTax, resCategory, productRes] = await Promise.all([
        getTax(localStorage.getItem("store_id")),
        getCategory(localStorage.getItem("store_id")),
        getProduct(localStorage.getItem("store_id")),
      ]);

      setTaxList(resTax.data);
      setCategoryData(resCategory.data || []);

      const product = productRes.data.find((item) => item.id === id);
      if (!product) {
        alert("Product not found!");
        return;
      }

      setName(product.name);
      setProductCode(product.item_code || "");
      setDescription(product.description || "");
      setPrice(product.price?.toString() || "0");
      setCategoryId(product.category_id?.toString() || "");
      setSelectedTaxId(product.tax_id?.toString() || "");
      setSelectedType(product.type || "simple");
      setIsActive(product.isActive ?? true);
      setCurrentProductId(id);
      setImagePreview(
        product.image_url ? `https://magskr.com${product.image_url}` : ""
      );

      if (product.type === "variable" && product.variants) {
        setVariants(
          product.variants.map((v) => ({
            name: v.name,
            price: v.price?.toString() || "0",
            description: v.description || "",
          }))
        );
      } else {
        setVariants([]);
      }

      setShowModal(true);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setName("");
    setProductCode("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setSelectedTaxId("");
    setSelectedType("simple");
    setIsActive(true);
    setVariants([]);
    setCurrentProductId(null);
    setSelectedImage(null);
    setImagePreview("");
    setUploadingImage(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingImage(true);

    let imageUrl = imagePreview.includes("https://magskr.com")
      ? imagePreview.replace("https://magskr.com", "")
      : "";

    // Upload image if a new one is selected
    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append("file", selectedImage);
        const imageResponse = await uploadImage(formData);
        if (imageResponse.data?.image_url) {
          imageUrl = imageResponse.data.image_url;
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

    const payload = {
      name: name,
      item_code: productCode,
      category_id: Number(selectedCategoryId),
      image_url: imageUrl,
      type: selectedType,
      price: selectedType === "simple" ? parseFloat(price) : 0,
      store_id: parseInt(localStorage.getItem("store_id")),
      tax_id: Number(selectedTaxId),
      isActive: isActive,
      description: description,
      variants:
        selectedType === "variable"
          ? variants.map((variant) => ({
              name: variant.name,
              price: parseFloat(variant.price),
              description: variant.description,
            }))
          : [],
    };

    try {
      await updateProduct(currentProductId, payload);
      onSuccess("Product updated successfully! ✅");
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
      Swal.fire("Error", "Failed to update product", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // Variant management
  const addVariant = () => {
    setVariants([...variants, { name: "", price: "", description: "" }]);
  };

  const removeVariant = (index) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  // Delete product function
  const handleDelete = async (productId) => {
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
        await productDelete(productId);
        onSuccess("Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product:", error);
        Swal.fire("Error", "Failed to delete product", "error");
      }
    }
  };

  // Toggle product status
  const toggleStatus = async (
    productId,
    currentStatus,
    name,
    category_id,
    price,
    type,
    variants
  ) => {
    try {
      const payload = {
        isActive: !currentStatus,
        name: name,
        category_id: category_id,
        price: price || 0,
        type: type,
        ...(type === "variable" && { variants: variants }),
      };

      await updateProduct(productId, payload);
      onSuccess(
        `Product ${!currentStatus ? "activated" : "deactivated"} successfully!`
      );
      fetchProducts();
    } catch (error) {
      console.error("Failed to change status:", error);
      Swal.fire("Error", "Failed to change product status", "error");
    }
  };

  // Fetch products on component mount or reload
  useEffect(() => {
    fetchProducts();
  }, [reload]);

  return (
    <div className="col-sm-12">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Product List</h5>
          <div className="search-box" style={{ width: "300px" }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
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
                      <th>Product Name</th>
                      <th>Product Code</th>
                      <th>Category</th>
                      <th>Tax</th>
                      <th>Type</th>
                      <th>Price/Variants</th>
                      <th>Status</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((item, index) => (
                        <>
                          <tr key={item.id}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td>
                           
                           
                            </td>
                            <td>{item.name}</td>
                            <td>{item.item_code || "-"}</td>
                            <td>{item.category?.name || "-"}</td>
                            <td>
                              {item.tax?.percentage !== undefined
                                ? `${item.tax.percentage}%`
                                : "-"}
                            </td>
                            <td>{item.type || "-"}</td>
                            <td>
                              {item.type === "simple" ? (
                                `${currentCurrency.symbol}${item.price}`
                              ) : (
                                <button
                                  className="btn btn-link p-0 text-primary"
                                  onClick={() => toggleVariants(item.id)}
                                >
                                  {expandedProducts[item.id] ? (
                                    <>
                                      <FaChevronUp className="me-1" />
                                      Hide variants
                                    </>
                                  ) : (
                                    <>
                                      <FaChevronDown className="me-1" />
                                      Show variants
                                    </>
                                  )}
                                </button>
                              )}
                            </td>
                            <td>
                              <span
                                onClick={() =>
                                  toggleStatus(
                                    item.id,
                                    item.isActive,
                                    item.name,
                                    item.category_id,
                                    item.price,
                                    item.type,
                                    item.variants
                                  )
                                }
                                className={`badge ${
                                  item.isActive ? "bg-success" : "bg-secondary"
                                }`}
                              >
                                {item.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
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
                              </div>
                            </td>
                          </tr>

                          {item.type === "variable" &&
                            expandedProducts[item.id] &&
                            item.variants?.length > 0 &&
                            item.variants.map((variant, idx) => (
                              <tr
                                key={`${item.id}-${idx}`}
                                className="variant-row"
                              >
                                <td colSpan="2"></td>
                                <td colSpan="4"></td>
                                <td>Variant {idx + 1}</td>
                                <td>
                                  <div>
                                    <strong>Name:</strong> {variant.name}
                                  </div>
                                  <div>
                                    <strong>Price:</strong>
                                    {currentCurrency.symbol} {variant.price}
                                  </div>
                                  <div>
                                    <strong>Description:</strong>{" "}
                                    {variant.description || "-"}
                                  </div>
                                </td>
                                <td colSpan="3"></td>
                              </tr>
                            ))}
                        </>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center py-4">
                          {searchTerm
                            ? "No matching products found"
                            : "No products available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header d-flex justify-content-between align-items-center">
                  <h5 className="modal-title mb-0">Edit Product</h5>
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
                          htmlFor="product-image-upload"
                          className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                        >
                          <input
                            id="product-image-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="product-image-upload"
                        className="btn btn-sm btn-outline-secondary mb-0"
                      >
                        <CgAdd />
                        <input
                          id="product-image-upload"
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
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Product Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Product Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={productCode}
                          onChange={(e) => setProductCode(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Category</label>
                        <select
                          className="form-select"
                          value={selectedCategoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          required
                        >
                          <option value="">Select Category</option>
                          {categoryData.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tax</label>
                        <select
                          className="form-select"
                          value={selectedTaxId}
                          onChange={(e) => setSelectedTaxId(e.target.value)}
                          required
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
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={isActive}
                          onChange={(e) =>
                            setIsActive(e.target.value === "true")
                          }
                          required
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Type</label>
                        <select
                          className="form-select"
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          required
                        >
                          <option value="simple">Simple</option>
                          <option value="variable">Variable</option>
                        </select>
                      </div>

                      {selectedType === "simple" && (
                        <div className="mb-3">
                          <label className="form-label">Price</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              {currentCurrency.symbol}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              value={price}
                              // onChange={(e) => setPrice(e.target.value)}
                              onChange={handleDecimalChange(setPrice)}
                              required
                            />
                          </div>
                        </div>
                      )}

                      {selectedType === "variable" && (
                        <div className="mb-3">
                          <label className="form-label">Variants</label>
                          {variants.map((variant, index) => (
                            <div key={index} className="card p-2 mb-2">
                              <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Variant Name"
                                value={variant.name}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                required
                              />
                              <div className="input-group mb-2">
                                <span className="input-group-text">
                                  {currentCurrency.symbol}
                                </span>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Price"
                                  value={variant.price}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const regex = /^\d*\.?\d{0,2}$/;
                                    if (val === "" || regex.test(val)) {
                                      handleVariantChange(index, "price", val);
                                    }
                                  }}
                                  required
                                />
                              </div>
                              <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Description"
                                value={variant.description}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => removeVariant(index)}
                              >
                                Remove Variant
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn btn-success btn-sm mt-2"
                            onClick={addVariant}
                          >
                            Add Variant
                          </button>
                        </div>
                      )}
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
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Uploading..." : "Update Product"}
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

export default ProductTable;
