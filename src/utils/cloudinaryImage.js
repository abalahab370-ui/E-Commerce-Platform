export function getOptimizedCloudinaryUrl(imageUrl, width, cropMode = 'limit') {
    if (typeof imageUrl !== 'string' || !imageUrl) return imageUrl;

    try {
        // Handle protocol-relative URLs (e.g., "//res.cloudinary.com/...")
        const validUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
        const url = new URL(validUrl);

        const isCloudinaryUrl = url.hostname === 'cloudinary.com' || url.hostname.endsWith('.cloudinary.com');
        if (!isCloudinaryUrl || !url.pathname.includes('/image/upload/')) {
            return imageUrl;
        }

        // Avoid adding transformations if they already exist
        if (/\/image\/upload\/f_auto/.test(url.pathname)) {
            return imageUrl;
        }

        const transformations = ['f_auto', 'q_auto:eco'];
        if (Number.isFinite(width) && width > 0) {
            transformations.push(`w_${Math.round(width)}`);
            if (cropMode) transformations.push(`c_${cropMode}`);
        }

        url.pathname = url.pathname.replace(
            '/image/upload/',
            `/image/upload/${transformations.join(',')}/`
        );

        return url.toString();
    } catch {
        return imageUrl;
    }
}