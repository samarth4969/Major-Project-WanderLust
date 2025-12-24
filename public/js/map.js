mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/standard-satellite",
  projection: "globe",
  zoom: 12,
  center: listing.geometry.coordinates,
});

const marker = new mapboxgl.Marker({ color: "black" })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <h4>${listing.title}</h4>
            <p>Exact location provided after booking</p>
        `)
  )
  .addTo(map);

// 🔥 IMPORTANT for mobile responsiveness
window.addEventListener("resize", () => {
  map.resize();
});
