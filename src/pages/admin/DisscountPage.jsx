import { useState, useEffect } from "react";
import {
  addDisscount,
  updateDisscount,
  getDisscount,
} from "@/api/AdminServices";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";

const DiscountPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();
  // Form states
  const [formData, setFormData] = useState({
    deliveryCode: "DELIVERY_DISCOUNT", // Fixed code for delivery
    pickupCode: "PICKUP_DISCOUNT", // Fixed code for pickup
    deliveryValue: "",
    pickupValue: "",
    expiresAt: "",
  });

  // Fetch all discounts
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const storeId = localStorage.getItem("store_id");
      const response = await getDisscount(storeId);
      setDiscounts(response.data || []);

      // Pre-fill form with existing discounts
      if (response.data?.length > 0) {
        const deliveryDiscount = response.data.find(
          (d) => d.code === "DELIVERY_DISCOUNT"
        );
        const pickupDiscount = response.data.find(
          (d) => d.code === "PICKUP_DISCOUNT"
        );

        setFormData((prev) => ({
          ...prev,
          deliveryValue: deliveryDiscount?.value || "",
          pickupValue: pickupDiscount?.value || "",
          expiresAt:
            deliveryDiscount?.expires_at?.split("T")[0] ||
            pickupDiscount?.expires_at?.split("T")[0] ||
            "",
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch discounts:", error);
      Swal.fire("Error", "Failed to load discounts", "error");
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.deliveryValue ||
      !formData.pickupValue ||
      !formData.expiresAt
    ) {
      Swal.fire("Error", "Please fill all required fields", "error");
      return;
    }

    const storeId = localStorage.getItem("store_id");
    const expiryDate = new Date(formData.expiresAt).toISOString();

    try {
      // Check if discounts already exist
      const existingDelivery = discounts.find(
        (d) => d.code === "DELIVERY_DISCOUNT"
      );
      const existingPickup = discounts.find(
        (d) => d.code === "PICKUP_DISCOUNT"
      );

      // Prepare payloads
      const deliveryPayload = {
        code: "DELIVERY_DISCOUNT",
        type: "percentage",
        value: parseFloat(formData.deliveryValue),
        expires_at: expiryDate,
        store_id: storeId ? parseInt(storeId) : 4,
      };

      const pickupPayload = {
        code: "PICKUP_DISCOUNT",
        type: "percentage",
        value: parseFloat(formData.pickupValue),
        expires_at: expiryDate,
        store_id: storeId ? parseInt(storeId) : 4,
      };

      // Save or update discounts
      if (existingDelivery) {
        await updateDisscount(existingDelivery.id, deliveryPayload);
      } else {
        await addDisscount(deliveryPayload);
      }

      if (existingPickup) {
        await updateDisscount(existingPickup.id, pickupPayload);
      } else {
        await addDisscount(pickupPayload);
      }

      Swal.fire("Success", "Discounts updated successfully!", "success");
      fetchDiscounts();
    } catch (error) {
      console.error("Failed to save discounts:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to save discounts";
      Swal.fire("Error", errorMsg, "error");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  // Fetch discounts on component mount
  useEffect(() => {
    fetchDiscounts();
  }, []);

  return (
    <div className="container-fluid">
      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-10">
              <div className="page-header-title">
                <h2 className="mb-0">{currentLanguage.discount_management}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>{currentLanguage.set_discount_percentages}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    {currentLanguage.delivery_discount_percentage} (%){" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="deliveryValue"
                    value={formData.deliveryValue}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="1"
                    required
                    placeholder="0"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    {}
                    {currentLanguage.pickup_discount_percentage} (%){" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="pickupValue"
                    value={formData.pickupValue}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="1"
                    required
                    placeholder="0"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    {currentLanguage.expiry_date}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Discounts"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>{currentLanguage.current_discounts}</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">
                      {currentLanguage.loading}...
                    </span>
                  </div>
                  <p>{currentLanguage.loading_discounts}...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>{currentLanguage.type}</th>
                        <th>{currentLanguage.value}</th>
                        {/* <th>Expires</th> */}
                        {/* <th>Status</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {discounts
                        .filter(
                          (d) =>
                            d.code === "DELIVERY_DISCOUNT" ||
                            d.code === "PICKUP_DISCOUNT"
                        )
                        .map((discount) => (
                          <tr key={discount.id}>
                            <td>
                              <strong>
                                {discount.code === "DELIVERY_DISCOUNT"
                                  ? "Delivery"
                                  : "Pickup"}
                              </strong>
                            </td>
                            <td>{discount.value}%</td>
                            {/* <td>
                            <span className={new Date(discount.expires_at) < new Date() ? 'text-danger' : ''}>
                              {formatDate(discount.expires_at)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${new Date(discount.expires_at) < new Date() ? 'bg-danger' : 'bg-success'}`}>
                              {new Date(discount.expires_at) < new Date() ? 'Expired' : 'Active'}
                            </span>
                          </td> */}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountPage;
