# Delivery-order-management-and-tracking-system
The Order model represents a delivery request created by a client and handled by a driver.

Fields
Field	Type	Description
client	ObjectId (User)	Client who created the order
driver	ObjectId (User)	Assigned driver (nullable)
pickupAddress	String	Pickup location
deliveryAddress	String	Delivery location
description	String	Order details
status	String	Current order status
expectedTime	Date	Expected delivery time
createdAt	Date	Creation timestamp
updatedAt	Date	Last update timestamp
 Order Status Flow

The order lifecycle follows a controlled state machine:

PENDING → ACCEPTED → ON_THE_WAY → DELIVERED
          ↘ CANCELLED

Invalid transitions are rejected by the backend.

 Order API Endpoints
 Create Order (Client)

POST /orders

Creates a new delivery order.

Get My Orders (Client / Driver)

GET /orders/my-orders

Returns orders related to the authenticated user.

Get Open Orders (Driver)

GET /orders/open

Returns all orders with status PENDING.

 Accept Order (Driver)

PUT /orders/:id/accept

Allows a driver to accept an available order.

 Update Order Status (Driver / Admin)

PUT /orders/:id/status

Updates the order status following allowed transitions.

 Get Order By ID (All Authorized Roles)

GET /orders/:id

Returns detailed order information with access control.

 Access Control Rules

Client: Can create and view own orders

Driver: Can view open orders, accept orders, and update assigned orders

Admin: Full access to all orders

POSTMAN URL : https://razanhamad281-6647129.postman.co/workspace/student-fullstack-developer's-W~f3a2906e-a542-445c-842e-adbe9ef9e785/request/49734982-ff99622d-5c46-4085-8d53-b02dd6435774?action=share&creator=49734982 
