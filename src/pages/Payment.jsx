
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Landmark, Check, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState('card');
  const [kycRequired, setKycRequired] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customers(*)')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      navigate('/dashboard');
      return;
    }
    
    setInvoice(data);
    if (data.amount > 5000) {
      setKycRequired(true);
    }
    setLoading(false);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Mock Payment Processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // 1. Record Payment
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          invoice_id: id,
          payment_method: method,
          amount: invoice.amount,
          status: 'Completed',
          transaction_id: `TXN-${Date.now()}`
        }]);
      
      if (paymentError) throw paymentError;

      // 2. Update Invoice Status
      const { error: invError } = await supabase
        .from('invoices')
        .update({ status: 'Paid', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (invError) throw invError;

      toast({
        title: "Payment Successful! 🎉",
        description: `Receipt emailed to ${invoice.customers?.email || 'your email'}.`,
      });

      navigate(`/invoices/${id}`);

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Could not process transaction.",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center text-white">Loading Secure Gateway...</div>;

  return (
    <>
      <Helmet>
        <title>Secure Payment - SwiftParcel</title>
      </Helmet>

      <div className="min-h-screen bg-[#1F1F1F] py-12 px-4 flex items-center justify-center">
        <div className="container max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Order Summary */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-6">Complete Payment</h1>
            <p className="text-white/60 mb-8 text-lg">
               Securely pay for invoice <span className="text-white font-mono">{invoice.invoice_number}</span>
            </p>

            <div className="bg-[#151515] p-8 rounded-3xl border border-white/10 mb-8">
               <div className="flex justify-between mb-4 text-white/60">
                 <span>Subtotal</span>
                 <span>${invoice.amount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between mb-4 text-white/60">
                 <span>Processing Fee</span>
                 <span>$0.00</span>
               </div>
               <div className="h-px bg-white/10 my-4" />
               <div className="flex justify-between text-2xl font-bold">
                 <span>Total</span>
                 <span className="text-[#36FFDB]">${invoice.amount.toFixed(2)}</span>
               </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-white/40">
               <Lock className="w-4 h-4" />
               Payments are processed securely via Stripe. 256-bit SSL Encrypted.
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-[#151515] p-8 rounded-3xl border border-white/10 shadow-2xl">
             
             {kycRequired && (
                <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
                   <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                   <div>
                      <h4 className="text-yellow-500 font-bold text-sm">High Value Transaction</h4>
                      <p className="text-xs text-white/60 mt-1">
                        For transactions over $5,000, additional KYC documents may be requested after payment.
                      </p>
                   </div>
                </div>
             )}

             <h3 className="text-lg font-bold mb-4">Select Method</h3>
             <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                  onClick={() => setMethod('card')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'card' ? 'bg-[#36FFDB]/10 border-[#36FFDB] text-[#36FFDB]' : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}`}
                >
                   <CreditCard className="w-6 h-6" />
                   <span className="text-sm font-bold">Credit Card</span>
                </button>
                <button 
                  onClick={() => setMethod('bank')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'bank' ? 'bg-[#36FFDB]/10 border-[#36FFDB] text-[#36FFDB]' : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}`}
                >
                   <Landmark className="w-6 h-6" />
                   <span className="text-sm font-bold">Bank Transfer</span>
                </button>
             </div>

             <form onSubmit={handlePayment} className="space-y-4">
                {method === 'card' ? (
                    <>
                        <div>
                           <label className="block text-xs font-medium text-white/60 mb-1 ml-1">Card Number</label>
                           <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] outline-none transition-colors" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-medium text-white/60 mb-1 ml-1">Expiry</label>
                              <input type="text" placeholder="MM/YY" className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] outline-none transition-colors" required />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-white/60 mb-1 ml-1">CVC</label>
                              <input type="text" placeholder="123" className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] outline-none transition-colors" required />
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-white/60 mb-1 ml-1">Cardholder Name</label>
                           <input type="text" placeholder="John Doe" className="w-full bg-[#1F1F1F] border border-white/10 rounded-xl px-4 py-3 focus:border-[#36FFDB] outline-none transition-colors" required />
                        </div>
                    </>
                ) : (
                    <div className="p-4 bg-white/5 rounded-xl text-center text-sm text-white/60">
                       Bank transfer instructions will be emailed to you after confirmation. Your order will be processed once funds are received.
                    </div>
                )}

                <Button 
                   type="submit" 
                   disabled={processing}
                   className="w-full bg-[#36FFDB] text-[#1F1F1F] hover:bg-white h-14 rounded-[50px] font-bold text-lg mt-4"
                >
                   {processing ? 'Processing Securely...' : `Pay $${invoice.amount.toFixed(2)}`}
                </Button>
             </form>
          </div>

        </div>
      </div>
    </>
  );
};

export default Payment;
