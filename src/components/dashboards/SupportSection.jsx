
import React, { useState, useEffect } from 'react';
import { LifeBuoy } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SupportSection = ({ customerId }) => {
  const [tickets, setTickets] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'general', priority: 'medium', description: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, [customerId]);

  const fetchTickets = async () => {
    if (!customerId) return;
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (data) setTickets(data);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!customerId) return;

    const { error } = await supabase.from('support_tickets').insert({
      customer_id: customerId,
      ...newTicket
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Success", description: "Ticket created successfully. Support team notified." });
      setIsCreating(false);
      setNewTicket({ subject: '', category: 'general', priority: 'medium', description: '' });
      fetchTickets();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold">Support Center</h2>
            <p className="text-white/60">Need help? Create a ticket and we'll respond shortly.</p>
         </div>
         <Button onClick={() => setIsCreating(!isCreating)} className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-white">
            {isCreating ? 'Cancel' : '+ New Ticket'}
         </Button>
      </div>

      {isCreating && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/10"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <input 
                  required
                  value={newTicket.subject}
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#36FFDB] outline-none"
                  placeholder="Issue summary..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#36FFDB] outline-none"
                  value={newTicket.category}
                  onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                >
                  <option value="tracking">Tracking Issue</option>
                  <option value="billing">Billing & Invoices</option>
                  <option value="technical">Technical Support</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                required
                rows="4"
                value={newTicket.description}
                onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-[#36FFDB] outline-none resize-none"
                placeholder="Describe your issue in detail..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#36FFDB] text-[#1F1F1F]">Submit Ticket</Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-[#1F1F1F] p-5 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer">
            <div className="flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-2 h-2 rounded-full ${
                      ticket.status === 'open' ? 'bg-green-500' : 
                      ticket.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500'
                    }`} />
                    <h3 className="font-bold">{ticket.subject}</h3>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/60 uppercase">{ticket.category}</span>
                  </div>
                  <p className="text-sm text-white/60 line-clamp-1">{ticket.description}</p>
               </div>
               <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  <p className="text-xs text-white/40 mt-2">{new Date(ticket.created_at).toLocaleDateString()}</p>
               </div>
            </div>
          </div>
        ))}
         {tickets.length === 0 && !isCreating && (
            <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-3xl">
               <LifeBuoy className="w-12 h-12 text-white/20 mx-auto mb-4" />
               <p className="text-white/40">No support tickets yet. We're here to help!</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default SupportSection;
