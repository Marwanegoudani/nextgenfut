'use client';

import { useRouter } from 'next/navigation';
import { CreateMatchForm } from './CreateMatchForm';
import { toast } from 'sonner';

export function CreateMatchClient() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      // Combine date and time
      const dateTime = new Date(`${data.date}T${data.time}`);

      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dateTime.toISOString(),
          location: data.location,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create match');
      }

      toast.success('Match created successfully');
      router.push('/matches');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create match');
      throw error; // Re-throw to be handled by the form
    }
  };

  return <CreateMatchForm onSubmit={handleSubmit} />;
} 