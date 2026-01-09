
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { FileText, Download, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { useToast } from '@/components/ui/use-toast';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, shipments(*), customers(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setInvoice(data);
    } catch (error) {
      console.error(error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center text-white">Loading Invoice...</div>;
  if (!invoice) return null;

  const isPaid = invoice.status === 'Paid';

  return (
    <>
      <Helmet>
        <title>Invoice {invoice.invoice_number} - SwiftParcel</title>
      </Helmet>

      <div className="min-h-screen bg-[#1F1F1F] py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="ghost" 
            className="mb-6 text-white/60 hover:text-white pl-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <div className="bg-[#151515] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
            {/* Status Strip */}
            <div className={`h-2 w-full ${isPaid ? 'bg-green-500' : 'bg-blue-500'}`} />

            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {isPaid ? 'Receipt' : 'Invoice'}
                  </h1>
                  <p className="text-white/60 font-mono">{invoice.invoice_number}</p>
                </div>
                <div className="flex flex-col items-end">
                   <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 mb-2 ${
                     isPaid ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                   }`}>
                      {isPaid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {invoice.status}
                   </div>
                   {!isPaid && (
                     <p className="text-sm text-red-400">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                   )}
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div>
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Bill To</h3>
                  <div className="text-lg font-medium">
                    {invoice.customers?.name || invoice.shipments?.customer_name}
                  </div>
                  <div className="text-white/60 mt-1">
                    {invoice.customers?.email || invoice.shipments?.email}<br/>
                    {invoice.customers?.address || invoice.shipments?.address}<br/>
                    {invoice.customers?.country || invoice.shipments?.country}
                  </div>
                </div>
                <div className="md:text-right">
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Payment Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between md:justify-end gap-8">
                       <span className="text-white/60">Issued Date:</span>
                       <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between md:justify-end gap-8">
                       <span className="text-white/60">Tracking Ref:</span>
                       <span className="font-mono">{invoice.shipments?.tracking_id}</span>
                    </div>
                    <div className="flex justify-between md:justify-end gap-8">
                       <span className="text-white/60">Currency:</span>
                       <span>USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="bg-white/5 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10 text-sm text-white/40 font-bold uppercase tracking-wider">
                   <span>Description</span>
                   <span>Amount</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                   <div>
                      <p>Global Shipping Services</p>
                      <p className="text-sm text-white/40 mt-1">
                        Package: {invoice.shipments?.package_info || 'Standard Cargo'}
                      </p>
                   </div>
                   <div className="font-mono">
                      ${invoice.amount.toFixed(2)}
                   </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end items-center gap-6 mb-12">
                 <span className="text-xl text-white/60">Total Amount</span>
                 <span className="text-4xl font-bold text-[#36FFDB]">${invoice.amount.toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4 justify-end">
                <Button 
                   variant="outline" 
                   onClick={() => generateInvoicePDF(invoice, invoice.shipments, invoice.customers)}
                   className="border-white/20 hover:bg-white/10 h-14 px-8 rounded-[50px] text-lg"
                >
                   <Download className="w-5 h-5 mr-2" />
                   Download PDF
                </Button>
                
                {!isPaid && (
                   <Button 
                      onClick={() => navigate(`/payment/${id}`)}
                      className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-white h-14 px-8 rounded-[50px] font-bold text-lg shadow-[0_0_20px_rgba(54,255,219,0.3)] hover:shadow-[0_0_30px_rgba(54,255,219,0.5)] transition-all"
                   >
                      <ShieldCheck className="w-5 h-5 mr-2" />
                      Pay Securely
                   </Button>
                )}
              </div>
            </div>
            
            <div className="bg-[#0f0f0f] p-6 text-center text-white/40 text-sm">
               SwiftParcel Global Inc. • New York, USA • swiftparcel.global
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetails;
