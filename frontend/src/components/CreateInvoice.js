import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, createInvoice } from '../services/api';

const CreateInvoice = () => {
  // State for customer details
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  // State for the list of available products from the backend
  const [products, setProducts] = useState([]);
  // State for the items added to the current invoice
  const [invoiceItems, setInvoiceItems] = useState([]);
  // State for the currently selected product and its quantity
  const [currentItem, setCurrentItem] = useState({ productId: '', quantity: 1 });
  // State for discount
  const [discount, setDiscount] = useState(0);

  // Fetch products from the backend when the component mounts
  useEffect(() => {
    getProducts()
      .then(response => setProducts(response.data))
      .catch(error => console.error("Failed to fetch products", error));
  }, []);

  // Handler for adding an item to the invoice
  const handleAddItem = () => {
    const product = products.find(p => p.id === parseInt(currentItem.productId));
    if (product && currentItem.quantity > 0) {
      // Avoid adding duplicate products, instead, you could update quantity
      if (invoiceItems.some(item => item.id === product.id)) {
        alert("Product already added.");
        return;
      }
      setInvoiceItems([...invoiceItems, { ...product, quantity: currentItem.quantity }]);
      // Reset the selection
      setCurrentItem({ productId: '', quantity: 1 });
    }
  };
  
  // Handler for removing an item from the invoice
  const handleRemoveItem = (productId) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== productId));
  };

  // Auto-calculate totals whenever invoiceItems or discount changes
  const totals = useMemo(() => {
    const subtotal = invoiceItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = invoiceItems.reduce((acc, item) => acc + (item.price * item.quantity * (item.tax / 100)), 0);
    const grandTotal = subtotal + tax - discount;
    return { subtotal, tax, grandTotal };
  }, [invoiceItems, discount]);

  // Handler for submitting the final invoice
  const handleSubmitInvoice = async () => {
    if (!customer.name || !customer.email || !customer.phone) {
        alert("Please fill in all customer details.");
        return;
    }
    if (invoiceItems.length === 0) {
        alert("Please add at least one product to the invoice.");
        return;
    }

    const invoiceData = {
        customer,
        items: invoiceItems.map(({ id, quantity }) => ({ id, quantity })),
        discount,
    };

    try {
        const response = await createInvoice(invoiceData);
        alert(`Invoice created successfully! ID: ${response.data.invoiceId}`);
        // Reset form
        setCustomer({ name: '', email: '', phone: '' });
        setInvoiceItems([]);
        setDiscount(0);
    } catch (error) {
        alert("Failed to create invoice. Please check the console.");
        console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Invoice</h1>

      {/* Customer Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Customer Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="p-2 border rounded" required />
          <input type="email" placeholder="Email (Compulsory)" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="p-2 border rounded" required />
          <input type="tel" placeholder="Phone (Compulsory)" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="p-2 border rounded" required />
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Products</h2>
        <div className="flex items-center gap-4">
          <select value={currentItem.productId} onChange={e => setCurrentItem({...currentItem, productId: e.target.value})} className="flex-grow p-2 border rounded">
            <option value="">Select a Product</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name} - ${product.price}</option>
            ))}
          </select>
          <input type="number" min="1" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: parseInt(e.target.value)})} className="w-24 p-2 border rounded" />
          <button onClick={handleAddItem} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">➕ Add Item</button>
        </div>
      </div>
      
      {/* Invoice Items Table */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Invoice Items</h2>
          <table className="w-full text-left">
              <thead>
                  <tr className="border-b">
                      <th className="p-2">Product</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Tax (%)</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {invoiceItems.map(item => (
                      <tr key={item.id} className="border-b">
                          <td className="p-2">{item.name}</td>
                          <td className="p-2">{item.quantity}</td>
                          <td className="p-2">${item.price}</td>
                          <td className="p-2">{item.tax}%</td>
                          <td className="p-2">${(item.price * item.quantity * (1 + item.tax / 100)).toFixed(2)}</td>
                          <td className="p-2">
                              <button onClick={() => handleRemoveItem(item.id)} className="text-red-500">Remove</button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-6">
          <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between mb-2"><span>Subtotal:</span> <span>${totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between mb-2"><span>Tax:</span> <span>${totals.tax.toFixed(2)}</span></div>
              <div className="flex justify-between items-center mb-2">
                  <span>Discount:</span>
                  <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-24 p-1 border rounded text-right" />
              </div>
              <hr className="my-2"/>
              <div className="flex justify-between font-bold text-lg"><span>Grand Total:</span> <span>${totals.grandTotal.toFixed(2)}</span></div>
          </div>
      </div>

      {/* Actions */}
      <div className="text-center">
        <button onClick={handleSubmitInvoice} className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700">
          ✅ Generate Invoice
        </button>
      </div>
    </div>
  );
};

export default CreateInvoice;