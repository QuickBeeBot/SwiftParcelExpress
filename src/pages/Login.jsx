// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signIn, signUp, signInWithGoogle, sendPasswordReset } = useAuth();

  const isSignUp = searchParams.get('signup') === 'true';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  useEffect(() => {
    const emailInput = document.getElementById('email-address');
    if (emailInput) emailInput.focus();
  }, []);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await signUp(email.trim(), password);
        await userCredential.user.sendEmailVerification();
        toast({
          title: t('login.success.signupTitle'),
          description: t('login.success.signupDesc'),
          duration: 6000,
        });
      } else {
        userCredential = await signIn(email.trim(), password);
        toast({
          title: t('login.success.loginTitle'),
          description: t('login.success.loginDesc'),
        });
      }
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      console.error('Auth error:', error);
      let message = t('login.errors.generic');

      switch (error.code) {
        case 'auth/email-already-in-use':
          message = t('login.errors.emailInUse');
          break;
        case 'auth/invalid-email':
          message = t('login.errors.invalidEmail');
          break;
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          message = t('login.errors.invalidCredentials');
          break;
        case 'auth/weak-password':
          message = t('login.errors.weakPassword');
          break;
        case 'auth/too-many-requests':
          message = t('login.errors.tooManyRequests');
          break;
        default:
          message = error.message;
      }

      toast({
        title: t('login.errors.title'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: t('login.success.googleLogin'),
        description: t('login.success.loginDesc'),
      });
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast({
        title: t('login.errors.googleFailed'),
        description: t('login.errors.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      toast({
        title: t('login.errors.emailRequired'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      toast({
        title: t('login.forgotPassword.successTitle'),
        description: t('login.forgotPassword.successDesc', { email }),
      });
      setForgotPasswordMode(false);
    } catch (error) {
      toast({
        title: t('login.forgotPassword.errorTitle'),
        description: t('login.forgotPassword.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isSignUp ? t('login.signupTitlePage') : t('login.loginTitlePage')} - SwiftParcel</title>
        <meta name="description" content={t('login.metaDescription')} />
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
            <Link to="/" className="inline-block">
              <img 
                src="/images/logo.png" 
                // src="https://horizons-cdn.hostinger.com/026546b3-3a97-44bc-b1b6-02c6690099a6/edf1c70f55630599a96794cb64678dc9.png" 
                alt="SwiftParcel logo" 
                className="h-10 w-auto mx-auto"
              />
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-white">
              {isSignUp ? t('login.signupTitle') : t('login.loginTitle')}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              {isSignUp ? t('login.haveAccount') : t('login.noAccount')}{' '}
              <Link
                to={isSignUp ? '/login' : '/login?signup=true'}
                className="font-medium text-[#36FFDB] hover:text-[#36FFDB]/80 transition-colors"
              >
                {isSignUp ? t('login.loginNow') : t('login.signupNow')}
              </Link>
            </p>
          </div>

          {/* Forgot Password Mode */}
          {forgotPasswordMode ? (
            <div className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                {t('login.forgotPassword.title')}
              </h2>
              <p className="text-sm text-white/60 mb-6">
                {t('login.forgotPassword.description')}
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reset-email" className="text-white/80 text-sm">
                    {t('login.emailLabel')}
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('login.emailPlaceholder')}
                      className="pl-10 w-full bg-black/30 border border-white/20 text-white placeholder-white/50 focus:ring-0 focus:border-[#36FFDB]"
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="w-full bg-[#36FFDB] text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#36FFDB] hover:border-[#36FFDB] border-2 border-transparent rounded-[50px] font-semibold transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('login.forgotPassword.sending')}
                    </span>
                  ) : (
                    t('login.forgotPassword.sendButton')
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setForgotPasswordMode(false)}
                  className="w-full text-white/60 hover:text-[#36FFDB] hover:bg-white/5"
                >
                  ← {t('login.forgotPassword.backToLogin')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-[#1F1F1F] p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg space-y-5">
              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <Label htmlFor="email-address" className="text-white/80 text-sm">
                    {t('login.emailLabel')}
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
                      placeholder={t('login.emailPlaceholder')}
                      className="pl-10 w-full bg-black/30 border border-white/20 text-white placeholder-white/50 focus:ring-0 focus:border-[#36FFDB]"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-white/80 text-sm">
                      {t('login.passwordLabel')}
                    </Label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordMode(true)}
                      className="text-sm text-[#36FFDB] hover:text-[#36FFDB]/80"
                    >
                      {t('login.forgotPassword.link')}
                    </button>
                  </div>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('login.passwordPlaceholder')}
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

                {!isSignUp && (
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-[#36FFDB] rounded border-white/30 bg-[#1F1F1F] focus:ring-[#36FFDB]"
                    />
                    <Label htmlFor="remember-me" className="ml-2 text-sm text-white/80">
                      {t('login.rememberMe')}
                    </Label>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#36FFDB] text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#36FFDB] hover:border-[#36FFDB] border-2 border-transparent rounded-[50px] font-semibold py-5 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? t('login.signingUp') : t('login.loggingIn')}
                    </span>
                  ) : isSignUp ? (
                    t('login.signupButton')
                  ) : (
                    t('login.loginButton')
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1F1F1F] text-white/60">{t('login.orContinueWith')}</span>
                </div>
              </div>

              {/* Google Sign-In — NOW BELOW THE FORM */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full bg-transparent border-white/20 hover:bg-white/5 text-white font-medium rounded-[50px] py-5"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.08z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {isSignUp ? t('login.signupWithGoogle') : t('login.loginWithGoogle')}
                  </>
                )}
              </Button>
            </div>
          )}

          <p className="text-center text-xs text-white/40 mt-6">
            © {new Date().getFullYear()} SwiftParcel. {t('login.footer')}
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default Login;


// import React, { useState } from 'react';
// import { Helmet } from 'react-helmet-async';
// import { useNavigate, useSearchParams, Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { useToast } from '@/components/ui/use-toast';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { useAuth } from '@/contexts/FirebaseAuthContext'; // 👈 Updated context
// import { useLanguage } from '@/contexts/LanguageContext';

// const Login = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const { toast } = useToast();
//   const { t } = useLanguage();
//   const { signIn, signUp } = useAuth(); // Now from Firebase context

//   const isSignUp = searchParams.get('signup') === 'true';
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       let userCredential;
//       if (isSignUp) {
//         userCredential = await signUp(email, password);
//         // Optional: send email verification
//         await userCredential.user.sendEmailVerification();
//       } else {
//         userCredential = await signIn(email, password);
//       }

//       toast({
//         title: "Success!",
//         description: isSignUp
//           ? "Account created! Please check your email to verify."
//           : "Logged in successfully.",
//       });

//       navigate('/dashboard');
//     } catch (error) {
//       console.error('Firebase Auth Error:', error);
//       let message = error.message;

//       // Optional: user-friendly error mapping
//       switch (error.code) {
//         case 'auth/email-already-in-use':
//           message = t('login.errors.emailInUse') || "This email is already registered.";
//           break;
//         case 'auth/invalid-email':
//           message = t('login.errors.invalidEmail') || "Please enter a valid email.";
//           break;
//         case 'auth/wrong-password':
//         case 'auth/user-not-found':
//           message = t('login.errors.invalidCredentials') || "Incorrect email or password.";
//           break;
//         case 'auth/weak-password':
//           message = t('login.errors.weakPassword') || "Password must be at least 6 characters.";
//           break;
//         default:
//           message = error.message;
//       }

//       toast({
//         title: "Authentication Error",
//         description: message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Helmet>
//         <title>{isSignUp ? "Sign Up" : "Login"} - Parcel</title>
//         <meta name="description" content={`Access your Parcel account or create a new one.`} />
//       </Helmet>
//       <div className="flex min-h-screen items-center justify-center bg-[#151515] py-12 px-4 sm:px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="w-full max-w-md space-y-8 bg-[#1F1F1F] p-8 rounded-3xl border border-white/10 shadow-lg"
//         >
//           <div>
//             <Link to="/" className="flex justify-center mb-6">
//               <img 
//                 src="https://horizons-cdn.hostinger.com/026546b3-3a97-44bc-b1b6-02c6690099a6/edf1c70f55630599a96794cb64678dc9.png" 
//                 alt="Parcel logo" 
//                 className="h-30 w-auto" // ✅ Fixed: h-42 is invalid; use h-10 or similar
//               />
//             </Link>
//             <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
//               {isSignUp ? t('login.signupTitle') : t('login.loginTitle')}
//             </h2>
//             <p className="mt-2 text-center text-sm text-white/60">
//               {isSignUp ? t('login.haveAccount') : t('login.noAccount')}{' '}
//               <Link to={isSignUp ? "/login" : "/login?signup=true"} className="font-medium text-[#36FFDB] hover:text-[#36FFDB]/80">
//                 {isSignUp ? t('login.loginNow') : t('login.signupNow')}
//               </Link>
//             </p>
//           </div>
//           <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//             <div>
//               <Label htmlFor="email-address" className="text-white">
//                 {t('login.emailLabel')}
//               </Label>
//               <Input
//                 id="email-address"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className="relative block w-full appearance-none rounded-md border border-white/20 bg-black/20 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[#36FFDB] focus:outline-none focus:ring-[#36FFDB] sm:text-sm"
//                 placeholder={t('login.emailPlaceholder')}
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <div>
//               <Label htmlFor="password" className="text-white">
//                 {t('login.passwordLabel')}
//               </Label>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 required
//                 className="relative block w-full appearance-none rounded-md border border-white/20 bg-black/20 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[#36FFDB] focus:outline-none focus:ring-[#36FFDB] sm:text-sm"
//                 placeholder={t('login.passwordPlaceholder')}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//             <Button
//               type="submit"
//               className="group relative flex w-full justify-center rounded-[50px] border border-transparent bg-[#36FFDB] py-2 px-4 text-sm font-medium text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#36FFDB] hover:border-[#36FFDB] focus:outline-none focus:ring-2 focus:ring-[#36FFDB] focus:ring-offset-2 transition-all"
//               disabled={loading}
//             >
//               {loading 
//                 ? (isSignUp ? t('login.signingUp') : t('login.loggingIn')) 
//                 : (isSignUp ? t('login.signupButton') : t('login.loginButton'))}
//             </Button>
//           </form>
//         </motion.div>
//       </div>
//     </>
//   );
// };

// export default Login;







