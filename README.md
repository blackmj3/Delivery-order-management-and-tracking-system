
# 🚀 Delivery Order Management API

> نظام إدارة وتتبع الطلبات – وثائق واجهة برمجة التطبيقات (API)  
> يشمل المصادقة، الطلبات، التقييمات، الموقع، المستخدمين، والإشعارات  

---

## 🌐 Base URL
```
http://localhost:3000/api
```

---

## 🔐 Authentication

| Method | Endpoint | Body | Description |
|--------|---------|------|-------------|
| POST | `/auth/register` | `{name, email, password, phone, role}` | Register user, sends email verification |
| GET  | `/auth/verify-email/:token` | - | Verify email account |
| POST | `/auth/login` | `{email, password}` | Login, sets access & refresh cookies |
| POST | `/auth/refresh` | - | Refresh access token |
| POST | `/auth/logout` | - | Logout, clears cookies |
| POST | `/auth/forgot-password` | `{email}` | Send reset password link |
| POST | `/auth/reset-password/:token` | `{newPassword}` | Reset password using token |
| PUT  | `/auth/update-password` | `{currentPassword, newPassword}` | Update password (authenticated) |

🛡**Security:**
Argon2 password hashing
HTTP-only Cookies
Rate limiting (login & auth)
Input validation & sanitization
Activity logging
email verification via Gmail SMTP required before login

---
## 🛒 Orders

| Method | Endpoint | Body | Roles | Description |
|--------|---------|------|-------|-------------|
| GET | `/orders/my-orders` | - | CLIENT, DRIVER | Get user’s orders |
| GET | `/orders/open` | - | DRIVER | Get open orders |
| GET | `/orders/:id` | - | CLIENT, DRIVER, ADMIN | Get order by ID |
| POST| `/orders` | `{pickupAddress, description, expectedTime, deliveryLocation}` | CLIENT | Create new order |
| PUT | `/orders/:id/accept` | - | DRIVER | Accept order |
| PUT | `/orders/:id/status` | `{status}` | DRIVER, ADMIN | Update order status (transitions enforced) |

---

## 🧑‍💼 Admin

**All routes require ADMIN authentication**

| Method | Endpoint | Body | Description |
|--------|---------|------|-------------|
| GET | `/admin/ordersall` | - | Get all orders with pagination |
| GET | `/admin/orders` | Filters in query | Get orders by filters |
| GET | `/admin/orders/export` | Filters | Export orders to Excel |
| GET | `/admin/orders/:id` | - | Get order by ID |
| DELETE | `/admin/order/:id` | - | Delete order |
| PUT | `/admin/order/:id` | Updates | Update order info |
| GET | `/admin/users` | Query filters | List users |
| GET | `/admin/user/:id` | - | Get user info |
| PUT | `/admin/user/role/:id` | `{role}` | Change user role |
| PUT | `/admin/user/:id/status` | `{isActive}` | Activate/deactivate user |
| DELETE | `/admin/user/delete/:id` | - | Delete user |
| GET | `/admin/driver/:driverId/latest` | - | Get latest driver location |

---

🛠 Admin Creation Script

يتضمن المشروع سكريبت مخصص لإنشاء حساب Admin
الهدف: تهيئة النظام لأول مرة بدون تدخل مباشر في قاعدة البيانات

---

## 📍 Locations

| Method | Endpoint | Body | Roles | Description |
|--------|---------|------|-------|-------------|
| POST | `/locations` | `{driver, order, latitude, longitude}` | DRIVER | Add driver location |
| GET  | `/locations/order/:id/latest` | - | AUTH | Get latest location for order |

---

## 🗺 Live Location Tracking Demo

يوضح هذا المثال التتبع المباشر لموقع السائق أثناء تنفيذ الطلب، ويتم تحديث الموقع بشكل لحظي.

![Live Tracking Demo](Animation.gif)

---

## ⭐ Ratings

| Method | Endpoint | Body | Roles | Description |
|--------|---------|------|-------|-------------|
| POST | `/ratings/addrate/:id` | `{score, comment, userID, orderID}` | AUTH | Add driver rating |
| GET  | `/ratings/getratingdriver/:userId` | - | AUTH | Get ratings a user wrote |
| GET  | `/ratings/getratingsforthisdriver/:driverID` | - | AUTH | Get ratings for driver |
| PUT  | `/ratings/updaterating/:id` | `{score, comment}` | AUTH | Update rating |
| DELETE| `/ratings/deleterating/:driverId` | `{ratingId}` | AUTH | Delete driver rating |

---

## 👤 Users

| Method | Endpoint | Body | Roles | Description |
|--------|---------|------|-------|-------------|
| GET  | `/users/profile/:id` | - | AUTH | Get user profile |
| PUT  | `/users/updateprofile/:id` | `{name, email, phone}` | AUTH | Update profile |
| POST | `/users/local/:id` | `form-data: image` | AUTH | Upload avatar locally |
| POST | `/users/cloud/:id` | `form-data: image` | AUTH | Upload avatar to Cloudinary |
| DELETE | `/users/deleteavatar/:id` | - | AUTH | Delete avatar |

---

## 🔔 Notifications

| Method | Endpoint | Roles | Description |
|--------|---------|-------|-------------|
| PATCH | `/notifications/:id/read` | AUTH | Mark notification as read |

---

## 🛡 Security & Features

- Password hashing: Argon2  
- JWT tokens in HTTP-only cookies  
- Email verification via Gmail SMTP  
- Rate limiting applied on sensitive routes  
- Input validation & XSS sanitization  
- Activity logging for audit  
- Caching for orders, locations, and ratings  
- Automatic account lock after failed login attempts (with auto-unlock)  

---

## ⚡ Tech Stack

- Node.js – Express
- MongoDB – Mongoose
- Nodemailer (Gmail SMTP)
- Multer & Cloudinary
- Redis / In-memory Cache
- Socket.IO for real-time tracking & notifications  

---

## 📦 Notes

- All endpoints return a JSON response:  
```json
{ "success": boolean, "message": string, "data": object }
```  
- Pagination default: 5 items per page  
- Status transitions for orders enforced to prevent invalid updates  

---
