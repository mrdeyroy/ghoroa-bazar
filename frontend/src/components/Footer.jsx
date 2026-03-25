import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Send, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#064734] text-[#E0FFC2] pt-20 pb-10 overflow-hidden mt-auto">
      {/* Decorative Wave at the top matching body background or white */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
        <svg
          className="relative block w-full h-[40px] md:h-[60px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white"
          ></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-[8%] relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-12">
          
          {/* Column 1: Brand & Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group inline-flex">
              <div className="bg-white p-1.5 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                <img src="/gblogo.png" alt="Logo" className="h-10 w-auto object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#FFFDD0] text-2xl font-black leading-none tracking-tight">
                  Ghoroa <span className="text-[#ffa500]">Bazar</span>
                </span>
                <span className="text-[10px] font-bold text-[#E0FFC2]/80 uppercase tracking-widest mt-1.5">
                  Nature to doorstep
                </span>
              </div>
            </Link>
            
            <p className="text-sm text-[#E0FFC2]/90 leading-relaxed max-w-sm">
              Your trusted source for safe, healthy, and organic food in Bangladesh. From premium mustard oil to fresh nuts and pure honey.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ffa500] hover:text-white transition-all transform hover:-translate-y-1">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ffa500] hover:text-white transition-all transform hover:-translate-y-1">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#ffa500] hover:text-white transition-all transform hover:-translate-y-1">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h4 className="text-base font-black text-[#FFFDD0] uppercase tracking-wider relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#ffa500]"></span>
            </h4>
            <div className="flex flex-col space-y-3 pt-2">
              {[
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/#products-section' },
                { name: 'Contact', path: '/contact' },
                { name: 'FAQ', path: '/faq' }
              ].map((link, idx) => (
                <Link 
                  key={idx} 
                  to={link.path} 
                  className="text-sm text-[#E0FFC2]/80 hover:text-[#FFFDD0] hover:translate-x-2 transition-all font-medium flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffa500] opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-6">
            <h4 className="text-base font-black text-[#FFFDD0] uppercase tracking-wider relative inline-block">
              Customer Care
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#ffa500]"></span>
            </h4>
            <div className="flex flex-col space-y-3 pt-2">
              {[
                { name: 'About Us', path: '/#about-section' },
                { name: 'Return Policy', path: '/return-policy' },
                { name: 'Refund Policy', path: '/refund-policy' },
                { name: 'Customer Care', path: '/contact' }
              ].map((link, idx) => (
                <Link 
                  key={idx} 
                  to={link.path} 
                  className="text-sm text-[#E0FFC2]/80 hover:text-[#FFFDD0] hover:translate-x-2 transition-all font-medium flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffa500] opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div className="space-y-6">
            <h4 className="text-base font-black text-[#FFFDD0] uppercase tracking-wider relative inline-block">
              Stay in Touch
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#ffa500]"></span>
            </h4>
            
            <div className="pt-2 space-y-4">
              <p className="text-xs text-[#E0FFC2]/80 leading-relaxed">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white/10 border border-[#E0FFC2]/20 text-[#FFFDD0] placeholder-[#E0FFC2]/50 text-sm rounded-full py-2.5 px-4 pr-12 outline-none focus:border-[#ffa500] focus:bg-white/20 transition-all"
                />
                <button className="absolute right-1 top-1 bottom-1 w-9 flex items-center justify-center bg-[#ffa500] text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 group-hover:scale-95 active:scale-90">
                  <Send size={14} className="-ml-0.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <p className="text-sm text-[#E0FFC2]/80 flex items-start gap-3">
                <MapPin size={16} className="text-[#ffa500] shrink-0 mt-0.5" />
                <span>Kolkata, West Bengal, India</span>
              </p>
              <p className="text-sm text-[#E0FFC2]/80 flex items-center gap-3">
                <Phone size={16} className="text-[#ffa500] shrink-0" />
                <span className="font-medium">+91 880019300X</span>
              </p>
              <p className="text-sm text-[#E0FFC2]/80 flex items-center gap-3">
                <Mail size={16} className="text-[#ffa500] shrink-0" />
                <span className="font-medium">contact@ghoroabazar.shop</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#E0FFC2]/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-medium text-[#E0FFC2]/50 tracking-white uppercase tracking-widest">
            © {new Date().getFullYear()} Ghoroa Bazar. All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#E0FFC2]/60 font-black uppercase tracking-widest mr-1">We Accept</span>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/5">
              <img src="/assets/gpay.png" alt="Google Pay" className="h-4 object-contain" />
              <img src="/assets/cod.png" alt="Cash on Delivery" className="h-4 object-contain opacity-90" />
              <img src="/assets/mastercard.png" alt="Mastercard" className="h-4 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
