import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const bucketName = "supervifile";

const supabase = createClient(supabaseUrl, supabaseKey);

export const ROOT_FOLDER_ID = "root";

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string | null;
  createdTime: string | null;
  modifiedTime: string | null;
  webViewLink: string | null;
  webContentLink: string | null;
  trashed: boolean;
  parents: string[];
}

function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data?.publicUrl || "";
}

function pathToKey(folderId: string, name: string): string {
  if (folderId === ROOT_FOLDER_ID) return name;
  return `${folderId}/${name}`;
}

async function isFolderPath(path: string): Promise<boolean> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(path, { limit: 1, search: ".folder" });
  if (error) return false;
  return data?.some((f) => f.name === ".folder") ?? false;
}

async function listAllRecursive(prefix: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(prefix, { limit: 1000 });

  if (error) return [];

  const paths: string[] = [];
  for (const item of data) {
    if (item.name === "" || item.name === ".folder") continue;
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (!item.metadata?.mimetype || item.metadata?.mimetype === "application/vnd.google-apps.folder" || item.name.endsWith("/")) {
      const subFiles = await listAllRecursive(fullPath);
      paths.push(...subFiles);
    } else {
      paths.push(fullPath);
    }
  }
  return paths;
}

export async function listFiles(folderId: string, trashed = false) {
  if (trashed) return listTrash();

  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folderId === ROOT_FOLDER_ID ? "" : folderId, {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    });

  if (error) throw error;

  const files: DriveFile[] = [];

  if (data) {
    for (const item of data) {
      if (item.name === "" || item.name === ".folder") continue;

      const itemPath = folderId === ROOT_FOLDER_ID
        ? item.name
        : `${folderId}/${item.name}`;

      const folder = !item.metadata?.mimetype || item.metadata?.mimetype === "application/vnd.google-apps.folder";
      const mimeType = folder
        ? "application/vnd.google-apps.folder"
        : item.metadata?.mimetype || "application/octet-stream";

      const publicUrl = folder ? null : getPublicUrl(itemPath);

      files.push({
        id: itemPath,
        name: item.name.replace(/\/$/, ""),
        mimeType,
        size: folder ? null : item.metadata?.size?.toString() || null,
        createdTime: item.created_at || null,
        modifiedTime: item.updated_at || null,
        webViewLink: publicUrl,
        webContentLink: publicUrl,
        trashed: false,
        parents: [folderId],
      });
    }
  }

  return files;
}

export async function getFile(fileId: string) {
  const parts = fileId.split("/");
  const name = parts.pop() || fileId;
  const parent = parts.length > 0 ? parts.join("/") : ROOT_FOLDER_ID;

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileId);

  return {
    id: fileId,
    name,
    mimeType: "application/octet-stream",
    size: null,
    createdTime: null,
    modifiedTime: null,
    webViewLink: publicUrl,
    webContentLink: publicUrl,
    trashed: false,
    parents: parent === ROOT_FOLDER_ID ? [] : [parent],
  } as DriveFile;
}

export async function getFileBuffer(fileId: string) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(fileId);

  if (error) throw error;

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function createFolder(name: string, parentId: string = ROOT_FOLDER_ID) {
  const folderKey = pathToKey(parentId, name);

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(folderKey + "/.folder", "folder", {
      contentType: "application/vnd.google-apps.folder",
      upsert: true,
    });

  if (error) throw error;

  return {
    id: folderKey,
    name,
    mimeType: "application/vnd.google-apps.folder",
    size: null,
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    webViewLink: null,
    webContentLink: null,
    trashed: false,
    parents: [parentId],
  } as DriveFile;
}

