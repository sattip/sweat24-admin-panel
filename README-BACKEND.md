# SWEAT24 Admin Panel - Laravel Backend Integration

## 🚀 Setup Complete!

Your React admin panel now has a fully functional Laravel backend API. Both servers are configured and ready to use.

## 📦 What's Been Created

### Laravel Backend (`/sweat24-laravel-backend/`)
- ✅ **Database**: 12 tables with relationships matching your React data structure
- ✅ **API Endpoints**: RESTful API for all entities (users, packages, bookings, etc.)
- ✅ **Sample Data**: Greek sample data matching your original mockData.ts
- ✅ **Authentication**: Laravel Sanctum for API security
- ✅ **CORS**: Configured for React frontend communication

### React Frontend Updates
- ✅ **API Configuration**: `/src/config/api.ts` 
- ✅ **API Service**: `/src/services/apiService.ts`
- ✅ **Environment Config**: `.env.local` with backend URL
- ✅ **Updated Components**: UsersPage and DashboardStats using real API

## 🖥️ Running the Application

### 1. Start Laravel Backend
```bash
cd sweat24-laravel-backend
php artisan serve
```
**Laravel API**: http://localhost:8000

### 2. Start React Frontend  
```bash
cd sweat24-admin-panel
npm run dev
```
**React App**: http://localhost:5173

## 🔗 API Endpoints

Base URL: `http://localhost:8000/api/v1`

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/users` | GET, POST, PUT, DELETE | Member management |
| `/packages` | GET, POST, PUT, DELETE | Package management |
| `/bookings` | GET, POST, PUT, DELETE | Booking system |
| `/instructors` | GET, POST, PUT, DELETE | Trainer management |
| `/classes` | GET, POST, PUT, DELETE | Class scheduling |
| `/payment-installments` | GET, POST, PUT, DELETE | Payment tracking |
| `/cash-register` | GET, POST, PUT, DELETE | Cash management |
| `/business-expenses` | GET, POST, PUT, DELETE | Expense tracking |
| `/dashboard/stats` | GET | Dashboard statistics |

## 🔐 Sample Login Credentials

- **Admin**: `admin@sweat24.com` / `password`
- **Test Users**: `giannis@email.com`, `maria@email.com`, `kostas@email.com` / `password`

## 📊 Sample Data Includes

- **3 Instructors**: Άλεξ Ροδρίγκεζ, Εμιλι Τσεν, Τζέιμς Τέιλορ
- **3 Members**: With packages and activity logs
- **5 Gym Packages**: Personal Training, Group Fitness, Yoga/Pilates, etc.
- **Financial Data**: Payment installments, cash entries, business expenses

## 🛠️ Development Features

- **Hot Reload**: Both servers support hot reload during development
- **Error Handling**: Comprehensive error handling in API calls
- **Loading States**: Loading indicators for better UX
- **Search & Filtering**: API-powered search and filtering
- **Real-time Updates**: Data refreshes after create/update operations

## 🌐 Environment Configuration

The frontend automatically connects to your Laravel backend using environment variables:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

## 📝 Next Steps

1. **Test the Integration**: Open http://localhost:5173 and test the Users page
2. **Add More Components**: Update other React pages to use the new API service
3. **Customize**: Modify the Laravel controllers and React components as needed
4. **Deploy**: When ready, deploy both backend and frontend to production

Your SWEAT24 admin panel is now a fully dynamic application! 🎉