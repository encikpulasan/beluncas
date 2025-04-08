import { useEffect, useState } from "preact/hooks";
import Card from "../components/Card.tsx";
import StatCard from "../components/StatCard.tsx";
import { Button } from "../components/Button.tsx";
import { analytics, DashboardAnalytics, Post, posts } from "../utils/api.ts";

export default function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchDashboardData();
    // Refresh stats every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await analytics.getDashboard();
      setDashboardData(data);
      setLastUpdated(new Date(data.lastUpdated));
      fetchPopularPosts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPopularPosts = async (data: DashboardAnalytics) => {
    try {
      const allPosts = await posts.getAll();
      // Use popular posts data if available, otherwise sort by viewCount
      const sorted = data.postStats.popular && data.postStats.popular.length > 0
        ? data.postStats.popular.map((popularPost) => {
          const fullPost = allPosts.find((p) => p.id === popularPost.id);
          return {
            ...fullPost,
            views: popularPost.views,
          } as Post;
        })
        : allPosts.sort((a, b) =>
          ((b as any).viewCount || 0) - ((a as any).viewCount || 0)
        ).slice(0, 5);

      setPopularPosts(sorted);
    } catch (err) {
      console.error("Failed to fetch popular posts:", err);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const calculateChange = (
    current: number,
    previous: number,
  ): { value: string; type: "increase" | "decrease" } => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${Math.abs(change).toFixed(1)}%`,
      type: change >= 0 ? "increase" : "decrease",
    };
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "new-post":
        window.location.href = "/admin/posts/new";
        break;
      case "new-user":
        window.location.href = "/admin/users";
        break;
      case "new-api-key":
        window.location.href = "/admin/api-keys";
        break;
      case "manage-locations":
        window.location.href = "/admin/organization";
        break;
    }
  };

  const formatActivityTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    }
    if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    }
    if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
      .format(date);
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case "post":
        return "article";
      case "user":
        return "person";
      case "api_key":
        return "key";
      case "location":
        return "business";
      case "API_CALL":
        return "api";
      default:
        return "info";
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case "post":
        return "bg-green-100 text-green-600";
      case "user":
        return "bg-blue-100 text-blue-600";
      case "api_key":
        return "bg-yellow-100 text-yellow-600";
      case "location":
        return "bg-purple-100 text-purple-600";
      case "API_CALL":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <>
      {error && (
        <div class="mb-6 p-4 rounded-8 bg-red-50 text-red-800">
          <div class="flex items-center">
            <span class="material-symbols-outlined mr-2">error</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={isLoading
            ? "..."
            : formatNumber(dashboardData?.userStats.total || 0)}
          icon="people"
          change={dashboardData?.userStats.change
            ? calculateChange(
              dashboardData.userStats.total,
              dashboardData.userStats.total - dashboardData.userStats.change,
            )
            : undefined}
          color="primary"
        />
        <StatCard
          title="Posts Published"
          value={isLoading
            ? "..."
            : formatNumber(dashboardData?.postStats.published || 0)}
          icon="article"
          change={dashboardData?.postStats.change
            ? calculateChange(
              dashboardData.postStats.total,
              dashboardData.postStats.total - dashboardData.postStats.change,
            )
            : undefined}
          color="secondary"
        />
        <StatCard
          title="Locations"
          value={isLoading
            ? "..."
            : formatNumber(dashboardData?.locationStats.total || 0)}
          icon="business"
          color="success"
        />
        <StatCard
          title="API Requests"
          value={isLoading
            ? "..."
            : formatNumber(dashboardData?.requestStats.total || 0)}
          icon="data_array"
          change={dashboardData?.requestStats.change
            ? calculateChange(
              dashboardData.requestStats.total,
              dashboardData.requestStats.total -
                dashboardData.requestStats.change,
            )
            : undefined}
          color="warning"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 grid grid-cols-1 gap-6">
          <Card
            title="Recent Activities"
            icon="history"
            className="h-full"
          >
            {isLoading
              ? (
                <div class="flex justify-center items-center py-12">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600">
                  </div>
                </div>
              )
              : dashboardData?.recentActivity.length === 0
              ? (
                <div class="text-center py-8 text-muted-foreground">
                  No recent activity to display
                </div>
              )
              : (
                <div class="space-y-4">
                  {dashboardData?.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      class="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      <div
                        class={`w-10 h-10 rounded-full ${
                          getActivityColor(activity.type)
                        } flex items-center justify-center flex-shrink-0`}
                      >
                        <span class="material-symbols-outlined">
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <div class="flex-1">
                        <p class="text-card-foreground font-medium">
                          {activity.action}
                        </p>
                        <div class="flex justify-between mt-1">
                          <p class="text-sm text-muted-foreground">
                            By {activity.user}
                          </p>
                          <p class="text-sm text-muted-foreground">
                            {formatActivityTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </Card>

          {/* Popular Posts */}
          <Card
            title="Popular Posts"
            icon="trending_up"
            className="h-full"
          >
            {isLoading || popularPosts.length === 0
              ? (
                <div class="flex justify-center items-center py-12">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600">
                  </div>
                </div>
              )
              : (
                <div class="divide-y divide-border">
                  {popularPosts.map((post, index) => (
                    <div
                      key={post.id}
                      class="py-3 flex items-center justify-between"
                    >
                      <div class="flex items-center gap-3">
                        <div class="bg-primary-50 text-primary-700 w-8 h-8 rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p class="font-medium truncate max-w-xs">
                            {post.title}
                          </p>
                          <p class="text-sm text-muted-foreground">
                            By {post.author}
                          </p>
                        </div>
                      </div>
                      <div class="flex flex-col items-end">
                        <div class="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          {(post as any).views || (post as any).viewCount || 0}
                          {" "}
                          views
                        </div>
                        <Button
                          variant="ghost"
                          class="text-primary-600 text-xs px-2 py-1 mt-1"
                          onClick={() =>
                            window.location.href = `/admin/posts/${post.id}`}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </Card>
        </div>

        <div class="space-y-6">
          <Card
            title="Quick Actions"
            icon="bolt"
          >
            <div class="space-y-3">
              <Button
                variant="primary"
                class="w-full justify-start"
                onClick={() => handleQuickAction("new-post")}
              >
                <span class="material-symbols-outlined mr-2">add</span>
                Create New Post
              </Button>
              <Button
                variant="outline"
                class="w-full justify-start"
                onClick={() => handleQuickAction("new-user")}
              >
                <span class="material-symbols-outlined mr-2">person_add</span>
                Add New User
              </Button>
              <Button
                variant="outline"
                class="w-full justify-start"
                onClick={() => handleQuickAction("new-api-key")}
              >
                <span class="material-symbols-outlined mr-2">key</span>
                Generate API Key
              </Button>
              <Button
                variant="outline"
                class="w-full justify-start"
                onClick={() => handleQuickAction("manage-locations")}
              >
                <span class="material-symbols-outlined mr-2">business</span>
                Manage Locations
              </Button>
            </div>
          </Card>

          <Card
            title="System Status"
            icon="monitoring"
          >
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-card-foreground font-medium">API Status</p>
                  <p class="text-sm text-muted-foreground">v1.2.3</p>
                </div>
                <div class="flex items-center text-green-600">
                  <span class="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                  Online
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-card-foreground font-medium">Database</p>
                  <p class="text-sm text-muted-foreground">Deno KV</p>
                </div>
                <div class="flex items-center text-green-600">
                  <span class="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                  Healthy
                </div>
              </div>
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-card-foreground font-medium">Last Updated</p>
                  <p class="text-sm text-muted-foreground">
                    {formatActivityTime(lastUpdated.toISOString())}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  class="text-primary-600 text-sm px-2 py-1"
                  onClick={fetchDashboardData}
                >
                  <span class="material-symbols-outlined mr-1">refresh</span>
                  Refresh
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
