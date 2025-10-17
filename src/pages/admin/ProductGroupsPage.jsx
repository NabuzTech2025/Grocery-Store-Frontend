import { useState, useEffect } from 'react';
import ProductGroupsTable from '../../components/Admin/ProductGroupsTable';
import { addProductGroup, getProduct, getToppingGroups } from "@/api/AdminServices";
import Swal from 'sweetalert2';

const ProductGroupsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [productId, setProductId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [productList, setProductList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [reloadTable, setReloadTable] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const openModal = async () => {
    try {
      const storeId = localStorage.getItem('store_id');
      const [productRes, groupsRes] = await Promise.all([
        getProduct(storeId),
        getToppingGroups(storeId)
      ]);
      setProductList(productRes);
      setGroupList(groupsRes);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch dropdown data", err);
      alert("Failed to load toppings or groups");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setProductId("");
    setGroupId("");
    setDisplayOrder(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      product_id: parseInt(productId),
      topping_group_id: parseInt(groupId),
    };

    try {
      const result = await addProductGroup(payload);
      console.log("Group item added:", result);
      setSuccessMsg("Group Item added successfully! ✅");
      setReloadTable(prev => !prev);
      closeModal();
    } catch (error) {
        const errMsg =
          error?.response?.data?.detail ||
          error?.message ||
          "Something went wrong";
        Swal.fire({
          icon: 'error',
          title: 'Failed to add group item',
          text: errMsg,
          confirmButtonText: 'OK',
        });
    }
  };

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 2000);
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
              <h2 className="mb-0">Product Group</h2>
            </div>
            <div className="col-2 text-end">
              <button className="btn btn-primary" onClick={openModal}>Add New</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <ProductGroupsTable reload={reloadTable} />
        </div>
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} aria-modal="true" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title mb-0">Add product Group</h5>
                </div>
                <div className="modal-body">
                  {/* Group dropdown */}
                  <div className="mb-3">
                    <label className="form-label">Select Group</label>
                    <select className="form-select" value={groupId} onChange={(e) => setGroupId(e.target.value)} required>
                      <option value="">Select Group</option>
                      {groupList.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Product dropdown */}
                  <div className="mb-3">
                    <label className="form-label">Select Product</label>
                    <select className="form-select" value={productId} onChange={(e) => setProductId(e.target.value)} required>
                      <option value="">Select Product</option>
                      {productList.data.map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Display order */}
                  {/* <div className="mb-3">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-control"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                      min="0"
                    />
                  </div> */}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                  <button type="submit" className="btn btn-primary">Save Group Item</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGroupsPage;
