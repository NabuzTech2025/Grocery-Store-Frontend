// import { useState, useEffect } from "react";
// import ReactQuill from "react-quill-new";
// import "react-quill-new/dist/quill.snow.css";
// import {
//   getAllergyGroups,
//   addAllergyGroups,
//   updateAllergyGroups,
//   deleteAllergyGroups,
// } from "@/api/AdminServices";

// function AllergyGroupPage() {
//   const [groups, setGroups] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     store_id: localStorage.getItem("store_id") || "1",
//   });
//   const [editingGroup, setEditingGroup] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   // Dummy fallback data
//   const dummyGroups = [
//     { id: 1, name: "Dairy Allergies", description: "Milk, Cheese, Butter", store_id: 1 },
//     { id: 2, name: "Seafood Allergies", description: "Fish, Shellfish", store_id: 1 },
//     { id: 3, name: "Nut Allergies", description: "Peanuts, Tree nuts", store_id: 1 },
//   ];

//   // Fetch Groups
//   const fetchGroups = async () => {
//     try {
//       setLoading(true);
//       const store_id = localStorage.getItem("store_id") || "1";
//       const response = await getAllergyGroups(store_id);
//       if (response && response.length > 0) {
//         setGroups(response);
//       } else {
//         setGroups(dummyGroups);
//       }
//     } catch (error) {
//       console.error("Error fetching groups:", error);
//       setGroups(dummyGroups);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchGroups();
//   }, []);

//   // Add or Update
//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   try {
//   //     if (editingGroup) {
//   //       const response = await updateAllergyGroups(editingGroup.id, formData);
//   //       setGroups(groups.map((g) => (g.id === editingGroup.id ? response : g)));
//   //       alert("Group updated successfully!");
//   //     } else {
//   //       const response = await addAllergyGroups(formData);
//   //       setGroups([...groups, response]);
//   //       alert("Group added successfully!");
//   //     }
//   //     setShowModal(false);
//   //     setFormData({ name: "", description: "", store_id: localStorage.getItem("store_id") || "1" });
//   //     setEditingGroup(null);
//   //   } catch (error) {
//   //     console.error("Error saving group:", error);
//   //     alert("Failed to save group. Using static demo.");
//   //     if (!editingGroup) {
//   //       setGroups([...groups, { id: Date.now(), ...formData }]);
//   //     }
//   //     setShowModal(false);
//   //   }
//   // };
//   // Add or Update
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     if (editingGroup) {
//       const response = await updateAllergyGroups(editingGroup.id, formData);
//       // Agar API se response na mile to manually update karo
//       if (response) {
//         setGroups(groups.map((g) => (g.id === editingGroup.id ? response : g)));
//       } else {
//         setGroups(
//           groups.map((g) =>
//             g.id === editingGroup.id ? { ...g, ...formData } : g
//           )
//         );
//       }
//       alert("Group updated successfully!");
//     } else {
//       const response = await addAllergyGroups(formData);
//       if (response) {
//         setGroups([...groups, response]);
//       } else {
//         setGroups([...groups, { id: Date.now(), ...formData }]);
//       }
//       alert("Group added successfully!");
//     }

//     // ✅ Reset form & close modal
//     setShowModal(false);
//     setFormData({
//       name: "",
//       description: "",
//       store_id: localStorage.getItem("store_id") || "1",
//     });
//     setEditingGroup(null);

//   } catch (error) {
//     console.error("Error saving group:", error);
//     alert("Failed to save group. Using static demo.");
//     if (!editingGroup) {
//       setGroups([...groups, { id: Date.now(), ...formData }]);
//     } else {
//       setGroups(
//         groups.map((g) =>
//           g.id === editingGroup.id ? { ...g, ...formData } : g
//         )
//       );
//     }
//     setShowModal(false);
//     setEditingGroup(null);
//   }
// };


//   // Delete Group
//   const handleDelete = async (id) => {
//     if (confirm("Are you sure you want to delete this group?")) {
//       try {
//         await deleteAllergyGroups(id);
//         setGroups(groups.filter((g) => g.id !== id));
//         alert("Group deleted successfully!");
//       } catch (error) {
//         console.error("Error deleting group:", error);
//         alert("Failed to delete group. Removing from static list.");
//         setGroups(groups.filter((g) => g.id !== id));
//       }
//     }
//   };

//   // Pagination Logic
//   const filteredGroups = groups.filter((g) =>
//     g.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
//   const currentData = filteredGroups.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   return (
//     <div className="container-fluid p-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2>Allergy Groups</h2>
//         <button
//           className="btn btn-primary"
//           onClick={() => setShowModal(true)}
//         >
//           <i className="fas fa-plus me-2"></i>Add New Group
//         </button>
//       </div>

//       {/* Table */}

//         <div className="card-header d-flex justify-content-between">
//           <h5 className="mb-0">Group List</h5>
//           <input
//             type="text"
//             className="form-control"
//             placeholder="Search groups..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{ width: "300px" }}
//           />
//         </div>

//         <div className="card-body p-0">
//           {loading ? (
//             <div className="text-center p-4">Loading...</div>
//           ) : (
//             <div className="table-responsive mt-3">{/* 👈 Added margin-top here */}
//               <table className="table table-hover table-striped table-bordered mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th>#</th>
//                     <th>GROUP NAME</th>
//                     <th>DESCRIPTION</th>
//                     <th style={{ width: "150px" }}>ACTION</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentData.length === 0 ? (
//                     <tr>
//                       <td colSpan="4" className="text-center p-4">
//                         No groups found
//                       </td>
//                     </tr>
//                   ) : (
//                     currentData.map((group, i) => (
//                       <tr key={group.id}>
//                         <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
//                         <td>{group.name}</td>
//                         <td>
//                           <div
//                             dangerouslySetInnerHTML={{
//                               __html: group.description || "No description",
//                             }}
//                           />
//                         </td>
//                         <td>
//                           <div className="d-flex justify-content-end">
//                             <button
//                               className="btn btn-sm"
//                               style={{
//                                 backgroundColor: "deepskyblue",
//                                 color: "white",
//                               }}
//                               onClick={() => {
//                                 setEditingGroup(group);
//                                 setFormData({
//                                   name: group.name,
//                                   description: group.description,
//                                   store_id: group.store_id,
//                                 });
//                                 setShowModal(true);
//                               }}
//                             >
//                               Edit
//                             </button>
//                             <button
//                               className="btn btn-sm btn-danger"
//                               onClick={() => handleDelete(group.id)}
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//       {/* Pagination - Always visible */}
//       <nav className="mt-3">
//         <ul className="pagination justify-content-center">
//           <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//             <button
//               className="page-link"
//               onClick={() => setCurrentPage(currentPage - 1)}
//             >
//               Previous
//             </button>
//           </li>
//           {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((num) => (
//             <li
//               key={num}
//               className={`page-item ${currentPage === num ? "active" : ""}`}
//             >
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage(num)}
//               >
//                 {num}
//               </button>
//             </li>
//           ))}
//           <li
//             className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
//           >
//             <button
//               className="page-link"
//               onClick={() => setCurrentPage(currentPage + 1)}
//             >
//               Next
//             </button>
//           </li>
//         </ul>
//       </nav>

