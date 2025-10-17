import { useState } from 'react';
import { addCategory } from "@/api/AdminServices"; // ✅ API import

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // page reload se rokna
    try {
      const response = await addCategory(formData);
      console.log("Category Added Successfully:", response.data);

      // Success ke baad form clear karna chahta hai?
      setFormData({
        name: "",
        description: ""
      });

    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>Add Category</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label" htmlFor="name">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="3"
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary mb-4">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
