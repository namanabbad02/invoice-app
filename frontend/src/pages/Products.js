// // // import React, { useState, useEffect } from 'react';
// // // import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/api';
// // // import { useAuth } from '../context/AuthContext';

// // // const Products = () => {
// // //   const [products, setProducts] = useState([]);
// // //   const [isEditing, setIsEditing] = useState(false);
// // //   const [currentProduct, setCurrentProduct] = useState({ id: null, name: '', price: '', tax: '' });
// // //   const { user } = useAuth();

// // //   useEffect(() => {
// // //     fetchProducts();
// // //   }, []);

// // //   const fetchProducts = async () => {
// // //     const { data } = await getProducts();
// // //     setProducts(data);
// // //   };

// // //   const handleInputChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setCurrentProduct({ ...currentProduct, [name]: value });
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     if (!user?.token) {
// // //         alert("You must be logged in to perform this action.");
// // //         return;
// // //     }

// // //     if (isEditing) {
// // //       await updateProduct(currentProduct.id, currentProduct, user.token);
// // //     } else {
// // //       await addProduct(currentProduct, user.token);
// // //     }
// // //     resetForm();
// // //     fetchProducts();
// // //   };

// // //   const handleEdit = (product) => {
// // //     setIsEditing(true);
// // //     setCurrentProduct(product);
// // //   };

// // //   const handleDelete = async (id) => {
// // //     if (window.confirm("Are you sure you want to delete this product?")) {
// // //       await deleteProduct(id, user.token);
// // //       fetchProducts();
// // //     }
// // //   };

// // //   const resetForm = () => {
// // //     setIsEditing(false);
// // //     setCurrentProduct({ id: null, name: '', price: '', tax: '' });
// // //   };

// // //   return (
// // //     <div className="container mx-auto p-8">
// // //       <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

// // //       {/* Add/Edit Form */}
// // //       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
// // //         <h2 className="text-2xl font-semibold mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
// // //         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
// // //           <input type="text" name="name" value={currentProduct.name} onChange={handleInputChange} placeholder="Product Name" className="p-2 border rounded" required />
// // //           <input type="number" name="price" value={currentProduct.price} onChange={handleInputChange} placeholder="Price (₹)" className="p-2 border rounded" required />
// // //           <input type="number" name="tax" value={currentProduct.tax} onChange={handleInputChange} placeholder="Tax (%)" className="p-2 border rounded" required />
// // //           <div className="flex gap-2">
// // //             <button type="submit" className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{isEditing ? 'Update' : 'Add'}</button>
// // //             {isEditing && <button type="button" onClick={resetForm} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>}
// // //           </div>
// // //         </form>
// // //       </div>

// // //       {/* Products Table */}
// // //       <div className="bg-white p-6 rounded-lg shadow-md">
// // //         <table className="w-full text-left">
// // //           <thead>
// // //             <tr className="border-b">
// // //               <th className="p-2">Name</th>
// // //               <th className="p-2">Price</th>
// // //               <th className="p-2">Tax</th>
// // //               <th className="p-2">Actions</th>
// // //             </tr>
// // //           </thead>
// // //           <tbody>
// // //             {products.map(p => (
// // //               <tr key={p.id} className="border-b hover:bg-gray-50">
// // //                 <td className="p-2">{p.name}</td>
// // //                 <td className="p-2">₹{p.price}</td>
// // //                 <td className="p-2">{p.tax}%</td>
// // //                 <td className="p-2">
// // //                   <button onClick={() => handleEdit(p)} className="text-yellow-500 mr-4">Edit</button>
// // //                   <button onClick={() => handleDelete(p.id)} className="text-red-500">Delete</button>
// // //                 </td>
// // //               </tr>
// // //             ))}
// // //           </tbody>
// // //         </table>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default Products;

// // import React, { useState, useEffect } from 'react';
// // import { getProducts, addProduct, updateProduct, deleteProduct, getCategories } from '../services/api';
// // import { useAuth } from '../context/AuthContext';

// // const Products = () => {
// //   const [products, setProducts] = useState([]);
// //   const [categories, setCategories] = useState([]); // State for the category dropdown
// //   const [isEditing, setIsEditing] = useState(false);
// //   // --- MODIFIED: Add new fields to the state ---
// //   const [currentProduct, setCurrentProduct] = useState({ id: null, name: '', price: '', tax: '', productId: '', category: '' });
// //   const { user } = useAuth();

// //   // Fetch both products and categories on component load
// //   useEffect(() => {
// //     refreshData();
// //   }, []);

// //   const refreshData = async () => {
// //     try {
// //       const productsRes = await getProducts();
// //       setProducts(productsRes.data);
// //       const categoriesRes = await getCategories();
// //       setCategories(categoriesRes.data);
// //     } catch (error) {
// //       console.error("Failed to fetch data", error);
// //     }
// //   };

// //   const handleInputChange = (e) => {
// //     const { name, value } = e.target;
// //     setCurrentProduct({ ...currentProduct, [name]: value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     if (!user?.token) {
// //         alert("You must be logged in to perform this action.");
// //         return;
// //     }

// //     try {
// //       if (isEditing) {
// //         await updateProduct(currentProduct.id, currentProduct, user.token);
// //       } else {
// //         await addProduct(currentProduct, user.token);
// //       }
// //       resetForm();
// //       refreshData(); // Refresh both products and categories
// //     } catch (error) {
// //       // Display specific error message from the backend if available
// //       const errorMessage = error.response?.data?.error || "An unexpected error occurred.";
// //       alert(errorMessage);
// //     }
// //   };

// //   const handleEdit = (product) => {
// //     setIsEditing(true);
// //     setCurrentProduct(product);
// //   };

// //   const handleDelete = async (id) => {
// //     if (window.confirm("Are you sure you want to delete this product?")) {
// //       await deleteProduct(id, user.token);
// //       refreshData();
// //     }
// //   };

// //   const resetForm = () => {
// //     setIsEditing(false);
// //     setCurrentProduct({ id: null, name: '', price: '', tax: '', productId: '', category: '' });
// //   };

// //   return (
// //     <div className="container mx-auto p-8">
// //       <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

// //       {/* Add/Edit Form */}
// //       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
// //         <h2 className="text-2xl font-semibold mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
// //         {/* --- MODIFIED: Updated grid and added new fields --- */}
// //         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
// //           <input type="text" name="productId" value={currentProduct.productId} onChange={handleInputChange} placeholder="Product ID" className="p-2 border rounded" required />
// //           <input type="text" name="name" value={currentProduct.name} onChange={handleInputChange} placeholder="Product Name" className="p-2 border rounded" required />
// //           <div>
// //             <input name="category" value={currentProduct.category} onChange={handleInputChange} list="categories" placeholder="Category" className="w-full p-2 border rounded" required />
// //             <datalist id="categories">
// //               {categories.map(cat => (
// //                 <option key={cat} value={cat} />
// //               ))}
// //             </datalist>
// //           </div>
// //           <input type="number" step="0.01" name="price" value={currentProduct.price} onChange={handleInputChange} placeholder="Price (₹)" className="p-2 border rounded" required />
// //           <input type="number" step="0.01" name="tax" value={currentProduct.tax} onChange={handleInputChange} placeholder="Tax (%)" className="p-2 border rounded" required />
// //           <div className="flex gap-2">
// //             <button type="submit" className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{isEditing ? 'Update' : 'Add'}</button>
// //             {isEditing && <button type="button" onClick={resetForm} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>}
// //           </div>
// //         </form>
// //       </div>

// //       {/* Products Table */}
// //       <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
// //         <table className="w-full text-left">
// //           <thead>
// //             <tr className="border-b bg-gray-50">
// //               {/* --- MODIFIED: Added new table headers --- */}
// //               <th className="p-2">Product ID</th>
// //               <th className="p-2">Name</th>
// //               <th className="p-2">Category</th>
// //               <th className="p-2">Price</th>
// //               <th className="p-2">Tax</th>
// //               <th className="p-2">Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {products.map(p => (
// //               <tr key={p.id} className="border-b hover:bg-gray-50">
// //                 {/* --- MODIFIED: Added new table cells --- */}
// //                 <td className="p-2 font-mono text-sm">{p.productId}</td>
// //                 <td className="p-2">{p.name}</td>
// //                 <td className="p-2">{p.category}</td>
// //                 <td className="p-2">₹{parseFloat(p.price).toFixed(2)}</td>
// //                 <td className="p-2">{p.tax}%</td>
// //                 <td className="p-2 whitespace-nowrap">
// //                   <button onClick={() => handleEdit(p)} className="text-yellow-600 hover:text-yellow-800 mr-4 font-semibold">Edit</button>
// //                   <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Products;

// // import React, { useState, useEffect } from 'react';
// // import {
// //   getProducts,
// //   addProduct,
// //   updateProduct,
// //   deleteProduct,
// //   getCategories
// // } from '../services/api';
// // import { useAuth } from '../context/AuthContext';

// // const Products = () => {
// //   const [products, setProducts] = useState([]);
// //   const [categories, setCategories] = useState([]);
// //   const [isEditing, setIsEditing] = useState(false);
// //   const initialFormState = {
// //     id: null,
// //     name: '',
// //     price: '',
// //     tax: '',
// //     productId: '',
// //     category: ''
// //   };
// //   const [currentProduct, setCurrentProduct] = useState(initialFormState);
// //   const { user } = useAuth();

// //   useEffect(() => {
// //     if (user) {
// //       refreshData();
// //     }
// //   }, [user]);

// //   const refreshData = async () => {
// //     try {
// //       const productsRes = await getProducts();
// //       setProducts(productsRes.data);
// //       const categoriesRes = await getCategories();
// //       setCategories(categoriesRes.data);
// //     } catch (error) {
// //       console.error("Failed to fetch data", error);
// //     }
// //   };

// //   const handleInputChange = (e) => {
// //     const { name, value } = e.target;
// //     setCurrentProduct({ ...currentProduct, [name]: value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     if (!user?.token) {
// //       alert("You must be logged in to perform this action.");
// //       return;
// //     }
// //     const price = parseFloat(currentProduct.price);
// // const tax = parseFloat(currentProduct.tax);

// // // Add a validation check to ensure the conversion was successful
// // if (isNaN(price) || isNaN(tax)) {
// //     alert("Price and Tax must be valid numbers.");
// //     return;
// // }

// // const productData = {
// //   ...currentProduct,
// //   price: price,
// //   tax: tax
// // };

// //     // const productData = currentProduct;

// //     try {
// //       if (isEditing) {
// //         await updateProduct(productData.id, productData, user.token);
// //       } else {
// //         await addProduct(productData, user.token);
// //       }
// //       resetForm();
// //       refreshData();
// //     } catch (error) {
// //       const errorMessage = error.response?.data?.error || "An unexpected error occurred. Please check console for details.";
// //       alert(errorMessage);
// //       console.error(error.response || error);
// //     }
// //   };

// //   const handleEdit = (product) => {
// //     setIsEditing(true);
// //     setCurrentProduct(product);
// //   };

// //   const handleDelete = async (id) => {
// //     if (!user?.token) {
// //       alert("You must be logged in to perform this action.");
// //       return;
// //     }

// //     if (window.confirm("Are you sure you want to delete this product?")) {
// //       await deleteProduct(id, user.token);
// //       refreshData();
// //     }
// //   };

// //   const resetForm = () => {
// //     setIsEditing(false);
// //     setCurrentProduct(initialFormState);
// //   };

// //   if (!user) {
// //     return <div className="text-center p-8">Please log in to manage products.</div>;
// //   }

// //   return (
// //     <div className="container mx-auto p-8">
// //       <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

// //       {/* Add/Edit Form */}
// //       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
// //         <h2 className="text-2xl font-semibold mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
// //         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
// //           <input
// //             type="text"
// //             name="productId"
// //             value={currentProduct.productId}
// //             onChange={handleInputChange}
// //             placeholder="Product ID"
// //             className="p-2 border rounded"
// //             required
// //           />
// //           <input
// //             type="text"
// //             name="name"
// //             value={currentProduct.name}
// //             onChange={handleInputChange}
// //             placeholder="Product Name"
// //             className="p-2 border rounded"
// //             required
// //           />
// //           <div>
// //             <input
// //               name="category"
// //               value={currentProduct.category}
// //               onChange={handleInputChange}
// //               list="categories"
// //               placeholder="Category"
// //               className="w-full p-2 border rounded"
// //               required
// //             />
// //             <datalist id="categories">
// //               {categories.map(cat => (
// //                 <option key={cat} value={cat} />
// //               ))}
// //             </datalist>
// //           </div>
// //           <input
// //             type="number"
// //             step="0.01"
// //             name="price"
// //             value={currentProduct.price}
// //             onChange={handleInputChange}
// //             placeholder="Price (₹)"
// //             className="p-2 border rounded"
// //             required
// //           />
// //           <input
// //             type="number"
// //             step="0.01"
// //             name="tax"
// //             value={currentProduct.tax}
// //             onChange={handleInputChange}
// //             placeholder="Tax (%)"
// //             className="p-2 border rounded"
// //             required
// //           />
// //           <div className="flex gap-2">
// //             <button
// //               type="submit"
// //               className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
// //             >
// //               {isEditing ? 'Update' : 'Add'}
// //             </button>
// //             {isEditing && (
// //               <button
// //                 type="button"
// //                 onClick={resetForm}
// //                 className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
// //               >
// //                 Cancel
// //               </button>
// //             )}
// //           </div>
// //         </form>
// //       </div>

// //       {/* Products Table */}
// //       <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
// //         <table className="w-full text-left">
// //           <thead>
// //             <tr className="border-b bg-gray-50">
// //               <th className="p-2">Product ID</th>
// //               <th className="p-2">Name</th>
// //               <th className="p-2">Category</th>
// //               <th className="p-2">Price</th>
// //               <th className="p-2">Tax</th>
// //               <th className="p-2">Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {products.map(p => (
// //               <tr key={p.id} className="border-b hover:bg-gray-50">
// //                 <td className="p-2 font-mono text-sm">{p.productId}</td>
// //                 <td className="p-2">{p.name}</td>
// //                 <td className="p-2">{p.category}</td>
// //                 <td className="p-2">₹{parseFloat(p.price).toFixed(2)}</td>
// //                 <td className="p-2">{p.tax}%</td>
// //                 <td className="p-2 whitespace-nowrap">
// //                   <button
// //                     onClick={() => handleEdit(p)}
// //                     className="text-yellow-600 hover:text-yellow-800 mr-4 font-semibold"
// //                   >
// //                     Edit
// //                   </button>
// //                   <button
// //                     onClick={() => handleDelete(p.id)}
// //                     className="text-red-600 hover:text-red-800 font-semibold"
// //                   >
// //                     Delete
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Products;

// import React, { useState, useEffect } from 'react';
// import { getProducts, addProduct, updateProduct, deleteProduct, getCategories } from '../services/api';
// import { useAuth } from '../context/AuthContext';

// const Products = () => {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
  
//   const initialFormState = { id: null, name: '', price: '', tax: '', productId: '', category: '' };
//   const [currentProduct, setCurrentProduct] = useState(initialFormState);
  
//   const { user } = useAuth();

//   useEffect(() => {
//     if (user) {
//         refreshData();
//     }
//   }, [user]);

//   const refreshData = async () => {
//     try {
//       const productsRes = await getProducts();
//       setProducts(productsRes.data);
//       const categoriesRes = await getCategories();
//       setCategories(categoriesRes.data);
//     } catch (error) {
//       console.error("Failed to fetch data", error);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentProduct(prevState => ({ ...prevState, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!user?.token) {
//         alert("You must be logged in to perform this action.");
//         return;
//     }
    
//     // --- FINAL FIX: Read values directly from the form fields ---
//     const form = e.target;
//     const productData = {
//   productId: currentProduct.productId,
//   name: currentProduct.name,
//   category: currentProduct.category,
//   price: parseFloat(currentProduct.price),
//   tax: parseFloat(currentProduct.tax),
// };
//     // --- END FINAL FIX ---

//     if (!productData.productId || !productData.category) {
//         alert("Validation failed: Product ID or Category is empty before sending.");
//         return;
//     }

//     try {
//       if (isEditing) {
//         await updateProduct(currentProduct.id, productData, user.token);
//       } else {
//         await addProduct(productData, user.token);
//       }
//       resetForm();
//       refreshData();
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || "An unexpected error occurred.";
//       alert(`API Error: ${errorMessage}`);
//       console.error("API Error Details:", error.response || error);
//     }
//   };

//   const handleEdit = (product) => {
//     setIsEditing(true);
//     setCurrentProduct(product);
//   };

//   const handleDelete = async (id) => {
//     if (!user?.token) {
//         alert("You must be logged in to perform this action.");
//         return;
//     }
//     if (window.confirm("Are you sure you want to delete this product?")) {
//       await deleteProduct(id, user.token);
//       refreshData();
//     }
//   };

//   const resetForm = () => {
//     setIsEditing(false);
//     setCurrentProduct(initialFormState);
//   };

//   if (!user) {
//     return <div className="text-center p-8">Please log in to manage products.</div>
//   }

//   return (
//     <div className="container mx-auto p-8">
//       <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

//       <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//         <h2 className="text-2xl font-semibold mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
//           <input type="text" name="productId" value={currentProduct.productId} onChange={handleInputChange} placeholder="Product ID" className="p-2 border rounded" required />
//           <input type="text" name="name" value={currentProduct.name} onChange={handleInputChange} placeholder="Product Name" className="p-2 border rounded" required />
//           <div>
//             <input name="category" value={currentProduct.category} onChange={handleInputChange} list="categories" placeholder="Category" className="w-full p-2 border rounded" required />
//             <datalist id="categories">
//               {categories.map(cat => (
//                 <option key={cat} value={cat} />
//               ))}
//             </datalist>
//           </div>
//           <input type="number" step="0.01" name="price" value={currentProduct.price} onChange={handleInputChange} placeholder="Price (₹)" className="p-2 border rounded" required />
//           <input type="number" step="0.01" name="tax" value={currentProduct.tax} onChange={handleInputChange} placeholder="Tax (%)" className="p-2 border rounded" required />
//           <div className="flex gap-2">
//             <button type="submit" className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{isEditing ? 'Update' : 'Add'}</button>
//             {isEditing && <button type="button" onClick={resetForm} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>}
//           </div>
//         </form>
//       </div>
//       {/* The rest of the component remains the same */}
//       <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="border-b bg-gray-50">
//               <th className="p-2">Product ID</th>
//               <th className="p-2">Name</th>
//               <th className="p-2">Category</th>
//               <th className="p-2">Price</th>
//               <th className="p-2">Tax</th>
//               <th className="p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.map(p => (
//               <tr key={p.id} className="border-b hover:bg-gray-50">
//                 <td className="p-2 font-mono text-sm">{p.productId}</td>
//                 <td className="p-2">{p.name}</td>
//                 <td className="p-2">{p.category}</td>
//                 <td className="p-2">₹{parseFloat(p.price).toFixed(2)}</td>
//                 <td className="p-2">{p.tax}%</td>
//                 <td className="p-2 whitespace-nowrap">
//                   <button onClick={() => handleEdit(p)} className="text-yellow-600 hover:text-yellow-800 mr-4 font-semibold">Edit</button>
//                   <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Products;

import React, { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, getCategories } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Plus, Save, Trash2, Edit2, XCircle } from 'lucide-react';
import FloatingLabelInput from '../components/FloatingLabelInput';
import TableSkeleton from '../components/TableSkeleton';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initialFormState = { id: null, name: '', price: '', tax: '', productId: '', category: '' };
  const [currentProduct, setCurrentProduct] = useState(initialFormState);
  const { user } = useAuth();

  useEffect(() => {
    if (user) refreshData();
  }, [user]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const productsRes = await getProducts();
      setProducts(productsRes.data);
      const categoriesRes = await getCategories();
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error("Failed to fetch product data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) return toast.error("Authentication error.");

    const productData = { ...currentProduct, price: parseFloat(currentProduct.price), tax: parseFloat(currentProduct.tax) };
    
    try {
      if (isEditing) {
        await updateProduct(currentProduct.id, productData, user.token);
        toast.success(`Product "${productData.name}" updated successfully!`);
      } else {
        await addProduct(productData, user.token);
        toast.success(`Product "${productData.name}" added successfully!`);
      }
      resetForm();
      refreshData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "An unexpected error occurred.";
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteProduct(id, user.token);
      toast.success(`Product "${name}" deleted.`);
      refreshData();
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentProduct(initialFormState);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Manage Products</h1>
      </header>
      
      <motion.div className="glass-card p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <FloatingLabelInput id="productId" label="Product ID *" name="productId" value={currentProduct.productId} onChange={handleInputChange} required />
          <FloatingLabelInput id="name" label="Product Name *" name="name" value={currentProduct.name} onChange={handleInputChange} required />
          <div>
            <input name="category" value={currentProduct.category} onChange={handleInputChange} list="categories" placeholder="Category" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50" required />
            <datalist id="categories">{categories.map(cat => <option key={cat} value={cat} />)}</datalist>
          </div>
          <FloatingLabelInput id="price" label="Price (₹) *" name="price" value={currentProduct.price} onChange={handleInputChange} type="number" step="0.01" required />
          <FloatingLabelInput id="tax" label="Tax (%) *" name="tax" value={currentProduct.tax} onChange={handleInputChange} type="number" step="0.01" required />
          <div className="flex gap-4 md:col-span-2 lg:col-span-1">
            <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
              {isEditing ? <><Save size={18}/> Update</> : <><Plus size={18}/> Add Product</>}
            </motion.button>
            {isEditing && (
              <motion.button type="button" onClick={resetForm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 bg-gray-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                <XCircle size={18}/> Cancel
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>

      <motion.div className="glass-card p-6">
        <h2 className="text-2xl font-semibold mb-4">Product List</h2>
        <div className="overflow-x-auto">
          {isLoading ? <TableSkeleton rows={5} columns={6}/> : (
            <table className="w-full">
              <thead><tr className="border-b border-white/20"><th className="p-3 text-left">Product ID</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Category</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Tax</th><th className="p-3 text-center">Actions</th></tr></thead>
              <tbody>
                <AnimatePresence>
                  {products.map(p => (
                    <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-white/20 hover:bg-gray-500/10">
                      <td className="p-3 font-mono text-sm">{p.productId}</td>
                      <td className="p-3 font-semibold">{p.name}</td>
                      <td className="p-3">{p.category}</td>
                      <td className="p-3 text-right">₹{parseFloat(p.price).toFixed(2)}</td>
                      <td className="p-3 text-right">{p.tax}%</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-4">
                          <motion.button whileTap={{scale:0.8}} onClick={() => handleEdit(p)}><Edit2 size={18} className="text-yellow-500"/></motion.button>
                          <motion.button whileTap={{scale:0.8}} onClick={() => handleDelete(p.id, p.name)}><Trash2 size={18} className="text-red-500"/></motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Products;