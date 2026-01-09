
import React, { useState } from 'react';
import { Settings, Shield, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const AccountSection = ({ user, customerData }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Implement save logic with Supabase update
    setIsEditing(false);
    toast({ title: "Profile Updated", description: "Your account details have been saved." });
  };

  return (
    <div className="space-y-8">
      <div>
         <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
         <p className="text-white/60">Manage your profile and security preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-[#1F1F1F] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
           <h3 className="font-bold text-lg flex items-center gap-2">
             <Settings className="w-5 h-5 text-[#36FFDB]" /> Profile Information
           </h3>
           <Button variant="ghost" size="sm" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
             {isEditing ? 'Save Changes' : 'Edit Profile'}
           </Button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
             <label className="text-sm text-white/40">Full Name</label>
             <input 
               disabled={!isEditing}
               defaultValue={customerData?.name || ''}
               className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white disabled:opacity-50"
             />
           </div>
           <div className="space-y-2">
             <label className="text-sm text-white/40">Email Address</label>
             <input 
               disabled={true}
               defaultValue={user?.email || ''}
               className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white disabled:opacity-50"
             />
           </div>
           <div className="space-y-2">
             <label className="text-sm text-white/40">Phone Number</label>
             <input 
               disabled={!isEditing}
               defaultValue={customerData?.contact_number || ''}
               className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white disabled:opacity-50"
               placeholder="+1 (555) 000-0000"
             />
           </div>
           <div className="space-y-2">
             <label className="text-sm text-white/40">Company Name</label>
             <input 
               disabled={!isEditing}
               defaultValue={customerData?.company_name || ''}
               className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white disabled:opacity-50"
               placeholder="Optional"
             />
           </div>
           <div className="col-span-full space-y-2">
             <label className="text-sm text-white/40">Shipping Address</label>
             <textarea 
               disabled={!isEditing}
               defaultValue={customerData?.address || ''}
               rows="3"
               className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white disabled:opacity-50 resize-none"
             />
           </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-[#1F1F1F] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
           <h3 className="font-bold text-lg flex items-center gap-2">
             <Shield className="w-5 h-5 text-[#36FFDB]" /> Security & Login
           </h3>
        </div>
        <div className="p-6 space-y-6">
           <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-white/60">Add an extra layer of security to your account.</p>
              </div>
              <Button variant="outline" className="border-white/10">Setup 2FA</Button>
           </div>
           <div className="border-t border-white/5 pt-6">
              <h4 className="font-medium mb-4">Recent Login History</h4>
              <div className="space-y-3">
                 {[1, 2].map((i) => (
                   <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-white/40" />
                        <div>
                          <p>San Francisco, US <span className="text-white/40">• Chrome on macOS</span></p>
                        </div>
                      </div>
                      <span className="text-white/40">
                         {i === 1 ? 'Current Session' : '2 days ago'}
                      </span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSection;
