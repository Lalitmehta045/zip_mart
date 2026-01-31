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

const ASSETS_PATH = path.join(__dirname, '../client/src/assets/Assets_image/Image');
const CATEGORY_PATH = path.join(ASSETS_PATH, 'category');
const SUBCATEGORY_PATH = path.join(ASSETS_PATH, 'sub category');
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
    const prices = [20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300];
    const units = ['250g', '500g', '1kg', '100ml', '250ml', '500ml', '1L', '1pc', '6pc', '12pc'];
    const stocks = [50, 100, 150, 200];

    return {
        price: prices[Math.floor(Math.random() * prices.length)],
        unit: units[Math.floor(Math.random() * units.length)],
        stock: stocks[Math.floor(Math.random() * stocks.length)],
        discount: Math.floor(Math.random() * 20), // 0-20% discount
        description: `High quality ${productName.toLowerCase()} available at best price`
    };
}

async function bulkUpload() {
    try {
        console.log('🚀 Starting bulk upload...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await ProductModel.deleteMany({});
        await SubCategoryModel.deleteMany({});
        await CategoryModel.deleteMany({});
        console.log('✅ Cleared existing data\n');

        const categoryMap = new Map();
        const subCategoryMap = new Map();

        // Step 1: Upload Categories
        console.log('📁 Uploading Categories...');
        const categoryFiles = getImageFiles(CATEGORY_PATH);

        for (const file of categoryFiles) {
            const categoryName = path.basename(file, path.extname(file));
            const imagePath = path.join(CATEGORY_PATH, file);

            console.log(`  Uploading category: ${categoryName}`);
            const imageUrl = await uploadToCloudinary(imagePath, 'categories');

            if (imageUrl) {
                const category = new CategoryModel({
                    name: categoryName,
                    image: imageUrl
                });
                await category.save();
                categoryMap.set(categoryName, category._id);
                console.log(`  ✅ Created: ${categoryName}`);
            }
        }
        console.log(`\n✅ Uploaded ${categoryMap.size} categories\n`);

        // Step 2: Upload Subcategories
        console.log('📂 Uploading Subcategories...');
        const categoryDirs = fs.readdirSync(SUBCATEGORY_PATH).filter(dir => {
            return fs.statSync(path.join(SUBCATEGORY_PATH, dir)).isDirectory();
        });

        for (const categoryDir of categoryDirs) {
            const categoryId = categoryMap.get(categoryDir);
            if (!categoryId) {
                console.log(`  ⚠️  Category not found for: ${categoryDir}`);
                continue;
            }

            const subCategoryFiles = getImageFiles(path.join(SUBCATEGORY_PATH, categoryDir));

            for (const file of subCategoryFiles) {
                const subCategoryName = path.basename(file, path.extname(file));
                const imagePath = path.join(SUBCATEGORY_PATH, categoryDir, file);

                console.log(`  Uploading subcategory: ${categoryDir} → ${subCategoryName}`);
                const imageUrl = await uploadToCloudinary(imagePath, 'subcategories');

                if (imageUrl) {
                    const subCategory = new SubCategoryModel({
                        name: subCategoryName,
                        image: imageUrl,
                        category: [categoryId]
                    });
                    await subCategory.save();
                    subCategoryMap.set(`${categoryDir}/${subCategoryName}`, {
                        id: subCategory._id,
                        categoryId: categoryId
                    });
                    console.log(`  ✅ Created: ${subCategoryName}`);
                }
            }
        }
        console.log(`\n✅ Uploaded ${subCategoryMap.size} subcategories\n`);

        // Step 3: Upload Products
        console.log('📦 Uploading Products...');

        if (!fs.existsSync(PRODUCT_PATH)) {
            console.log('⚠️  Product folder not found. Please extract product.zip first.');
            process.exit(0);
        }

        const productCategoryDirs = fs.readdirSync(PRODUCT_PATH).filter(dir => {
            return fs.statSync(path.join(PRODUCT_PATH, dir)).isDirectory();
        });

        let productCount = 0;

        for (const categoryDir of productCategoryDirs) {
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
                    continue;
                }

                for (const productDir of productDirs) {
                    const productName = productDir;
                    const productPath = path.join(subCategoryPath, productDir);
                    const productImages = getImageFiles(productPath);

                    if (productImages.length === 0) continue;

                    console.log(`  Uploading product: ${productName}`);

                    // Upload all product images
                    const imageUrls = [];
                    for (const imageFile of productImages.slice(0, 5)) { // Max 5 images per product
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
                        console.log(`  ✅ Created: ${productName} (${imageUrls.length} images)`);
                    }
                }
            }
        }

        console.log(`\n✅ Uploaded ${productCount} products\n`);
        console.log('🎉 Bulk upload completed successfully!');
        console.log(`\nSummary:`);
        console.log(`  Categories: ${categoryMap.size}`);
        console.log(`  Subcategories: ${subCategoryMap.size}`);
        console.log(`  Products: ${productCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during bulk upload:', error);
        process.exit(1);
    }
}

bulkUpload();
