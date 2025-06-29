import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

// Session timeout in milliseconds (20 minutes of inactivity)
const SESSION_TIMEOUT = 20 * 60 * 1000;
// Warning before timeout (2 minutes)
const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000;

export function SessionTimeout() {
  const { isAuthenticated, refreshToken, logout } = useAuth();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    // Clear existing timers
    const warningTimer = window.sessionWarningTimer;
    const logoutTimer = window.sessionLogoutTimer;
    
    if (warningTimer) clearTimeout(warningTimer);
    if (logoutTimer) clearTimeout(logoutTimer);

    // Set new timers
    window.sessionWarningTimer = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(WARNING_BEFORE_TIMEOUT / 1000); // Convert to seconds
    }, SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT);

    window.sessionLogoutTimer = setTimeout(() => {
      handleTimeout();
    }, SESSION_TIMEOUT);
  }, [isAuthenticated]);

  const handleTimeout = useCallback(async () => {
    setShowWarning(false);
    await logout();
    toast({
      title: "Η συνεδρία σας έληξε",
      description: "Αποσυνδεθήκατε λόγω αδράνειας για λόγους ασφαλείας.",
      variant: "destructive",
    });
  }, [logout, toast]);

  const handleContinue = useCallback(async () => {
    setShowWarning(false);
    try {
      await refreshToken();
      resetTimer();
      toast({
        title: "Η συνεδρία σας ανανεώθηκε",
        description: "Μπορείτε να συνεχίσετε να εργάζεστε.",
      });
    } catch (error) {
      console.error('Failed to refresh session:', error);
      handleTimeout();
    }
  }, [refreshToken, resetTimer, toast, handleTimeout]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initial timer setup
    resetTimer();

    return () => {
      // Clean up
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      const warningTimer = window.sessionWarningTimer;
      const logoutTimer = window.sessionLogoutTimer;
      
      if (warningTimer) clearTimeout(warningTimer);
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, [isAuthenticated, resetTimer]);

  // Update countdown timer
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Προειδοποίηση αδράνειας συνεδρίας</AlertDialogTitle>
          <AlertDialogDescription>
            Η συνεδρία σας θα λήξει σε {formatTime(timeRemaining)} λόγω αδράνειας. 
            Θέλετε να συνεχίσετε να εργάζεστε;
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleTimeout}>
            Αποσύνδεση
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue}>
            Συνέχεια εργασίας
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Extend Window interface to include our timers
declare global {
  interface Window {
    sessionWarningTimer?: NodeJS.Timeout;
    sessionLogoutTimer?: NodeJS.Timeout;
  }
}