// src/pages/Billing.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  Package, 
  Receipt, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const Billing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock subscription status
  const getSubscriptionStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { text: t('billing.status.active'), icon: <CheckCircle className="w-4 h-4 text-green-400" /> };
      case 'past_due':
        return { text: t('billing.status.pastDue'), icon: <Clock className="w-4 h-4 text-yellow-400" /> };
      case 'canceled':
        return { text: t('billing.status.canceled'), icon: <XCircle className="w-4 h-4 text-red-400" /> };
      default:
        return { text: t('billing.status.inactive'), icon: <XCircle className="w-4 h-4 text-gray-400" /> };
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch subscription (if you store it)
        const subQuery = query(
          collection(db, 'subscriptions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const subSnapshot = await getDocs(subQuery);
        if (!subSnapshot.empty) {
          setSubscription({ id: subSnapshot.docs[0].id, ...subSnapshot.docs[0].data() });
        }

        // Fetch invoices
        const invQuery = query(
          collection(db, 'invoices'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const invSnapshot = await getDocs(invQuery);
        const invoiceList = invSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
        }));

        setInvoices(invoiceList);
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError(t('billing.errors.fetchFailed'));
        toast({
          title: t('billing.errors.title'),
          description: t('billing.errors.fetchFailed'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [user, t, toast]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount / 100); // assuming amount in cents
  };

  return (
    <>
      <Helmet>
        <title>{t('billing.pageTitle')} - SwiftParcel</title>
        <meta name="description" content={t('billing.metaDescription')} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{t('billing.title')}</h1>
              <p className="text-white/60 mt-2">{t('billing.subtitle')}</p>
            </div>
            <Button asChild className="mt-4 sm:mt-0 bg-[#36FFDB] text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#36FFDB] hover:border-[#36FFDB] border-2 border-transparent rounded-[50px] font-semibold">
              <Link to="/documents">
                <Download className="w-4 h-4 mr-2" />
                {t('billing.viewAllDocuments')}
              </Link>
            </Button>
          </div>

          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1F1F1F] border border-white/10 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-[#36FFDB]/10 rounded-xl">
                <CreditCard className="w-6 h-6 text-[#36FFDB]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{t('billing.subscription.title')}</h2>
                <p className="text-white/60 text-sm">{t('billing.subscription.description')}</p>
              </div>
            </div>

            {loading ? (
              <div className="h-6 bg-white/10 rounded w-1/3 animate-pulse"></div>
            ) : subscription ? (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div>
                  <p className="text-white/80">{subscription.planName || t('billing.subscription.basicPlan')}</p>
                  <p className="text-2xl font-bold text-white">
                    {formatAmount(subscription.amount, subscription.currency)}
                    <span className="text-white/60 text-sm ml-1">/{subscription.interval || 'month'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getSubscriptionStatus(subscription.status).icon}
                  <span className="text-white/80">{getSubscriptionStatus(subscription.status).text}</span>
                </div>
              </div>
            ) : (
              <p className="text-white/60">{t('billing.subscription.none')}</p>
            )}
          </motion.div>

          {/* Invoices Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{t('billing.invoices.title')}</h2>
              {invoices.length > 0 && (
                <Link to="/documents" className="text-sm text-[#36FFDB] hover:text-[#36FFDB]/80">
                  {t('billing.invoices.viewAll')}
                </Link>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-[#1F1F1F] border border-white/10 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-1/4 mb-3"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-white/5 rounded w-1/6"></div>
                      <div className="h-3 bg-white/5 rounded w-1/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                <Receipt className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{t('billing.invoices.empty.title')}</h3>
                <p className="text-white/60 max-w-md mx-auto">{t('billing.invoices.empty.description')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice) => (
                  <motion.div
                    key={invoice.id}
                    whileHover={{ x: 4 }}
                    className="bg-[#1F1F1F] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <Receipt className="w-5 h-5 text-[#36FFDB]" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {invoice.description || t('billing.invoice.defaultDesc')}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-white/50">
                          <Calendar className="w-3 h-3" />
                          {formatDate(invoice.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-medium ${getPaymentStatusColor(invoice.status)}`}>
                        {formatAmount(invoice.amount, invoice.currency)}
                      </span>
                      <Button
                        asChild
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/5 hover:border-[#36FFDB]"
                      >
                        <Link to={`/documents?invoice=${invoice.id}`}>
                          <Download className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Billing;