import { auth } from './firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

export const uploadProfilePicture = async (file: File): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is signed in.');
  }

  // Create a storage reference
  const storageRef = ref(storage, `profile-pictures/${user.uid}/${file.name}`);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);

  // Get the download URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
};
