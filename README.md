# Delivery-order-management-and-tracking-system

## Postman_URL(Users-Ratings) : 
- https://documenter.getpostman.com/view/49722654/2sBXVZpF4s

## Delivery order management and tracking system :
### API Documents : 
- USERS API :
- GET  /users/profile/:id :  get user information
- POST /users/local/:id : upload avatar user to multer
- POST /users/cloud/:id : upload avatar user to cloudinary
- PUT /users/updateprofile/:id : update profile user 
- DELETE /usres/deleteavatar/:id : delete user's avatar

### API Documents :
- RATING API :
- GET /Rating/getratingdriver/:userId : get all rating that user creates it   
- GET /Rating/getratingsforthisdriver/:driverID : get all ratings for the selected driver
- POST /Rating/addrate/:id : Add rating to driver with the user who rates and his order
- PUT /Rating/updaterating/:id : update rating
- DELETE /Rating/deletrating/:driverId : delete Rating

## Security methods :
- express-validator : for users and ratings Apis
- express-rate-limit : for APIS and Login
- xss
- helmet

## Error methods :
- Handel Error 
- Not Found

## Upload Images methods :
- Cloudinary
- Multer
﻿
Name
