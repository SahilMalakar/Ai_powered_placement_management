import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Students",
      value: "1,248",
      description: "Registered on platform",
      icon: Users,
      trend: "+12% from last month",
      trendType: "up",
    },
    {
      title: "Active Job Postings",
      value: "24",
      description: "Open for applications",
      icon: Briefcase,
      trend: "+4 new today",
      trendType: "up",
    },
    {
      title: "Placed Students",
      value: "156",
      description: "Batch of 2025",
      icon: CheckCircle2,
      trend: "+18% from last month",
      trendType: "up",
    },
    {
      title: "Pending Verifications",
      value: "12",
      description: "Requires action",
      icon: AlertCircle,
      trend: "-2 from yesterday",
      trendType: "down",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of the placement status.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-heavy hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-primary/5 rounded-lg">
                <stat.icon className="size-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div className={`mt-3 flex items-center text-xs font-semibold ${
                stat.trendType === 'up' ? 'text-success' : 'text-error'
              }`}>
                {stat.trendType === 'up' ? <ArrowUpRight className="size-3 mr-1" /> : <ArrowDownRight className="size-3 mr-1" />}
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-heavy">
          <CardHeader>
            <CardTitle>Placement Analytics</CardTitle>
            <CardDescription>
              Performance overview for the current academic year.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg m-4">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <TrendingUp className="size-8 opacity-20" />
              <p className="text-sm">Chart visualization will be implemented here</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-heavy">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest updates from the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="size-2 mt-2 rounded-full bg-primary shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">New Job Posted: Google SDE-1</p>
                    <p className="text-xs text-muted-foreground">2 hours ago by Rahul Sharma</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
