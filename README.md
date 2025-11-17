# 🌙 Moona - Investment Portfolio Tracker

A modern, full-stack investment portfolio tracking application with real-time price updates, comprehensive analytics, and beautiful UI. Track stocks, cryptocurrencies, and Roth IRA investments all in one place.

![Moona Dashboard](https://img.shields.io/badge/Status-Production%20Ready-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React](https://img.shields.io/badge/React-19.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality
- **Multi-Asset Tracking**: Stocks, Cryptocurrencies, and Roth IRA accounts
- **Real-Time Price Updates**: Automatic price fetching from multiple sources (Yahoo Finance, CoinGecko, Alpha Vantage)
- **Portfolio Analytics**: Comprehensive performance metrics, gain/loss calculations, and return percentages
- **Visual Analytics**: Interactive charts for performance, allocation, and SPY comparison
- **Excel Export**: Export your entire portfolio to a formatted Excel file
- **Search & Filter**: Find holdings by symbol, type, or sector

### User Experience
- **Modern UI**: Glassmorphism design with gradient elements and smooth animations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **OAuth Authentication**: Secure Google OAuth login with session management
- **Protected Routes**: Secure access to dashboard and portfolio data
- **Toast Notifications**: User-friendly feedback for all actions

### Technical Features
- **Price Caching**: 5-minute cache to reduce API calls and improve performance
- **Rate Limiting**: Intelligent batch processing for external API calls
- **Error Handling**: Graceful fallbacks with mock data when APIs are unavailable
- **Async Operations**: Fully asynchronous backend for optimal performance

## 🛠 Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **MongoDB**: NoSQL database with Motor async driver
- **Python 3.8+**: Core programming language
- **Pydantic**: Data validation and settings management
- **PyCoinGecko**: Cryptocurrency price data
- **OpenPyXL**: Excel file generation

### Frontend
- **React 19**: UI library
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **Axios**: HTTP client for API calls
- **Recharts**: Chart library for data visualization

### External Services
- **Yahoo Finance API**: Stock price data (free, no API key required)
- **CoinGecko API**: Cryptocurrency price data (free tier)
- **Alpha Vantage**: Stock price data (optional, requires API key)
- **Emergent Auth**: OAuth authentication service

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** and **npm/yarn** ([Download](https://nodejs.org/))
- **MongoDB Atlas account** or local MongoDB instance ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Moona-main.git
cd Moona-main
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
# or
yarn install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB Configuration
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=moona_db

# CORS Configuration (comma-separated for multiple origins)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Optional: Alpha Vantage API Key (for enhanced stock data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` with your backend URL:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

## 🏃 Running the Application

### Start Backend Server

```bash
# From backend directory
cd backend

# Activate virtual environment (if not already active)
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Run the server
uvicorn server:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

API documentation (Swagger UI) will be available at `http://localhost:8000/docs`

### Start Frontend Development Server

```bash
# From frontend directory
cd frontend

# Start development server
npm start
# or
yarn start
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
Moona-main/
├── backend/
│   ├── auth.py              # Authentication routes and session management
│   ├── holdings.py          # Holdings CRUD operations
│   ├── price_service.py     # Price fetching service with caching
│   ├── excel_export.py     # Excel export functionality
│   ├── company_data.py      # Company name and sector mappings
│   ├── server.py            # FastAPI application entry point
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (not in repo)
│
├── frontend/
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── InvestmentList.jsx
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── holdingsService.js
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── contracts.md             # Project specifications
├── README.md               # This file
└── API.md                  # API documentation
```

## 📚 API Documentation

For detailed API documentation, see [API.md](./API.md)

Quick overview:
- **Authentication**: `/api/auth/*` - OAuth, session management
- **Holdings**: `/api/holdings/*` - CRUD operations for investments
- **Export**: `/api/export/*` - Excel export functionality

Interactive API documentation is available at `http://localhost:8000/docs` when the backend is running.

## 🔐 Authentication

Moona uses OAuth authentication with Google via Emergent Auth service.

### Authentication Flow

1. User clicks "Sign in with Google" on the login page
2. Redirects to OAuth provider (Google)
3. User authorizes the application
4. OAuth provider redirects back with session token
5. Frontend sends session token to backend
6. Backend validates and stores session in MongoDB
7. Session cookie is set (HttpOnly, Secure, SameSite=None)
8. User is redirected to dashboard

### Session Management

- Sessions are stored in MongoDB with 7-day expiry
- HttpOnly cookies prevent XSS attacks
- Secure flag ensures HTTPS-only transmission
- SameSite=None allows cross-site requests (for production)

### Protected Routes

All holdings and export endpoints require authentication. The backend validates the session token from cookies or Authorization header.

## 🚢 Deployment

### Backend Deployment

#### Option 1: Railway / Render / Heroku

1. Create a new project
2. Connect your GitHub repository
3. Set environment variables in the platform dashboard
4. Deploy from `backend/` directory
5. Set start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

#### Option 2: Docker

```dockerfile
# Dockerfile (in backend/)
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t moona-backend ./backend
docker run -p 8000:8000 --env-file ./backend/.env moona-backend
```

### Frontend Deployment

#### Option 1: Vercel / Netlify

1. Connect your GitHub repository
2. Set build directory to `frontend`
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory to `frontend/build`
5. Add environment variable: `REACT_APP_BACKEND_URL=your_backend_url`

#### Option 2: Static Hosting

```bash
cd frontend
npm run build
# Upload the build/ directory to your hosting provider
```

### Environment Variables for Production

**Backend:**
```env
MONGO_URL=your_production_mongodb_url
DB_NAME=moona_production
CORS_ORIGINS=https://your-frontend-domain.com
ALPHA_VANTAGE_API_KEY=your_key (optional)
```

**Frontend:**
```env
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

## 🧪 Testing

### Backend Testing

Test files are available in the root directory:
- `auth_test.py` - Authentication flow testing
- `backend_test.py` - Holdings API testing
- `working_backend_test.py` - Comprehensive API tests

Run tests:
```bash
python backend_test.py
```

### Frontend Testing

```bash
cd frontend
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint/Prettier for JavaScript/React code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [API Documentation](./API.md)
2. Review existing [Issues](https://github.com/yourusername/Moona-main/issues)
3. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Gold & Silver tracking
- [ ] Historical price charts
- [ ] Dividend tracking
- [ ] Tax reporting features
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Portfolio sharing
- [ ] Advanced analytics and insights

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [CoinGecko](https://www.coingecko.com/) for cryptocurrency data
- [Yahoo Finance](https://finance.yahoo.com/) for stock market data
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent framework

---

**Made with ❤️ by the Moona Team**
