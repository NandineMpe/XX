import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// TypeScript declaration for Klaviyo
declare global {
  interface Window {
    _klOnsite?: any[];
  }
}

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl blur-sm"></div>
    <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl">
      {children}
    </div>
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`${delay} bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 max-w-xs`}>
    <div className="flex items-center gap-3 mb-3">
      <img src={testimonial.avatarSrc} alt={testimonial.name} className="w-10 h-10 rounded-full" />
      <div>
        <p className="font-medium text-sm">{testimonial.name}</p>
        <p className="text-xs text-muted-foreground">{testimonial.handle}</p>
      </div>
    </div>
    <p className="text-sm text-muted-foreground">{testimonial.text}</p>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Welcome</span>,
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showKlaviyoForm, setShowKlaviyoForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleRequestExclusiveAccess = () => {
    setShowKlaviyoForm(true);
    setFormSubmitted(false);
  };

  const handleCloseKlaviyoForm = () => {
    setShowKlaviyoForm(false);
    setFormSubmitted(false);
  };

  // Listen for Klaviyo form submission
  useEffect(() => {
    if (showKlaviyoForm) {
      console.log('🔄 Klaviyo modal opened, initializing form...');
      
      // Use a more reliable method to embed the Klaviyo form
      const embedKlaviyoForm = () => {
        const formContainer = document.querySelector('.klaviyo-form-TwzEQD');
        if (formContainer) {
          console.log('🔄 Embedding Klaviyo form...');
          
          // Clear the container first
          formContainer.innerHTML = '';
          
          // Create the proper embed structure
          const embedDiv = document.createElement('div');
          embedDiv.className = 'klaviyo-form-TwzEQD';
          embedDiv.setAttribute('data-klaviyo-form-id', 'TwzEQD');
          
          // Add the embed div to the container
          formContainer.appendChild(embedDiv);
          
          // Try to trigger the form embed
          if (window._klOnsite) {
            console.log('✅ Triggering Klaviyo form embed...');
            window._klOnsite.push(['embedForm', 'TwzEQD', '.klaviyo-form-TwzEQD']);
          } else {
            console.log('⏳ Klaviyo script not ready, will retry...');
            setTimeout(() => {
              if (window._klOnsite) {
                window._klOnsite.push(['embedForm', 'TwzEQD', '.klaviyo-form-TwzEQD']);
              }
            }, 1000);
          }
        }
      };

      // Start the embedding process
      embedKlaviyoForm();

      const handleKlaviyoSubmit = (event: any) => {
        console.log('📝 Klaviyo form submission event received:', event);
        // Check if the event is from our Klaviyo form
        if (event.detail && event.detail.formId === 'TwzEQD') {
          setFormSubmitted(true);
        }
      };

      // Listen for Klaviyo form submission events
      document.addEventListener('klaviyo:form:submit', handleKlaviyoSubmit);
      
      // Also check for form submission by monitoring the form element
      const checkFormSubmission = setInterval(() => {
        const formElement = document.querySelector('.klaviyo-form-TwzEQD');
        if (formElement) {
          const successElements = formElement.querySelectorAll('[data-success], .klaviyo-form-success');
          if (successElements.length > 0) {
            console.log('✅ Klaviyo form submission detected via DOM monitoring');
            setFormSubmitted(true);
            clearInterval(checkFormSubmission);
          }
        }
      }, 1000);

      return () => {
        document.removeEventListener('klaviyo:form:submit', handleKlaviyoSubmit);
        clearInterval(checkFormSubmission);
      };
    }
  }, [showKlaviyoForm]);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw]">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {/* Augentik Logo */}
            <img
              src="https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/agentic%20logo.png"
              alt="Augentik Logo"
              className="mx-auto mb-2 w-32 h-32 object-contain"
            />
            <p className="animate-element animate-delay-200 text-muted-foreground text-center">{description}</p>
            
            {/* Disclaimer */}
            <p className="animate-element animate-delay-200 text-xs text-muted-foreground/70 text-center italic">
              Sign In limited to onboarded users
            </p>

            <form className="space-y-5" onSubmit={onSignIn}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <GlassInputWrapper>
                  <input name="username" type="text" placeholder="Enter your username" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                  <span className="text-foreground/90">Keep me signed in</span>
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="hover:underline text-violet-400 transition-colors">Reset password</a>
              </div>

              <button type="submit" className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Sign In
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-border"></span>
              <span className="px-4 text-sm text-muted-foreground bg-background absolute">Don't have access?</span>
            </div>

            <div className="animate-element animate-delay-800 text-center space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Request Exclusive Access</h3>
              <p className="text-sm text-muted-foreground">
                Join the exclusive community of early adopters and get priority access to our advanced AI-powered document management platform.
              </p>
              <button 
                onClick={handleRequestExclusiveAccess} 
                className="w-full flex items-center justify-center gap-3 border border-violet-400 rounded-2xl py-4 hover:bg-violet-500/10 transition-colors text-violet-400 hover:text-violet-300"
              >
                Request Exclusive Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
              {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" /></div>}
            </div>
          )}
        </section>
      )}

      {/* Klaviyo Form Modal */}
      {showKlaviyoForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl p-6 max-w-md w-full relative">
            <button
              onClick={handleCloseKlaviyoForm}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              ✕
            </button>
            
            {!formSubmitted ? (
              <>
                <h3 className="text-lg font-semibold mb-4">Request Exclusive Access</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our exclusive community and be among the first to experience the future of AI-powered document management.
                </p>
                
                {/* Klaviyo Form Container */}
                <div className="klaviyo-form-TwzEQD" style={{ minHeight: '300px', position: 'relative' }}>
                  {/* The Klaviyo form will be embedded here */}
                </div>
                
                {/* Fallback if Klaviyo form doesn't load */}
                <div className="text-center py-4 mt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Having trouble with the form?
                  </p>
                  <button
                    onClick={() => {
                      // Try to reload the form
                      if (window._klOnsite) {
                        window._klOnsite.push(['embedForm', 'TwzEQD', '.klaviyo-form-TwzEQD']);
                      }
                    }}
                    className="text-sm text-violet-400 hover:text-violet-300 underline"
                  >
                    Try again
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">You're on the list!</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Thank you for joining our exclusive early access community. We'll be in touch soon - get ready to experience audits, reimagined.
                  </p>
                </div>
                <button
                  onClick={handleCloseKlaviyoForm}
                  className="w-full bg-violet-600 text-white rounded-2xl py-3 font-medium hover:bg-violet-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 