import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { WISH_STYLES, NOTE_SHAPES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const formSchema = z.object({
  text: z.string().min(1, { message: "Write something, duh!" }).max(100, { message: "Too long! Nobody wants to read your novel." }),
  name: z.string().optional(),
  style: z.string().min(1, { message: "Pick a style, any style!" }),
  topPosition: z.number().int().min(0).max(100),
  leftPosition: z.number().int().min(0).max(100),
  rotation: z.number().int().min(-10).max(10),
  fontSize: z.string(),
  shape: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface WishFormProps {
  onWishAdded: () => void;
}

const WishForm: FC<WishFormProps> = ({ onWishAdded }) => {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      name: "",
      style: "comic",
      shape: "square",
      topPosition: 0,
      leftPosition: 0,
      rotation: 0,
      fontSize: "1rem"
    }
  });
  
  const wishMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('POST', '/api/wishes', data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/wishes'] });
      toast({
        title: "Note Passed!",
        description: "Your embarrassing note is now floating around for everyone to see.",
      });
      form.reset({
        text: "",
        name: "",
        style: "comic",
        shape: "square",
        topPosition: 0,
        leftPosition: 0,
        rotation: 0,
        fontSize: "1rem"
      });
      onWishAdded();
    },
    onError: (error) => {
      toast({
        title: "Failed miserably",
        description: error.message || "Your note was too lame to even post",
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (data: FormData) => {
    // Set default name if not provided
    if (!data.name || data.name.trim() === "") {
      data.name = "anoni hea koi";
    }
    
    // Generate random positions if not set
    if (data.topPosition === 0) {
      data.topPosition = Math.floor(Math.random() * 80) + 10;
    }
    if (data.leftPosition === 0) {
      data.leftPosition = Math.floor(Math.random() * 80) + 10;
    }
    if (data.rotation === 0) {
      data.rotation = Math.floor(Math.random() * 20) - 10;
    }
    if (data.fontSize === "1rem") {
      const sizes = ["1rem", "1.25rem", "1.5rem", "1.75rem", "2rem"];
      data.fontSize = sizes[Math.floor(Math.random() * sizes.length)];
    }
    
    // Always use square shape
    data.shape = "square";
    
    wishMutation.mutate(data);
  };
  
  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-blue-50 border-2 border-blue-200 shadow-xl p-4 relative overflow-hidden notebook-paper">
        {/* Graph paper lines created with CSS grid in background */}
        <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] h-full w-full pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`col-${i}`} className="border-r border-blue-200"></div>
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-[repeat(20,1fr)] h-full w-full pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`row-${i}`} className="border-b border-blue-200"></div>
          ))}
        </div>
        
        {/* Red margin line */}
        <div className="absolute top-0 bottom-0 left-10 border-l-2 border-red-400"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-blue-900 ml-12 mb-4 handwritten">Add Your Note</h2>
          <div className="ml-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="your name (or leave empty for 'anoni hea koi')" 
                          {...field} 
                          className="w-full p-2 bg-transparent border-b-2 border-blue-300 border-dashed focus:ring-0 focus:border-blue-400 handwritten-input"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="write something embarrassing..." 
                          {...field} 
                          className="w-full p-2 bg-transparent border-b-2 border-blue-300 border-dashed focus:ring-0 focus:border-blue-400 handwritten-input"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full p-2 bg-transparent border-2 border-blue-300 handwritten-input">
                            <SelectValue placeholder="handwriting style..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WISH_STYLES.map((style) => (
                            <SelectItem key={style.id} value={style.id}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-amber-100 text-blue-900 font-bold py-2 px-4 border-2 border-amber-300 hover:bg-amber-200 transition-colors handwritten"
                  disabled={wishMutation.isPending}
                >
                  {wishMutation.isPending ? "PASSING NOTE..." : "PASS THIS NOTE!"}
                </Button>
              </form>
            </Form>
            <div className="text-xs text-gray-500 mt-2 text-right">
              *pretend this is folded up like in middle school*
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishForm;
