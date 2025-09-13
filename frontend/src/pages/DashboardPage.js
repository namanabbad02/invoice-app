import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardKpis, getTopProducts, getCategorySales, getRecentInvoices } from '../services/api';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingBag, Percent, Eye } from 'lucide-react';
import { Bar, BarChart as ReBarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart as RePieChart, Cell } from 'recharts';
import DashboardSkeleton from '../components/DashboardSkeleton';
import RevenueChart from '../components/RevenueChart';
import KpiCard from '../components/KpiCard';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const [kpis, setKpis] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;
      try {
        const [kpisRes, topProductsRes, categorySalesRes, recentInvoicesRes] = await Promise.all([
          getDashboardKpis(user.token), getTopProducts('quantity', user.token),
          getCategorySales(user.token), getRecentInvoices(user.token),
        ]);
        setKpis(kpisRes.data);
        setTopProducts(topProductsRes.data);
        setCategorySales(categorySalesRes.data);
        setRecentInvoices(recentInvoicesRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  if (isLoading) return <DashboardSkeleton />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Today's Revenue" value={kpis.todaysRevenue} prefix="₹" icon={<IndianRupee />} color="text-green-400" />
        <KpiCard title="Monthly Revenue" value={kpis.monthlyRevenue} prefix="₹" icon={<IndianRupee />} color="text-green-400" />
        <KpiCard title="Best-Selling Product" suffix={kpis.bestSellingProduct.name} isText={true} icon={<ShoppingBag />} color="text-cyan-400" />
        <KpiCard title="Monthly Discount" value={kpis.monthlyDiscount} prefix="₹" icon={<Percent />} color="text-red-400" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <motion.div variants={{hidden:{opacity:0,y:50}, visible:{opacity:1,y:0}}} className="glass-card lg:col-span-2 p-6"><RevenueChart /></motion.div>
        <motion.div variants={{hidden:{opacity:0,y:50}, visible:{opacity:1,y:0}}} className="glass-card p-6 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Sales by Category</h2>
          <div className="flex-grow"><ResponsiveContainer width="100%" height={300}><RePieChart><Pie data={categorySales} dataKey="totalRevenue" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} label>{categorySales.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => `₹${value.toFixed(2)}`} /><Legend /></RePieChart></ResponsiveContainer></div>
        </motion.div>
      </div>

      <motion.div variants={{hidden:{opacity:0,y:50}, visible:{opacity:1,y:0}}} className="glass-card p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Invoices</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/20"><th className="p-3 text-left">Invoice No.</th><th className="p-3 text-left">Customer</th><th className="p-3 text-right">Amount</th><th className="p-3 text-center">Action</th></tr></thead>
            <tbody>
              {recentInvoices.map(invoice => (
                <tr key={invoice.id} className="border-b border-white/20 hover:bg-gray-500/10"><td className="p-3 font-mono text-sm">{invoice.invoiceNumber}</td><td className="p-3 font-semibold">{invoice.Customer?.name || 'N/A'}</td><td className="p-3 text-right">₹{parseFloat(invoice.grandTotal).toFixed(2)}</td><td className="p-3 text-center"><Link to={`/invoices/${invoice.id}`}><motion.button whileTap={{scale:0.8}}><Eye size={18} className="text-blue-500"/></motion.button></Link></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;

// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { getDashboardKpis, getTopProducts, getCategorySales, getRecentInvoices } from '../services/api';
// import { motion } from 'framer-motion';
// import { IndianRupee, ShoppingBag, Percent, BarChart, PieChart, LineChart } from 'lucide-react';
// import CountUp from 'react-countup';
// import { Bar, BarChart as ReBarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart as RePieChart, Cell } from 'recharts';
// import DashboardSkeleton from '../components/DashboardSkeleton';
// import { Link } from 'react-router-dom';

// const KpiCard = ({ title, value, icon, prefix = '', suffix = '' }) => (
//   <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
//     <div className="flex justify-between items-center">
//       <h3 className="text-lg text-gray-500 dark:text-gray-400">{title}</h3>
//       <div className="text-blue-400">{icon}</div>
//     </div>
//     <p className="text-4xl font-bold mt-2">
//       <CountUp prefix={prefix} suffix={suffix} end={value} duration={2} separator="," />
//     </p>
//   </motion.div>
// );

// const DashboardPage = () => {
//   const [kpis, setKpis] = useState(null);
//   const [topProducts, setTopProducts] = useState([]);
//   const [categorySales, setCategorySales] = useState([]);
//   const [recentInvoices, setRecentInvoices] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [topProductsBy, setTopProductsBy] = useState('quantity');
//   const { user } = useAuth();

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!user?.token) return;
//       try {
//         const [kpisRes, topProductsRes, categorySalesRes, recentInvoicesRes] = await Promise.all([
//           getDashboardKpis(user.token),
//           getTopProducts(topProductsBy, user.token),
//           getCategorySales(user.token),
//           getRecentInvoices(user.token),
//         ]);
//         setKpis(kpisRes.data);
//         setTopProducts(topProductsRes.data);
//         setCategorySales(categorySalesRes.data);
//         setRecentInvoices(recentInvoicesRes.data);
//       } catch (error) {
//         console.error("Failed to fetch dashboard data", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, [user, topProductsBy]);
  
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

//   if (isLoading) return <DashboardSkeleton />;

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-4 md:p-8">
//       <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <KpiCard title="Today's Revenue" value={kpis.todaysRevenue} prefix="₹" icon={<IndianRupee />} />
//         <KpiCard title="Monthly Revenue" value={kpis.monthlyRevenue} prefix="₹" icon={<LineChart />} />
//         {/* --- THE FIX: Use the new object structure for bestSellingProduct --- */}
//         <KpiCard 
//           title="Best-Selling Product" 
//           value={kpis.bestSellingProduct.quantity} 
//           suffix={` units - ${kpis.bestSellingProduct.name}`} 
//           icon={<ShoppingBag />} 
//         />
//         <KpiCard title="Monthly Discount" value={kpis.monthlyDiscount} prefix="₹" icon={<Percent />} />
//       </div>

//       {/* Main Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{delay: 0.2}} className="glass-card lg:col-span-2 p-6">
//           <h2 className="text-2xl font-semibold mb-4">Top 5 Products</h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <ReBarChart data={topProducts}>
//               <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
//               {/* --- THE FIX: The data key for the name is now just 'name' --- */}
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, name]} />
//               <Legend />
//               <Bar dataKey={topProductsBy === 'revenue' ? 'totalRevenue' : 'totalQuantity'} fill="#8884d8" name={topProductsBy === 'revenue' ? 'Total Revenue (₹)' : 'Total Quantity'}/>
//             </ReBarChart>
//           </ResponsiveContainer>
//         </motion.div>
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6 flex flex-col">
//                   <h2 className="text-2xl font-semibold mb-4">Sales by Category</h2>
//                   {categorySales && categorySales.length > 0 ? (
//                       <div className="flex-grow">
//                           <ResponsiveContainer width="100%" height={300}>
//                               <RePieChart>
//                                   <Pie
//                                       data={categorySales}
//                                       dataKey="totalRevenue"
//                                       nameKey="category"
//                                       cx="50%"
//                                       cy="50%"
//                                       // Make the pie chart bigger
//                                       innerRadius={60}
//                                       outerRadius={100}
//                                       fill="#8884d8"
//                                       paddingAngle={5}
//                                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                                   >
//                                       {categorySales.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
//                                   </Pie>
//                                   <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
//                                   <Legend />
//                               </RePieChart>
//                           </ResponsiveContainer>
//                       </div>
//                   ) : (
//                       <div className="flex-grow flex items-center justify-center text-gray-500 dark:text-gray-400">
//                           No category sales data available.
//                       </div>
//                   )}
//               </motion.div>
//       </div>

//       {/* Recent Invoices & Quick Actions */}
//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{delay: 0.4}} className="glass-card p-6">
//         <h2 className="text-2xl font-semibold mb-4">Recent Invoices</h2>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead><tr className="border-b border-white/20"><th className="p-3 text-left">Invoice No.</th><th className="p-3 text-left">Customer</th><th className="p-3 text-right">Amount</th></tr></thead>
//             <tbody>
//               {recentInvoices.map(invoice => (
//                 <tr key={invoice.id} className="border-b border-white/20 hover:bg-gray-500/10">
//                   <td className="p-3 font-mono text-sm">{invoice.invoiceNumber}</td>
//                   <td className="p-3 font-semibold">{invoice.Customer?.name || 'N/A'}</td>
//                   <td className="p-3 text-right">₹{parseFloat(invoice.grandTotal).toFixed(2)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default DashboardPage;
