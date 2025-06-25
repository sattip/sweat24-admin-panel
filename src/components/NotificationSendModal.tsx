import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useToast } from "../hooks/use-toast";
import { Bell, Send } from "lucide-react";

interface NotificationSendModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
}

export function NotificationSendModal({ 
  isOpen, 
  onOpenChange, 
  triggerButton = true 
}: NotificationSendModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    priority: "medium",
    targetAudience: "active",
    sendMethod: "push",
  });

  const handleSendNotification = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε τον τίτλο και το μήνυμα.",
        variant: "destructive"
      });
      return;
    }

    // Προσομοίωση αποστολής
    toast({
      title: "Ειδοποίηση Στάλθηκε! 📨",
      description: `Η ειδοποίηση "${formData.title}" στάλθηκε επιτυχώς σε ${
        formData.targetAudience === 'all' ? 'όλους τους πελάτες' : 'τους ενεργούς πελάτες'
      }.`,
      duration: 5000
    });

    // Καθαρισμός φόρμας
    setFormData({
      title: "",
      message: "",
      priority: "medium",
      targetAudience: "active",
      sendMethod: "push",
    });

    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const content = (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Αποστολή Ειδοποίησης
        </DialogTitle>
        <DialogDescription>
          Στείλτε ειδοποίηση στους πελάτες σας
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="title">Τίτλος Ειδοποίησης</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
            placeholder="π.χ. Νέο Πρόγραμμα HIIT!"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.title.length}/50 χαρακτήρες
          </p>
        </div>

        <div>
          <Label htmlFor="message">Μήνυμα</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
            placeholder="Γράψτε το μήνυμά σας εδώ..."
            rows={4}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.message.length}/200 χαρακτήρες
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Προτεραιότητα</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({...prev, priority: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Χαμηλή</SelectItem>
                <SelectItem value="medium">🟡 Μεσαία</SelectItem>
                <SelectItem value="high">🔴 Υψηλή</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Παραλήπτες</Label>
            <Select value={formData.targetAudience} onValueChange={(value) => setFormData(prev => ({...prev, targetAudience: value}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Όλοι οι πελάτες</SelectItem>
                <SelectItem value="active">Ενεργοί πελάτες</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Μέθοδος Αποστολής</Label>
          <Select value={formData.sendMethod} onValueChange={(value) => setFormData(prev => ({...prev, sendMethod: value}))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="push">📱 Push Notification</SelectItem>
              <SelectItem value="email">📧 Email</SelectItem>
              <SelectItem value="sms">📲 SMS</SelectItem>
              <SelectItem value="all">📢 Όλες οι μέθοδοι</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSendNotification} className="w-full">
          <Send className="h-4 w-4 mr-2" />
          Αποστολή Ειδοποίησης
        </Button>
      </div>
    </DialogContent>
  );

  if (triggerButton) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200">
            <Bell className="h-4 w-4 mr-2" />
            Αποστολή Ειδοποίησης
          </Button>
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
} 