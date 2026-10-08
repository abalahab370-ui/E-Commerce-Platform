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

        const transformations = ['f_auto', 'q_auto:eco'];
        if (Number.isFinite(width) && width > 0) {
            transformations.push(`w_${Math.round(width)}`);
            if (cropMode) transformations.push(`c_${cropMode}`);
        }

        const uploadPath = '/image/upload/';
        const uploadPathIndex = url.pathname.indexOf(uploadPath);
        const assetPathStart = uploadPathIndex + uploadPath.length;
        const pathAfterUpload = url.pathname.slice(assetPathStart);
        const firstPathSegment = pathAfterUpload.split('/')[0];
        const hasExistingTransformations = /^(?:f_|q_|w_|h_|c_|ar_|dpr_|g_|e_|fl_|t_)/.test(firstPathSegment);
        const assetPath = hasExistingTransformations
            ? pathAfterUpload.slice(firstPathSegment.length + 1)
            : pathAfterUpload;

        url.pathname = `${url.pathname.slice(0, uploadPathIndex)}${uploadPath}${transformations.join(',')}/${assetPath}`;

        return url.toString();
    } catch {
        return imageUrl;
    }
}