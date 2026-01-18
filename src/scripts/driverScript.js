const { io } = require("socket.io-client");
console.log("hello from driver");
const socket = io("http://localhost:3000");
const driverId = "696925f902c3284f205dffec";
let locationInterval = null;
const path = [
  { lng: 35.92617117249986, lat: 31.945073172249863 },
  { lng: 35.91861808471731, lat: 31.94492750789216 },
  { lng: 35.91587150268629, lat: 31.94703961848269 },
  { lng: 35.9125241058355, lat: 31.949515824242923 },
  { lng: 35.90891921691946, lat: 31.951118039465612 },
  { lng: 35.91170871429199, lat: 31.952359726181413 },
  { lng: 35.91213953705042, lat: 31.95326641971097 },
  { lng: 35.91081083068863, lat: 31.95376891501506 },
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

    console.log(`Driver location sent: ${point.lng}, ${point.lat}`);

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
