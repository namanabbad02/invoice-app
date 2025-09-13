import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createInvoice } from '../services/api';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Percent, IndianRupee } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import CountUp from 'react-countup';
import FloatingLabelInput from '../components/FloatingLabelInput';

const InvoicePage = () => {
  // === HOOKS & STATE MANAGEMENT ===
  const navigate = useNavigate();

  // Form State
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [products, setProducts] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);

  // Product Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({ productId: '', quantity: '1' });
  const [activeIndex, setActiveIndex] = useState(-1);

  // Financial State
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percent'

  // UI State
  const [isLoading, setIsLoading] = useState(false);

  // Refs for managing focus and clicks
  const searchContainerRef = useRef(null);
  const dropdownRef = useRef(null);

  // === DATA FETCHING ===
  useEffect(() => {
    getProducts()
      .then(response => setProducts(response.data))
      .catch(error => {
        console.error("Failed to fetch products", error);
        toast.error("Could not fetch products. Please ensure the backend is running.");
      });
  }, []);

  // === DERIVED STATE & CALCULATIONS ===
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercasedSearchTerm) ||
      product.productId.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [searchTerm, products]);

  // const totals = useMemo(() => {
  //   const subtotal = invoiceItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
  //   const tax = invoiceItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity * (parseFloat(item.tax) / 100)), 0);
  //   let discountAmount = parseFloat(discount) || 0;
  //   if (discountType === 'percent') {
  //     discountAmount = (subtotal * discountAmount) / 100;
  //   }
  //   const grandTotal = subtotal + tax - discountAmount;
  //   return { subtotal, tax, discountAmount, grandTotal };
  // }, [invoiceItems, discount, discountType]);
  const totals = useMemo(() => {
    const subtotal = invoiceItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
    const tax = invoiceItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity * (parseFloat(item.tax) / 100)), 0);

    let discountAmount = parseFloat(discount) || 0;
    if (discountType === 'percent') {
      discountAmount = (subtotal * discountAmount) / 100;
    }

    // ✅ Cap discount so it never exceeds subtotal + tax
    const maxDiscount = subtotal + tax;
    if (discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }

    const grandTotal = subtotal + tax - discountAmount;
    return { subtotal, tax, discountAmount, grandTotal };
  }, [invoiceItems, discount, discountType]);

  const discountRef = useRef(null);

  const handleDiscountChange = (e) => {
    let value = parseFloat(e.target.value) || 0;
    const maxDiscount = totals.subtotal + totals.tax;

    if (value > maxDiscount) {
      // Shake effect
      if (discountRef.current) {
        discountRef.current.classList.add("shake");
        setTimeout(() => discountRef.current.classList.remove("shake"), 400);
      }

      toast.error("Discount can't exceed Subtotal + Tax");
      value = 0; // auto-correct to max
    }

    setDiscount(value);
  };

  // Effect for scrolling the active item in the dropdown into view
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const activeItem = dropdownRef.current.children[activeIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  // === HANDLER FUNCTIONS ===
  const handleAddItem = () => {
    const quantity = parseInt(currentItem.quantity, 10);
    if (!currentItem.productId || isNaN(quantity) || quantity <= 0) {
      toast.warn("Please select a valid product and quantity.");
      return;
    }
    const product = products.find(p => p.id === parseInt(currentItem.productId));
    if (product) {
      if (invoiceItems.some(item => item.id === product.id)) {
        toast.info("Product is already in the invoice.");
        return;
      }
      setInvoiceItems(prevItems => [...prevItems, { ...product, quantity }]);
      setSearchTerm('');
      setCurrentItem({ productId: '', quantity: '1' });
      setActiveIndex(-1);
    }
  };

  const handleRemoveItem = (idToRemove) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== idToRemove));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
    setActiveIndex(-1);
  };

  const handleProductSelect = (product) => {
    setSearchTerm(product.name);
    setCurrentItem({ ...currentItem, productId: product.id });
    setIsDropdownOpen(false);
    setActiveIndex(-1);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[1-9][0-9]*$/.test(value)) {
      setCurrentItem({ ...currentItem, quantity: value });
    }
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || filteredProducts.length === 0) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredProducts.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredProducts.length) % filteredProducts.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) handleProductSelect(filteredProducts[activeIndex]);
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setActiveIndex(-1);
        break;
      default: break;
    }
  };

  const handleSubmitInvoice = async () => {
    if (!customer.name || !customer.phone) {
      toast.error("Customer Name and Phone Number are required.");
      return;
    }
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(customer.phone)) {
      toast.error("Phone number must be in international format (e.g., +91...).");
      return;
    }
    if (invoiceItems.length === 0) {
      toast.error("Please add at least one product.");
      return;
    }

    setIsLoading(true);
    const invoiceData = {
      customer,
      items: invoiceItems.map(({ id, quantity }) => ({ id, quantity })),
      discount: totals.discountAmount,
    };

    try {
      const response = await createInvoice(invoiceData);
      if (response.status === 201) {
        toast.success('Invoice generated & uploaded successfully!');
      } else if (response.status === 202) {
        toast.warn('Invoice generated, but upload to Drive failed.');
      }
      navigate(`/invoices/${response.data.invoiceId}`);
    } catch (error) {
      const errorMessage = error.response?.data?.details || error.response?.data?.error || "An unknown error occurred.";
      toast.error(`Invoice generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Create New Invoice</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <motion.div className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-6">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingLabelInput id="customerName" label="Customer Name *" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} type="text" />
              <FloatingLabelInput id="customerEmail" label="Email (Optional)" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} type="email" />
              <div className="md:col-span-2 relative z-50">
                <PhoneInput
                  country={'in'}
                  value={customer.phone}
                  onChange={phone => setCustomer({ ...customer, phone: `+${phone}` })}
                  inputClass="!w-full !pl-14 !pr-4 !py-3 !text-base !border !border-gray-300 !dark:border-gray-600 !rounded-lg !bg-white/50 !dark:bg-gray-700/50 !text-gray-800 !dark:text-gray-200"
                  buttonClass="!border !border-gray-300 !dark:border-gray-600 !rounded-l-lg !bg-white/50 !dark:bg-gray-700/50"
                  dropdownClass="!rounded-lg !glass-card !z-50"
                />
              </div>
            </div>
          </motion.div>

          <motion.div className="glass-card p-6 relative z-20">

            <h2 className="text-2xl font-semibold mb-4">Add Products</h2>
            <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
              <div ref={searchContainerRef} className="relative flex-grow w-full">
                <input type="text" value={searchTerm} onChange={handleSearchChange} onKeyDown={handleKeyDown} onFocus={() => setIsDropdownOpen(true)} onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} placeholder="Type to search..." className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-gray-700/50" />
                {isDropdownOpen && filteredProducts.length > 0 && (
                  // <ul ref={dropdownRef} className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto shadow-lg glass-card">
                  <ul
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-xl rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30"
                  >
                    <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-xl z-[-1]" />
                    <AnimatePresence>
                      {filteredProducts.map((product, index) => (
                        <motion.li
                          key={product.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleProductSelect(product)}
                          className={`p-3 cursor-pointer border-b last:border-none border-white/10 dark:border-gray-700/50 ${index === activeIndex ? 'bg-blue-500/30' : 'hover:bg-gray-500/10'
                            }`}
                        >
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {product.productId} | Price: ₹{product.price}
                          </p>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>
              <input type="number" value={currentItem.quantity} onChange={handleQuantityChange} placeholder="Qty" className="w-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <motion.button onClick={handleAddItem} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold w-full sm:w-auto flex items-center justify-center gap-2"><Plus size={18} /> Add Item</motion.button>
            </div>
          </motion.div>

          <motion.div className="glass-card p-6 relative z-10">

            <h2 className="text-2xl font-semibold mb-4">Invoice Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-white/20"><th className="p-3 text-left">Product</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Total</th><th className="p-3 text-center">Actions</th></tr></thead>
                <tbody>
                  <AnimatePresence>
                    {invoiceItems.length > 0 ? invoiceItems.map(item => (
                      <motion.tr key={item.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-500/10">
                        <td className="p-3 font-semibold">{item.name}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">₹{parseFloat(item.price).toFixed(2)}</td>
                        <td className="p-3 text-right font-medium">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                        <td className="p-3 text-center"><motion.button whileTap={{ scale: 0.8 }} onClick={() => handleRemoveItem(item.id)}><Trash2 size={18} className="text-red-500 hover:text-red-400" /></motion.button></td>
                      </motion.tr>
                    )) : (
                      <tr><td colSpan="5" className="text-center p-8 text-gray-500 dark:text-gray-400">No items added yet.</td></tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        <div className="relative">
          <div className="sticky top-24 space-y-6">
            <motion.div className="glass-card p-6">
              <h2 className="text-2xl font-semibold mb-4">Summary</h2>
              <div className="space-y-3 text-lg">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-medium"><CountUp prefix="₹" end={totals.subtotal} decimals={2} duration={0.5} /></span></div>
                <div className="flex justify-between"><span>Tax</span><span className="font-medium"><CountUp prefix="₹" end={totals.tax} decimals={2} duration={0.5} /></span></div>
                <div className="flex justify-between items-center">
                  <span>Discount</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    {/* <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-20 p-1 text-right bg-transparent focus:outline-none" /> */}
                    <input
                      ref={discountRef}
                      type="number"
                      value={discount}
                      onChange={handleDiscountChange}
                      onWheel={e => e.target.blur()}
                      className="w-20 p-1 text-right bg-transparent focus:outline-none
             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <button onClick={() => setDiscountType('fixed')} className={`p-1.5 transition-colors ${discountType === 'fixed' ? 'bg-blue-500 text-white' : 'hover:bg-gray-500/10'}`}><IndianRupee size={16} /></button>
                    <button onClick={() => setDiscountType('percent')} className={`p-1.5 transition-colors ${discountType === 'percent' ? 'bg-blue-500 text-white' : 'hover:bg-gray-500/10'}`}><Percent size={16} /></button>
                  </div>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300"><span></span><span className="text-sm font-medium">- ₹{totals.discountAmount.toFixed(2)}</span></div>
                <hr className="border-white/20 my-2" />
                <div className="flex justify-between font-bold text-2xl"><span>Grand Total</span><span><CountUp prefix="₹" end={totals.grandTotal} decimals={2} duration={0.5} /></span></div>
              </div>
              <motion.button onClick={handleSubmitInvoice} disabled={isLoading} whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px -5px rgba(0,0,0,0.2)" }} whileTap={{ scale: 0.95 }} className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg flex items-center justify-center text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? <><ClipLoader color="#ffffff" size={24} /><span className="ml-3">Processing...</span></> : "Generate Invoice"}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InvoicePage;


// // import React, { useState, useEffect, useMemo } from 'react';
// // import { getProducts, createInvoice } from '../services/api';

// // const InvoicePage = () => {
// //   // State for customer details
// //   const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
// //   // State for the list of available products from the backend
// //   const [products, setProducts] = useState([]);
// //   // State for the items added to the current invoice
// //   const [invoiceItems, setInvoiceItems] = useState([]);
// //   // State for the currently selected product and its quantity
// //   const [currentItem, setCurrentItem] = useState({ productId: '', quantity: 1 });
// //   // State for discount
// //   const [discount, setDiscount] = useState(0);
// //   // Loading state for submission
// //   const [isLoading, setIsLoading] = useState(false);

// //   // Fetch products from the backend when the component mounts
// //   useEffect(() => {
// //     const fetchProducts = async () => {
// //       try {
// //         const response = await getProducts();
// //         setProducts(response.data);
// //       } catch (error) {
// //         console.error("Failed to fetch products", error);
// //         alert("Could not fetch products. Make sure the backend server is running.");
// //       }
// //     };
// //     fetchProducts();
// //   }, []);

// //   // Handler for adding an item to the invoice
// //   const handleAddItem = () => {
// //     const product = products.find(p => p.id === parseInt(currentItem.productId));
// //     if (product && currentItem.quantity > 0) {
// //       // Avoid adding duplicate products
// //       if (invoiceItems.some(item => item.id === product.id)) {
// //         alert("Product already added.");
// //         return;
// //       }
// //       setInvoiceItems([...invoiceItems, { ...product, quantity: currentItem.quantity }]);
// //       // Reset the selection
// //       setCurrentItem({ productId: '', quantity: 1 });
// //     }
// //   };

// //   // Handler for removing an item from the invoice
// //   const handleRemoveItem = (productId) => {
// //     setInvoiceItems(invoiceItems.filter(item => item.id !== productId));
// //   };

// //   // Auto-calculate totals whenever invoiceItems or discount changes
// //   const totals = useMemo(() => {
// //     const subtotal = invoiceItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
// //     const tax = invoiceItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity * (parseFloat(item.tax) / 100)), 0);
// //     const grandTotal = subtotal + tax - discount;
// //     return { subtotal, tax, grandTotal };
// //   }, [invoiceItems, discount]);

// //   // Handler for submitting the final invoice
// //   const handleSubmitInvoice = async () => {
// //     if (!customer.name || !customer.email || !customer.phone) {
// //       alert("Please fill in all customer details.");
// //       return;
// //     }
// //     if (invoiceItems.length === 0) {
// //       alert("Please add at least one product to the invoice.");
// //       return;
// //     }

// //     setIsLoading(true); // Disable button

// //     const invoiceData = {
// //       customer,
// //       items: invoiceItems.map(({ id, quantity }) => ({ id, quantity })),
// //       discount,
// //     };

// //     try {
// //       const response = await createInvoice(invoiceData);
// //       alert(`Invoice created successfully! ID: ${response.data.invoiceId}`);
// //       // Reset form
// //       setCustomer({ name: '', email: '', phone: '' });
// //       setInvoiceItems([]);
// //       setDiscount(0);
// //     } catch (error) {
// //       alert("Failed to create invoice. Please check the console.");
// //       console.error(error);
// //     } finally {
// //       setIsLoading(false); // Re-enable button
// //     }
// //   };

// //   return (
// //     <div className="container mx-auto p-8 bg-gray-50">
// //       <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Invoice</h1>

// //       {/* Customer Section */}
// //       <div className="bg-white p-6 rounded-lg shadow-md mb-6">
// //         <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //           <input
// //             type="text"
// //             placeholder="Customer Name"
// //             value={customer.name}
// //             onChange={e => setCustomer({ ...customer, name: e.target.value })}
// //             className="p-2 border rounded"
// //             required
// //           />
// //           <input
// //             type="email"
// //             placeholder="Email (Compulsory)"
// //             value={customer.email}
// //             onChange={e => setCustomer({ ...customer, email: e.target.value })}
// //             className="p-2 border rounded"
// //             required
// //           />
// //           <input
// //             type="tel"
// //             placeholder="Phone (Compulsory)"
// //             value={customer.phone}
// //             onChange={e => setCustomer({ ...customer, phone: e.target.value })}
// //             className="p-2 border rounded"
// //             required
// //           />
// //         </div>
// //       </div>

// //       {/* Products Section */}
// //       <div className="bg-white p-6 rounded-lg shadow-md mb-6">
// //         <h2 className="text-xl font-semibold mb-4">Add Products</h2>
// //         <div className="flex items-center gap-4">
// //           <select
// //             value={currentItem.productId}
// //             onChange={e => setCurrentItem({ ...currentItem, productId: e.target.value })}
// //             className="flex-grow p-2 border rounded"
// //           >
// //             <option value="">Select a Product</option>
// //             {products.map(product => (
// //               <option key={product.id} value={product.id}>
// //                 {product.name} - ₹{product.price}
// //               </option>
// //             ))}
// //           </select>
// //           <input
// //             type="number"
// //             min="1"
// //             value={currentItem.quantity}
// //             onChange={e => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
// //             className="w-24 p-2 border rounded"
// //           />
// //           <button
// //             onClick={handleAddItem}
// //             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold"
// //           >
// //             ➕ Add Item
// //           </button>
// //         </div>
// //       </div>

// //       {/* Invoice Items Table */}
// //       <div className="bg-white p-6 rounded-lg shadow-md mb-6">
// //         <h2 className="text-xl font-semibold mb-4">Invoice Items</h2>
// //         <div className="overflow-x-auto">
// //           <table className="w-full text-left">
// //             <thead>
// //               <tr className="border-b bg-gray-50">
// //                 <th className="p-2">Product</th>
// //                 <th className="p-2">Qty</th>
// //                 <th className="p-2">Price</th>
// //                 <th className="p-2">Tax (%)</th>
// //                 <th className="p-2">Total</th>
// //                 <th className="p-2">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {invoiceItems.length > 0 ? (
// //                 invoiceItems.map(item => (
// //                   <tr key={item.id} className="border-b">
// //                     <td className="p-2">{item.name}</td>
// //                     <td className="p-2">{item.quantity}</td>
// //                     <td className="p-2">₹{parseFloat(item.price).toFixed(2)}</td>
// //                     <td className="p-2">{item.tax}%</td>
// //                     <td className="p-2">
// //                       ₹
// //                       {(parseFloat(item.price) * item.quantity * (1 + parseFloat(item.tax) / 100)).toFixed(2)}
// //                     </td>
// //                     <td className="p-2">
// //                       <button
// //                         onClick={() => handleRemoveItem(item.id)}
// //                         className="text-red-500 hover:text-red-700"
// //                       >
// //                         Remove
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 ))
// //               ) : (
// //                 <tr>
// //                   <td colSpan="6" className="text-center p-4 text-gray-500">
// //                     No items added yet.
// //                   </td>
// //                 </tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>

// //       {/* Totals Section */}
// //       <div className="flex justify-end mb-6">
// //         <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md">
// //           <div className="flex justify-between mb-2">
// //             <span>Subtotal:</span> <span>₹{totals.subtotal.toFixed(2)}</span>
// //           </div>
// //           <div className="flex justify-between mb-2">
// //             <span>Tax:</span> <span>₹{totals.tax.toFixed(2)}</span>
// //           </div>
// //           <div className="flex justify-between items-center mb-2">
// //             <span>Discount:</span>
// //             <input
// //               type="number"
// //               value={discount}
// //               onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
// //               className="w-24 p-1 border rounded text-right"
// //             />
// //           </div>
// //           <hr className="my-2" />
// //           <div className="flex justify-between font-bold text-lg">
// //             <span>Grand Total:</span> <span>₹{totals.grandTotal.toFixed(2)}</span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Actions */}
// //       <div className="text-center">
// //         <button
// //           onClick={handleSubmitInvoice}
// //           disabled={isLoading}
// //           className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
// //         >
// //           {isLoading ? 'Generating...' : '✅ Generate Invoice'}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default InvoicePage;

// // // Import necessary hooks and functions from React and your API service.
// // import React, { useState, useEffect, useMemo, useRef } from 'react';
// // import { getProducts, createInvoice } from '../services/api';
// // import { useNavigate } from 'react-router-dom';

// // // Define the main component for the invoice creation page.
// // const InvoicePage = () => {
// //   const navigate = useNavigate(); // Hook to redirect user after success
// //   // === STATE MANAGEMENT ===

// //   // State for the customer's details (name, email, phone).
// //   const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });

// //   // State to hold the complete list of products fetched from the database.
// //   const [products, setProducts] = useState([]);

// //   // State for the line items that have been added to the current invoice.
// //   const [invoiceItems, setInvoiceItems] = useState([]);

// //   // State to manage the text typed into the product search input.
// //   const [searchTerm, setSearchTerm] = useState('');

// //   // State to control the visibility of the product search results dropdown.
// //   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

// //   // State for the product currently being added (selected product ID and quantity).
// //   // Quantity is stored as a string to allow the input field to be empty.
// //   const [currentItem, setCurrentItem] = useState({ productId: '', quantity: '1' });

// //   // State for the discount amount applied to the invoice.
// //   const [discount, setDiscount] = useState(0);

// //   // State to manage the loading status when the final invoice is being submitted.
// //   const [isLoading, setIsLoading] = useState(false);

// //   // A ref to the product search container to detect clicks outside of it.
// //   const searchContainerRef = useRef(null);

// //   const [activeIndex, setActiveIndex] = useState(-1);

// //   // --- NEW: Refs for managing focus and scrolling ---

// //   const dropdownRef = useRef(null);

// //   // === DATA FETCHING ===

// //   // useEffect hook to fetch the list of all products from the API when the component first loads.
// //   useEffect(() => {
// //     getProducts()
// //       .then(response => {
// //         // On success, store the fetched products in the state.
// //         setProducts(response.data);
// //       })
// //       .catch(error => {
// //         // On failure, log an error to the console.
// //         console.error("Failed to fetch products", error);
// //         alert("Could not fetch products. Please ensure the backend server is running.");
// //       });
// //   }, []); // The empty dependency array [] means this effect runs only once.

// //   useEffect(() => {
// //     if (activeIndex >= 0 && dropdownRef.current) {
// //       const activeItem = dropdownRef.current.children[activeIndex];
// //       if (activeItem) {
// //         // This ensures the highlighted item is always visible in the dropdown.
// //         activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
// //       }
// //     }
// //   }, [activeIndex]);

// //   // === DERIVED STATE & CALCULATIONS ===

// //   // useMemo hook to efficiently filter products based on the search term.
// //   // This calculation only re-runs when 'searchTerm' or 'products' change.
// //   const filteredProducts = useMemo(() => {
// //     if (!searchTerm) return []; // If the search term is empty, return no results.
// //     const lowercasedSearchTerm = searchTerm.toLowerCase();
// //     // Return products where the name or product ID includes the search term.
// //     return products.filter(product =>
// //       product.name.toLowerCase().includes(lowercasedSearchTerm) ||
// //       product.productId.toLowerCase().includes(lowercasedSearchTerm)
// //     );
// //   }, [searchTerm, products]);

// //   // useMemo hook to automatically recalculate invoice totals.
// //   // This only re-runs when 'invoiceItems' or 'discount' change.
// //   const totals = useMemo(() => {
// //     const subtotal = invoiceItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
// //     const tax = invoiceItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity * (parseFloat(item.tax) / 100)), 0);
// //     const grandTotal = subtotal + tax - (parseFloat(discount) || 0);
// //     return { subtotal, tax, grandTotal };
// //   }, [invoiceItems, discount]);

// //   // === HANDLER FUNCTIONS ===

// //   // Function to add the currently selected product to the invoice items table.
// //   const handleAddItem = () => {
// //     const quantity = parseInt(currentItem.quantity, 10); // Convert quantity string to a number.

// //     // Validate that a product is selected and quantity is a valid number greater than 0.
// //     if (!currentItem.productId || isNaN(quantity) || quantity <= 0) {
// //       alert("Please select a valid product and enter a quantity greater than 0.");
// //       return;
// //     }

// //     // Find the full product object from the main products list.
// //     const product = products.find(p => p.id === parseInt(currentItem.productId));
// //     if (product) {
// //       // Check if the product has already been added to the invoice.
// //       if (invoiceItems.some(item => item.id === product.id)) {
// //         alert("Product already added.");
// //         return;
// //       }
// //       // Add the new item to the invoiceItems array.
// //       setInvoiceItems([...invoiceItems, { ...product, quantity: quantity }]);

// //       // Reset the search term and current item selection.
// //       setSearchTerm('');
// //       setCurrentItem({ productId: '', quantity: '1' });
// //     }
// //   };

// //   // Function to remove an item from the invoice items table.
// //   const handleRemoveItem = (productIdToRemove) => {
// //     setInvoiceItems(invoiceItems.filter(item => item.id !== productIdToRemove));
// //   };

// //   // Function to update the search term as the user types.
// //   const handleSearchChange = (e) => {
// //     setSearchTerm(e.target.value);
// //     setIsDropdownOpen(true); // Show the dropdown when the user starts typing.
// //   };

// //   // Function to handle when a user selects a product from the dropdown.
// //   const handleProductSelect = (product) => {
// //     setSearchTerm(product.name); // Put the product's name in the input for user feedback.
// //     setCurrentItem({ ...currentItem, productId: product.id }); // Store the actual product ID in the state.
// //     setIsDropdownOpen(false); // Hide the dropdown after selection.
// //   };

// //   // Function to handle changes in the quantity input field.
// //   const handleQuantityChange = (e) => {
// //     const value = e.target.value;
// //     // This allows the field to be empty (for backspacing) or contain only positive integers.
// //     if (value === '' || /^[1-9][0-9]*$/.test(value)) {
// //       setCurrentItem({ ...currentItem, quantity: value });
// //     }
// //   };
// //   const handleKeyDown = (e) => {
// //     if (!isDropdownOpen || filteredProducts.length === 0) return;

// //     switch (e.key) {
// //       case 'ArrowDown':
// //         e.preventDefault(); // Prevent cursor from moving in the input
// //         // Move highlight down, looping to the top if at the end
// //         setActiveIndex(prevIndex => (prevIndex + 1) % filteredProducts.length);
// //         break;
// //       case 'ArrowUp':
// //         e.preventDefault(); // Prevent cursor from moving
// //         // Move highlight up, looping to the bottom if at the start
// //         setActiveIndex(prevIndex => (prevIndex - 1 + filteredProducts.length) % filteredProducts.length);
// //         break;
// //       case 'Enter':
// //         e.preventDefault(); // Prevent default form submission
// //         if (activeIndex >= 0) {
// //           // Select the highlighted item
// //           handleProductSelect(filteredProducts[activeIndex]);
// //         }
// //         break;
// //       case 'Escape':
// //         // Close the dropdown
// //         setIsDropdownOpen(false);
// //         setActiveIndex(-1);
// //         break;
// //       default:
// //         break;
// //     }
// //   };

// //   // // Function to submit the final invoice to the backend.
// //   // const handleSubmitInvoice = async () => {
// //   //   if (!customer.name || !customer.email || !customer.phone) {
// //   //     alert("Please fill in all customer details.");
// //   //     return;
// //   //   }
// //   //   if (invoiceItems.length === 0) {
// //   //     alert("Please add at least one product to the invoice.");
// //   //     return;
// //   //   }

// //   //   setIsLoading(true); // Disable the button to prevent multiple submissions.

// //   //   const invoiceData = {
// //   //       customer,
// //   //       items: invoiceItems.map(({ id, quantity }) => ({ id, quantity })),
// //   //       discount: parseFloat(discount) || 0,
// //   //   };

// //   //   try {
// //   //       const response = await createInvoice(invoiceData);
// //   //       alert(response.data.message || `Invoice created successfully! ID: ${response.data.invoiceId}`);
// //   //       // Reset the form to its initial state after successful submission.
// //   //       setCustomer({ name: '', email: '', phone: '' });
// //   //       setInvoiceItems([]);
// //   //       setDiscount(0);
// //   //       setSearchTerm('');
// //   //       setCurrentItem({ productId: '', quantity: '1' });
// //   //   } catch (error) {
// //   //       alert("Failed to create invoice. Please check the console for details.");
// //   //       console.error(error);
// //   //   } finally {
// //   //       setIsLoading(false); // Re-enable the button.
// //   //   }
// //   // };
// //   // --- FINAL: Updated Submission Handler ---
// //   const handleSubmitInvoice = async () => {
// //     // Email is now optional, only name and phone are required.
// //     if (!customer.name || !customer.phone) {
// //       alert("Please fill in Customer Name and Phone Number.");
// //       return;
// //     }
// //     if (invoiceItems.length === 0) {
// //       alert("Please add at least one product to the invoice.");
// //       return;
// //     }

// //     setIsLoading(true);

// //     const invoiceData = {
// //       customer,
// //       items: invoiceItems.map(({ id, quantity }) => ({ id, quantity })),
// //       discount: parseFloat(discount) || 0,
// //     };

// //     try {
// //       const response = await createInvoice(invoiceData);
// //       alert(response.data.message || `Invoice created successfully! ID: ${response.data.invoiceId}`);
// //       // On success, redirect to the new invoice's detail page
// //       navigate(`/invoices/${response.data.invoiceId}`);
// //     } catch (error) {
// //       // --- THIS IS THE KEY FIX ---
// //       // Check for the specific validation error from the backend.
// //       if (error.response && error.response.data && error.response.data.error) {
// //         alert(`Error: ${error.response.data.details || error.response.data.error}`);
// //       } else {
// //         // Generic fallback error message.
// //         alert("Failed to create invoice. Please check the console for details.");
// //       }
// //       console.error(error.response || error);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // === JSX RENDER ===

// //   return (
// //     <div className="container mx-auto p-8 bg-gray-50">
// //       <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Invoice</h1>

// //       {/* Customer Details Section */}
// //       {/* <div className="bg-white p-6 rounded-lg shadow-md mb-6">
// //         <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //           <input type="text" placeholder="Customer Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="p-2 border rounded" required />
// //           <input type="email" placeholder="Email (Compulsory)" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="p-2 border rounded" required />
// //           <input type="tel" placeholder="Phone (+919876543210) *" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="p-2 border rounded" required />
// //           </div>
// //       </div> */}
// //       <div className="bg-white p-6 rounded-lg shadow-md mb-6">
// //         <h2 className="text-xl font-semibold mb-2">Customer Details</h2>
// //         <p className="text-sm text-gray-500 mb-4">
// //           Phone number is mandatory and must be in international format (e.g., +91...).
// //         </p>
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //           <input
// //             type="text"
// //             placeholder="Customer Name *"
// //             value={customer.name}
// //             onChange={e => setCustomer({ ...customer, name: e.target.value })}
// //             className="p-2 border rounded"
// //             required
// //           />
// //           {/* --- CHANGE: Placeholder updated --- */}
// //           <input
// //             type="email"
// //             placeholder="Email (Optional)"
// //             value={customer.email}
// //             onChange={e => setCustomer({ ...customer, email: e.target.value })}
// //             className="p-2 border rounded"
// //           />
// //           <input
// //             type="tel"
// //             placeholder="Phone (+919876543210) *"
// //             value={customer.phone}
// //             onChange={e => setCustomer({ ...customer, phone: e.target.value })}
// //             className="p-2 border rounded"
// //             required
// //           />
// //         </div>
// //       </div>

// //       <div className="bg-white p-6 rounded-lg shadow-md mb-6">
// //         <h2 className="text-xl font-semibold mb-4">Add Products</h2>
// //         <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
// //           <div ref={searchContainerRef} className="relative flex-grow w-full">
// //             {/* --- ADDED onKeyDown HANDLER --- */}
// //             <input
// //               type="text"
// //               value={searchTerm}
// //               onChange={handleSearchChange}
// //               onKeyDown={handleKeyDown}
// //               onFocus={() => setIsDropdownOpen(true)}
// //               onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
// //               placeholder="Type to search for a product by name or ID..."
// //               className="w-full p-2 border rounded"
// //             />
// //             {isDropdownOpen && filteredProducts.length > 0 && (
// //               // --- ADDED ref to the ul ---
// //               <ul ref={dropdownRef} className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-y-auto shadow-lg">
// //                 {filteredProducts.map((product, index) => (
// //                   // --- ADDED conditional class for highlighting ---
// //                   <li
// //                     key={product.id}
// //                     onClick={() => handleProductSelect(product)}
// //                     className={`p-3 cursor-pointer ${index === activeIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
// //                       }`}
// //                   >
// //                     <p className="font-semibold">{product.name}</p>
// //                     <p className="text-sm text-gray-500">ID: {product.productId} | Price: ₹{product.price}</p>
// //                   </li>
// //                 ))}
// //               </ul>
// //             )}
// //           </div>
// //           <input
// //             type="number"
// //             value={currentItem.quantity}
// //             onChange={handleQuantityChange}
// //             placeholder="Qty"
// //             className="w-24 p-2 border rounded text-center"
// //           />
// //           <button onClick={handleAddItem} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold w-full sm:w-auto">
// //             Add Item
// //           </button>
// //         </div>
// //       </div>

// //       {/* Invoice Items Table */}
// //       <div className="bg-white p-6 rounded-lg shadow-md mb-6">
// //         <h2 className="text-xl font-semibold mb-4">Invoice Items</h2>
// //         <div className="overflow-x-auto">
// //           <table className="w-full text-left">
// //             <thead className="bg-gray-50">
// //               <tr className="border-b">
// //                 <th className="p-2">Product</th>
// //                 <th className="p-2">Qty</th>
// //                 <th className="p-2">Price</th>
// //                 <th className="p-2">Tax (%)</th>
// //                 <th className="p-2">Total</th>
// //                 <th className="p-2">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {invoiceItems.length > 0 ? invoiceItems.map(item => (
// //                 <tr key={item.id} className="border-b">
// //                   <td className="p-2">{item.name} <span className="text-gray-500 text-sm">({item.productId})</span></td>
// //                   <td className="p-2">{item.quantity}</td>
// //                   <td className="p-2">₹{parseFloat(item.price).toFixed(2)}</td>
// //                   <td className="p-2">{item.tax}%</td>
// //                   <td className="p-2">₹{(parseFloat(item.price) * item.quantity * (1 + parseFloat(item.tax) / 100)).toFixed(2)}</td>
// //                   <td className="p-2">
// //                     <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700">Remove</button>
// //                   </td>
// //                 </tr>
// //               )) : (
// //                 <tr>
// //                   <td colSpan="6" className="text-center p-4 text-gray-500">No items added yet.</td>
// //                 </tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>

// //       {/* Totals Section */}
// //       <div className="flex justify-end mb-6">
// //         <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md">
// //           <div className="flex justify-between mb-2"><span>Subtotal:</span> <span>₹{totals.subtotal.toFixed(2)}</span></div>
// //           <div className="flex justify-between mb-2"><span>Tax:</span> <span>₹{totals.tax.toFixed(2)}</span></div>
// //           <div className="flex justify-between items-center mb-2">
// //             <span>Discount:</span>
// //             <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-24 p-1 border rounded text-right" />
// //           </div>
// //           <hr className="my-2" />
// //           <div className="flex justify-between font-bold text-lg"><span>Grand Total:</span> <span>₹{totals.grandTotal.toFixed(2)}</span></div>
// //         </div>
// //       </div>

// //       {/* Actions Section */}
// //       <div className="text-center">
// //         <button onClick={handleSubmitInvoice} disabled={isLoading} className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
// //           {isLoading ? 'Generating...' : 'Generate Invoice'}
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default InvoicePage;

// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getProducts, createInvoice } from '../services/api';
// // --- 1. Import the toast notification library and a spinner ---
// import { toast } from 'react-toastify';
// import { ClipLoader } from 'react-spinners';
// import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';

// const InvoicePage = () => {
//   const navigate = useNavigate();
//   const [isLoading, setIsLoading] = useState(false); // This state now controls the button's appearance and behavior
//   const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
//   const [products, setProducts] = useState([]);
//   const [invoiceItems, setInvoiceItems] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [currentItem, setCurrentItem] = useState({ productId: '', quantity: '1' });
//   const [discount, setDiscount] = useState(0);
//   const searchContainerRef = useRef(null);
//   const [activeIndex, setActiveIndex] = useState(-1);

//   const dropdownRef = useRef(null);


//   // === DATA FETCHING ===
//   useEffect(() => {
//     getProducts()
//       .then(response => {
//         setProducts(response.data);
//       })
//       .catch(error => {
//         console.error("Failed to fetch products", error);
//         alert("Could not fetch products. Please ensure the backend server is running.");
//       });
//   }, []); 

//   useEffect(() => {
//     if (activeIndex >= 0 && dropdownRef.current) {
//       const activeItem = dropdownRef.current.children[activeIndex];
//       if (activeItem) {
//         activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
//       }
//     }
//   }, [activeIndex]);

//   // === DERIVED STATE & CALCULATIONS ===
//   const filteredProducts = useMemo(() => {
//     if (!searchTerm) return []; // If the search term is empty, return no results.
//     const lowercasedSearchTerm = searchTerm.toLowerCase();
//     return products.filter(product =>
//       product.name.toLowerCase().includes(lowercasedSearchTerm) ||
//       product.productId.toLowerCase().includes(lowercasedSearchTerm)
//     );
//   }, [searchTerm, products]);

//   const totals = useMemo(() => {
//     const subtotal = invoiceItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
//     const tax = invoiceItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity * (parseFloat(item.tax) / 100)), 0);
//     const grandTotal = subtotal + tax - (parseFloat(discount) || 0);
//     return { subtotal, tax, grandTotal };
//   }, [invoiceItems, discount]);

//   // === HANDLER FUNCTIONS ===
//   const handleAddItem = () => {
//     const quantity = parseInt(currentItem.quantity, 10); // Convert quantity string to a number.

//     if (!currentItem.productId || isNaN(quantity) || quantity <= 0) {
//       alert("Please select a valid product and enter a quantity greater than 0.");
//       return;
//     }

//     const product = products.find(p => p.id === parseInt(currentItem.productId));
//     if (product) {
//       if (invoiceItems.some(item => item.id === product.id)) {
//         alert("Product already added.");
//         return;
//       }
//       setInvoiceItems([...invoiceItems, { ...product, quantity: quantity }]);

//       setSearchTerm('');
//       setCurrentItem({ productId: '', quantity: '1' });
//     }
//   };

//   const handleRemoveItem = (productIdToRemove) => {
//     setInvoiceItems(invoiceItems.filter(item => item.id !== productIdToRemove));
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//     setIsDropdownOpen(true); // Show the dropdown when the user starts typing.
//   };

//   const handleProductSelect = (product) => {
//     setSearchTerm(product.name); // Put the product's name in the input for user feedback.
//     setCurrentItem({ ...currentItem, productId: product.id }); // Store the actual product ID in the state.
//     setIsDropdownOpen(false); // Hide the dropdown after selection.
//   };

//   const handleQuantityChange = (e) => {
//     const value = e.target.value;
//     // This allows the field to be empty (for backspacing) or contain only positive integers.
//     if (value === '' || /^[1-9][0-9]*$/.test(value)) {
//       setCurrentItem({ ...currentItem, quantity: value });
//     }
//   };
//   const handleKeyDown = (e) => {
//     if (!isDropdownOpen || filteredProducts.length === 0) return;

//     switch (e.key) {
//       case 'ArrowDown':
//         e.preventDefault(); // Prevent cursor from moving in the input
//         // Move highlight down, looping to the top if at the end
//         setActiveIndex(prevIndex => (prevIndex + 1) % filteredProducts.length);
//         break;
//       case 'ArrowUp':
//         e.preventDefault(); // Prevent cursor from moving
//         // Move highlight up, looping to the bottom if at the start
//         setActiveIndex(prevIndex => (prevIndex - 1 + filteredProducts.length) % filteredProducts.length);
//         break;
//       case 'Enter':
//         e.preventDefault(); // Prevent default form submission
//         if (activeIndex >= 0) {
//           // Select the highlighted item
//           handleProductSelect(filteredProducts[activeIndex]);
//         }
//         break;
//       case 'Escape':
//         // Close the dropdown
//         setIsDropdownOpen(false);
//         setActiveIndex(-1);
//         break;
//       default:
//         break;
//     }
//   };

//   // --- 2. The new, robust handleSubmitInvoice function ---
//   const handleSubmitInvoice = async () => {
//     // --- Client-side validation ---
//     if (!customer.name || !customer.phone) {
//       toast.error("Please fill in Customer Name and Phone Number.");
//       return;
//     }
//     const phoneRegex = /^\+[1-9]\d{1,14}$/;
//     if (!phoneRegex.test(customer.phone)) {
//       toast.error("Phone number must be in international format (e.g., +91...).");
//       return;
//     }
//     if (invoiceItems.length === 0) {
//       toast.error("Please add at least one product to the invoice.");
//       return;
//     }

//     setIsLoading(true); // Start loading animation

//     const invoiceData = {
//         customer,
//         items: invoiceItems.map(({ id, quantity }) => ({ id, quantity })),
//         discount: parseFloat(discount) || 0,
//     };

//     try {
//       const response = await createInvoice(invoiceData);

//       if (response.status === 201) { // 201 Created: Everything worked perfectly.
//         toast.success('Invoice generated & uploaded to Drive successfully!');
//       } else if (response.status === 202) { // 202 Accepted: Core task done, but a secondary part failed.
//         toast.warn('Invoice generated, but the upload to Drive failed.');
//         console.warn("Partial failure details:", response.data.error);
//       }

//       navigate(`/invoices/${response.data.invoiceId}`);

//     } catch (error) {
//       // --- Handle Critical Failure ---
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || "An unknown error occurred.";
//       toast.error(`Invoice generation failed: ${errorMessage}`);
//       console.error("Critical invoice generation error:", error.response || error);
//     } finally {
//       setIsLoading(false); // Stop loading animation
//     }
//   };

//   return (
//     <div className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
//       {/* ... (The Customer Details and Add Products sections are the same as the last version) ... */}
//       <div className="lg:col-span-2 space-y-8">
//         <h2 className="text-xl font-semibold mb-2">Customer Details</h2>
//         <p className="text-sm text-gray-500 mb-4">
//           Phone number is mandatory and must be in international format (e.g., +91...).
//         </p>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <input
//             type="text"
//             placeholder="Customer Name *"
//             value={customer.name}
//             onChange={e => setCustomer({ ...customer, name: e.target.value })}
//             className="p-2 border rounded"
//             required
//           />
//           {/* --- CHANGE: Placeholder updated --- */}
//           <input
//             type="email"
//             placeholder="Email (Optional)"
//             value={customer.email}
//             onChange={e => setCustomer({ ...customer, email: e.target.value })}
//             className="p-2 border rounded"
//           />
//           <PhoneInput
//             country={'in'} // Default country
//             value={customer.phone}
//             onChange={phone => setCustomer({ ...customer, phone: `+${phone}` })}
//             inputClass="w-full p-2 border rounded"
//             placeholder="Phone (+919876543210) *"
//           />
//         </div>
//       </div>

//       <div className="relative">
//         <div className="sticky top-8 space-y-6">
//           <h2 className="text-xl font-semibold mb-4">Add Products</h2>
//           <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
//             <div ref={searchContainerRef} className="relative flex-grow w-full">
//               {/* --- ADDED onKeyDown HANDLER --- */}
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//                 onKeyDown={handleKeyDown}
//                 onFocus={() => setIsDropdownOpen(true)}
//                 onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
//                 placeholder="Type to search for a product by name or ID..."
//                 className="w-full p-2 border rounded"
//               />
//               {isDropdownOpen && filteredProducts.length > 0 && (
//                 // --- ADDED ref to the ul ---
//                 <ul ref={dropdownRef} className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-y-auto shadow-lg">
//                   {filteredProducts.map((product, index) => (
//                     // --- ADDED conditional class for highlighting ---
//                     <li
//                       key={product.id}
//                       onClick={() => handleProductSelect(product)}
//                       className={`p-3 cursor-pointer ${index === activeIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
//                         }`}
//                     >
//                       <p className="font-semibold">{product.name}</p>
//                       <p className="text-sm text-gray-500">ID: {product.productId} | Price: ₹{product.price}</p>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//             <input
//               type="number"
//               value={currentItem.quantity}
//               onChange={handleQuantityChange}
//               placeholder="Qty"
//               className="w-24 p-2 border rounded text-center"
//             />
//             <button onClick={handleAddItem} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 font-semibold w-full sm:w-auto">
//               Add Item
//             </button>
//           </div>
//         </div>

//         {/* Invoice Items Table */}
//         <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//           <h2 className="text-xl font-semibold mb-4">Invoice Items</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left">
//               <thead className="bg-gray-50">
//                 <tr className="border-b">
//                   <th className="p-2">Product</th>
//                   <th className="p-2">Qty</th>
//                   <th className="p-2">Price</th>
//                   <th className="p-2">Tax (%)</th>
//                   <th className="p-2">Total</th>
//                   <th className="p-2">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {invoiceItems.length > 0 ? invoiceItems.map(item => (
//                   <tr key={item.id} className="border-b">
//                     <td className="p-2">{item.name} <span className="text-gray-500 text-sm">({item.productId})</span></td>
//                     <td className="p-2">{item.quantity}</td>
//                     <td className="p-2">₹{parseFloat(item.price).toFixed(2)}</td>
//                     <td className="p-2">{item.tax}%</td>
//                     <td className="p-2">₹{(parseFloat(item.price) * item.quantity * (1 + parseFloat(item.tax) / 100)).toFixed(2)}</td>
//                     <td className="p-2">
//                       <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700">Remove</button>
//                     </td>
//                   </tr>
//                 )) : (
//                   <tr>
//                     <td colSpan="6" className="text-center p-4 text-gray-500">No items added yet.</td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Totals Section */}
//         <div className="flex justify-end mb-6">
//           <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md">
//             <div className="flex justify-between mb-2"><span>Subtotal:</span> <span>₹{totals.subtotal.toFixed(2)}</span></div>
//             <div className="flex justify-between mb-2"><span>Tax:</span> <span>₹{totals.tax.toFixed(2)}</span></div>
//             <div className="flex justify-between items-center mb-2">
//               <span>Discount:</span>
//               <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-24 p-1 border rounded text-right" />
//             </div>
//             <hr className="my-2" />
//             <div className="flex justify-between font-bold text-lg"><span>Grand Total:</span> <span>₹{totals.grandTotal.toFixed(2)}</span></div>
//           </div>
//         </div>
//         {/* --- 3. The new dynamic "Generate Invoice" button --- */}
//         <div className="text-center mt-8">
//           <button
//             onClick={handleSubmitInvoice}
//             disabled={isLoading}
//             className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center w-64 mx-auto transition-all duration-300"
//           >
//             {isLoading ? (
//               <>
//                 <ClipLoader color="#ffffff" size={20} />
//                 <span className="ml-3">Processing...</span>
//               </>
//             ) : (
//               '✅ Generate Invoice'
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoicePage;

// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getProducts, createInvoice } from '../services/api';
// import { toast } from 'react-toastify';
// import { ClipLoader } from 'react-spinners';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Plus, Trash2 } from 'lucide-react';
// import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';
// import CountUp from 'react-countup';
// import FloatingLabelInput from '../components/FloatingLabelInput'; // Import the new component

// const InvoicePage = () => {
//   const navigate = useNavigate();
//   // ... (All your existing state variables: customer, products, invoiceItems, etc.)
//   const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
//   const [products, setProducts] = useState([]);
//   const [invoiceItems, setInvoiceItems] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [currentItem, setCurrentItem] = useState({ productId: '', quantity: '1' });
//   const [discount, setDiscount] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(-1);
//   const searchContainerRef = useRef(null);
//   const dropdownRef = useRef(null);

//   // === DATA FETCHING ===
//   useEffect(() => {
//     getProducts()
//       .then(response => {
//         setProducts(response.data);
//       })
//       .catch(error => {
//         console.error("Failed to fetch products", error);
//         alert("Could not fetch products. Please ensure the backend server is running.");
//       });
//   }, []); 

//   useEffect(() => {
//     if (activeIndex >= 0 && dropdownRef.current) {
//       const activeItem = dropdownRef.current.children[activeIndex];
//       if (activeItem) {
//         activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
//       }
//     }
//   }, [activeIndex]);

//   const filteredProducts = useMemo(() => {
//     if (!searchTerm) return []; // If the search term is empty, return no results.
//     const lowercasedSearchTerm = searchTerm.toLowerCase();
//     return products.filter(product =>
//       product.name.toLowerCase().includes(lowercasedSearchTerm) ||
//       product.productId.toLowerCase().includes(lowercasedSearchTerm)
//     );
//   }, [searchTerm, products]);

//   const totals = useMemo(() => {
//     const subtotal = invoiceItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
//     const tax = invoiceItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity * (parseFloat(item.tax) / 100)), 0);
//     const grandTotal = subtotal + tax - (parseFloat(discount) || 0);
//     return { subtotal, tax, grandTotal };
//   }, [invoiceItems, discount]);

//   // === HANDLER FUNCTIONS ===
//   const handleAddItem = () => {
//     const quantity = parseInt(currentItem.quantity, 10); // Convert quantity string to a number.

//     if (!currentItem.productId || isNaN(quantity) || quantity <= 0) {
//       alert("Please select a valid product and enter a quantity greater than 0.");
//       return;
//     }

//     const product = products.find(p => p.id === parseInt(currentItem.productId));
//     if (product) {
//       if (invoiceItems.some(item => item.id === product.id)) {
//         alert("Product already added.");
//         return;
//       }
//       setInvoiceItems([...invoiceItems, { ...product, quantity: quantity }]);

//       setSearchTerm('');
//       setCurrentItem({ productId: '', quantity: '1' });
//     }
//   };

//   const handleRemoveItem = (productIdToRemove) => {
//     setInvoiceItems(invoiceItems.filter(item => item.id !== productIdToRemove));
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//     setIsDropdownOpen(true); // Show the dropdown when the user starts typing.
//   };

//   const handleProductSelect = (product) => {
//     setSearchTerm(product.name); // Put the product's name in the input for user feedback.
//     setCurrentItem({ ...currentItem, productId: product.id }); // Store the actual product ID in the state.
//     setIsDropdownOpen(false); // Hide the dropdown after selection.
//   };

//   const handleQuantityChange = (e) => {
//     const value = e.target.value;
//     // This allows the field to be empty (for backspacing) or contain only positive integers.
//     if (value === '' || /^[1-9][0-9]*$/.test(value)) {
//       setCurrentItem({ ...currentItem, quantity: value });
//     }
//   };
//   const handleKeyDown = (e) => {
//     if (!isDropdownOpen || filteredProducts.length === 0) return;

//     switch (e.key) {
//       case 'ArrowDown':
//         e.preventDefault(); // Prevent cursor from moving in the input
//         // Move highlight down, looping to the top if at the end
//         setActiveIndex(prevIndex => (prevIndex + 1) % filteredProducts.length);
//         break;
//       case 'ArrowUp':
//         e.preventDefault(); // Prevent cursor from moving
//         // Move highlight up, looping to the bottom if at the start
//         setActiveIndex(prevIndex => (prevIndex - 1 + filteredProducts.length) % filteredProducts.length);
//         break;
//       case 'Enter':
//         e.preventDefault(); // Prevent default form submission
//         if (activeIndex >= 0) {
//           // Select the highlighted item
//           handleProductSelect(filteredProducts[activeIndex]);
//         }
//         break;
//       case 'Escape':
//         // Close the dropdown
//         setIsDropdownOpen(false);
//         setActiveIndex(-1);
//         break;
//       default:
//         break;
//     }
//   };

//   // --- 2. The new, robust handleSubmitInvoice function ---
//   const handleSubmitInvoice = async () => {
//     // --- Client-side validation ---
//     if (!customer.name || !customer.phone) {
//       toast.error("Please fill in Customer Name and Phone Number.");
//       return;
//     }
//     const phoneRegex = /^\+[1-9]\d{1,14}$/;
//     if (!phoneRegex.test(customer.phone)) {
//       toast.error("Phone number must be in international format (e.g., +91...).");
//       return;
//     }
//     if (invoiceItems.length === 0) {
//       toast.error("Please add at least one product to the invoice.");
//       return;
//     }

//     setIsLoading(true); // Start loading animation

//     const invoiceData = {
//         customer,
//         items: invoiceItems.map(({ id, quantity }) => ({ id, quantity })),
//         discount: parseFloat(discount) || 0,
//     };

//     try {
//       const response = await createInvoice(invoiceData);

//       if (response.status === 201) { // 201 Created: Everything worked perfectly.
//         toast.success('Invoice generated & uploaded to Drive successfully!');
//       } else if (response.status === 202) { // 202 Accepted: Core task done, but a secondary part failed.
//         toast.warn('Invoice generated, but the upload to Drive failed.');
//         console.warn("Partial failure details:", response.data.error);
//       }

//       navigate(`/invoices/${response.data.invoiceId}`);

//     } catch (error) {
//       // --- Handle Critical Failure ---
//       const errorMessage = error.response?.data?.details || error.response?.data?.error || "An unknown error occurred.";
//       toast.error(`Invoice generation failed: ${errorMessage}`);
//       console.error("Critical invoice generation error:", error.response || error);
//     } finally {
//       setIsLoading(false); // Stop loading animation
//     }
//   };
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="container mx-auto p-4 md:p-8"
//     >
//       <header className="mb-8">
//         <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Create New Invoice</h1>
//       </header>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
//         {/* === MAIN CONTENT COLUMN === */}
//         <div className="lg:col-span-2 space-y-8">

//           {/* --- Customer Details Card --- */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.3 }}
//             className="glass-card p-6"
//           >
//             <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Customer Details</h2>
//             <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
//               Phone number is mandatory for WhatsApp notifications.
//             </p>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <FloatingLabelInput
//                 id="customerName"
//                 label="Customer Name *"
//                 value={customer.name}
//                 onChange={e => setCustomer({ ...customer, name: e.target.value })}
//                 type="text"
//                 required
//               />
//               <FloatingLabelInput
//                 id="customerEmail"
//                 label="Email (Optional)"
//                 value={customer.email}
//                 onChange={e => setCustomer({ ...customer, email: e.target.value })}
//                 type="email"
//               />
//               <div className="md:col-span-2">
//                 <PhoneInput
//                   country={'in'}
//                   value={customer.phone}
//                   onChange={phone => setCustomer({ ...customer, phone: `+${phone}` })}
//                   placeholder="Phone (+919876543210) *"
//                   inputClass="!w-full !px-4 !py-3 !text-base !border !border-gray-300 !dark:border-gray-600 !rounded-lg !bg-white/50 !dark:bg-gray-700/50 !text-gray-800 !dark:text-gray-200"
//                   buttonClass="!border !border-gray-300 !dark:border-gray-600 !rounded-l-lg !bg-white/50 !dark:bg-gray-700/50"
//                   dropdownClass="!rounded-lg !glass-card"
//                 />
//               </div>
//             </div>

//           </motion.div>

//           {/* --- Add Products Card --- */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.3, delay: 0.1 }}
//             className="glass-card p-6"
//           >
//             <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Add Products</h2>
//             <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
//               <div ref={searchContainerRef} className="relative flex-grow w-full">
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={handleSearchChange}
//                   onKeyDown={handleKeyDown}
//                   onFocus={() => setIsDropdownOpen(true)}
//                   onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
//                   placeholder="Type to search for a product by name or ID..."
//                   className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-gray-700/50"
//                 />
//                 {isDropdownOpen && filteredProducts.length > 0 && (
//                   <ul ref={dropdownRef} className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto shadow-lg glass-card">
//                     {filteredProducts.map((product, index) => (
//                       <li
//                         key={product.id}
//                         onClick={() => handleProductSelect(product)}
//                         className={`p-3 cursor-pointer ${index === activeIndex ? 'bg-blue-500/30' : 'hover:bg-gray-500/10'
//                           }`}
//                       >
//                         <p className="font-semibold">{product.name}</p>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">ID: {product.productId} | Price: ₹{product.price}</p>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//               <input
//                 type="number"
//                 value={currentItem.quantity}
//                 onChange={handleQuantityChange}
//                 placeholder="Qty"
//                 className="w-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <motion.button
//                 onClick={handleAddItem}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold w-full sm:w-auto flex items-center justify-center gap-2"
//               >
//                 <Plus size={18} /> Add Item
//               </motion.button>
//             </div>
//           </motion.div>

//           {/* --- Invoice Items Table --- */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.3, delay: 0.2 }}
//             className="glass-card p-6"
//           >
//             <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Invoice Items</h2>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead>
//                   <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
//                     <th className="p-3">Product</th>
//                     <th className="p-3 text-center">Qty</th>
//                     <th className="p-3 text-right">Price</th>
//                     <th className="p-3 text-right">Total</th>
//                     <th className="p-3 text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <AnimatePresence>
//                     {invoiceItems.length > 0 ? invoiceItems.map(item => (
//                       <motion.tr
//                         key={item.id}
//                         layout
//                         initial={{ opacity: 0, y: -10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, x: -20 }}
//                         transition={{ duration: 0.3 }}
//                         className="border-b border-gray-200/50 dark:border-gray-700/50"
//                       >
//                         <td className="p-3 font-semibold">{item.name}</td>
//                         <td className="p-3 text-center">{item.quantity}</td>
//                         <td className="p-3 text-right">₹{parseFloat(item.price).toFixed(2)}</td>
//                         <td className="p-3 text-right font-medium">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
//                         <td className="p-3 text-center">
//                           <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleRemoveItem(item.id)}>
//                             <Trash2 size={18} className="text-red-500 hover:text-red-400" />
//                           </motion.button>
//                         </td>
//                       </motion.tr>
//                     )) : (
//                       <tr>
//                         <td colSpan="5" className="text-center p-8 text-gray-500 dark:text-gray-400">No items added yet.</td>
//                       </tr>
//                     )}
//                   </AnimatePresence>
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>
//         </div>

//         {/* === STICKY SUMMARY COLUMN === */}
//         <div className="relative">
//           <div className="sticky top-24 space-y-6">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.3, delay: 0.3 }}
//               className="glass-card p-6"
//             >
//               <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Summary</h2>
//               <div className="space-y-3 text-lg">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
//                   <span className="font-medium"><CountUp prefix="₹" end={totals.subtotal} decimals={2} duration={0.5} /></span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600 dark:text-gray-300">Tax</span>
//                   <span className="font-medium"><CountUp prefix="₹" end={totals.tax} decimals={2} duration={0.5} /></span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600 dark:text-gray-300">Discount</span>
//                   <input
//                     type="number"
//                     value={discount}
//                     onChange={e => setDiscount(e.target.value)}
//                     className="w-24 p-1 border border-gray-300 dark:border-gray-600 rounded text-right bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <hr className="border-gray-200/50 dark:border-gray-700/50 my-2" />
//                 <div className="flex justify-between font-bold text-2xl text-gray-800 dark:text-gray-100">
//                   <span>Grand Total</span>
//                   <span><CountUp prefix="₹" end={totals.grandTotal} decimals={2} duration={0.5} /></span>
//                 </div>
//               </div>

//               <motion.button
//                 onClick={handleSubmitInvoice}
//                 disabled={isLoading}
//                 whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px -5px rgba(0,0,0,0.2)" }}
//                 whileTap={{ scale: 0.95 }}
//                 className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg flex items-center justify-center text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? (
//                   <>
//                     <ClipLoader color="#ffffff" size={24} />
//                     <span className="ml-3">Processing...</span>
//                   </>
//                 ) : (
//                   'Generate Invoice'
//                 )}
//               </motion.button>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default InvoicePage;