import { FC, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

interface TimeCapsuleProps {
  themeClass?: string;
  userId?: number;
}

interface TimeCapsuleMessage {
  id: number;
  hour: number;
  message: string;
}

interface TimeCapsuleResponse {
  message: TimeCapsuleMessage;
}

// Form schema with both fields needed for the form
const formSchema = z.object({
  hour: z.number()
    .min(0, { message: "Hour must be at least 0" })
    .max(23, { message: "Hour must be at most 23" }),
  message: z.string()
    .min(1, { message: "Message is required" })
    .max(200, { message: "Message must be at most 200 characters" }),
  authorName: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

const TimeCapsule: FC<TimeCapsuleProps> = ({ themeClass, userId }) => {
  const { toast } = useToast();
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [currentMinute, setCurrentMinute] = useState<number>(new Date().getMinutes());
  const [showForm, setShowForm] = useState<boolean>(false);
  
  const { data, isLoading } = useQuery<TimeCapsuleResponse>({
    queryKey: userId ? [`/api/time-capsule-messages/current?userId=${userId}`] : ['/api/time-capsule-messages/current'],
    queryFn: async () => {
      const url = userId ? `/api/time-capsule-messages/current?userId=${userId}` : '/api/time-capsule-messages/current';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch time capsule message');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hour: currentHour,
      message: "",
      authorName: ""
    }
  });

  const messageMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Combine the message and author name
      const finalMessage = data.authorName && data.authorName.trim() !== ""
        ? `${data.message} - from ${data.authorName}`
        : data.message;

      // Send only hour and message to match database schema
      return apiRequest('/api/time-capsule-messages', {
        method: 'POST',
        body: {
          hour: data.hour,
          message: finalMessage,
          userId
        }
      });
    },
    onSuccess: async () => {
      const queryKey = userId ? [`/api/time-capsule-messages/current?userId=${userId}`] : ['/api/time-capsule-messages/current'];
      await queryClient.invalidateQueries({ queryKey: ['/api/time-capsule-messages'] });
      await queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Message Scheduled!",
        description: "Your message has been added to the time capsule.",
      });
      form.reset({
        hour: currentHour,
        message: "",
        authorName: ""
      });
      setShowForm(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add message",
        description: error.message || "An error occurred while adding your message",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormData) => {
    messageMutation.mutate(data);
  };
  
  // Update the current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setCurrentMinute(now.getMinutes());
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to get styled clock number
  const getStyledClockNumber = (num: number) => {
    // Format the number with leading zero if needed
    return num < 10 ? `0${num}` : num.toString();
  };

  return (
    <div className="w-[300px] relative">
      {/* Clock - now more fun! */}
      <div className="mb-4 text-right">
        <motion.div
          className="inline-block p-4 bg-white rounded-full shadow-lg border-4 border-pink-300"
          animate={{ 
            rotate: [0, 3, 0, -3, 0],
            scale: [1, 1.05, 1, 1.05, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="handwritten-messy text-3xl text-blue-900 font-bold flex items-center justify-center">
            <span className="text-2xl mr-1 bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text shadow-lg">{getStyledClockNumber(currentHour)}</span>
            <span className="animate-pulse mx-1 text-red-500">:</span>
            <span className="text-2xl ml-1 bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text shadow-lg">{getStyledClockNumber(currentMinute)}</span>
          </div>
          <div className="text-xs text-pink-500 italic text-center font-bold">
            birthday time!
          </div>
        </motion.div>
      </div>
      
      {/* Sticky note appearance */}
      <div className="bg-yellow-100 p-6 shadow-lg relative transform -rotate-1">
        {/* Small grid pattern for sticky note */}
        <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] h-full w-full opacity-10 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={`sticky-col-${i}`} className="border-r border-black"></div>
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-[repeat(40,1fr)] h-full w-full opacity-10 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={`sticky-row-${i}`} className="border-b border-black"></div>
          ))}
        </div>
      
        <h3 className="text-2xl font-bold text-yellow-800 handwritten mb-4">The Time Capsule</h3>
        <p className="text-yellow-800 mb-4 handwritten-neat text-sm">
          Messages appear at specific hours! <br />Add your own timed message below.
        </p>
        
        <motion.div 
          className="p-5 bg-white rounded shadow-inner text-center"
          initial={{ opacity: 0.8 }}
          animate={{ 
            opacity: [0.8, 1, 0.8],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3,
            ease: "easeInOut" 
          }}
        >
          <div className="handwritten text-lg font-bold text-blue-900">
            {isLoading ? (
              "Loading message..."
            ) : data?.message ? (
              data.message.message
            ) : (
              "Waiting for the right moment..."
            )}
          </div>
        </motion.div>
        
        {!showForm ? (
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full mt-4 bg-amber-100 text-amber-900 font-bold py-2 border-2 border-amber-300 hover:bg-amber-200 transition-colors handwritten text-sm"
          >
            Add Your Own Message
          </Button>
        ) : (
          <div className="mt-4 p-4 bg-white rounded shadow-inner">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="hour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="handwritten text-amber-900">Show at hour (0-23):</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          min={0}
                          max={23}
                          className="handwritten-input"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="handwritten text-amber-900">Birthday Message:</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="handwritten-input"
                          placeholder="Your secret birthday message..."
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="handwritten text-amber-900">Your Name (optional):</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="handwritten-input"
                          placeholder="Sign your message..."
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-2">
                  <Button 
                    type="submit"
                    className="flex-1 bg-green-100 text-green-900 font-bold py-2 border-2 border-green-300 hover:bg-green-200 transition-colors handwritten text-sm"
                    disabled={messageMutation.isPending}
                  >
                    {messageMutation.isPending ? "Adding..." : "Add Message"}
                  </Button>
                  
                  <Button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-red-100 text-red-900 font-bold py-2 border-2 border-red-300 hover:bg-red-200 transition-colors handwritten text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        
        {/* Tape at the top */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-gray-100 opacity-60"></div>
        
        {/* Current time */}
        <div className="absolute bottom-1 right-2 text-xs text-yellow-800">
          Current Hour: {currentHour}:00
        </div>
      </div>
    </div>
  );
};

export default TimeCapsule;
