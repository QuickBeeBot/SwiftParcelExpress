
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Package, Edit, Trash2, X, FileText, DollarSign, CheckCircle, Calculator, Activity } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import AnalyticsSection from '@/components/admins/AnalyticsSection';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shipments'); // 'shipments', 'invoices', 'quotes', 'analytics'
  const [shipments, setShipments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  
  const [editingShipment, setEditingShipment] = useState(null);
  const [creatingInvoice, setCreatingInvoice] = useState(null);
  const [processingQuote, setProcessingQuote] = useState(null);
  
  const [invoiceAmount, setInvoiceAmount] = useState('');
  
  // Quote Processing State
  const [quotePricing, setQuotePricing] = useState({
    base_rate: 0,
    fuel_surcharge: 0,
    handling_fee: 0,
    insurance: 0,
    taxes: 0,
    estimated_delivery: ''
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/admin/login'); return; }
    const { data: adminData } = await supabase.from('admin_users').select('id').eq('id', user.id).single();
    if (!adminData) { await supabase.auth.signOut(); navigate('/admin/login'); return; }
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchShipments(), fetchInvoices(), fetchQuotes()]);
    setLoading(false);
  };

  const fetchShipments = async () => {
    const { data } = await supabase.from('shipments').select('*').order('created_at', { ascending: false });
    if (data) {
       setShipments(data);
       setStats({
          total: data.length,
          pending: data.filter(s => s.status === 'Pending').length,
          inTransit: data.filter(s => s.status === 'In Transit').length,
          delivered: data.filter(s => s.status === 'Delivered').length
       });
    }
  };

  const fetchInvoices = async () => {
    const { data } = await supabase.from('invoices').select('*, shipments(tracking_id, customer_name, email)').order('created_at', { ascending: false });
    if (data) setInvoices(data);
  };

  const fetchQuotes = async () => {
    const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    if (data) setQuotes(data);
  };

  const handleUpdateQuote = async (e) => {
    e.preventDefault();
    if (!processingQuote) return;

    const total_price = 
      parseFloat(quotePricing.base_rate) + 
      parseFloat(quotePricing.fuel_surcharge) + 
      parseFloat(quotePricing.handling_fee) + 
      parseFloat(quotePricing.insurance) + 
      parseFloat(quotePricing.taxes);

    try {
      const { error } = await supabase.from('quotes').update({
        ...quotePricing,
        total_price,
        status: 'Sent',
        updated_at: new Date().toISOString()
      }).eq('id', processingQuote.id);

      if (error) throw error;
      toast({ title: "Quote Sent", description: "Pricing added and quote sent to customer." });
      setProcessingQuote(null);
      fetchQuotes();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleUpdateStatus = async (id, status) => {
    await supabase.from('shipments').update({ status }).eq('id', id);
    fetchShipments(); setEditingShipment(null);
  };

  const statusColors = { 'Pending': 'text-yellow-500', 'In Transit': 'text-blue-500', 'Delivered': 'text-green-500' };

  return (
    <>
      <Helmet><title>Admin Dashboard - Parcel</title></Helmet>
      <div className="min-h-screen py-8 bg-[#1F1F1F] text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <img 
                src="https://horizons-cdn.hostinger.com/026546b3-3a97-44bc-b1b6-02c6690099a6/edf1c70f55630599a96794cb64678dc9.png" 
                alt="Parcel logo" 
                className="h-12 w-auto" 
              />
              Admin Dashboard
            </h1>
            <Button onClick={() => { supabase.auth.signOut(); navigate('/admin/login'); }} variant="outline">Logout</Button>
          </div>

          <div className="flex gap-4 mb-8 overflow-x-auto">
            {['shipments', 'quotes', 'invoices', 'analytics'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full font-bold capitalize transition-colors ${activeTab === tab ? 'bg-[#36FFDB] text-[#1F1F1F]' : 'bg-[#151515] hover:bg-white/10'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'analytics' && <AnalyticsSection />}

          {activeTab === 'quotes' && (
             <div className="bg-[#151515] rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                   <h2 className="text-xl font-bold">Quote Requests</h2>
                   <div className="flex gap-2 text-sm">
                      <span className="text-yellow-500">{quotes.filter(q => q.status === 'Draft').length} Draft</span>
                      <span className="text-green-500">{quotes.filter(q => q.status === 'Accepted').length} Accepted</span>
                   </div>
                </div>
                <table className="w-full text-left">
                   <thead className="bg-white/5 text-xs uppercase text-white/40">
                      <tr>
                         <th className="px-6 py-4">ID</th>
                         <th className="px-6 py-4">Route</th>
                         <th className="px-6 py-4">Details</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4">Total</th>
                         <th className="px-6 py-4">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {quotes.map(q => (
                         <tr key={q.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 font-mono text-sm text-[#36FFDB]">{q.id.slice(0,6)}</td>
                            <td className="px-6 py-4 text-sm">{q.origin} &rarr; {q.destination}</td>
                            <td className="px-6 py-4 text-sm text-white/60">{q.service_type} • {q.weight}kg</td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  q.status === 'Draft' ? 'bg-yellow-500/10 text-yellow-500' : 
                                  q.status === 'Sent' ? 'bg-blue-500/10 text-blue-500' : 
                                  q.status === 'Accepted' ? 'bg-green-500/10 text-green-500' : 'text-white/40'
                               }`}>{q.status}</span>
                            </td>
                            <td className="px-6 py-4 font-bold">{q.total_price > 0 ? `$${q.total_price}` : '-'}</td>
                            <td className="px-6 py-4">
                               {q.status === 'Draft' && (
                                  <Button size="sm" onClick={() => setProcessingQuote(q)} className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-white">
                                     <Calculator className="w-4 h-4 mr-2" /> Price
                                  </Button>
                               )}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}

          {activeTab === 'shipments' && (
            <div className="bg-[#151515] rounded-3xl border border-white/10 overflow-hidden">
               <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Shipments</h2>
                  {shipments.map(s => (
                     <div key={s.id} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0">
                        <div>
                           <div className="font-bold text-[#36FFDB]">{s.tracking_id}</div>
                           <div className="text-sm text-white/60">{s.customer_name}</div>
                        </div>
                        <div className={`${statusColors[s.status]}`}>{s.status}</div>
                        <Button size="sm" variant="ghost" onClick={() => setEditingShipment(s)}><Edit className="w-4 h-4"/></Button>
                     </div>
                  ))}
               </div>
            </div>
          )}
          
          {activeTab === 'invoices' && (
            <div className="bg-[#151515] p-6 rounded-3xl text-center text-white/40">Invoices Management</div>
          )}
        </div>

        {/* Quote Processing Modal */}
        <AnimatePresence>
           {processingQuote && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                 <div className="bg-[#1F1F1F] p-8 rounded-3xl max-w-lg w-full border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Process Quote #{processingQuote.id.slice(0,6)}</h3>
                    <form onSubmit={handleUpdateQuote} className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-xs text-white/40 uppercase">Base Rate</label>
                             <input type="number" className="w-full bg-black/20 border border-white/10 rounded p-2" 
                               value={quotePricing.base_rate} onChange={e => setQuotePricing({...quotePricing, base_rate: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-xs text-white/40 uppercase">Fuel Surcharge</label>
                             <input type="number" className="w-full bg-black/20 border border-white/10 rounded p-2" 
                               value={quotePricing.fuel_surcharge} onChange={e => setQuotePricing({...quotePricing, fuel_surcharge: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-xs text-white/40 uppercase">Handling Fee</label>
                             <input type="number" className="w-full bg-black/20 border border-white/10 rounded p-2" 
                               value={quotePricing.handling_fee} onChange={e => setQuotePricing({...quotePricing, handling_fee: e.target.value})} />
                          </div>
                          <div>
                             <label className="text-xs text-white/40 uppercase">Insurance</label>
                             <input type="number" className="w-full bg-black/20 border border-white/10 rounded p-2" 
                               value={quotePricing.insurance} onChange={e => setQuotePricing({...quotePricing, insurance: e.target.value})} />
                          </div>
                          <div className="col-span-2">
                             <label className="text-xs text-white/40 uppercase">Estimated Delivery</label>
                             <input type="text" placeholder="e.g., 5-7 Business Days" className="w-full bg-black/20 border border-white/10 rounded p-2" 
                               value={quotePricing.estimated_delivery} onChange={e => setQuotePricing({...quotePricing, estimated_delivery: e.target.value})} />
                          </div>
                       </div>
                       <div className="flex justify-end gap-2 mt-4">
                          <Button type="button" variant="ghost" onClick={() => setProcessingQuote(null)}>Cancel</Button>
                          <Button type="submit" className="bg-[#36FFDB] text-[#1F1F1F]">Send Quote</Button>
                       </div>
                    </form>
                 </div>
              </motion.div>
           )}
           {editingShipment && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                 <div className="bg-[#1F1F1F] p-8 rounded-3xl w-full max-w-sm border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Update Status</h3>
                    <div className="space-y-2">
                       {['Pending', 'In Transit', 'Delivered'].map(s => (
                          <button key={s} onClick={() => handleUpdateStatus(editingShipment.id, s)} className="w-full p-3 text-left hover:bg-white/10 rounded">{s}</button>
                       ))}
                       <button onClick={() => setEditingShipment(null)} className="w-full p-3 text-red-500 mt-2">Cancel</button>
                    </div>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminDashboard;
