import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Plus,
  Clock,
  Calendar,
  Pill,
  TestTube,
  Stethoscope,
  Edit,
  Trash2,
  CheckCircle
} from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  type: 'medicine' | 'lab-test' | 'appointment';
  description: string;
  datetime: string;
  recurring: boolean;
  completed: boolean;
  notified?: boolean;
}

const reminders: Reminder[] = [
  {
    id: '1',
    title: 'Take Paracetamol',
    type: 'medicine',
    description: '500mg after breakfast',
    datetime: '2024-01-16T09:00',
    recurring: true,
    completed: false,
    notified: false
  },
  {
    id: '2',
    title: 'Blood Test',
    type: 'lab-test',
    description: 'Complete blood count at PathLab',
    datetime: '2024-01-18T10:30',
    recurring: false,
    completed: false,
    notified: false
  },
  {
    id: '3',
    title: 'Dr. Sharma Appointment',
    type: 'appointment',
    description: 'Regular checkup with cardiologist',
    datetime: '2024-01-20T15:00',
    recurring: false,
    completed: false,
    notified: false
  }
];

const Reminders = () => {
  const [activeReminders, setActiveReminders] = useState<Reminder[]>(reminders);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newReminder, setNewReminder] = useState({
    title: '',
    type: 'medicine' as 'medicine' | 'lab-test' | 'appointment',
    description: '',
    datetime: '',
    recurring: false
  });
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);

  const triggerDueCheck = () => {
    setActiveReminders(prev => {
      const now = Date.now();
      return prev.map(r => {
        const scheduled = new Date(r.datetime).getTime();
        const diff = scheduled - now;

        // If we missed it by more than 60s (tab slept), don't spam; mark as handled
        if (!r.notified && diff < -60000 && !r.recurring) {
          return { ...r, notified: true };
        }

        // Fire when within a 1s window around the scheduled time
        if (!r.notified && Math.abs(diff) <= 1000) {
          const title = `Reminder: ${r.title}`;
          const body = `${r.type.replace('-', ' ')} • ${r.description || ''}`.trim();

          if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === 'granted') {
            try { new Notification(title, { body }); } catch {}
          } else {
            toast({ title, description: body || 'It\'s time!' });
          }

          if (r.recurring) {
            // Schedule the next valid day strictly after now
            let next = scheduled + 24 * 60 * 60 * 1000;
            while (next <= now) next += 24 * 60 * 60 * 1000;
            return { ...r, datetime: new Date(next).toISOString().slice(0,16), notified: false };
          }
          return { ...r, notified: true };
        }
        return r;
      });
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medicine': return Pill;
      case 'lab-test': return TestTube;
      case 'appointment': return Stethoscope;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medicine': return 'bg-primary text-primary-foreground';
      case 'lab-test': return 'bg-secondary text-secondary-foreground';
      case 'appointment': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const resetForm = () => {
    setNewReminder({
      title: '',
      type: 'medicine',
      description: '',
      datetime: '',
      recurring: false
    });
    setEditingId(null);
  };

  const handleSubmitReminder = () => {
    if (!newReminder.title || !newReminder.datetime) return;

    if (editingId) {
      // Update existing reminder
      setActiveReminders(prev =>
        prev.map(r =>
          r.id === editingId
            ? { ...r, ...newReminder, notified: false }
            : r
        )
      );
    } else {
      // Create new reminder
      const reminder: Reminder = {
        id: Date.now().toString(),
        ...newReminder,
        completed: false,
        notified: false
      };
      setActiveReminders(prev => [...prev, reminder]);
    }

    resetForm();
    setShowAddForm(false);
  };

  // Request notification permission and start scheduler
  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      try { Notification.requestPermission().catch(() => void 0); } catch {}
    }

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }

    // Immediate tick and set 1s interval
    triggerDueCheck();
    intervalRef.current = window.setInterval(triggerDueCheck, 1000);

    const onVisibility = () => {
      if (!document.hidden) {
        triggerDueCheck();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [toast]);

  const toggleComplete = (id: string) => {
    setActiveReminders(prev =>
      prev.map(reminder =>
        reminder.id === id
          ? { ...reminder, completed: !reminder.completed }
          : reminder
      )
    );
  };

  const deleteReminder = (id: string) => {
    setActiveReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-20 lg:pb-6">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-medium">
              <Bell className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Smart Reminders</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Never miss your medicines, lab tests, or doctor appointments
          </p>
        </div>

        {/* Add Reminder Button */}
        <div className="mb-8 text-center">
          <Button
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="bg-gradient-primary text-primary-foreground shadow-medium hover:shadow-strong"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Reminder
          </Button>
        </div>

        {/* Add Reminder Form */}
        {showAddForm && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Reminder' : 'Create New Reminder'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder(prev => ({...prev, title: e.target.value}))}
                    placeholder="e.g., Take Vitamin D"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={newReminder.type}
                    onChange={(e) => setNewReminder(prev => ({...prev, type: e.target.value as any}))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="medicine">Medicine</option>
                    <option value="lab-test">Lab Test</option>
                    <option value="appointment">Appointment</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="datetime">Date & Time</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={newReminder.datetime}
                  onChange={(e) => setNewReminder(prev => ({...prev, datetime: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newReminder.description}
                  onChange={(e) => setNewReminder(prev => ({...prev, description: e.target.value}))}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newReminder.recurring}
                  onChange={(e) => setNewReminder(prev => ({...prev, recurring: e.target.checked}))}
                  className="rounded"
                />
                <Label htmlFor="recurring">Recurring reminder</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitReminder} className="bg-primary text-primary-foreground">
                  {editingId ? 'Update Reminder' : 'Create Reminder'}
                </Button>
                <Button variant="outline" onClick={() => { setShowAddForm(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reminders List */}
        <div className="space-y-4">
          {activeReminders.map((reminder) => {
            const IconComponent = getTypeIcon(reminder.type);
            const { date, time } = formatDateTime(reminder.datetime);
            
            return (
              <Card key={reminder.id} className={`transition-all duration-200 ${
                reminder.completed ? 'opacity-60 bg-muted/50' : 'hover:shadow-medium'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${getTypeColor(reminder.type)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className={`text-lg font-semibold ${
                            reminder.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}>
                            {reminder.title}
                          </h3>
                          <Badge variant="outline" className="text-xs capitalize">
                            {reminder.type.replace('-', ' ')}
                          </Badge>
                          {reminder.recurring && (
                            <Badge variant="secondary" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                        
                        {reminder.description && (
                          <p className={`text-sm ${
                            reminder.completed ? 'text-muted-foreground' : 'text-muted-foreground'
                          }`}>
                            {reminder.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleComplete(reminder.id)}
                        className={reminder.completed ? 'text-primary' : ''}
                      >
                        <CheckCircle className={`w-4 h-4 ${
                          reminder.completed ? 'fill-primary' : ''
                        }`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(reminder.id);
                          setNewReminder({
                            title: reminder.title,
                            type: reminder.type,
                            description: reminder.description,
                            datetime: reminder.datetime,
                            recurring: reminder.recurring,
                          });
                          setShowAddForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {activeReminders.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No reminders yet</p>
            <p className="text-muted-foreground">Create your first reminder to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminders;