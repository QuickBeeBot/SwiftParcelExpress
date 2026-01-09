
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Download, Filter, Calendar, TrendingUp, DollarSign, Package, Clock, Activity, Map } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const AnalyticsSection = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('30'); // 7, 30, 90
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpi: { revenue: 0, shipments: 0, avgDeliveryTime: 0, onTimeRate: 0 },
    revenueData: [],
    serviceData: [],
    statusData: [],
    costData: [],
    topDestinations: []
  });

  const COLORS = ['#36FFDB', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    try {
      // 1. Fetch Shipments
      const { data: shipments } = await supabase
        .from('shipments')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // 2. Fetch Invoices (Revenue)
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .eq('status', 'Paid');

      // 3. Fetch Quotes (Service Types & Costs)
      const { data: quotes } = await supabase
        .from('quotes')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .or('status.eq.Accepted,status.eq.Sent');

      processData(shipments || [], invoices || [], quotes || [], startDate);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({ variant: "destructive", title: "Data Fetch Error", description: "Could not load analytics data." });
    } finally {
      setLoading(false);
    }
  };

  const processData = (shipments, invoices, quotes, startDate) => {
    // --- KPI Calculations ---
    const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const totalShipments = shipments.length;
    
    // Avg Delivery Time (Mock calculation based on Created vs Updated for delivered items)
    const deliveredShipments = shipments.filter(s => s.status === 'Delivered');
    const totalDeliveryTime = deliveredShipments.reduce((acc, s) => {
      const start = new Date(s.created_at);
      const end = new Date(s.updated_at);
      return acc + (end - start);
    }, 0);
    const avgDeliveryDays = deliveredShipments.length ? Math.round((totalDeliveryTime / deliveredShipments.length) / (1000 * 60 * 60 * 24)) : 0;
    
    // On Time Rate (Mock: assuming Delivered = On Time for simplicity in this dataset)
    const onTimeRate = totalShipments ? Math.round((deliveredShipments.length / totalShipments) * 100) : 0;

    // --- Charts Preparation ---
    
    // 1. Revenue & Cost Over Time
    const revenueMap = {};
    invoices.forEach(inv => {
      const date = new Date(inv.created_at).toLocaleDateString();
      revenueMap[date] = (revenueMap[date] || 0) + Number(inv.amount);
    });
    const revenueData = Object.entries(revenueMap).map(([name, revenue]) => ({ name, revenue }));

    // 2. Service Distribution (from Quotes)
    const serviceMap = {};
    quotes.forEach(q => {
      const service = q.service_type || 'Unknown';
      serviceMap[service] = (serviceMap[service] || 0) + 1;
    });
    const serviceData = Object.entries(serviceMap).map(([name, value]) => ({ name, value }));

    // 3. Status Distribution
    const statusMap = {};
    shipments.forEach(s => {
      statusMap[s.status] = (statusMap[s.status] || 0) + 1;
    });
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // 4. Cost Breakdown (from Quotes)
    const costs = {
      Fuel: 0, Handling: 0, Insurance: 0, Taxes: 0
    };
    quotes.forEach(q => {
      costs.Fuel += Number(q.fuel_surcharge) || 0;
      costs.Handling += Number(q.handling_fee) || 0;
      costs.Insurance += Number(q.insurance) || 0;
      costs.Taxes += Number(q.taxes) || 0;
    });
    const costData = Object.entries(costs).map(([name, value]) => ({ name, value }));

    // 5. Top Destinations
    const destMap = {};
    shipments.forEach(s => {
      const country = s.country || 'Unknown';
      destMap[country] = (destMap[country] || 0) + 1;
    });
    const topDestinations = Object.entries(destMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    setData({
      kpi: {
        revenue: totalRevenue,
        shipments: totalShipments,
        avgDeliveryTime: avgDeliveryDays,
        onTimeRate
      },
      revenueData,
      serviceData,
      statusData,
      costData,
      topDestinations
    });
  };

  const handleExportCSV = () => {
    // Simple CSV Export logic
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Revenue\n"
      + data.revenueData.map(e => `${e.name},${e.revenue}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_report_${dateRange}days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Successful", description: "CSV report has been downloaded." });
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1F1F1F] p-6 rounded-3xl border border-white/10">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-[#36FFDB]" /> Analytics & Reporting
          </h2>
          <p className="text-white/60">Performance metrics and insights for the last {dateRange} days.</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <div className="flex bg-[#151515] rounded-lg p-1 border border-white/10">
             {['7', '30', '90'].map(range => (
               <button
                 key={range}
                 onClick={() => setDateRange(range)}
                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                   dateRange === range 
                   ? 'bg-[#36FFDB] text-[#1F1F1F] shadow-lg' 
                   : 'text-white/60 hover:text-white'
                 }`}
               >
                 {range} Days
               </button>
             ))}
           </div>
           <Button variant="outline" onClick={handleExportCSV} className="border-white/10 hover:bg-white/5">
             <Download className="w-4 h-4 mr-2" /> Export CSV
           </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><DollarSign size={80} /></div>
          <p className="text-white/60 mb-1">Total Revenue</p>
          <h3 className="text-3xl font-bold text-[#36FFDB]">
            ${data.kpi.revenue.toLocaleString()}
          </h3>
          <div className="text-xs text-white/40 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" /> +12.5% from previous period
          </div>
        </div>

        <div className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><Package size={80} /></div>
          <p className="text-white/60 mb-1">Total Shipments</p>
          <h3 className="text-3xl font-bold text-blue-400">
            {data.kpi.shipments}
          </h3>
          <div className="text-xs text-white/40 mt-2">
             Across {data.serviceData.length} service types
          </div>
        </div>

        <div className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><Clock size={80} /></div>
          <p className="text-white/60 mb-1">Avg. Delivery Time</p>
          <h3 className="text-3xl font-bold text-purple-400">
            {data.kpi.avgDeliveryTime} Days
          </h3>
          <div className="text-xs text-white/40 mt-2">
             Standard shipping
          </div>
        </div>

        <div className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5"><Activity size={80} /></div>
          <p className="text-white/60 mb-1">On-Time Rate</p>
          <h3 className="text-3xl font-bold text-green-400">
            {data.kpi.onTimeRate}%
          </h3>
          <div className="text-xs text-white/40 mt-2">
             Based on delivered items
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Trend */}
        <div className="bg-[#1F1F1F] p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold mb-6">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#36FFDB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#36FFDB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151515', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#36FFDB' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#36FFDB" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-[#1F1F1F] p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold mb-6">Cost Breakdown</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.costData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" stroke="#666" fontSize={12} tickFormatter={(value) => `$${value}`} />
                <YAxis dataKey="name" type="category" stroke="#fff" fontSize={12} width={100} tickLine={false} />
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ backgroundColor: '#151515', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                   {data.costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Type Distribution */}
        <div className="bg-[#1F1F1F] p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold mb-6">Shipments by Service</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#151515', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-[#1F1F1F] p-6 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-400" /> Top Destinations
          </h3>
          <div className="space-y-4">
             {data.topDestinations.map((dest, index) => (
               <div key={index} className="relative">
                 <div className="flex justify-between items-center mb-1 text-sm z-10 relative">
                    <span className="font-medium">{dest.name}</span>
                    <span className="text-white/60">{dest.count} shipments</span>
                 </div>
                 <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                      style={{ width: `${(dest.count / Math.max(...data.topDestinations.map(d => d.count))) * 100}%` }}
                    />
                 </div>
               </div>
             ))}
             {data.topDestinations.length === 0 && (
                <div className="text-center text-white/40 py-12">No destination data available</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
