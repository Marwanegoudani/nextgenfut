import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { LocationAutocomplete, Location } from '@/components/ui/location-autocomplete';

const createMatchSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.object({
    name: z.string().min(1, 'Location name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }),
});

type FormData = z.infer<typeof createMatchSchema>;

interface CreateMatchFormProps {
  onSubmit: (data: FormData) => Promise<void>;
}

export function CreateMatchForm({ onSubmit }: CreateMatchFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      date: '',
      time: '',
      location: {
        name: '',
        address: '',
        city: '',
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      },
    },
  });

  const handleLocationSelect = (location: Location) => {
    form.setValue('location', location, { shouldValidate: true });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      form.reset();
      toast.success('Match created successfully');
    } catch (error) {
      toast.error('Failed to create match. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={() => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationAutocomplete
                  onLocationSelect={handleLocationSelect}
                  placeholder="Search for a location..."
                  defaultValue={form.getValues('location.address')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Match'}
        </Button>
      </form>
    </Form>
  );
} 