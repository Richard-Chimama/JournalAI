
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";
import { v4 as uuidv4 } from 'uuid'; // For generating unique file names

/**
 * Converts a Data URI to a Blob object.
 */
const dataURIToBlob = (dataURI: string): Blob => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

/**
 * Uploads a file (Blob, File, or Data URI string) to Firebase Storage.
 * @param userId The ID of the user.
 * @param path The sub-path within the user's storage folder (e.g., 'journal-images', 'voice-notes').
 * @param file The file to upload. Can be a Blob, File, or a Data URI string.
 * @param fileName Optional. If not provided, a UUID will be generated.
 * @returns Promise<string> The download URL of the uploaded file.
 */
export const uploadFileToStorage = async (
  userId: string,
  path: string,
  file: Blob | File | string,
  fileName?: string
): Promise<string> => {
  let blobToUpload: Blob;
  let finalFileName = fileName;

  if (typeof file === 'string') { // It's a Data URI
    blobToUpload = dataURIToBlob(file);
    if (!finalFileName) {
      // Try to get extension from MIME type for Data URI
      const mimeType = file.substring(file.indexOf(':') + 1, file.indexOf(';'));
      const extension = mimeType.split('/')[1] || 'bin';
      finalFileName = `${uuidv4()}.${extension}`;
    }
  } else { // It's a Blob or File
    blobToUpload = file;
    if (!finalFileName) {
      const extension = (file as File).name?.split('.').pop() || 'bin';
      finalFileName = `${uuidv4()}.${extension}`;
    }
  }
  
  if(!finalFileName) finalFileName = `${uuidv4()}.bin`; // Fallback if name generation failed

  const storageRef = ref(storage, `users/${userId}/${path}/${finalFileName}`);
  await uploadBytes(storageRef, blobToUpload);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

/**
 * Deletes a file from Firebase Storage using its full download URL.
 * @param fileUrl The full download URL of the file to delete.
 * @returns Promise<void>
 */
export const deleteFileFromStorage = async (fileUrl: string): Promise<void> => {
  try {
    // Firebase Storage URLs don't directly map to ref paths if they include tokens.
    // A robust way is to use refFromURL if your SDK version supports it, or parse carefully.
    // For simplicity, if you store the storage path (e.g., users/userId/path/fileName)
    // alongside the URL, deleting becomes easier with ref(storage, storagePath).
    // Assuming the URL is a standard Firebase Storage download URL.
    const storageRef = ref(storage, fileUrl); // This creates a reference from the URL
    await deleteObject(storageRef);
  } catch (error) {
    // Handle errors, e.g., file not found, permissions issue
    // Firebase throws an error if the object does not exist, which can be ignored if desired.
    if ((error as any).code === 'storage/object-not-found') {
      console.warn(`File not found for deletion, may have already been deleted: ${fileUrl}`);
    } else {
      console.error("Error deleting file from storage:", error);
      throw error;
    }
  }
};


/**
 * Fetches a file from a Firebase Storage URL and converts it to a Data URI.
 * @param storageUrl The Firebase Storage download URL.
 * @returns Promise<string> The Data URI of the fetched file.
 */
export const getFileAsDataUrl = async (storageUrl: string): Promise<string> => {
  try {
    // Fetch the file as a blob
    const response = await fetch(storageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();

    // Convert blob to Data URI
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching file as Data URL:", error);
    throw error;
  }
};
