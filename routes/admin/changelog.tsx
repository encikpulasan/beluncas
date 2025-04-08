import AdminLayout from "../../components/AdminLayout.tsx";
import Card from "../../components/Card.tsx";

export default function Changelog() {
  const changes = [
    {
      version: "v1.0.0",
      date: "July 28, 2023",
      changes: [
        "Initial release of the admin dashboard",
        "Implemented user management features",
        "Created posts and organization management",
        "Added API key management",
        "Implemented authentication system",
      ],
    },
    {
      version: "v1.1.0",
      date: "August 15, 2023",
      changes: [
        "Added theme switching functionality",
        "Improved responsive design for mobile devices",
        "Enhanced security with JWT token expiration",
        "Added user activity logging",
        "Fixed various UI bugs and improved accessibility",
      ],
    },
    {
      version: "v1.2.0",
      date: "September 5, 2023",
      changes: [
        "Added multi-location support for organizations",
        "Implemented post publishing scheduling",
        "Enhanced user role management",
        "Added data export functionality",
        "Improved search and filtering capabilities",
      ],
    },
    {
      version: "v1.2.3",
      date: "September 20, 2023",
      changes: [
        "Fixed issue with API key generation",
        "Improved theme color consistency",
        "Enhanced form validation messages",
        "Updated documentation and help resources",
        "Performance optimizations for data loading",
      ],
    },
  ];

  return (
    <AdminLayout title="Changelog" activeSection="changelog">
      <div class="max-w-4xl mx-auto">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-foreground">Changelog</h1>
          <p class="text-muted-foreground">
            Track changes and updates to the admin dashboard
          </p>
        </div>

        <div class="space-y-6">
          {changes.map((change) => (
            <Card key={change.version} className="overflow-hidden">
              <div class="p-4 bg-primary-50 border-b border-border">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-semibold text-primary-700">
                    {change.version}
                  </h2>
                  <span class="text-sm text-muted-foreground">
                    {change.date}
                  </span>
                </div>
              </div>
              <div class="p-4">
                <ul class="space-y-2 list-disc pl-5">
                  {change.changes.map((item, index) => (
                    <li key={index} class="text-foreground">{item}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
