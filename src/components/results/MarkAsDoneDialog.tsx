
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  completionDate: z.date({
    required_error: "A completion date is required.",
  }),
  completionNotes: z.string().min(10, {
    message: "Please provide some details about how you achieved this (min 10 characters).",
  }),
});

export type MarkAsDoneData = z.infer<typeof formSchema>;

interface MarkAsDoneDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: (data: MarkAsDoneData) => void;
}

export const MarkAsDoneDialog = ({ isOpen, onOpenChange, onDone }: MarkAsDoneDialogProps) => {
  const { toast } = useToast();
  const form = useForm<MarkAsDoneData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        completionDate: new Date(),
        completionNotes: "",
    }
  });

  const onSubmit = (data: MarkAsDoneData) => {
    onDone(data);
    onOpenChange(false);
    toast({
      title: "Habit Completed! 🎉",
      description: "Congratulations on achieving your goal!",
    });
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Habit as Completed</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="completionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Completion Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="completionNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How did you achieve it?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the steps you took and what you learned..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancel</Button>
                </DialogClose>
                <Button type="submit">Done</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
