"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { Reminder } from "@/lib/types";
import { PlusCircleIcon, BellRingIcon, Edit2Icon, Trash2Icon, CalendarClockIcon } from "lucide-react";
import { useDataContext } from "@/context/data-context";

export default function RemindersPage() {
  const { toast } = useToast();
  const { reminders, addReminder, updateReminder, deleteReminder } = useDataContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [frequency, setFrequency] = useState<Reminder["frequency"]>("daily");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setTitle("");
    setTime("09:00");
    setFrequency("daily");
    setDescription("");
    setEditingReminder(null);
  };

  const handleOpenForm = (reminder?: Reminder) => {
    if (reminder) {
      setEditingReminder(reminder);
      setTitle(reminder.title);
      setTime(reminder.time);
      setFrequency(reminder.frequency);
      setDescription(reminder.description || "");
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    const reminderData: Omit<Reminder, "id" | "active"> = {
      title, time, frequency, description
    };

    if (editingReminder) {
      updateReminder({ ...editingReminder, ...reminderData });
      toast({ title: "Reminder Updated" });
    } else {
      addReminder({ ...reminderData, id: Date.now().toString(), active: true });
      toast({ title: "Reminder Added" });
    }
    
    setIsFormOpen(false);
    resetForm();
  };

  const toggleReminderActive = (reminder: Reminder) => {
    updateReminder({ ...reminder, active: !reminder.active });
    toast({ title: `Reminder ${!reminder.active ? 'activated' : 'deactivated'}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits & Reminders</h1>
          <p className="text-muted-foreground">
            Stay on track with your goals and routines.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingReminder ? "Edit Reminder" : "Add New Reminder"}</DialogTitle>
              <DialogDescription>
                Set up a new reminder to help you stay consistent.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">Time</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">Frequency</Label>
                <Select onValueChange={(value) => setFrequency(value as Reminder["frequency"])} value={frequency}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                    <SelectItem value="weekends">Weekends</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="(Optional)" />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">{editingReminder ? "Save Changes" : "Add Reminder"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {reminders.length === 0 ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CalendarClockIcon className="h-6 w-6 text-primary" />
                No Reminders Yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create reminders for your habits, appointments, or any important tasks.
            </p>
          </CardContent>
           <CardFooter>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create First Reminder
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${!reminder.active ? 'opacity-60 bg-muted/30' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <BellRingIcon className={`h-5 w-5 ${reminder.active ? 'text-primary' : 'text-muted-foreground'}`} />
                    {reminder.title}
                  </CardTitle>
                  <Switch
                    checked={reminder.active}
                    onCheckedChange={() => toggleReminderActive(reminder)}
                    aria-label={`Toggle reminder ${reminder.title}`}
                  />
                </div>
                <CardDescription>
                  {reminder.time} - <span className="capitalize">{reminder.frequency}</span>
                </CardDescription>
              </CardHeader>
              {reminder.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{reminder.description}</p>
                </CardContent>
              )}
              <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenForm(reminder)} aria-label="Edit reminder">
                  <Edit2Icon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => deleteReminder(reminder.id)} aria-label="Delete reminder">
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
