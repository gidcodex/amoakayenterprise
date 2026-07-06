import imagekit from "@/configs/imageKit";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    const response = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "categories",
    });

    const imageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "512" },
      ],
    });

    return NextResponse.json({
      message: "Image uploaded successfully.",
      imageUrl,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}