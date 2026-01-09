
import React from 'react';
import { Package, TrendingUp, FileText, AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardOverview = ({ data }) => {
  const { shipments = [], invoices = [], totalSpent = 0 } = data;
  
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-[#36FFDB]/30 transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Package size={100} />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Active Shipments</p>
              <h4 className="text-3xl font-bold mt-1">
                {shipments.filter(s => s.status !== 'Delivered').length}
              </h4>
            </div>
          </div>
          <div className="text-xs text-white/40">
            {shipments.filter(s => s.status === 'In Transit').length} In Transit
          </div>
        </div>

        <div className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-[#36FFDB]/30 transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CreditCard size={100} />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-[#36FFDB]/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-[#36FFDB]" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Spent</p>
              <h4 className="text-3xl font-bold mt-1">
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
            </div>
          </div>
          <div className="text-xs text-white/40">
            Lifetime expenditure
          </div>
        </div>

        <div className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-[#36FFDB]/30 transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileText size={100} />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Pending Invoices</p>
              <h4 className="text-3xl font-bold mt-1">
                {invoices.filter(i => i.status !== 'Paid').length}
              </h4>
            </div>
          </div>
          <div className="text-xs text-white/40">
            Action required
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-[#1F1F1F] rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Shipments</h2>
          <Button variant="ghost" size="sm" className="text-[#36FFDB] hover:text-white">View All</Button>
        </div>
        
        {shipments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase">Tracking ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase">Origin &rarr; Destination</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white/40 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {shipments.slice(0, 5).map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-[#36FFDB]">{shipment.tracking_id}</td>
                    <td className="px-6 py-4 text-sm text-white/80">
                      <div className="flex items-center gap-2">
                         <span className="truncate max-w-[100px]">{shipment.origin || 'Warehouse'}</span>
                         <span className="text-white/30">&rarr;</span>
                         <span className="truncate max-w-[100px]">{shipment.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                        shipment.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        shipment.status === 'In Transit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-white/40">
            No recent shipments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
