import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY;
const API_SECRET = process.env.EXPO_PUBLIC_CLOUDINARY_SECRET_API_KEY;

/**
 * Generates a Cloudinary signature for signed uploads.
 * Standard formula: {params_sorted_alphabetically_joined_with_&} + API_SECRET -> SHA1
 */
const generateSignature = async (params) => {
    try {
        const sortedParams = Object.keys(params)
            .sort()
            .map((key) => `${key}=${params[key]}`)
            .join("&");

        const stringToSign = sortedParams + API_SECRET;
        const signature = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA1,
            stringToSign
        );
        return signature;
    } catch (error) {
        console.error("Signature Generation Error:", error);
        throw error;
    }
};

export const uploadToCloudinary = async (fileUri) => {
    if (!fileUri) return null;

    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = "userprofile";

        // Parameters to sign (must be sorted alphabetically for signature)
        const paramsToSign = {
            folder: folder,
            timestamp: timestamp,
        };

        const signature = await generateSignature(paramsToSign);

        const uploadData = new FormData();
        uploadData.append('file', {
            uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
            type: 'image/jpeg',
            name: `upload_${timestamp}.jpg`
        });

        // Signed upload parameters
        uploadData.append('api_key', API_KEY);
        uploadData.append('timestamp', timestamp.toString());
        uploadData.append('signature', signature);
        uploadData.append('folder', folder);

        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

        const response = await fetch(url, {
            method: 'POST',
            body: uploadData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const data = await response.json();

        // Fallback to home folder if "userprofile" fails or folder is restricted
        if (data.error && data.error.message.includes("folder")) {
            console.warn("Folder failed, falling back to root...");
            return await uploadToCloudinaryFallback(fileUri);
        }

        if (data.secure_url) {
            return data.secure_url;
        } else {
            console.error("Cloudinary Signed Upload Error:", data);
            throw new Error(data.error?.message || "Upload failed");
        }
    } catch (error) {
        console.error("Error in uploadToCloudinary (Signed):", error);
        throw error;
    }
};

const uploadToCloudinaryFallback = async (fileUri) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsToSign = { timestamp: timestamp };
        const signature = await generateSignature(paramsToSign);

        const uploadData = new FormData();
        uploadData.append('file', {
            uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
            type: 'image/jpeg',
            name: `upload_home_${timestamp}.jpg`
        });

        uploadData.append('api_key', API_KEY);
        uploadData.append('timestamp', timestamp.toString());
        uploadData.append('signature', signature);

        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

        const response = await fetch(url, {
            method: 'POST',
            body: uploadData,
        });

        const data = await response.json();
        return data.secure_url || null;
    } catch (error) {
        console.error("Fallback upload failed:", error);
        return null;
    }
};
