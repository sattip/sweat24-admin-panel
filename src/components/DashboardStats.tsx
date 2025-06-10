import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Package, Star } from "lucide-react";

const stats = [
  {
    title: "Συνολικά Μέλη",
    value: "2,847",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Ενεργά Μαθήματα",
    value: "156",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: Calendar,
  },
  {
    title: "Μηνιαία Έσοδα",
    value: "€48,325",
    change: "+15.8%",
    changeType: "positive" as const,
    icon: Package,
  },
  {
    title: "Μέση Αξιολόγηση",
    value: "4.8",
    change: "+0.3",
    changeType: "positive" as const,
    icon: Star,
  },
];

export function DashboardStats() {
  return (
    <div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      data-oid="g3-iwo5"
    >
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="bg-card border border-border hover:shadow-md transition-shadow"
          data-oid="_b3cpca"
        >
          <CardHeader
            className="flex flex-row items-center justify-between space-y-0 pb-3"
            data-oid="vf2.2s:"
          >
            <CardTitle
              className="text-sm font-medium text-muted-foreground"
              data-oid="dkayemm"
            >
              {stat.title}
            </CardTitle>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"
              data-oid="wl0nqd6"
            >
              <stat.icon
                className="h-5 w-5 text-primary"
                data-oid=".oxe94d"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0" data-oid="ra.as:-">
            <div
              className="text-2xl font-bold text-card-foreground"
              data-oid="ordo.y:"
            >
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1" data-oid="5vlxj6-">
              <span
                className={`font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
                data-oid="x87732c"
              >
                {stat.change}
              </span>{" "}
              από τον προηγούμενο μήνα
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
