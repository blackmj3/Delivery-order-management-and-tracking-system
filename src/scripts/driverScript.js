const { io } = require("socket.io-client");
console.log("hello from driver");
const socket = io("http://localhost:3000");
const driverId = "65f8e1b9a2d9c1234567890a";
let locationInterval = null;
const path = [
  { lat: 24.816, lng: 46.778 },
  { lat: 24.8155, lng: 46.7775 },
  { lat: 24.815, lng: 46.777 },
  { lat: 24.8145, lng: 46.7765 },
  { lat: 24.71445, lng: 46.6772 },
  { lat: 24.614, lng: 46.675 },
];

let pathIndex = 0;
//add driver to connectedUsers map
socket.emit("register", driverId);

//if driver accept order join to order room

socket.on("orderAccepted", ({ orderId }) => {
  socket.emit("joinOrderRoom", { orderId });

  //dont create more than one Interval
  if (locationInterval) return;
  //every 5 seconds send location
  locationInterval = setInterval(() => {
    const point = path[pathIndex];

    socket.emit("updateLocation", {
      driver: driverId,
      order: orderId,
      latitude: point.lat,
      longitude: point.lng,
    });

    console.log(`Driver location sent: ${point.lat}, ${point.lng}`);

    pathIndex++;
    //stop when path is end
    if (pathIndex >= path.length) {
      clearInterval(locationInterval);
      locationInterval = null;
      console.log("Driver reached end of path");
    }
  }, 5000);
});

//notification
socket.on("newNotification", (notification) => {
  console.log("🔔 New Notification:", notification);
});
