
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailContent: string;
  userEmail: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, emailContent, userEmail }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailContent);
      setCopied(true);
      toast.success('Email content copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const openEmailClient = () => {
    const subject = encodeURIComponent('🌤️ Weather Intelligence Report');
    const body = encodeURIComponent(emailContent);
    const mailtoLink = `mailto:${userEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scale-in">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Email Report Ready
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Your weather report is ready! You can copy the content below or open it in your email client.
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto border">
            <pre className="text-sm whitespace-pre-wrap font-mono">{emailContent}</pre>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={copyToClipboard}
              className="flex-1 flex items-center gap-2"
              variant={copied ? "default" : "outline"}
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Content'}
            </Button>
            
            <Button 
              onClick={openEmailClient}
              className="flex-1 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Open in Email Client
            </Button>
            
            <Button 
              onClick={onClose}
              variant="outline"
              className="px-6"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailModal;
