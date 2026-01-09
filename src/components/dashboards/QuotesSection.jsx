
import React, { useState, useEffect } from 'react';
import { FileText, Search, Plus, Filter, Download, X, Check, ArrowRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const QuotesSection = ({ customerId, userEmail }) => {
  const [quotes, setQuotes] = useState([]);
  const [view, setView] = useState('list'); // list, create, details
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Create Form State
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    weight: '',
    dimensions: '',
    cargo_type: 'General',
    service_type: 'Air Freight',
    special_requirements: '',
    preferred_delivery_date: '',
    contact_info: { name: '', email: userEmail, phone: '' }
  });

  useEffect(() => {
    fetchQuotes();
  }, [customerId]);

  const fetchQuotes = async () => {
    if (!customerId) return;
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching quotes:', error);
    } else {
      setQuotes(data);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) return;

    try {
      const { error } = await supabase.from('quotes').insert({
        customer_id: customerId,
        ...formData,
        status: 'Draft',
        contact_info: formData.contact_info // Ensure this is stored as JSONB
      });

      if (error) throw error;

      toast({ 
        title: "Quote Requested", 
        description: "Your quote request has been saved as Draft. We will review it shortly." 
      });
      setView('list');
      fetchQuotes();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const updateQuoteStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({ 
        title: `Quote ${status}`, 
        description: `Quote has been marked as ${status}.` 
      });
      fetchQuotes();
      if (selectedQuote) setSelectedQuote({ ...selectedQuote, status });
      
      // Simulating email notification
      if (status === 'Accepted' || status === 'Rejected') {
         setTimeout(() => {
             toast({ title: "Notification Sent", description: `Confirmation email sent to ${userEmail}` });
         }, 1000);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const downloadPDF = (quote) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(54, 255, 219); // #36FFDB
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(31, 31, 31);
    doc.text('SwiftParcel Quote', 20, 25);
    
    // Quote Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Quote ID: ${quote.id.slice(0, 8).toUpperCase()}`, 150, 20);
    doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString()}`, 150, 25);
    doc.text(`Status: ${quote.status}`, 150, 30);

    // From/To
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`From: ${quote.origin}`, 20, 60);
    doc.text(`To: ${quote.destination}`, 120, 60);

    // Details
    doc.setFontSize(10);
    doc.text(`Service: ${quote.service_type}`, 20, 80);
    doc.text(`Cargo: ${quote.cargo_type}`, 20, 85);
    doc.text(`Weight: ${quote.weight} kg`, 20, 90);
    doc.text(`Est. Delivery: ${quote.estimated_delivery || 'TBD'}`, 20, 95);

    // Pricing Table
    if (quote.total_price > 0) {
      doc.autoTable({
        startY: 110,
        head: [['Description', 'Amount (USD)']],
        body: [
          ['Base Rate', `$${quote.base_rate}`],
          ['Fuel Surcharge', `$${quote.fuel_surcharge}`],
          ['Handling Fee', `$${quote.handling_fee}`],
          ['Insurance', `$${quote.insurance}`],
          ['Taxes', `$${quote.taxes}`],
          [{ content: 'Total', styles: { fontStyle: 'bold' } }, { content: `$${quote.total_price}`, styles: { fontStyle: 'bold' } }],
        ],
        theme: 'grid',
        headStyles: { fillColor: [31, 31, 31] }
      });
    } else {
      doc.text("Pricing pending review.", 20, 110);
    }

    doc.save(`Quote_${quote.id.slice(0, 8)}.pdf`);
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesFilter = filter === 'All' || q.status === filter;
    const matchesSearch = 
      q.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Draft': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'Sent': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Viewed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Accepted': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-white/10 text-white/60';
    }
  };

  if (view === 'create') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setView('list')}>&larr; Back</Button>
          <h2 className="text-2xl font-bold">Request New Quote</h2>
        </div>
        <form onSubmit={handleCreateSubmit} className="bg-[#1F1F1F] p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Origin</label>
              <input required className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#36FFDB] outline-none" 
                value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Destination</label>
              <input required className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#36FFDB] outline-none" 
                value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Weight (kg)</label>
              <input type="number" required className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#36FFDB] outline-none" 
                value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Dimensions (LxWxH cm)</label>
              <input required className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#36FFDB] outline-none" 
                value={formData.dimensions} onChange={e => setFormData({...formData, dimensions: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Service Type</label>
              <select className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#36FFDB] outline-none"
                value={formData.service_type} onChange={e => setFormData({...formData, service_type: e.target.value})}>
                <option value="Air Freight">Air Freight</option>
                <option value="Sea Freight">Sea Freight</option>
                <option value="Road Freight">Road Freight</option>
              </select>
            </div>
             <div className="space-y-2">
              <label className="text-sm text-white/60">Preferred Date</label>
              <input type="date" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#36FFDB] outline-none" 
                value={formData.preferred_delivery_date} onChange={e => setFormData({...formData, preferred_delivery_date: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
             <label className="text-sm text-white/60">Special Requirements</label>
             <textarea rows="3" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#36FFDB] outline-none" 
               value={formData.special_requirements} onChange={e => setFormData({...formData, special_requirements: e.target.value})} />
          </div>
          <div className="flex justify-end pt-4">
             <Button type="submit" className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-white px-8 rounded-full">Submit Request</Button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'details' && selectedQuote) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
           <Button variant="ghost" onClick={() => { setView('list'); setSelectedQuote(null); }}>&larr; Back to Quotes</Button>
           <div className="flex gap-2">
              {selectedQuote.status === 'Sent' && (
                <>
                  <Button onClick={() => updateQuoteStatus(selectedQuote.id, 'Rejected')} variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white">Reject</Button>
                  <Button onClick={() => updateQuoteStatus(selectedQuote.id, 'Accepted')} className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-white">Accept Quote</Button>
                </>
              )}
              <Button variant="outline" onClick={() => downloadPDF(selectedQuote)}><Download className="w-4 h-4 mr-2"/> PDF</Button>
           </div>
        </div>

        <div className="bg-[#1F1F1F] rounded-3xl border border-white/5 overflow-hidden">
           <div className="p-8 border-b border-white/5 flex justify-between items-start">
              <div>
                 <h2 className="text-3xl font-bold mb-2">Quote #{selectedQuote.id.slice(0,8).toUpperCase()}</h2>
                 <p className="text-white/60">Created on {new Date(selectedQuote.created_at).toLocaleDateString()}</p>
              </div>
              <div className={`px-4 py-2 rounded-full border ${getStatusColor(selectedQuote.status)}`}>
                 {selectedQuote.status}
              </div>
           </div>
           
           <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div>
                    <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-2">Route Details</h3>
                    <div className="flex items-center gap-4 text-lg">
                       <span>{selectedQuote.origin}</span>
                       <ArrowRight className="text-white/40" />
                       <span>{selectedQuote.destination}</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-1">Service</h3>
                       <p>{selectedQuote.service_type}</p>
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-1">Cargo</h3>
                       <p>{selectedQuote.cargo_type}</p>
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-1">Weight</h3>
                       <p>{selectedQuote.weight} kg</p>
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-1">Est. Delivery</h3>
                       <p>{selectedQuote.estimated_delivery || 'Pending'}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-black/20 rounded-2xl p-6">
                 <h3 className="text-lg font-bold mb-4">Pricing Breakdown</h3>
                 {selectedQuote.total_price > 0 ? (
                   <div className="space-y-3">
                      <div className="flex justify-between text-white/60">
                         <span>Base Rate</span>
                         <span>${selectedQuote.base_rate}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                         <span>Fuel Surcharge</span>
                         <span>${selectedQuote.fuel_surcharge}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                         <span>Handling Fee</span>
                         <span>${selectedQuote.handling_fee}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                         <span>Insurance</span>
                         <span>${selectedQuote.insurance}</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                         <span>Taxes</span>
                         <span>${selectedQuote.taxes}</span>
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-xl text-[#36FFDB]">
                         <span>Total</span>
                         <span>${selectedQuote.total_price}</span>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-40 text-white/40 text-center">
                      <Clock className="w-8 h-8 mb-2" />
                      <p>Pricing is being calculated by our team.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
             <h2 className="text-2xl font-bold">My Quotes</h2>
             <p className="text-white/60">Manage and track your shipping quotes</p>
          </div>
          <Button onClick={() => setView('create')} className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-white rounded-full">
             <Plus className="w-4 h-4 mr-2" /> New Quote Request
          </Button>
       </div>

       <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
             <input 
               placeholder="Search by ID, Origin, Destination..." 
               className="w-full bg-[#1F1F1F] pl-10 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-[#36FFDB] outline-none"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
             {['All', 'Draft', 'Sent', 'Accepted', 'Rejected'].map(s => (
                <button 
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${filter === s ? 'bg-white text-[#1F1F1F]' : 'bg-[#1F1F1F] text-white/60 hover:text-white'}`}
                >
                  {s}
                </button>
             ))}
          </div>
       </div>

       <div className="bg-[#1F1F1F] rounded-3xl border border-white/5 overflow-hidden">
          {filteredQuotes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase">Quote ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase">Route</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase">Service</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {filteredQuotes.map(quote => (
                      <tr key={quote.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { setSelectedQuote(quote); setView('details'); }}>
                         <td className="px-6 py-4 font-mono text-sm text-[#36FFDB]">{quote.id.slice(0, 8).toUpperCase()}</td>
                         <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                               <span>{quote.origin}</span>
                               <span className="text-white/40">&rarr;</span>
                               <span>{quote.destination}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-white/60">{quote.service_type}</td>
                         <td className="px-6 py-4 text-sm text-white/60">{new Date(quote.created_at).toLocaleDateString()}</td>
                         <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                               {quote.status}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">View</Button>
                         </td>
                      </tr>
                   ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
               <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
               <p className="text-white/40">No quotes found matching your criteria.</p>
            </div>
          )}
       </div>
    </div>
  );
};

export default QuotesSection;
