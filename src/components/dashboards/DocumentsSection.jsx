
import React, { useState, useEffect } from 'react';
import { FileText, Clock, Upload, Download } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const DocumentsSection = ({ customerId }) => {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, [customerId]);

  const fetchDocuments = async () => {
    if (!customerId) return;
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('customer_id', customerId)
      .order('uploaded_at', { ascending: false });
    if (data) setDocs(data);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !customerId) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${customerId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('documents').insert({
        customer_id: customerId,
        document_type: 'User Upload',
        file_name: file.name,
        file_url: publicUrl 
      });

      if (dbError) throw dbError;
      
      toast({ title: "Document Uploaded", description: "Your file has been securely stored." });
      fetchDocuments();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold">Documents</h2>
            <p className="text-white/60">Manage your shipping documents, invoices, and customs forms.</p>
         </div>
         <div className="relative">
           <input 
             type="file" 
             id="file-upload" 
             className="hidden" 
             onChange={handleFileUpload}
             disabled={uploading}
           />
           <label htmlFor="file-upload">
              <Button as="span" className="cursor-pointer bg-[#36FFDB] text-[#1F1F1F] hover:bg-white" disabled={uploading}>
                {uploading ? <Clock className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
           </label>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/5 hover:border-[#36FFDB]/50 transition-all group">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#36FFDB]/10 transition-colors">
                    <FileText className="w-6 h-6 text-white group-hover:text-[#36FFDB]" />
                 </div>
                 <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                 </span>
               </div>
               <h3 className="font-bold text-lg mb-1 truncate" title={doc.file_name}>{doc.file_name}</h3>
               <p className="text-sm text-white/60 mb-4">{doc.document_type}</p>
               <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 group-hover:border-[#36FFDB]/30">
                  <Download className="w-4 h-4 mr-2" /> Download
               </Button>
            </div>
          ))}
          {docs.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-3xl">
               <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
               <p className="text-white/40">No documents found. Upload your first document above.</p>
            </div>
          )}
       </div>
    </div>
  );
};

export default DocumentsSection;
