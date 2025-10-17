import { useState, useEffect } from 'react';
import CategoryTable from '../../components/Admin/CategoryTable';
import { addCategory, getTax, uploadImage } from "@/api/AdminServices";
import { CgAdd } from 'react-icons/cg';  

const CategoryListPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [taxList, setTaxList] = useState([]);
  const [selectedTaxId, setSelectedTaxId] = useState("");
  const [reloadTable, setReloadTable] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const openModal = async () => {
    try {
      const resTax = await getTax(localStorage.getItem('store_id'));
      if (resTax.data.length > 0) {
        setTaxList(resTax.data);
        setShowModal(true);
      } else {
        alert("No tax data found!");
      }
    } catch (error) {
      console.error("Failed to fetch tax list", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setName("");
    setDescription("");
    setSelectedTaxId("");
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
  
    let imageUrl = "";
  
    // Upload image if selected
    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append('file', selectedImage);
        // Use the uploadImage function from AdminServices
        const imageResponse = await uploadImage(formData);
        if (imageResponse.data?.image_url) {
          imageUrl = imageResponse.data.image_url;
          console.log("Image uploaded successfully. URL:", imageUrl);
        } else {
          throw new Error("Invalid response format - missing image_url");
        }
      } catch (error) {
        console.error("Failed to upload image:", error);
        alert(`Failed to upload image: ${error.message}`);
        setUploadingImage(false);
        return;
      }
    }
  
    // Proceed with category creation
    const payload = {
      name,
      store_id: localStorage.getItem('store_id'),
      tax_id: selectedTaxId,
      image_url: imageUrl,
      description
    };
  
    try {
      const result = await addCategory(payload);
      console.log("Category created:", result);
      setSuccessMsg('Category added successfully! ✅');
      setReloadTable(prev => !prev);
      closeModal();
    } catch (error) {
      console.error("Category creation failed:", error);
      alert(`Failed to create category: ${error.message}`);
    } finally {
      setUploadingImage(false);
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
      {/* Page Header */}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-10">
              <div className="page-header-title">
                <h2 className="mb-0">Category</h2>
              </div>
            </div>
            <div className="col-2 text-end">
              <button className="btn btn-primary" type="button" onClick={openModal}>
                Add New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="row">
        <div className="col-md-12">
          <CategoryTable reload={reloadTable} onSuccess={handleSuccess} />
        </div>
      </div>

      {/* Modal */}
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
                <h5 className="modal-title mb-0">Add New Category</h5>
                <div className="d-flex align-items-center">
                  {imagePreview ? (
                 <div className="position-relative me-2">
                 <img 
                   src={imagePreview} 
                   alt="Preview" 
                   style={{ 
                     width: '50px', 
                     height: '50px', 
                     objectFit: 'cover',
                     borderRadius: '50%',  // Changed from '4px' to '50%' for perfect circle
                     border: '2px solid #f0f0f0' // Optional: adds a light border
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
                    <label htmlFor="image-upload" className="btn btn-sm btn-outline-secondary mb-0">
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
                    <label className="col-form-label pt-0">Category Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Tax Select */}
                  <div className="mb-3">
                    <label className="col-form-label pt-0">Tax</label>
                    <select
                      className="form-select"
                      value={selectedTaxId}
                      onChange={(e) => setSelectedTaxId(e.target.value)}
                      
                    >
                      <option value="">Select Tax</option>
                      {taxList && taxList.length > 0 && taxList.map((tax) => (
                        <option key={tax.id} value={tax.id}>
                          {tax.name} ({tax.percentage}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
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
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={uploadingImage}>
                    {uploadingImage ? 'Uploading...' : 'Save Category'}
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

export default CategoryListPage;