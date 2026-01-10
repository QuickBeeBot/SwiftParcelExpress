// src/components/pages/TrackShipment.jsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const TrackShipment = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrackShipment = (e) => {
    e.preventDefault();
    const id = trackingId.trim().toUpperCase();

    if (!id) {
      toast({
        title: t('track.errors.requiredTitle'),
        description: t('track.errors.requiredDesc'),
        variant: "destructive"
      });
      return;
    }

    // Validate format if needed (e.g., SP2025XYZ)
    // Optional: add regex validation here

    setLoading(true);
    try {
      // Redirect to your existing tracking page with query param
      navigate(`/tracking?tracking=${encodeURIComponent(id)}`);
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: t('track.errors.genericTitle'),
        description: t('track.errors.genericDesc'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('track.pageTitle')} - SwiftParcel</title>
        <meta name="description" content={t('track.metaDescription')} />
      </Helmet>

      <section className="relative min-h-[500px] flex items-center justify-center py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-80" 
            alt="Logistic network background" 
            src="/images/track_image.webp" 
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6 text-balance text-white"
          >
            {t('track.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          >
            {t('track.subtitle')}
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleTrackShipment}
            className="max-w-xl mx-auto bg-[#1F1F1F] p-4 rounded-full shadow-lg flex items-center border border-white/10 backdrop-blur-sm"
          >
            <Search className="w-6 h-6 text-white/60 ml-2" />
            <input
              type="text"
              placeholder={t('track.placeholder')}
              className="flex-grow bg-transparent outline-none border-none text-white px-4 py-3 placeholder-white/50"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-white rounded-full px-8 py-3 text-lg font-semibold transition-all duration-300"
              disabled={loading}
            >
              {loading ? t('track.tracking') : t('track.button')}
            </Button>
          </motion.form>
        </div>
      </section>

      {/* No results display here — all handled by /dashboard/tracking */}
    </>
  );
};

export default TrackShipment;

// import React, { useState } from 'react';
// import { Helmet } from 'react-helmet-async';
// import { motion } from 'framer-motion';
// import { Search, Package, CheckCircle, Truck, MapPin, XCircle } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useToast } from '@/components/ui/use-toast';
// import { supabase } from '@/lib/customSupabaseClient';
// import { useLanguage } from '@/contexts/LanguageContext';
// const TrackShipment = () => {
//   const {
//     toast
//   } = useToast();
//   const {
//     t
//   } = useLanguage();
//   const [trackingId, setTrackingId] = useState('');
//   const [shipmentData, setShipmentData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const handleTrackShipment = async e => {
//     e.preventDefault();
//     if (!trackingId) {
//       toast({
//         title: "Tracking ID Required",
//         description: "Please enter a tracking ID to search.",
//         variant: "destructive"
//       });
//       return;
//     }
//     setLoading(true);
//     setShipmentData(null);
//     try {
//       const {
//         data,
//         error
//       } = await supabase.from('shipments').select('*').eq('tracking_id', trackingId).maybeSingle();
//       if (error) throw error;
//       if (data) {
//         setShipmentData(data);
//         toast({
//           title: "Shipment Found",
//           description: `Details for tracking ID: ${trackingId}`
//         });
//       } else {
//         toast({
//           title: "Shipment Not Found",
//           description: `No shipment found for tracking ID: ${trackingId}`,
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error('Error tracking shipment:', error);
//       toast({
//         title: "Tracking Error",
//         description: error.message || "An unexpected error occurred while tracking your shipment.",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };
//   const getStatusIcon = status => {
//     switch (status) {
//       case 'Pending':
//         return <Package className="w-8 h-8 text-yellow-500" />;
//       case 'In Transit':
//         return <Truck className="w-8 h-8 text-blue-500" />;
//       case 'Delivered':
//         return <CheckCircle className="w-8 h-8 text-green-500" />;
//       default:
//         return <XCircle className="w-8 h-8 text-gray-500" />;
//     }
//   };
//   const getStatusColor = status => {
//     switch (status) {
//       case 'Pending':
//         return 'text-yellow-500';
//       case 'In Transit':
//         return 'text-blue-500';
//       case 'Delivered':
//         return 'text-green-500';
//       default:
//         return 'text-gray-500';
//     }
//   };
//   return <>
//       <Helmet>
//         <title>Track Shipment - SwiftParcel</title>
//         <meta name="description" content="Track your SwiftParcel shipment in real-time. Enter your tracking ID to get the latest status updates." />
//       </Helmet>

