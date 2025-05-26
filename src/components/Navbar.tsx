
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { LogOut, CloudSun } from 'lucide-react';

const Navbar = () => {
  const user = useUser();
  const supabase = useSupabaseClient();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CloudSun className="w-6 h-6 text-white" />
          <h1 className="text-xl font-bold text-white">Weather Automation</h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">
              Welcome, {user.email}
            </span>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
