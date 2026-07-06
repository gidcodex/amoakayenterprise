import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Approve Seller
export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json(
                { error: "not authorized" },
                { status: 401 }
            );
        }

        const { storeId, status } = await request.json();

        if (status === "approved") {
            const store = await prisma.store.update({
                where: { id: storeId },
                data: {
                    status: "approved",
                    isActive: true,
                },
            });

            // Notify Seller
            await prisma.notification.create({
                data: {
                    title: "Store Approved",
                    message:
                        "Congratulations! Your store has been approved and is now live.",
                    type: "STORE",
                    role: "SELLER",
                    storeId: store.id,
                    link: "/store",
                },
            });

            // Notify Admin
            await prisma.notification.create({
                data: {
                    title: "Store Approved",
                    message: `${store.name} has been approved successfully.`,
                    type: "STORE",
                    role: "ADMIN",
                    link: "/admin/stores",
                },
            });

        } else if (status === "rejected") {
            const store = await prisma.store.update({
                where: { id: storeId },
                data: {
                    status: "rejected",
                },
            });

            // Notify Seller
            await prisma.notification.create({
                data: {
                    title: "Store Application Rejected",
                    message:
                        "Unfortunately, your seller application was not approved. Please review your application and try again.",
                    type: "STORE",
                    role: "SELLER",
                    storeId: store.id,
                    link: "/store",
                },
            });

            // Notify Admin
            await prisma.notification.create({
                data: {
                    title: "Store Rejected",
                    message: `${store.name} has been rejected.`,
                    type: "STORE",
                    role: "ADMIN",
                    link: "/admin/approve",
                },
            });
        }

        return NextResponse.json({
            message: `${status} successfully`,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}

// Get stores
export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        const isAdmin = await authAdmin(userId);

        if (!isAdmin) {
            return NextResponse.json(
                { error: "not authorized" },
                { status: 401 }
            );
        }

        const stores = await prisma.store.findMany({
            where: {
                status: {
                    in: ["pending", "rejected"],
                },
            },
            include: {
                user: true,
            },
        });

        return NextResponse.json({ stores });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
}