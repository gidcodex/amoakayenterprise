import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Add new rating
export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        const { orderId, productId, rating, review } = await request.json();

        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
                userId,
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        const isAlreadyRated = await prisma.rating.findFirst({
            where: {
                productId,
                orderId,
            },
        });

        if (isAlreadyRated) {
            return NextResponse.json(
                { error: "Product already rated" },
                { status: 400 }
            );
        }

        // Create the rating
        const response = await prisma.rating.create({
            data: {
                userId,
                productId,
                rating,
                review,
                orderId,
            },
        });

        // Get the product and seller information
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
            select: {
                name: true,
                storeId: true,
            },
        });

        // Notify the seller
        if (product) {
            await prisma.notification.create({
                data: {
                    title: "New Product Review",
                    message: `Your product "${product.name}" received a ${rating}-star review.`,
                    type: "MESSAGE",
                    role: "SELLER",
                    storeId: product.storeId,
                    link: "/store",
                },
            });
        }

        return NextResponse.json({
            message: "Rating added successfully",
            rating: response,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: error.code || error.message,
            },
            {
                status: 400,
            }
        );
    }
}

// Get all ratings for a user
export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const ratings = await prisma.rating.findMany({
            where: {
                userId,
            },
        });

        return NextResponse.json({ ratings });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: error.code || error.message,
            },
            {
                status: 400,
            }
        );
    }
}