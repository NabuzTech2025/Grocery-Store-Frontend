import { useState, useEffect } from 'react';
import ToppingTable from '../../components/Admin/ToppingTable';
import { addTopping, getToppings } from "@/api/AdminServices";

const ToppingListPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [reloadTable, setReloadTable] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setName("");
    setDescription("");
    setPrice("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      price: parseFloat(price),
      store_id: localStorage.getItem('store_id')
    };

    try {
      const result = await addTopping(payload);
      console.log("Topping added:", result);
      setSuccessMsg("Topping added successfully! ✅");
      setReloadTable(prev => !prev);
      closeModal();
    } catch (error) {
      console.error("Failed to add topping:", error);
      alert("Failed to add topping: " + error.message);
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
              <h2 className="mb-0">Toppings</h2>
            </div>
            <div className="col-2 text-end">
              <button className="btn btn-primary" onClick={openModal}>Add New</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <ToppingTable reload={reloadTable} />
        </div>
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} aria-modal="true" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title mb-0">Add New Topping</h5>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="col-form-label pt-0">Name:</label>
                    <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="col-form-label pt-0">Price:</label>
                    <input type="number" className="form-control" value={price} onChange={e => setPrice(e.target.value)} step="0.01" required />
                  </div>
                  <div className="mb-3">
                    <label className="col-form-label">Description:</label>
                    <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                  <button type="submit" className="btn btn-primary">Save Topping</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToppingListPage;
