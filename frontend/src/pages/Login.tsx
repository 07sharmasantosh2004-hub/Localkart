import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { MessageCircle, ShieldCheck, ArrowRight, Soup, ShoppingBasket, Utensils } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      navigate('/partner');
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-start overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(6,78,59,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_40%),#FDFCFB] px-4 py-6 lg:justify-center lg:py-10">
      <div className="mb-6 flex flex-col items-center gap-4 sm:mb-8">
         <Link to="/" className="flex flex-col items-center gap-4 group">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-emerald-950/10 transition-transform duration-500 group-hover:scale-105 sm:h-20 sm:w-20">
               <img 
                 src="/logo.png" 
                 alt="LocalKart" 
                 width="80"
                 height="80"
                 decoding="async"
                 className="h-full w-full object-contain" 
               />
            </div>
            <div className="text-center">
               <span className="text-3xl font-black text-slate-950 tracking-tighter">Local<span className="text-emerald-700">Kart</span></span>
               <div className="mt-2 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-[#F59E0B]">
                  <Soup className="h-3.5 w-3.5" />
                  <ShoppingBasket className="h-3.5 w-3.5" />
                  <Utensils className="h-3.5 w-3.5" />
               </div>
            </div>
         </Link>
      </div>

      <Card className="w-full max-w-md rounded-[3rem] border-slate-100 bg-white/80 p-5 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl sm:p-6 md:p-8">
        <CardHeader className="space-y-5 pb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700">
             <ShieldCheck className="h-3.5 w-3.5" />
             Secure Shopkeeper Login
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
               Welcome Back
            </CardTitle>
            <CardDescription className="text-base font-medium text-slate-500">
               Manage your shop and customer leads in one place.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</Label>
              <Input id="email" type="email" placeholder="shop@localkart.com" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all" {...register('email')} />
              {errors.email && <p className="text-xs font-bold text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400">Password</Label>
                <a href="#" className="text-xs font-black text-emerald-700 hover:underline">Forgot?</a>
              </div>
              <Input id="password" type="password" placeholder="••••••••" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-6 font-bold focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all" {...register('password')} />
              {errors.password && <p className="text-xs font-bold text-red-500">{errors.password.message}</p>}
            </div>
            
            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100 text-sm font-bold text-red-600">
                 {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 rounded-2xl bg-[#064E3B] text-lg font-black text-white shadow-xl shadow-emerald-950/20 hover:bg-emerald-900 hover:scale-[1.02] active:scale-95 transition-all" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : (
                <span className="flex items-center justify-center gap-2">
                   Login to Studio <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
            
            <div className="space-y-4 border-t border-slate-100 pt-5 text-center">
               <p className="text-sm font-medium text-slate-500">
                  New shopkeeper? <Link to="/register-shop" className="font-black text-emerald-700 hover:underline">List your shop for free</Link>
               </p>
               <div className="flex items-center justify-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1.5">
                     <span className="text-[10px] font-black uppercase tracking-widest">Premium Support</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-slate-300" />
                  <div className="flex items-center gap-1.5">
                     <MessageCircle className="h-3.5 w-3.5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp Direct</span>
                  </div>
               </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