export async function uploadFile(
  name: string,
  mimeType: string,
  buffer: Buffer,
  parentId: string = ROOT_FOLDER_ID
) {
  const key = pathToKey(parentId, name);

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(key, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw error;

  const publicUrl = getPublicUrl(key);

  return {
    id: key,
    name,
    mimeType,
    size: buffer.length.toString(),
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    webViewLink: publicUrl,
    webContentLink: publicUrl,
    trashed: false,
    parents: [parentId],
  } as DriveFile;
}

async function moveFile(fromPath: string, toPath: string) {
  const buffer = await getFileBuffer(fromPath);
  const { data: listData } = await supabase.storage
    .from(bucketName)
    .list(fromPath.split("/").slice(0, -1).join("/"), { limit: 1000 });

  let contentType = "application/octet-stream";
  const fileName = fromPath.split("/").pop() || "";
  if (listData) {
    const found = listData.find(f => f.name === fileName);
    if (found) contentType = found.metadata?.mimetype || contentType;
  }

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(toPath, buffer, { contentType, upsert: false });

  if (uploadError) throw uploadError;

  const { error: deleteError } = await supabase.storage
    .from(bucketName)
    .remove([fromPath]);

  if (deleteError) throw deleteError;
}

export async function renameFile(fileId: string, newName: string) {
  const parts = fileId.split("/");
  const oldName = parts.pop() || "";
  const parentPath = parts.join("/");

  const isFolder = await isFolderPath(fileId);

  if (isFolder) {
    // List all files inside the folder
    const allFiles = await listAllRecursive(fileId);

    // Move each file to the new path
    for (const filePath of allFiles) {
      const relativePath = filePath.startsWith(fileId + "/")
        ? filePath.slice(fileId.length + 1)
        : filePath;
      const newFilePath = parentPath ? `${parentPath}/${newName}/${relativePath}` : `${newName}/${relativePath}`;
      const buffer = await getFileBuffer(filePath);
      const { data: listData } = await supabase.storage
        .from(bucketName)
        .list(filePath.split("/").slice(0, -1).join("/"), { limit: 1000 });
      let contentType = "application/octet-stream";
      const fName = filePath.split("/").pop() || "";
      if (listData) {
        const found = listData.find(f => f.name === fName);
        if (found) contentType = found.metadata?.mimetype || contentType;
      }
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(newFilePath, buffer, { contentType, upsert: false });
      if (uploadError) throw uploadError;
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      if (deleteError) throw deleteError;
    }

    // Create new .folder marker
    const newFolderPath = parentPath ? `${parentPath}/${newName}` : newName;
    const { error: createError } = await supabase.storage
      .from(bucketName)
      .upload(newFolderPath + "/.folder", "folder", {
        contentType: "application/vnd.google-apps.folder",
        upsert: true,
      });
    if (createError) throw createError;

    // Delete old .folder marker
    await supabase.storage.from(bucketName).remove([fileId + "/.folder"]);

    return {
      id: newFolderPath,
      name: newName,
      mimeType: "application/vnd.google-apps.folder",
      size: null,
      createdTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
      webViewLink: null,
      webContentLink: null,
      trashed: false,
      parents: parentPath ? [parentPath] : [ROOT_FOLDER_ID],
    } as DriveFile;
  }

  // For files: download, upload to new path, delete old
  const buffer = await getFileBuffer(fileId);
  const newPath = parentPath ? `${parentPath}/${newName}` : newName;

  const { data: listData } = await supabase.storage
    .from(bucketName)
    .list(parentPath || "", { limit: 1000 });

  let contentType = "application/octet-stream";
  if (listData) {
    const found = listData.find(f => f.name === oldName);
    if (found) contentType = found.metadata?.mimetype || contentType;
  }

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(newPath, buffer, { contentType, upsert: false });

  if (uploadError) throw uploadError;

  const { error: deleteError } = await supabase.storage
    .from(bucketName)
    .remove([fileId]);

  if (deleteError) throw deleteError;

  const publicUrl = getPublicUrl(newPath);

  return {
    id: newPath,
    name: newName,
    mimeType: contentType,
    size: buffer.length.toString(),
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    webViewLink: publicUrl,
    webContentLink: publicUrl,
    trashed: false,
    parents: parentPath ? [parentPath] : [ROOT_FOLDER_ID],
  } as DriveFile;
}

export async function moveToTrash(fileId: string) {
  const isFolder = await isFolderPath(fileId);

  if (isFolder) {
    const allFiles = await listAllRecursive(fileId);

    for (const filePath of allFiles) {
      const buffer = await getFileBuffer(filePath);
      const trashKey = `trash/${filePath}`;
      const { data: listData } = await supabase.storage
        .from(bucketName)
        .list(filePath.split("/").slice(0, -1).join("/"), { limit: 1000 });
      let contentType = "application/octet-stream";
      const fName = filePath.split("/").pop() || "";
      if (listData) {
        const found = listData.find(f => f.name === fName);
        if (found) contentType = found.metadata?.mimetype || contentType;
      }
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(trashKey, buffer, { contentType, upsert: false });
      if (uploadError) throw uploadError;
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      if (deleteError) throw deleteError;
    }

    // Delete .folder marker
    await supabase.storage.from(bucketName).remove([fileId + "/.folder"]);

    return {
      id: `trash/${fileId}`,
      name: fileId.split("/").pop() || "",
      mimeType: "application/vnd.google-apps.folder",
      size: null,
      createdTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
      webViewLink: null,
      webContentLink: null,
      trashed: true,
      parents: [],
    } as DriveFile;
  }

  // For files: download, upload to trash, delete original
  const buffer = await getFileBuffer(fileId);
  const trashKey = `trash/${fileId}`;

  const { data: listData } = await supabase.storage
    .from(bucketName)
    .list(fileId.split("/").slice(0, -1).join("/"), { limit: 1000 });

  let contentType = "application/octet-stream";
  const fileName = fileId.split("/").pop() || "";
  if (listData) {
    const found = listData.find(f => f.name === fileName);
    if (found) contentType = found.metadata?.mimetype || contentType;
  }

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(trashKey, buffer, { contentType, upsert: false });

  if (uploadError) throw uploadError;

  const { error: deleteError } = await supabase.storage
    .from(bucketName)
    .remove([fileId]);

  if (deleteError) throw deleteError;

  return {
    id: trashKey,
    name: fileName,
    mimeType: contentType,
    size: buffer.length.toString(),
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    webViewLink: null,
    webContentLink: null,
    trashed: true,
    parents: [],
  } as DriveFile;
}

export async function restoreFromTrash(fileId: string) {
  const originalKey = fileId.replace(/^trash\//, "");
  const isFolder = await isFolderPath(fileId);

  if (isFolder) {
    const allFiles = await listAllRecursive(fileId);

    for (const filePath of allFiles) {
      const originalPath = filePath.replace(/^trash\//, "");
      const buffer = await getFileBuffer(filePath);
      const { data: listData } = await supabase.storage
        .from(bucketName)
        .list(filePath.split("/").slice(0, -1).join("/"), { limit: 1000 });
      let contentType = "application/octet-stream";
      const fName = filePath.split("/").pop() || "";
      if (listData) {
        const found = listData.find(f => f.name === fName);
        if (found) contentType = found.metadata?.mimetype || contentType;
      }
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(originalPath, buffer, { contentType, upsert: false });
      if (uploadError) throw uploadError;
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      if (deleteError) throw deleteError;
    }

    // Recreate .folder marker
    const folderPath = originalKey;
    await supabase.storage.from(bucketName).upload(folderPath + "/.folder", "folder", {
      contentType: "application/vnd.google-apps.folder",
      upsert: true,
    });

    return {
      id: originalKey,
      name: originalKey.split("/").pop() || "",
      mimeType: "application/vnd.google-apps.folder",
      size: null,
      createdTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
      webViewLink: null,
      webContentLink: null,
      trashed: false,
      parents: [],
    } as DriveFile;
  }

  // For files: download from trash, upload to original, delete from trash
  const buffer = await getFileBuffer(fileId);
  const { data: listData } = await supabase.storage
    .from(bucketName)
    .list("trash", { limit: 1000 });

  let contentType = "application/octet-stream";
  const fileName = fileId.split("/").pop() || "";
  if (listData) {
    const found = listData.find(f => f.name === fileName);
    if (found) contentType = found.metadata?.mimetype || contentType;
  }

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(originalKey, buffer, { contentType, upsert: false });

  if (uploadError) throw uploadError;

  const { error: deleteError } = await supabase.storage
    .from(bucketName)
    .remove([fileId]);

  if (deleteError) throw deleteError;

  const publicUrl = getPublicUrl(originalKey);

  return {
    id: originalKey,
    name: fileName,
    mimeType: contentType,
    size: buffer.length.toString(),
    createdTime: new Date().toISOString(),
    modifiedTime: new Date().toISOString(),
    webViewLink: publicUrl,
    webContentLink: publicUrl,
    trashed: false,
    parents: [],
  } as DriveFile;
}

export async function permanentlyDelete(fileId: string) {
  const isFolder = await isFolderPath(fileId);

  if (isFolder) {
    const allFiles = await listAllRecursive(fileId);
    const pathsToDelete = [...allFiles, fileId + "/.folder"];
    const { error } = await supabase.storage
      .from(bucketName)
      .remove(pathsToDelete);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([fileId]);

  if (error) throw error;
}

async function listTrashRecursive(prefix: string): Promise<DriveFile[]> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(prefix, { limit: 1000 });

  if (error) return [];

  const files: DriveFile[] = [];

  for (const item of data) {
    if (item.name === "" || item.name === ".folder") continue;

    const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

    if (!item.metadata?.mimetype) {
      const subFiles = await listTrashRecursive(itemPath);
      files.push(...subFiles);
    } else {
      files.push({
        id: itemPath,
        name: itemPath.replace(/^trash\//, ""),
        mimeType: item.metadata?.mimetype || "application/octet-stream",
        size: item.metadata?.size?.toString() || null,
        createdTime: item.created_at || null,
        modifiedTime: item.updated_at || null,
        webViewLink: null,
        webContentLink: null,
        trashed: true,
        parents: [],
      });
    }
  }

  return files;
}

export async function listTrash() {
  return listTrashRecursive("trash");
}

export async function searchFiles(query: string, folderId: string = ROOT_FOLDER_ID) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(folderId === ROOT_FOLDER_ID ? "" : folderId, {
      limit: 100,
    });

  if (error) throw error;

  const results: DriveFile[] = [];

  if (data) {
    for (const item of data) {
      if (item.name === "" || item.name === ".folder") continue;

      if (item.name.toLowerCase().includes(query.toLowerCase())) {
        const itemPath = folderId === ROOT_FOLDER_ID
          ? item.name
          : `${folderId}/${item.name}`;

      const folder = !item.metadata?.mimetype || item.metadata?.mimetype === "application/vnd.google-apps.folder";
        const mimeType = folder
          ? "application/vnd.google-apps.folder"
          : item.metadata?.mimetype || "application/octet-stream";

        const publicUrl = folder ? null : getPublicUrl(itemPath);

        results.push({
          id: itemPath,
          name: item.name.replace(/\/$/, ""),
          mimeType,
          size: folder ? null : item.metadata?.size?.toString() || null,
          createdTime: item.created_at || null,
          modifiedTime: item.updated_at || null,
          webViewLink: publicUrl,
          webContentLink: publicUrl,
          trashed: false,
          parents: [folderId],
        });
      }
    }
  }

  return results;
}
