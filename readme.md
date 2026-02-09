# ZipMart - Quick Grocery Delivery App

A full-stack e-commerce platform for grocery delivery, built with MERN stack.

## Live Demo
🔗 [zipmart.vercel.app](https://zipmart.vercel.app)

## What's This About?

I built this as a Blinkit-inspired grocery delivery app where users can browse products, add them to cart, and checkout with Stripe payments. There's also an admin panel to manage products and orders.

## Tech Stack

**Frontend:**
- React with Vite
- Redux Toolkit for state
- Tailwind CSS
- React Router

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- Stripe for payments

**Other stuff:**
- Cloudinary for images
- Resend for emails
- Deployed on Vercel

## Main Features

- User login/signup with email verification
- Browse products by category
- Search and filter
- Shopping cart
- Multiple delivery addresses
- Stripe checkout
- Order history
- Admin dashboard for managing everything

## Running Locally

1. Clone the repo
```bash
git clone https://github.com/Lalitmehta045/zip_mart.git
cd zip_mart
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables

Create `.env` in server folder:
```
MONGODB_URI=your_mongodb_uri
SECRET_KEY_ACCESS_TOKEN=your_secret
SECRET_KEY_REFRESH_TOKEN=your_secret
FRONTEND_URL=http://localhost:5173
CLODINARY_CLOUD_NAME=your_cloudinary_name
CLODINARY_API_KEY=your_key
CLODINARY_API_SECRET_KEY=your_secret
STRIPE_SECRET_KEY=your_stripe_key
RESEND_API_KEY=your_resend_key
```

Create `.env` in client folder:
```
VITE_API_URL=http://localhost:8080
```

4. Run the app
```bash
# Run server (from server folder)
npm run dev

# Run client (from client folder)
npm run dev
```

Server runs on `http://localhost:8080`  
Client runs on `http://localhost:5173`

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   └── utils/         # Helper functions
│   └── package.json
│
├── server/                # Express backend
│   ├── controllers/       # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & other middleware
│   └── package.json
│
└── api/                  # Vercel serverless functions
    └── index.js
```

## Deployment

The app is deployed on Vercel. Frontend is served as static files and backend runs as serverless functions.

Key files:
- `vercel.json` - Deployment config
- `api/index.js` - Serverless function entry

## Things I Learned

- Setting up serverless functions on Vercel
- Integrating Stripe payments
- Managing state with Redux Toolkit
- Working with Cloudinary for image uploads
- JWT authentication with refresh tokens

## Future Plans

- Add product reviews
- Real-time order tracking
- Wishlist feature
- Better mobile experience
- Admin analytics dashboard

## Issues?

If something's not working, feel free to open an issue or reach out.

---

Made with ☕ by Lalit Mehta