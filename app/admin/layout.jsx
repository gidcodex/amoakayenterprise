import AdminLayout from "@/components/admin/AdminLayout";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import DeliveryNotificationWatcher from "@/components/admin/DeliveryNotificationWatcher";

export const metadata = {
    title: "GoCart. - Admin",
    description: "GoCart. - Admin",
};

export default function RootAdminLayout({ children }) {
    return (
        <>
            <SignedIn>

                <DeliveryNotificationWatcher />

                <AdminLayout>
                    {children}
                </AdminLayout>

            </SignedIn>

            <SignedOut>
                <div className="min-h-screen flex items-center justify-center">
                    <SignIn fallbackRedirectUrl="/admin" routing="hash" />
                </div>
            </SignedOut>
        </>
    );
}