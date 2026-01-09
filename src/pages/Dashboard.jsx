
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, TrendingUp, FileText, Settings, Bell, 
  LayoutDashboard, LifeBuoy, LogOut, CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Import refactored sections
import DashboardOverview from '@/components/dashboards/DashboardOverview';
import DocumentsSection from '@/components/dashboards/DocumentsSection';
import SupportSection from '@/components/dashboards/SupportSection';
import AccountSection from '@/components/dashboards/AccountSection';
import QuotesSection from '@/components/dashboards/QuotesSection';

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [customerData, setCustomerData] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (user) loadData();
  }, [user, loading]);

  const loadData = async () => {
    // 1. Get Customer
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();
    setCustomerData(customer);

    if (customer) {
      // 2. Get Shipments
      const { data: s } = await supabase
        .from('shipments')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });
      setShipments(s || []);

      // 3. Get Invoices
      const { data: i } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', customer.id);
      setInvoices(i || []);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'tracking', label: 'Track Shipments', icon: Package },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'invoices', label: 'Invoices', icon: CreditCard },
    { id: 'support', label: 'Support', icon: LifeBuoy },
    { id: 'account', label: 'Account', icon: Settings },
  ];

  if (loading) return <div className="min-h-screen bg-[#151515] flex items-center justify-center text-white/50">Loading...</div>;

  return (
    <>
      <Helmet>
        <title>Dashboard - SwiftParcel</title>
      </Helmet>
      
      <div className="min-h-screen bg-[#151515] flex">
        {/* Sidebar */}
        <motion.aside 
          initial={{ width: 280 }}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="hidden md:flex flex-col border-r border-white/5 bg-[#1F1F1F] sticky top-0 h-screen z-20"
        >
          <div className="p-6 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-[#36FFDB] flex items-center justify-center text-black font-bold">SP</div>
             {isSidebarOpen && <span className="font-bold text-xl tracking-tight">SwiftParcel</span>}
          </div>

          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
             {navItems.map(item => (
               <button
                 key={item.id}
                 onClick={() => setActiveSection(item.id)}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                   activeSection === item.id 
                     ? 'bg-[#36FFDB] text-[#1F1F1F] font-bold shadow-[0_0_20px_rgba(54,255,219,0.3)]' 
                     : 'text-white/60 hover:bg-white/5 hover:text-white'
                 }`}
               >
                 <item.icon size={20} />
                 {isSidebarOpen && <span>{item.label}</span>}
               </button>
             ))}
          </div>

          <div className="p-4 border-t border-white/5">
             <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
               <LogOut size={20} />
               {isSidebarOpen && <span>Sign Out</span>}
             </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#151515]/80 backdrop-blur sticky top-0 z-10">
             <h1 className="text-xl font-bold capitalize">{activeSection.replace('-', ' ')}</h1>
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white hover:bg-white/5">
                   <Bell className="w-5 h-5" />
                   <span className="absolute top-2 right-2 w-2 h-2 bg-[#36FFDB] rounded-full" />
                </Button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#36FFDB] to-blue-500 flex items-center justify-center text-black font-bold text-xs">
                   {user?.email?.charAt(0).toUpperCase()}
                </div>
             </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'overview' && (
                  <DashboardOverview 
                    data={{ 
                      shipments, 
                      invoices, 
                      totalSpent: invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0) 
                    }} 
                  />
                )}
                {activeSection === 'quotes' && <QuotesSection customerId={customerData?.id} userEmail={user?.email} />}
                {activeSection === 'tracking' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h2 className="text-2xl font-bold">Track Shipments</h2>
                       <Button className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-white">+ Add Shipment</Button>
                    </div>
                    <div className="grid gap-4">
                      {shipments.map(s => (
                        <div key={s.id} className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-[#36FFDB]/10 rounded-full">
                                <Package className="text-[#36FFDB]" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg">{s.tracking_id}</h4>
                                <p className="text-sm text-white/60">{s.origin || 'Warehouse'} &rarr; {s.country}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-8">
                              <div className="text-right">
                                <p className="text-xs text-white/40 uppercase tracking-wider">Status</p>
                                <p className="font-medium text-[#36FFDB]">{s.status}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-white/40 uppercase tracking-wider">Est. Delivery</p>
                                <p className="font-medium">{new Date(new Date().setDate(new Date().getDate() + 5)).toLocaleDateString()}</p>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeSection === 'documents' && <DocumentsSection customerId={customerData?.id} />}
                {activeSection === 'support' && <SupportSection customerId={customerData?.id} />}
                {activeSection === 'account' && <AccountSection user={user} customerData={customerData} />}
                {activeSection === 'invoices' && (
                   <div className="bg-[#1F1F1F] rounded-2xl border border-white/5 overflow-hidden">
                      <div className="p-6 border-b border-white/5">
                        <h2 className="text-xl font-bold">Invoices</h2>
                      </div>
                      <table className="w-full text-left">
                        <thead className="bg-white/5 text-white/40 text-xs uppercase">
                          <tr>
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {invoices.map(inv => (
                             <tr key={inv.id}>
                               <td className="px-6 py-4 font-mono">{inv.invoice_number}</td>
                               <td className="px-6 py-4 text-white/60">{new Date(inv.created_at).toLocaleDateString()}</td>
                               <td className="px-6 py-4 font-bold">${inv.amount}</td>
                               <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                    inv.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                  }`}>{inv.status}</span>
                               </td>
                               <td className="px-6 py-4">
                                  <Button size="sm" variant="ghost">Download PDF</Button>
                               </td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