//       {/* Add/Edit Modal */}
//       {showModal && (
//         <div
//           className="modal fade show d-block"
//           tabIndex="-1"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog modal-lg">
//             <div className="modal-content">
//               <form onSubmit={handleSubmit}>
//                 <div className="modal-header">
//                   <h5 className="modal-title">
//                     {editingGroup ? "Edit Group" : "Add New Group"}
//                   </h5>
//                   <button
//                     type="button"
//                     className="btn-close"
//                     onClick={() => {
//                       setShowModal(false);
//                       setEditingGroup(null);
//                       setFormData({
//                         name: "",
//                         description: "",
//                         store_id: localStorage.getItem("store_id") || "1",
//                       });
//                     }}
//                   ></button>
//                 </div>
//                 <div className="modal-body">
//                   <div className="mb-3">
//                     <label className="form-label">Group Name *</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={formData.name}
//                       onChange={(e) =>
//                         setFormData({ ...formData, name: e.target.value })
//                       }
//                       required
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Description</label>
//                     <ReactQuill
//                       theme="snow"
//                       value={formData.description}
//                       onChange={(value) =>
//                         setFormData({ ...formData, description: value })
//                       }
//                       placeholder="Write detailed description..."
//                       style={{ height: "150px", marginBottom: "40px" }}
//                       modules={{
//                         toolbar: [
//                           [{ header: [1, 2, 3, false] }],
//                           ["bold", "italic", "underline", "strike"],
//                           [{ list: "ordered" }, { list: "bullet" }],
//                         ],
//                       }}
//                     />
//                   </div>
//                 </div>
//                 <div className="modal-footer">
//                   <button
//                     type="button"
//                     className="btn btn-secondary"
//                     onClick={() => setShowModal(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button type="submit" className="btn btn-primary">
//                     {editingGroup ? "Update Group" : "Add Group"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AllergyGroupPage;
