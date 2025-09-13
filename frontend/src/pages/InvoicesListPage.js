
import React, { useState, useEffect, useMemo } from 'react';
import { getInvoices } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';
import TableSkeleton from '../components/TableSkeleton';

const InvoicesListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.token) fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data } = await getInvoices(user.token);
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    if (filterStatus === 'All') return invoices;
    return invoices.filter(invoice => invoice.status === filterStatus);
  }, [invoices, filterStatus]);

  const StatusPill = ({ status }) => {
    const statusStyles = {
      Paid: 'bg-green-500/20 text-green-500',
      Unpaid: 'bg-yellow-500/20 text-yellow-500',
      Overdue: 'bg-red-500/20 text-red-500',
    };
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status] || 'bg-gray-500/20 text-gray-500'}`}>{status}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Invoices</h1>
        <div className="flex space-x-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
          {['All', 'Paid', 'Unpaid'].map(status => (
            <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-1 rounded-md text-sm font-semibold ${filterStatus === status ? 'bg-white dark:bg-gray-900 shadow' : 'hover:bg-gray-300/50 dark:hover:bg-gray-600/50'}`}>
              {status}
            </button>
          ))}
        </div>
      </header>

      <motion.div className="glass-card p-6">
        <div className="overflow-x-auto">
          {isLoading ? <TableSkeleton /> : (
            <table className="w-full">
              <thead><tr className="border-b border-white/20"><th className="p-3 text-left">ID</th><th className="p-3 text-left">Invoice No.</th><th className="p-3 text-left">Customer</th><th className="p-3 text-right">Amount</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Actions</th></tr></thead>
              <tbody>
                <AnimatePresence>
                  {filteredInvoices.length > 0 ? filteredInvoices.map((invoice, index) => (
                    <motion.tr key={invoice.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{delay: index * 0.05}} className={`border-b border-white/20 ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-500/5'}`}>
                      <td className="p-3 font-bold">{invoice.id}</td>
                      <td className="p-3 font-mono text-sm">{invoice.invoiceNumber}</td>
                      <td className="p-3 font-semibold">{invoice.Customer?.name || 'N/A'}</td>
                      <td className="p-3 text-right font-medium">₹{parseFloat(invoice.grandTotal).toFixed(2)}</td>
                      <td className="p-3 text-center"><StatusPill status={invoice.status} /></td>
                      <td className="p-3 text-center">
                        <Link to={`/invoices/${invoice.id}`}><motion.button whileTap={{scale: 0.8}}><Eye size={18} className="text-blue-500"/></motion.button></Link>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr><td colSpan="6" className="text-center p-8 text-gray-500">No invoices found for this filter.</td></tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvoicesListPage;