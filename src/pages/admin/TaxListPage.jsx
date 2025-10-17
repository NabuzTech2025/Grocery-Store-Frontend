import { useState, useEffect } from 'react';
import TaxTable from '../../components/Admin/TaxTable';
import { addTax, getTax } from "@/api/AdminServices";
import Swal from 'sweetalert2';

const TaxListPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState("");
  const [description, setDescription] = useState("");
  const [reloadTable, setReloadTable] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [modalType, setModalType] = useState('tax'); // 'tax' or 'category'

  const openTaxModal = () => {
    setModalType('tax');
    setName("");
    setPercentage("");
    setDescription("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setName("");
    setPercentage("");
    setDescription("");
  };

  const handleTaxSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      percentage: parseFloat(percentage),
      store_id: localStorage.getItem('store_id'),
    };

    try {
      const result = await addTax(payload);
      console.log("Tax added successfully:", result);
      setSuccessMsg('Tax added successfully! ✅');
      setReloadTable(prev => !prev);
      closeModal();
    } catch (error) {
      console.error("Failed to add tax:", error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to add tax', 'error');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      store_id: 2, 
      tax_id: selectedTaxId,
      image_url: "", 
      description
    };

    try {
      const result = await addCategory(payload);
      console.log("Category added successfully:", result);
      setSuccessMsg('Category added successfully! ✅');
      setReloadTable(prev => !prev);
      closeModal();
    } catch (error) {
      console.error("Failed to add category:", error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to add category', 'error');
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
                <h2 className="mb-0">Tax Management</h2>
              </div>
            </div>
            <div className="col-2 text-end">
              <div className="btn-group">
                <button 
                  className="btn btn-primary" 
                  type="button" 
                  onClick={openTaxModal}
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
          <TaxTable reload={reloadTable} onSuccess={handleSuccess} />
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
              <form onSubmit={modalType === 'tax' ? handleTaxSubmit : handleCategorySubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalType === 'tax' ? 'Add New Tax' : 'Add New Category'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Common Fields */}
                  <div className="mb-3">
                    <label className="col-form-label pt-0">
                      {modalType === 'tax' ? 'Tax Name:' : 'Category Name:'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Tax Specific Fields */}
                  {modalType === 'tax' && (
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
                  )}

                  {/* Category Specific Fields */}
                  {modalType === 'category' && (
                    <div className="mb-3">
                      <label className="col-form-label pt-0">Tax</label>
                      <select
                        className="form-select"
                        value={selectedTaxId}
                        onChange={(e) => setSelectedTaxId(e.target.value)}
                        required
                      >
                        <option value="">Select Tax</option>
                        {taxList && taxList.length > 0 && taxList.map((tax) => (
                          <option key={tax.id} value={tax.id}>
                            {tax.name} ({tax.percentage}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modalType === 'tax' ? 'Save Tax' : 'Save Category'}
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

export default TaxListPage;