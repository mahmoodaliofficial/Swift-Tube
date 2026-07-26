'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const email = 'ma9930470@gmail.com';
    const emailSubject = encodeURIComponent(subject.trim() || 'SwiftTube Feedback');
    const emailBody = encodeURIComponent(
      `Name: ${name.trim() || 'Anonymous'}\n\nFeedback:\n${message.trim()}`
    );

    const mailtoLink = `mailto:${email}?subject=${emailSubject}&body=${emailBody}`;
    window.location.href = mailtoLink;

    // Reset and close
    setName('');
    setSubject('');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full glass border border-neon-cyan/30 text-white shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
      >
        <MessageSquare className="h-6 w-6 text-neon-cyan" />
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative z-[70] w-full max-w-md max-h-full flex flex-col"
            >
              <div className="relative rounded-3xl glass border border-white/10 shadow-2xl p-6 md:p-8 overflow-y-auto custom-scrollbar">
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-neon-cyan" />
                    Send Feedback
                  </h2>
                  <p className="text-sm text-white/60">
                    We&apos;d love to hear your thoughts or feature requests!
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-white/50 ml-2">Name (Optional)</label>
                    <input
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full h-12 bg-white/5 border border-white/10 text-white px-4 placeholder:text-white/20 rounded-xl focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-white/50 ml-2">Subject</label>
                    <input
                      placeholder="Feature request: Add new platform"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1 w-full h-12 bg-white/5 border border-white/10 text-white px-4 placeholder:text-white/20 rounded-xl focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-white/50 ml-2">Message</label>
                    <textarea
                      placeholder="Tell us what you think..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1 w-full min-h-[120px] bg-white/5 border border-white/10 text-white placeholder:text-white/20 rounded-xl p-4 focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 transition-colors resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-neon-cyan/80 to-neon-fuchsia/80 hover:from-neon-cyan hover:to-neon-fuchsia text-white font-bold shadow-lg shadow-neon-cyan/20 border-none transition-all hover:scale-[1.02]"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send via Email App
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
