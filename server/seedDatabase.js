import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CategoryModel from './models/category.model.js';
import SubCategoryModel from './models/subCategory.model.js';
import ProductModel from './models/product.model.js';

dotenv.config();

// Sample data
const categories = [
    { name: 'Vegetables & Fruits', image: 'https://cdn-icons-png.flaticon.com/512/135/135620.png' },
    { name: 'Dairy & Breakfast', image: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png' },
    { name: 'Munchies', image: 'https://cdn-icons-png.flaticon.com/512/3480/3480822.png' },
    { name: 'Cold Drinks & Juices', image: 'https://cdn-icons-png.flaticon.com/512/2718/2718537.png' },
    { name: 'Instant & Frozen Food', image: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png' },
    { name: 'Tea, Coffee & Health Drinks', image: 'https://cdn-icons-png.flaticon.com/512/924/924514.png' },
    { name: 'Bakery & Biscuits', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png' },
    { name: 'Sweet Tooth', image: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png' }
];

const subCategories = [
    { name: 'Fresh Vegetables', category: [] },
    { name: 'Fresh Fruits', category: [] },
    { name: 'Milk', category: [] },
    { name: 'Bread & Pav', category: [] },
    { name: 'Chips & Crisps', category: [] },
    { name: 'Namkeen', category: [] },
    { name: 'Soft Drinks', category: [] },
    { name: 'Juices', category: [] }
];

const products = [
    {
        name: 'Fresh Tomato',
        image: ['https://cdn-icons-png.flaticon.com/512/1202/1202045.png'],
        unit: '1 kg',
        stock: 100,
        price: 40,
        discount: 5,
        description: 'Fresh and juicy tomatoes'
    },
    {
        name: 'Fresh Potato',
        image: ['https://cdn-icons-png.flaticon.com/512/2224/2224066.png'],
        unit: '1 kg',
        stock: 150,
        price: 30,
        discount: 0,
        description: 'Farm fresh potatoes'
    },
    {
        name: 'Fresh Onion',
        image: ['https://cdn-icons-png.flaticon.com/512/1652/1652121.png'],
        unit: '1 kg',
        stock: 120,
        price: 35,
        discount: 10,
        description: 'Premium quality onions'
    },
    {
        name: 'Apple',
        image: ['https://cdn-icons-png.flaticon.com/512/415/415733.png'],
        unit: '1 kg',
        stock: 80,
        price: 150,
        discount: 15,
        description: 'Sweet and crunchy apples'
    },
    {
        name: 'Banana',
        image: ['https://cdn-icons-png.flaticon.com/512/2909/2909761.png'],
        unit: '1 dozen',
        stock: 200,
        price: 50,
        discount: 0,
        description: 'Fresh bananas'
    },
    {
        name: 'Amul Milk',
        image: ['https://cdn-icons-png.flaticon.com/512/869/869636.png'],
        unit: '500 ml',
        stock: 100,
        price: 28,
        discount: 0,
        description: 'Full cream milk'
    },
    {
        name: 'Brown Bread',
        image: ['https://cdn-icons-png.flaticon.com/512/3081/3081986.png'],
        unit: '400g',
        stock: 50,
        price: 45,
        discount: 5,
        description: 'Healthy brown bread'
    },
    {
        name: 'Lays Chips',
        image: ['https://cdn-icons-png.flaticon.com/512/2553/2553642.png'],
        unit: '50g',
        stock: 200,
        price: 20,
        discount: 0,
        description: 'Classic salted chips'
    },
    {
        name: 'Coca Cola',
        image: ['https://cdn-icons-png.flaticon.com/512/2405/2405479.png'],
        unit: '750 ml',
        stock: 150,
        price: 40,
        discount: 10,
        description: 'Refreshing cold drink'
    },
    {
        name: 'Mango Juice',
        image: ['https://cdn-icons-png.flaticon.com/512/1625/1625048.png'],
        unit: '1 L',
        stock: 80,
        price: 80,
        discount: 5,
        description: 'Fresh mango juice'
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await CategoryModel.deleteMany({});
        await SubCategoryModel.deleteMany({});
        await ProductModel.deleteMany({});
        console.log('Cleared existing data');

        // Insert categories
        const insertedCategories = await CategoryModel.insertMany(categories);
        console.log(`Inserted ${insertedCategories.length} categories`);

        // Assign categories to subcategories
        subCategories[0].category = [insertedCategories[0]._id]; // Fresh Vegetables -> Vegetables & Fruits
        subCategories[1].category = [insertedCategories[0]._id]; // Fresh Fruits -> Vegetables & Fruits
        subCategories[2].category = [insertedCategories[1]._id]; // Milk -> Dairy & Breakfast
        subCategories[3].category = [insertedCategories[1]._id]; // Bread -> Dairy & Breakfast
        subCategories[4].category = [insertedCategories[2]._id]; // Chips -> Munchies
        subCategories[5].category = [insertedCategories[2]._id]; // Namkeen -> Munchies
        subCategories[6].category = [insertedCategories[3]._id]; // Soft Drinks -> Cold Drinks
        subCategories[7].category = [insertedCategories[3]._id]; // Juices -> Cold Drinks

        const insertedSubCategories = await SubCategoryModel.insertMany(subCategories);
        console.log(`Inserted ${insertedSubCategories.length} subcategories`);

        // Assign categories and subcategories to products
        products[0].category = [insertedCategories[0]._id];
        products[0].subCategory = [insertedSubCategories[0]._id];

        products[1].category = [insertedCategories[0]._id];
        products[1].subCategory = [insertedSubCategories[0]._id];

        products[2].category = [insertedCategories[0]._id];
        products[2].subCategory = [insertedSubCategories[0]._id];

        products[3].category = [insertedCategories[0]._id];
        products[3].subCategory = [insertedSubCategories[1]._id];

        products[4].category = [insertedCategories[0]._id];
        products[4].subCategory = [insertedSubCategories[1]._id];

        products[5].category = [insertedCategories[1]._id];
        products[5].subCategory = [insertedSubCategories[2]._id];

        products[6].category = [insertedCategories[1]._id];
        products[6].subCategory = [insertedSubCategories[3]._id];

        products[7].category = [insertedCategories[2]._id];
        products[7].subCategory = [insertedSubCategories[4]._id];

        products[8].category = [insertedCategories[3]._id];
        products[8].subCategory = [insertedSubCategories[6]._id];

        products[9].category = [insertedCategories[3]._id];
        products[9].subCategory = [insertedSubCategories[7]._id];

        const insertedProducts = await ProductModel.insertMany(products);
        console.log(`Inserted ${insertedProducts.length} products`);

        console.log('\n✅ Database seeded successfully!');
        console.log(`Total: ${insertedCategories.length} categories, ${insertedSubCategories.length} subcategories, ${insertedProducts.length} products`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
