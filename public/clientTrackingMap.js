/*********************************
 *  MAPBOX CONFIG
 *********************************/
mapboxgl.accessToken =
  "pk.eyJ1IjoibGFuYS1uYiIsImEiOiJjbWs2anpldWcwbTBzM2VzaGVnOTM3OTgwIn0.iqkeE8Y4feaNPqPO125g5A";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [35.91055, 31.9539],
  zoom: 13,
});

/*********************************
 *  SOCKET.IO CONFIG
 *********************************/
const socket = io("http://localhost:3000");
const clientId = "695ae34503480665b8f821ed";

// register client
socket.emit("register", clientId);

/*********************************
 *  MAP ELEMENTS
 *********************************/
let driverMarker = null;
let clientMarker = null;

/*********************************
 *  HELPERS
 *********************************/
function createMarker(color) {
  return new mapboxgl.Marker({ color });
}

function setClientLocation(lng, lat) {
  if (!clientMarker) {
    clientMarker = createMarker("red").setLngLat([lng, lat]).addTo(map);
  }
}

/*********************************
 *  ROUTE DRAWING
 *********************************/
async function drawRoute(from, to) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from[0]},${from[1]};${to[0]},${to[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data.routes?.length) return;

  const route = data.routes[0].geometry;

  if (map.getSource("route")) {
    map.getSource("route").setData({
      type: "Feature",
      geometry: route,
    });
    return;
  }

  map.addSource("route", {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: route,
    },
  });

  map.addLayer({
    id: "route",
    type: "line",
    source: "route",
    paint: {
      "line-color": "#1db7dd",
      "line-width": 5,
    },
  });
}

/*********************************
 *  SOCKET EVENTS
 *********************************/

// when order accepted → join room
socket.on("orderAccepted", ({ orderId }) => {
  socket.emit("joinOrderRoom", { orderId });
});

// live driver location
socket.on("locationUpdated", (data) => {
  if (!data?.location?.coordinates) return;

  const [lng, lat] = data.location.coordinates;

  // driver marker
  if (!driverMarker) {
    driverMarker = createMarker("blue").setLngLat([lng, lat]).addTo(map);
  } else {
    driverMarker.setLngLat([lng, lat]);
  }

  if (clientMarker) {
    const centerLat = (lat + clientMarker.getLngLat().lat) / 2;
    const centerLng = (lng + clientMarker.getLngLat().lng) / 2;
    //zoom on map to show the rout
    map.flyTo({
      center: [centerLng, centerLat],
      zoom: 15,
      speed: 0.7,
      curve: 1,
    });

    drawRoute(clientMarker.getLngLat().toArray(), [lng, lat]);
  } else {
    //if client not found show the driver
    map.flyTo({
      center: [lng, lat],
      zoom: 15,
      speed: 0.7,
    });
  }
});

// notifications
socket.on("newNotification", (notification) => {
  if (!driverMarker) return;

  new mapboxgl.Popup({ offset: 25 })
    .setLngLat(driverMarker.getLngLat())
    .setHTML(
      `
      <strong>${notification.title}</strong>
      <p>${notification.message}</p>
    `
    )
    .addTo(map);
});

/*********************************
 *  INITIAL CLIENT LOCATION
 *********************************/
setClientLocation(35.91055, 31.9539);
