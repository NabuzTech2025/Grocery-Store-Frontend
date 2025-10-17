import { useState, useEffect } from 'react';
import GroupsItemTable from '../../components/Admin/GroupsItemTable';
import { addGroupItem, getToppings, getToppingGroups } from "@/api/AdminServices";

const GroupsItemListPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [toppingId, setToppingId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [toppingList, setToppingList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [reloadTable, setReloadTable] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const openModal = async () => {
    try {
      const storeId = localStorage.getItem('store_id');
      const [toppingsRes, groupsRes] = await Promise.all([
        getToppings(storeId),
        getToppingGroups(storeId)
      ]);
      setToppingList(toppingsRes);
      setGroupList(groupsRes);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch dropdown data", err);
      alert("Failed to load toppings or groups");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setToppingId("");
    setGroupId("");
    setDisplayOrder(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      topping_id: parseInt(toppingId),
      topping_group_id: parseInt(groupId),
      display_order: parseInt(displayOrder),
    };

    try {
      const result = await addGroupItem(payload);
      console.log("Group item added:", result);
      setSuccessMsg("Group Item added successfully! ✅");
      setReloadTable(prev => !prev);
      closeModal();
    } catch (error) {
      console.error("Failed to add group item:", error);
      alert("Failed to add group item: " + error.message);
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
              <h2 className="mb-0">Group Item</h2>
            </div>
            <div className="col-2 text-end">
              <button className="btn btn-primary" onClick={openModal}>Add New</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <GroupsItemTable reload={reloadTable} />
        </div>
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} aria-modal="true" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title mb-0">Add Group Item</h5>
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

                  {/* Topping dropdown */}
                  <div className="mb-3">
                    <label className="form-label">Select Topping</label>
                    <select className="form-select" value={toppingId} onChange={(e) => setToppingId(e.target.value)} required>
                      <option value="">Select Topping</option>
                      {toppingList.map(topping => (
                        <option key={topping.id} value={topping.id}>{topping.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Display order */}
                  <div className="mb-3">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-control"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(e.target.value)}
                      min="0"
                    />
                  </div>
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

export default GroupsItemListPage;
