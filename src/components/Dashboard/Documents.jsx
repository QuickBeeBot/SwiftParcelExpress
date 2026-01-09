// src/pages/Documents.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Package, Receipt, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock document types for icon mapping
  const getDocumentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'invoice':
        return <Receipt className="w-6 h-6 text-[#36FFDB]" />;
      case 'contract':
        return <ClipboardList className="w-6 h-6 text-blue-400" />;
      case 'receipt':
        return <Receipt className="w-6 h-6 text-green-400" />;
      case 'waybill':
        return <Package className="w-6 h-6 text-purple-400" />;
      default:
        return <FileText className="w-6 h-6 text-gray-400" />;
    }
  };

  const getDocumentColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'invoice': return 'text-[#36FFDB]';
      case 'contract': return 'text-blue-400';
      case 'receipt': return 'text-green-400';
      case 'waybill': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch documents linked to the user
        const q = query(
          collection(db, 'documents'),
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
        })).sort((a, b) => b.createdAt - a.createdAt);

        setDocuments(docs);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(t('documents.errors.fetchFailed'));
        toast({
          title: t('documents.errors.title'),
          description: t('documents.errors.fetchFailed'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user, t, toast]);

  const handleDownload = async (document) => {
    if (!document.downloadUrl) {
      toast({
        title: t('documents.errors.noDownloadUrl'),
        variant: 'destructive',
      });
      return;
    }

    try {
      // Optional: log download in Firestore
      // await addDoc(collection(db, 'downloads'), {
      //   documentId: document.id,
      //   userId: user.uid,
      //   timestamp: new Date(),
      // });

      // Trigger download
      const link = document.createElement('a');
      link.href = document.downloadUrl;
      link.setAttribute('download', document.fileName || `${document.type}_${document.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: t('documents.success.downloadedTitle'),
        description: t('documents.success.downloadedDesc', { name: document.name }),
      });
    } catch (err) {
      console.error('Download failed:', err);
      toast({
        title: t('documents.errors.downloadFailed'),
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>{t('documents.pageTitle')} - SwiftParcel</title>
        <meta name="description" content={t('documents.metaDescription')} />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('documents.title')}</h1>
          <p className="text-white/60 mb-8 max-w-2xl">
            {t('documents.subtitle')}
          </p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#1F1F1F] border border-white/10 rounded-xl p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-white/10 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-white/5 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">{error}</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{t('documents.empty.title')}</h3>
              <p className="text-white/60 max-w-md mx-auto">{t('documents.empty.description')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ y: -4 }}
                  className="bg-[#1F1F1F] border border-white/10 rounded-xl p-6 transition-all hover:border-[#36FFDB]/30"
                >
                  <div className="flex items-start gap-4">
                    {getDocumentIcon(doc.type)}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${getDocumentColor(doc.type)} truncate`}>
                        {doc.name || `${doc.type} #${doc.id}`}
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        {doc.description || t(`documents.types.${doc.type}`) || doc.type}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-white/50">
                        <Calendar className="w-3 h-3" />
                        {formatDate(doc.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(doc)}
                    variant="outline"
                    className="w-full mt-4 border-white/20 text-white hover:bg-white/5 hover:border-[#36FFDB]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('documents.download')}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default Documents;