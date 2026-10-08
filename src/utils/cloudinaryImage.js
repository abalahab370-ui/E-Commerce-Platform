export function getOptimizedCloudinaryUrl(imageUrl, width) {
    if (typeof imageUrl !== 'string' || !imageUrl) return imageUrl;

    try {
        const url = new URL(imageUrl);
        const isCloudinaryUrl = url.hostname === 'cloudinary.com'
            || url.hostname.endsWith('.cloudinary.com');

        if (!isCloudinaryUrl || !url.pathname.includes('/image/upload/')) {
            return imageUrl;
        }

        const transformations = ['f_auto', 'q_auto:eco'];
        if (Number.isFinite(width) && width > 0) {
            transformations.push(`w_${Math.round(width)}`);
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