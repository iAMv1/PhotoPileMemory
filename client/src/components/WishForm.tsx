import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { WISH_STYLES } from '@/lib/constants';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  text: z.string().min(1, { message: "Please enter a wish" }).max(100, { message: "Wish is too long (max 100 characters)" }),
  style: z.string().min(1, { message: "Please select a style" }),
  topPosition: z.number().int().min(0).max(100),
  leftPosition: z.number().int().min(0).max(100),
  rotation: z.number().int().min(-10).max(10),
  fontSize: z.string()
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
      style: "comic",
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
        title: "Wish added!",
        description: "Your birthday wish is now floating!",
      });
      form.reset({
        text: "",
        style: "comic",
        topPosition: 0,
        leftPosition: 0,
        rotation: 0,
        fontSize: "1rem"
      });
      onWishAdded();
    },
    onError: (error) => {
      toast({
        title: "Error adding wish",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (data: FormData) => {
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
    
    wishMutation.mutate(data);
  };
  
  return (
    <Card className="max-w-md mx-auto my-8 bg-gradient-to-r from-fuchsia-500 to-cyan-400 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Add Your Birthday Wish!</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Your birthday wish here..." 
                      {...field} 
                      className="w-full p-2 rounded text-black"
                    />
                  </FormControl>
                  <FormMessage />
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
                      <SelectTrigger className="w-full p-2 rounded text-black bg-white">
                        <SelectValue placeholder="Select a style" />
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-lime-400 text-black font-bold py-2 px-4 rounded hover:bg-lime-300 transition-colors"
              disabled={wishMutation.isPending}
            >
              {wishMutation.isPending ? "ADDING..." : "MAKE IT FLOAT!"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WishForm;
