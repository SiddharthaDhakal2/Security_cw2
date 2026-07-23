import { cookies } from "next/headers";
import ProfileForm from "./_components/ProfileForm";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  
  if (!userCookie) {
    redirect("/login");
  }

  const user = JSON.parse(userCookie);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
