
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addSubscriber } from '@/services/subscriberService';

export function FooterNewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const result = await addSubscriber(email);

    if (result.success) {
      toast({
        title: 'Subscription Successful!',
        description: result.message,
      });
      setEmail(''); // Clear input on success
    } else {
      toast({
        variant: 'destructive',
        title: 'Subscription Failed',
        description: result.message,
      });
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md mx-auto lg:mx-0 items-center space-x-2"
    >
      <Input
        type="email"
        placeholder="Enter your email address"
        className="bg-background flex-grow"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />
      <Button type="submit" size="icon" aria-label="Subscribe" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
      </Button>
    </form>
  );
}
