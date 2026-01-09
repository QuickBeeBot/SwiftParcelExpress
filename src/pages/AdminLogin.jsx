// src/pages/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-focus email
  useEffect(() => {
    const emailInput = document.getElementById('email-address');
    if (emailInput) emailInput.focus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);

    try {
      const auth = getAuth();
      const db = getFirestore();

      // Step 1: Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Step 2: Get user role from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error("User profile not found.");
      }

      const userData = userDocSnap.data();

      // Step 3: Check if user is admin
      if (userData.role !== 'admin') {
        await auth.signOut();
        throw new Error("You are not authorized to access the admin panel.");
      }

      toast({
        title: "Admin Login Successful!",
        description: "Redirecting to Admin Dashboard.",
      });

      setTimeout(() => navigate('/admin/dashboard'), 500);
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Access Denied",
        description: error.message || "Invalid credentials or insufficient permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - SwiftParcel</title>
        <meta name="description" content="Secure admin access to SwiftParcel logistics dashboard." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#151515] to-black py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-block">
              <img 
                src="/images/swiftparcel_logo.webp"
                alt="SwiftParcel logo"
                className="h-46 w-auto mx-auto"
              />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-white">Admin Login</h1>
            <p className="mt-2 text-sm text-white/60">
              Access the SwiftParcel administration panel.
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email-address" className="text-white/80 text-sm">
                  Email address
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input
                    id="email-address"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@swiftparcel.com"
                    className="pl-10 w-full bg-black/30 border border-white/20 text-white placeholder-white/50 focus:ring-0 focus:border-[#36FFDB]"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-white/80 text-sm">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 w-full bg-black/30 border border-white/20 text-white placeholder-white/50 focus:ring-0 focus:border-[#36FFDB]"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#36FFDB] rounded border-white/30 bg-[#1F1F1F] focus:ring-[#36FFDB]"
                />
                <Label htmlFor="remember-me" className="ml-2 text-sm text-white/80">
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#36FFDB] text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#36FFDB] hover:border-[#36FFDB] border-2 border-transparent rounded-[50px] font-semibold py-5 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  'Login to Admin Dashboard'
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-white/40 mt-6">
            © {new Date().getFullYear()} SwiftParcel. Secure admin access.
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLogin;

// // src/pages/AdminLogin.jsx
// import React, { useState } from 'react';
// import { Helmet } from 'react-helmet-async';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// import { getFirestore, doc, getDoc } from 'firebase/firestore';
// import { useToast } from '@/components/ui/use-toast';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';

// const AdminLogin = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const auth = getAuth();
//       const db = getFirestore();

//       // Step 1: Sign in with Firebase
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Step 2: Get user role from Firestore
//       const userDocRef = doc(db, 'users', user.uid);
//       const userDocSnap = await getDoc(userDocRef);

//       if (!userDocSnap.exists()) {
//         throw new Error("User profile not found.");
//       }

//       const userData = userDocSnap.data();

//       // Step 3: Check if user is admin
//       if (userData.role !== 'admin') {
//         await auth.signOut(); // Log out non-admins
//         throw new Error("You are not authorized to access the admin panel.");
//       }

//       toast({
//         title: "Admin Login Successful!",
//         description: "Redirecting to Admin Dashboard.",
//       });

//       navigate('/admin/dashboard');
//     } catch (error) {
//       toast({
//         title: "Admin Login Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Admin Login - Parcel</title>
//         <meta name="description" content="Admin login page for Parcel logistics dashboard." />
//       </Helmet>
//       <div className="flex min-h-screen items-center justify-center bg-[#151515] py-12 px-4 sm:px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="w-full max-w-md space-y-8 bg-[#1F1F1F] p-8 rounded-3xl border border-white/10 shadow-lg"
//         >
//           <div>
//             <div className="flex justify-center mb-6">
//               <img 
//                 src="/images/swiftparcel_logo.webp"
//                 alt="Parcel logo"
//                 className="h-50 w-auto" // ✅ Fixed: h-42 is invalid
//               />
//             </div>
//             <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
//               Admin Login
//             </h2>
//             <p className="mt-2 text-center text-sm text-white/60">
//               Access the Parcel administration panel.
//             </p>
//           </div>
//           <form className="mt-8 space-y-6" onSubmit={handleLogin}>
//             <div>
//               <Label htmlFor="email-address" className="text-white">
//                 Email address
//               </Label>
//               <Input
//                 id="email-address"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className="relative block w-full appearance-none rounded-md border border-white/20 bg-black/20 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[#36FFDB] focus:outline-none focus:ring-[#36FFDB] sm:text-sm"
//                 placeholder="Email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <div>
//               <Label htmlFor="password" className="text-white">
//                 Password
//               </Label>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 required
//                 className="relative block w-full appearance-none rounded-md border border-white/20 bg-black/20 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[#36FFDB] focus:outline-none focus:ring-[#36FFDB] sm:text-sm"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//             <Button
//               type="submit"
//               className="group relative flex w-full justify-center rounded-[50px] border border-transparent bg-[#36FFDB] py-2 px-4 text-sm font-medium text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#36FFDB] hover:border-[#36FFDB] focus:outline-none focus:ring-2 focus:ring-[#36FFDB] focus:ring-offset-2 transition-all"
//               disabled={loading}
//             >
//               {loading ? "Logging in..." : "Login"}
//             </Button>
//           </form>
//         </motion.div>
//       </div>
//     </>
//   );
// };

// export default AdminLogin;



