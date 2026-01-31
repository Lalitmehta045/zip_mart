import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import CategoryModel from './models/category.model.js';
import SubCategoryModel from './models/subCategory.model.js';
import ProductModel from './models/product.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLODINARY_CLOUD_NAME,
    api_key: process.env.CLODINARY_API_KEY,
    api_secret: process.env.CLODINARY_API_SECRET_KEY
});

const PRODUCT_PATH = path.join(__dirname, '../client/src/assets/product');

// Upload image to Cloudinary
async function uploadToCloudinary(imagePath, folder) {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: `blinkit/${folder}`,
            resource_type: 'auto'
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Error uploading ${imagePath}:`, error.message);
        return null;
    }
}

// Get all image files from a directory
function getImageFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return [];

    const files = fs.readdirSync(dirPath);
    return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });
}

// Generate dummy product details based on name
function generateProductDetails(productName) {
    const prices = [20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500];
    const units = ['250g', '500g', '1kg', '100ml', '250ml', '500ml', '1L', '1pc', '6pc', '12pc', '500g', '1 dozen'];
    const stocks = [50, 100, 150, 200, 250];

    return {
        price: prices[Math.floor(Math.random() * prices.length)],
        unit: units[Math.floor(Math.random() * units.length)],
        stock: stocks[Math.floor(Math.random() * stocks.length)],
        discount: Math.floor(Math.random() * 25), // 0-25% discount
        description: `Premium quality ${productName.toLowerCase()} at best price. Fresh and authentic product.`
    };
}

async function uploadProductsOnly() {
    try {
        console.log('🚀 Starting products upload...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing products only
        console.log('🗑️  Clearing existing products...');
        await ProductModel.deleteMany({});
        console.log('✅ Cleared existing products\n');

        // Get all categories and subcategories from database
        const categories = await CategoryModel.find({});
        const subCategories = await SubCategoryModel.find({});

        console.log(`Found ${categories.length} categories and ${subCategories.length} subcategories in database\n`);

        // Create maps for quick lookup
        const categoryMap = new Map();
        categories.forEach(cat => {
            categoryMap.set(cat.name, cat._id);
        });

        const subCategoryMap = new Map();
        subCategories.forEach(sub => {
            sub.category.forEach(catId => {
                const category = categories.find(c => c._id.equals(catId));
                if (category) {
                    const key = `${category.name}/${sub.name}`;
                    subCategoryMap.set(key, {
                        id: sub._id,
                        categoryId: catId
                    });
                }
            });
        });

        // Upload Products
        console.log('📦 Uploading Products...\n');

        if (!fs.existsSync(PRODUCT_PATH)) {
            console.log('❌ Product folder not found at:', PRODUCT_PATH);
            process.exit(1);
        }

        const categoryDirs = fs.readdirSync(PRODUCT_PATH).filter(dir => {
            return fs.statSync(path.join(PRODUCT_PATH, dir)).isDirectory();
        });

        let productCount = 0;
        let skippedCount = 0;

        for (const categoryDir of categoryDirs) {
            const categoryPath = path.join(PRODUCT_PATH, categoryDir);
            const subCategoryDirs = fs.readdirSync(categoryPath).filter(dir => {
                return fs.statSync(path.join(categoryPath, dir)).isDirectory();
            });

            for (const subCategoryDir of subCategoryDirs) {
                const subCategoryPath = path.join(categoryPath, subCategoryDir);
                const productDirs = fs.readdirSync(subCategoryPath).filter(dir => {
                    return fs.statSync(path.join(subCategoryPath, dir)).isDirectory();
                });

                const subCategoryKey = `${categoryDir}/${subCategoryDir}`;
                const subCategoryData = subCategoryMap.get(subCategoryKey);

                if (!subCategoryData) {
                    console.log(`  ⚠️  Subcategory not found: ${subCategoryKey}`);
                    skippedCount += productDirs.length;
                    continue;
                }

                for (const productDir of productDirs) {
                    const productName = productDir;
                    const productPath = path.join(subCategoryPath, productDir);
                    const productImages = getImageFiles(productPath);

                    if (productImages.length === 0) {
                        skippedCount++;
                        continue;
                    }

                    console.log(`  📸 Uploading: ${productName} (${productImages.length} images)`);

                    // Upload all product images (max 5)
                    const imageUrls = [];
                    for (const imageFile of productImages.slice(0, 5)) {
                        const imagePath = path.join(productPath, imageFile);
                        const imageUrl = await uploadToCloudinary(imagePath, 'products');
                        if (imageUrl) imageUrls.push(imageUrl);
                    }

                    if (imageUrls.length > 0) {
                        const productDetails = generateProductDetails(productName);

                        const product = new ProductModel({
                            name: productName,
                            image: imageUrls,
                            category: [subCategoryData.categoryId],
                            subCategory: [subCategoryData.id],
                            ...productDetails
                        });

                        await product.save();
                        productCount++;
                        console.log(`  ✅ Created: ${productName} (${imageUrls.length} images, ₹${productDetails.price})`);
                    } else {
                        skippedCount++;
                    }
                }
            }
        }

        console.log(`\n🎉 Products upload completed!\n`);
        console.log(`Summary:`);
        console.log(`  ✅ Products uploaded: ${productCount}`);
        console.log(`  ⚠️  Products skipped: ${skippedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during products upload:', error);
        process.exit(1);
    }
}

uploadProductsOnly();
