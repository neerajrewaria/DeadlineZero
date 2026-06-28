const cloudinary = require("cloudinary").v2

exports.uploadImageToCloudinary = async (files, folder, height, quality) => {
    try {
        console.log("Pass 9.1");
        const options = { folder }
        if (height) {
            options.height = height;
        }
        if (quality) {
            options.quality = quality;
        }
        options.resource_type = "auto";
        console.log("Pass 9.2");
        const response = await cloudinary.uploader.upload(files.tempFilePath, options);
        if (!response) {
            console.log("Pass 9.3");
        }
        console.log("Pass 9.4");
        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
}