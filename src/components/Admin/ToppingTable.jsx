import { useEffect, useState } from 'react';
import { getToppings, updateTopping, deleteTopping, reactivateTopping } from '@/api/AdminServices';
import Swal from 'sweetalert2';

const ToppingTable = ({ reload, onSuccess }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentToppingId, setCurrentToppingId] = useState(null);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredData(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, data]);

  const fetchToppings = async () => {
    try {
      const res = await getToppings(localStorage.getItem('store_id'));
      setData(res);
      setFilteredData(res);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch toppings:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToppings();
  }, [reload]);

  const openModal = (item) => {
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price);
    setCurrentToppingId(item.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCurrentToppingId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      price: parseFloat(price),
      store_id: parseInt(localStorage.getItem('store_id')),
    };
    try {
      await updateTopping(currentToppingId, payload);
      onSuccess && onSuccess('Topping updated successfully!');
      closeModal();
      fetchToppings();
    } catch (err) {
      console.error("Update failed", err);
      Swal.fire('Error', 'Failed to update topping', 'error');
    }
  };

  const handleToggleDeleteRestore = async (item) => {
    const isCurrentlyActive = item.isActive;
  
    const confirmText = isCurrentlyActive
      ? 'This will delete the topping!'
      : 'This will restore the topping!';
  
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: confirmText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isCurrentlyActive ? '#d33' : '#28a745',
      cancelButtonColor: '#999',
      confirmButtonText: isCurrentlyActive ? 'Yes, delete it!' : 'Yes, restore it!'
    });
  
    if (!result.isConfirmed) return;
  
    try {
      if (isCurrentlyActive) {
        await deleteTopping(item.id); // DELETE /toppings/:id
        onSuccess && onSuccess('Topping deleted!');
      } else {
        await reactivateTopping(item.id); // PUT /toppings/:id/reactivate
        onSuccess && onSuccess('Topping restored!');
      }
  
      fetchToppings();
    } catch (err) {
      console.error("Status toggle failed", err);
      Swal.fire('Error', 'Failed to change status', 'error');
    }
  };
  

  // const toggleStatus = async (item) => {
  //   const updated = {
  //     isActive: !item.isActive,
  //     name: item.name,
  //     description: item.description,
  //     price: item.price,
  //     store_id: item.store_id
  //   };
  //   try {
  //     await reactivateTopping(item.id, updated);
  //     onSuccess && onSuccess('Status updated!');
  //     fetchToppings();
  //   } catch (err) {
  //     console.error("Status update failed", err);
  //     Swal.fire('Error', 'Status update failed', 'error');
  //   }
  // };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (page) => setCurrentPage(page);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Toppings</h5>
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
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{indexOfFirst + idx + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>${parseFloat(item.price).toFixed(2)}</td>
                    <td>
                      <span
                        onClick={() => toggleStatus(item)}
                        className={`badge ${item.isActive ? 'bg-success' : 'bg-secondary'}`}
                        role="button"
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button className="btn btn-sm btn-primary" onClick={() => openModal(item)}>Edit</button>
                     
                       <button
                        className={`btn btn-sm ${item.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleDeleteRestore(item)}
                      >
                        {item.isActive ? 'Delete' : 'Restore'}
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center">No toppings found.</td></tr>
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

      {/* Edit Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Topping</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label>Name</label>
                    <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label>Description</label>
                    <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label>Price</label>
                    <input type="number" step="0.01" className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} required />
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

export default ToppingTable;
