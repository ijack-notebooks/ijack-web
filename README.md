# Ijack Notebooks - Ecommerce Website

A modern, dark-mode ecommerce website for selling notebooks, built with Next.js.

## Features

- 🛍️ Browse and shop different types of notebooks
- 👤 User authentication (login/signup)
- 🛒 Shopping cart functionality
- 📦 Order placement with checkout
- 🎨 Beautiful dark mode design
- 📱 Responsive layout

## Getting Started

### Prerequisites

- Node.js installed
- Backend server running (see `ijack-server` README)

### Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory (optional):

```env
# For production (default)
NEXT_PUBLIC_API_URL=https://ijack-server-pbdb.onrender.com/api

# For local development, use:
# NEXT_PUBLIC_API_URL=http://localhost:5002/api
```

**Note:** The frontend is configured to use the production backend by default (`https://ijack-server-pbdb.onrender.com/api`). If you want to use a local backend, create a `.env.local` file with the local URL.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

You can use these pre-seeded accounts to login:

- **Username:** user1, user2, user3, user4, user5
- **Password:** 1234 (for all users)

## Project Structure

```
ijack-notebooks/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── page.js       # Home page
│   │   ├── login/        # Login page
│   │   ├── signup/       # Signup page
│   │   ├── notebooks/    # Products listing
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Checkout page
│   │   └── order-confirmation/ # Order confirmation
│   ├── components/       # Reusable components
│   │   ├── Navbar.js
│   │   └── ProductCard.js
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   └── lib/              # Utilities
│       └── api.js        # API client
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework:** Next.js 16
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **HTTP Client:** Axios
