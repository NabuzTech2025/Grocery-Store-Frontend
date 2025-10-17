import { useEffect, useState } from 'react';
import {
  getProductGroups,
  getProduct,
  updateProductGroups,
  deleteProductGroups,
} from '@/api/AdminServices';
import Swal from 'sweetalert2';

const ProductGroupsTable = ({ reload, onSuccess }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentItemId, setCurrentItemId] = useState(null);

  const [allProduct, setAllProduct] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const product = await getProduct(localStorage.getItem("store_id"));
        const groups = await getProductGroups(localStorage.getItem("store_id"));
        setAllProduct(product);
        setAllGroups(groups);
      } catch (e) {
        console.error("Dropdown fetch error", e);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item =>
        item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.group?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, data]);

  const fetchItems = async () => {
    try {
      const res = await getProductGroups(localStorage.getItem('store_id'));
      setData(res);
      setFilteredData(res);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [reload]);

  const openModal = (item) => {
    setSelectedProductId(item.product?.id || '');
    setSelectedGroupId(item.group?.id || '');
    setDisplayOrder(item.display_order ?? 0);
    setCurrentItemId(item.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedProductId('');
    setSelectedGroupId('');
    setDisplayOrder(0);
    setCurrentItemId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
    product_id: parseInt(selectedProductId),
    topping_group_id: parseInt(selectedGroupId),
    // display_order: parseInt(displayOrder) || 0,
    };

    try {
      await updateProductGroups(currentItemId, payload);
      onSuccess && onSuccess('Group Item updated!');
      closeModal();
      fetchItems();
    } catch (err) {
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

  const handleToggleDeleteRestore = async (item) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the group item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#999',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProductGroups(item.id);
      onSuccess && onSuccess('Deleted successfully!');
      fetchItems();
    } catch (err) {
      console.error("Delete failed", err);
      Swal.fire('Error', 'Failed to delete', 'error');
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (page) => setCurrentPage(page);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Product Group</h5>
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Group</th>
                {/* <th>Display Order</th> */}
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{indexOfFirst + idx + 1}</td>
                    <td>{item.product?.name || '-'}</td>
                    <td>{item.group?.name || '-'}</td>
                    {/* <td>{item.display_order ?? 0}</td> */}
                    <td className="text-center">
                      <div className="btn-group">
                        <button className="btn btn-sm btn-primary" onClick={() => openModal(item)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleToggleDeleteRestore(item)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center">No data found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {filteredData.length > itemsPerPage && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <li key={num} className={`page-item ${currentPage === num ? 'active' : ''}`}>
                <button className="page-link" onClick={() => paginate(num)}>{num}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Product Group</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label>Product</label>
                    <select
                      className="form-control"
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      required
                    >
                      <option value="">Select Product</option>
                      {allProduct.data.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label>Group</label>
                    <select
                      className="form-control"
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      required
                    >
                      <option value="">Select Group</option>
                      {allGroups.map((group) => (
                        <option key={group.group.id} value={group.group.id}>{group.group.name}</option>
                      ))}
                    </select>
                  </div>
               
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGroupsTable;

