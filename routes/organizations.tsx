import { Head } from "$fresh/runtime.ts";
import OrganizationList from "../islands/OrganizationList.tsx";

export default function OrganizationsPage() {
  return (
    <>
      <Head>
        <title>Organizations | Charity Shelter</title>
        <meta
          name="description"
          content="Browse our network of charity organizations and their locations."
        />
      </Head>
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl font-bold mb-6">Our Charity Organizations</h1>
          <p class="text-muted-foreground mb-8">
            Below you'll find a list of all organizations in our network. Click
            on each organization to see their locations and contact information.
          </p>

          <OrganizationList />
        </div>
      </div>
    </>
  );
}