//       <section className="relative min-h-[500px] flex items-center justify-center py-20 overflow-hidden">
//         <div className="absolute inset-0 z-0">
//           <img className="w-full h-full object-cover opacity-80" alt="Logistic network background" src="/images/track_image.webp" />
//           {/* Dark overlay added */}
//           <div className="absolute inset-0 bg-black/20" />
//         </div>

//         <div className="container mx-auto px-4 relative z-10 text-center">
//           <motion.h1 initial={{
//           opacity: 0,
//           y: 30
//         }} animate={{
//           opacity: 1,
//           y: 0
//         }} transition={{
//           duration: 0.6
//         }} className="text-5xl md:text-6xl font-bold mb-6 text-balance">
//             {t('track.title')}
//           </motion.h1>
//           <motion.p initial={{
//           opacity: 0,
//           y: 30
//         }} animate={{
//           opacity: 1,
//           y: 0
//         }} transition={{
//           duration: 0.6,
//           delay: 0.2
//         }} className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
//             {t('track.subtitle')}
//           </motion.p>

//           <motion.form initial={{
//           opacity: 0,
//           y: 30
//         }} animate={{
//           opacity: 1,
//           y: 0
//         }} transition={{
//           duration: 0.6,
//           delay: 0.4
//         }} onSubmit={handleTrackShipment} className="max-w-xl mx-auto bg-[#1F1F1F] p-4 rounded-full shadow-lg flex items-center border border-white/10 backdrop-blur-sm">
//             <Search className="w-6 h-6 text-white/60 ml-2" />
//             <input type="text" placeholder={t('track.placeholder')} className="flex-grow bg-transparent outline-none border-none text-white px-4 py-3" value={trackingId} onChange={e => setTrackingId(e.target.value)} />
//             <Button type="submit" className="bg-[#36FFDB] text-[#1F1F1F] hover:bg-white rounded-full px-8 py-3 text-lg font-semibold transition-all duration-300" disabled={loading}>
//               {loading ? t('track.tracking') : t('track.button')}
//             </Button>
//           </motion.form>
//         </div>
//       </section>

//       {shipmentData && <motion.div initial={{
//       opacity: 0,
//       y: 50
//     }} animate={{
//       opacity: 1,
//       y: 0
//     }} transition={{
//       duration: 0.5
//     }} className="container mx-auto px-4 py-16">
//           <div className="bg-[#1F1F1F] rounded-3xl p-8 border border-white/10 shadow-xl max-w-3xl mx-auto">
//             <h2 className="text-3xl font-bold mb-6 text-center">{t('track.shipmentDetails')}</h2>
//             <div className="flex items-center justify-center gap-4 mb-8">
//               {getStatusIcon(shipmentData.status)}
//               <span className={`text-2xl font-bold ${getStatusColor(shipmentData.status)}`}>
//                 {shipmentData.status}
//               </span>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-white/80">
//               <div className="space-y-1">
//                 <p className="text-white/60 text-sm">{t('track.trackingID')}</p>
//                 <p className="font-bold text-lg text-[#36FFDB]">{shipmentData.tracking_id}</p>
//               </div>
//               <div className="space-y-1">
//                 <p className="text-white/60 text-sm">{t('track.customerName')}</p>
//                 <p>{shipmentData.customer_name}</p>
//               </div>
//               <div className="space-y-1">
//                 <p className="text-white/60 text-sm">{t('track.destination')}</p>
//                 <p className="flex items-center gap-2">
//                   <MapPin className="w-4 h-4 text-[#36FFDB]" />
//                   {shipmentData.address}, {shipmentData.country}
//                 </p>
//               </div>
//               <div className="space-y-1">
//                 <p className="text-white/60 text-sm">{t('track.packageInfo')}</p>
//                 <p>{shipmentData.package_info}</p>
//               </div>
//               <div className="space-y-1">
//                 <p className="text-white/60 text-sm">{t('track.createdAt')}</p>
//                 <p>{new Date(shipmentData.created_at).toLocaleDateString()}</p>
//               </div>
//               <div className="space-y-1">
//                 <p className="text-white/60 text-sm">{t('track.lastUpdate')}</p>
//                 <p>{new Date(shipmentData.updated_at).toLocaleString()}</p>
//               </div>
//             </div>

//             <div className="mt-10 text-center">
//               <Button onClick={() => toast({
//             title: "Map View",
//             description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
//           })} className="bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-full px-6 py-3">
//                 {t('track.viewOnMap')}
//               </Button>
//             </div>
//           </div>
//         </motion.div>}
//     </>;
// };
// export default TrackShipment;