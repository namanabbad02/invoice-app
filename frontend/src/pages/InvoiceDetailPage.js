
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvoiceById, downloadInvoicePDF, resendInvoiceEmail, uploadInvoiceToDrive, sendWhatsAppMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, Download, Mail, UploadCloud, MessageSquare } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import InvoiceDetailSkeleton from '../components/InvoiceDetailSkeleton'; // Import the new skeleton loader
import { comma } from 'postcss/lib/list';

const InvoiceDetailPage = () => {
  // === HOOKS & STATE MANAGEMENT ===
  const { id } = useParams();
  const { user } = useAuth();
  
  // The single source of truth for all invoice data
  const [invoice, setInvoice] = useState(null);

  // State for UI feedback
  const [isLoading, setIsLoading] = useState(true);
  // A single state to manage which action button is currently loading
  const [actionLoading, setActionLoading] = useState(null); // e.g., 'download', 'upload'
  

  // === DATA FETCHING ===
  useEffect(() => {
    // Only run the effect if we have a user and an ID
    if (user?.token && id) {
      const fetchInvoice = async () => {
        setIsLoading(true);
        try {
          const { data } = await getInvoiceById(id, user.token);
          setInvoice(data);
        } catch (error) {
          console.error("Failed to fetch invoice", error);
          toast.error("Failed to fetch invoice details.");
          setInvoice(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [id, user]);

  // === HANDLER FUNCTIONS ===

  // A generic wrapper to handle loading states for all action buttons
  const handleAction = async (actionType, actionFn) => {
    setActionLoading(actionType);
    try {
      await actionFn();
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleDownload = () => handleAction('download', async () => {
    try {
      const response = await downloadInvoicePDF(id, user.token);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Failed to download PDF.");
    }
  });

  const handleResend = () => handleAction('resend', async () => {
  try {
    // Check for email existence before sending
    if (!invoice.Customer.email) {
      toast.warn("This customer does not have an email address on file.");
      return;
    }
    const { data } = await resendInvoiceEmail(id, user.token);
    toast.success(data.message); // Use a success toast
  } catch (error) {
    console.error("Resend failed", error);
    toast.error("Failed to resend email."); // Use an error toast
  }
});

  const handleUpload = () => handleAction('upload', async () => {
    try {
      const { data } = await uploadInvoiceToDrive(id, user.token);
      setInvoice(prev => ({ ...prev, pdfUrl: data.pdfUrl }));
      toast.success(data.message);
    } catch (error) {
      toast.error("Failed to upload file.");
      console.error(error);
    }
  });

  const handleSendWhatsApp = () => handleAction('whatsapp', async () => {
    if (!invoice?.pdfUrl) {
      toast.warn("Please upload the invoice to Drive first.");
      return;
    }
    try {
      const { data } = await sendWhatsAppMessage(id, null, user.token);
      toast.success(data.message);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to send message.";
      toast.error(`Error: ${errorMessage}`);
    }
  });

  // === RENDER LOGIC ===

  // Use the new skeleton loader while fetching initial data
  if (isLoading) {
    return <InvoiceDetailSkeleton />;
  }

  // A cleaner "Not Found" message
  if (!invoice) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Invoice Not Found</h2>
        <Link to="/invoices" className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
          <ArrowLeft size={18} /> Back to Invoices
        </Link>
      </div>
    );
  }

  // Reusable Action Button Component for the toolbar
  const ActionButton = ({ onClick, type, icon, text, color }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={!!actionLoading}
      className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg text-white ${color} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {actionLoading === type ? <ClipLoader size={20} color="#ffffff" /> : icon}
      {text}
    </motion.button>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Link to="/invoices" className="flex items-center gap-2 text-blue-500 hover:underline font-semibold">
          <ArrowLeft size={18} /> Back to Invoices List
        </Link>
        <div className="flex flex-wrap justify-end gap-3">
          <ActionButton onClick={handleDownload} type="download" icon={<Download size={16} />} text="Download" color="bg-blue-500" />
          <ActionButton onClick={handleResend} type="resend" icon={<Mail size={16} />} text="Resend Email" color="bg-green-500" />
          <ActionButton onClick={handleUpload} type="upload" icon={<UploadCloud size={16} />} text="Upload to Drive" color="bg-yellow-500" />
          <ActionButton onClick={handleSendWhatsApp} type="whatsapp" icon={<MessageSquare size={16} />} text="WhatsApp" color="bg-teal-500" />
        </div>
      </header>

      <motion.div className="glass-card p-8 sm:p-12">
        {invoice.pdfUrl && (
          <div className="mb-8 p-4 bg-gray-500/10 rounded-lg">
            <p className="font-semibold text-gray-800 dark:text-gray-100">Shared Drive Link:</p>
            <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 break-all underline">
              {invoice.pdfUrl}
            </a>
          </div>
        )}

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Invoice</h1>
            <p className="text-gray-500 dark:text-gray-400 font-mono">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold">Embellish Jewels</h2>
            <p className="text-gray-600 dark:text-gray-300">Jaipur, Rajasthan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 border-t border-b border-gray-200/50 dark:border-gray-700/50 py-6">
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Bill To:</h3>
            <p className="font-bold text-lg">{invoice.Customer.name}</p>
            <p className="text-gray-600 dark:text-gray-400">{invoice.Customer.email}</p>
            <p className="text-gray-600 dark:text-gray-400">{invoice.Customer.phone}</p>
          </div>
          <div className="text-left sm:text-right">
            <p><span className="font-semibold">Invoice ID:</span> {invoice.id}</p>
            <p><span className="font-semibold">Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p><span className="font-semibold">Status:</span> {invoice.status}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50"><th className="p-3 text-left">Product</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Total</th></tr>
            </thead>
            <tbody>
              {invoice.InvoiceItems.map((item) => (
                <tr key={item.Product.id} className="border-b border-gray-200/50 dark:border-gray-700/50">
                  <td className="p-3 font-semibold">{item.Product.name}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">₹{parseFloat(item.price).toFixed(2)}</td>
                  <td className="p-3 text-right font-medium">₹{(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full sm:w-1/2 md:w-1/3 space-y-3 text-lg">
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Subtotal:</span><span className="font-medium">₹{parseFloat(invoice.subtotal).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Tax:</span><span className="font-medium">₹{parseFloat(invoice.tax).toFixed(2)}</span></div>
            {invoice.discount > 0 && <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Discount:</span><span className="font-medium">- ₹{parseFloat(invoice.discount).toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-2xl pt-3 border-t-2 border-gray-300 dark:border-gray-600"><span className="text-gray-800 dark:text-gray-100">Grand Total:</span><span className="text-gray-800 dark:text-gray-100">₹{parseFloat(invoice.grandTotal).toFixed(2)}</span></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvoiceDetailPage;