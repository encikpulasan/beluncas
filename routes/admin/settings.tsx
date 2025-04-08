import AdminLayout from "../../components/AdminLayout.tsx";
import Card from "../../components/Card.tsx";
import ThemeSwitcher from "../../islands/ThemeSwitcher.tsx";
import SettingsForm from "../../islands/SettingsForm.tsx";

export default function Settings() {
  return (
    <AdminLayout title="Settings" activeSection="settings">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Settings</h1>
          <p class="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <Card title="Navigation" icon="menu">
            <ul class="space-y-1">
              <li>
                <a
                  href="#account"
                  class="block p-3 rounded-8 text-primary-700 bg-primary-50 font-medium"
                >
                  Account Settings
                </a>
              </li>
              <li>
                <a
                  href="#appearance"
                  class="block p-3 rounded-8 hover:bg-muted"
                >
                  Appearance
                </a>
              </li>
              <li>
                <a
                  href="#notifications"
                  class="block p-3 rounded-8 hover:bg-muted"
                >
                  Notifications
                </a>
              </li>
              <li>
                <a href="#security" class="block p-3 rounded-8 hover:bg-muted">
                  Security
                </a>
              </li>
              <li>
                <a href="#api" class="block p-3 rounded-8 hover:bg-muted">
                  API Keys
                </a>
              </li>
            </ul>
          </Card>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <Card title="Account Settings" icon="person">
            <SettingsForm />
          </Card>

          <Card title="Appearance" icon="palette">
            <ThemeSwitcher />
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
