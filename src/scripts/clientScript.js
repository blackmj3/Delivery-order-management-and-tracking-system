const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");
const clientId = "696913fd3d0adbdecf55cd81";
console.log("hello from client");
//add client to connectedUsers Map
socket.emit("register", clientId);
//if order accepted join to order room
socket.on("orderAccepted", ({ orderId }) => {
  socket.emit("joinOrderRoom", { orderId });
});
//if driver update location
socket.on("locationUpdated", (data) => {
  if (!data?.location?.coordinates) {
    return;
  }
  const [longitude, latitude] = data.location.coordinates;
  console.log("Live Location:", [longitude, latitude]);
});
//notification
socket.on("newNotification", (notification) => {
  console.log("🔔 New Notification:", notification);
});
