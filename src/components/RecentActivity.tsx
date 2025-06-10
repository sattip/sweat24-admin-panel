import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

const activities = [
  {
    id: 1,
    user: { name: "Γιάννης Παπαδόπουλος", avatar: null, initials: "ΓΠ" },
    action: "κράτησε",
    target: "HIIT Προπόνηση",
    time: "πριν από 2 λεπτά",
    type: "booking",
  },
  {
    id: 2,
    user: { name: "Σάρα Κωνσταντίνου", avatar: null, initials: "ΣΚ" },
    action: "ακύρωσε",
    target: "Μάθημα Yoga",
    time: "πριν από 5 λεπτά",
    type: "cancellation",
  },
  {
    id: 3,
    user: { name: "Μιχάλης Χριστοδούλου", avatar: null, initials: "ΜΧ" },
    action: "εγγράφηκε",
    target: "Πρέμιουμ Συνδρομή",
    time: "πριν από 12 λεπτά",
    type: "registration",
  },
  {
    id: 4,
    user: { name: "Έλλη Δημητρίου", avatar: null, initials: "ΕΔ" },
    action: "αγόρασε",
    target: "Πρωτεϊνούχα Σκόνη",
    time: "πριν από 18 λεπτά",
    type: "purchase",
  },
  {
    id: 5,
    user: { name: "Άλεξ Ροδρίγκεζ", avatar: null, initials: "ΑΡ" },
    action: "ολοκλήρωσε",
    target: "Προπόνηση Δύναμης",
    time: "πριν από 25 λεπτά",
    type: "completion",
  },
];

const getActivityBadgeColor = (type: string) => {
  switch (type) {
    case "booking":
      return "bg-green-100 text-green-800";
    case "cancellation":
      return "bg-red-100 text-red-800";
    case "registration":
      return "bg-blue-100 text-blue-800";
    case "purchase":
      return "bg-purple-100 text-purple-800";
    case "completion":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function RecentActivity() {
  return (
    <Card
      className="bg-card border border-border rounded-lg shadow-sm"
      data-oid="22b32jh"
    >
      <CardHeader className="p-6" data-oid="7rtl7o6">
        <CardTitle
          className="flex items-center gap-2 text-lg font-semibold text-card-foreground"
          data-oid="80y77xw"
        >
          <Clock className="h-5 w-5 text-primary" data-oid="ereilzk" />
          Πρόσφατη Δραστηριότητα
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0" data-oid="0ql67lu">
        <div className="space-y-4" data-oid="3ucc7:a">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
              data-oid="2em98eq"
            >
              <Avatar className="h-10 w-10" data-oid="5m50rmi">
                <AvatarImage
                  src={activity.user.avatar || undefined}
                  alt={activity.user.name}
                  data-oid="my366q:"
                />

                <AvatarFallback
                  className="bg-primary text-primary-foreground text-sm"
                  data-oid="kqtrss4"
                >
                  {activity.user.initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0" data-oid="8_:uupf">
                <div
                  className="flex items-center gap-2 flex-wrap"
                  data-oid="u1djbh7"
                >
                  <span
                    className="font-medium text-card-foreground"
                    data-oid="08t9jaw"
                  >
                    {activity.user.name}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                    data-oid="04a157i"
                  >
                    {activity.action}
                  </Badge>
                  <span className="text-sm text-muted-foreground" data-oid="g42ft9d">
                    {activity.target}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1" data-oid="hv5itgd">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
