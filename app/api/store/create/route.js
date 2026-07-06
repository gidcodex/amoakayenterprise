import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const settings =
      (await prisma.adminSettings.findFirst()) ||
      (await prisma.adminSettings.create({ data: {} }));

    if (!settings.allowSellerApplications) {
      return NextResponse.json(
        { error: "Seller applications are currently closed." },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const email = formData.get("email");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const image = formData.get("image");

    if (!name || !username || !description || !email || !contact || !address || !image) {
      return NextResponse.json({ error: "missing store info" }, { status: 400 });
    }

    const existingStore = await prisma.store.findFirst({
      where: { userId },
    });

    if (existingStore) {
      return NextResponse.json({ status: existingStore.status });
    }

    const isUsernameTaken = await prisma.store.findFirst({
      where: { username: username.toLowerCase() },
    });

    if (isUsernameTaken) {
      return NextResponse.json(
        { error: "username already taken" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    const response = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "logos",
    });

    const optimizedImage = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "512" },
      ],
    });

    const newStore = await prisma.store.create({
      data: {
        userId,
        name,
        description,
        username: username.toLowerCase(),
        email,
        contact,
        address,
        logo: optimizedImage,
        status: settings.autoApproveStores ? "approved" : "pending",
        isActive: settings.autoApproveStores ? true : false,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        store: {
          connect: { id: newStore.id },
        },
      },
    });

    await prisma.notification.create({
      data: {
        title: settings.autoApproveStores
          ? "New Store Auto-Approved"
          : "New Store Application",
        message: settings.autoApproveStores
          ? `${name} has been automatically approved.`
          : `${name} submitted a store application for review.`,
        type: "STORE",
        role: "ADMIN",
        link: settings.autoApproveStores ? "/admin/stores" : "/admin/approve",
      },
    });

    if (settings.autoApproveStores) {
      await prisma.notification.create({
        data: {
          title: "Store Approved",
          message: "Congratulations! Your store has been approved and is now live.",
          type: "STORE",
          role: "SELLER",
          storeId: newStore.id,
          link: "/store",
        },
      });
    }

    return NextResponse.json({
      message: settings.autoApproveStores
        ? "Store created and approved successfully."
        : "Applied, waiting for approval.",
      status: newStore.status,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const store = await prisma.store.findFirst({
      where: { userId },
    });

    if (store) {
      return NextResponse.json({ status: store.status });
    }

    return NextResponse.json({ status: "not registered" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}