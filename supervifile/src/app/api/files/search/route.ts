import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchFiles, ROOT_FOLDER_ID } from "@/lib/drive";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();
    const folderId = searchParams.get("carpeta") || ROOT_FOLDER_ID;

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const files = await searchFiles(query, folderId);

    const mapped = files.map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      webViewLink: f.webViewLink,
      webContentLink: f.webContentLink,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error searching files:", error);
    return NextResponse.json(
      { error: "Error en la búsqueda" },
      { status: 500 }
    );
  }
}
