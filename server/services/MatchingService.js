const { haversineDistance } = require('../utils/haversine');

/**
 * MatchingService — core intelligent ride matching logic.
 *
 * Algorithm:
 *  1. Proximity score: how close is driver's pickup to rider's pickup? (0-40 pts)
 *  2. Route score: how aligned is the driver's full route with the rider's route? (0-40 pts)
 *  3. Time score: how close are departure times? (0-20 pts)
 *
 * Total: 0–100 match score.
 * Time complexity: O(n) per ride; O(n log n) for ranked sort.
 */

const MAX_PROXIMITY_KM = 10; // rider pickup within 10km of driver = full score
const MAX_TIME_DIFF_MIN = 60; // within 60 min window = full time score

/**
 * Calculate match score between a driver's ride and a rider's requested route.
 * @param {Object} driverRide - RidePool document
 * @param {number[]} riderPickupCoords - [lng, lat]
 * @param {number[]} riderDropCoords   - [lng, lat]
 * @param {Date}    riderDepartureTime
 * @returns {number} score 0-100
 */
function calculateMatchScore(driverRide, riderPickupCoords, riderDropCoords, riderDepartureTime) {
  const [driverPickupLng, driverPickupLat] = driverRide.pickup_location.coordinates;
  const [driverDropLng, driverDropLat] = driverRide.drop_location.coordinates;
  const [riderPickupLng, riderPickupLat] = riderPickupCoords;
  const [riderDropLng, riderDropLat] = riderDropCoords;

  // --- 1. Pickup proximity score (0-40) ---
  const pickupDist = haversineDistance(
    riderPickupLat, riderPickupLng,
    driverPickupLat, driverPickupLng
  );
  const pickupScore = Math.max(0, (1 - pickupDist / MAX_PROXIMITY_KM)) * 40;

  // --- 2. Route alignment score (0-40) ---
  // Project rider's pickup+drop onto the driver's route vector
  const driverRouteDist = haversineDistance(
    driverPickupLat, driverPickupLng,
    driverDropLat, driverDropLng
  );

  // Check if rider's drop is "between" driver's pickup and drop (directional match)
  const distToRiderDrop = haversineDistance(
    driverPickupLat, driverPickupLng,
    riderDropLat, riderDropLng
  );
  const distFromRiderDropToDriverDrop = haversineDistance(
    riderDropLat, riderDropLng,
    driverDropLat, driverDropLng
  );

  // If the sum of (driver_pickup→rider_drop) + (rider_drop→driver_drop) ≈ driver full route,
  // the rider's drop is on-route. Penalty for detour.
  const detourDist = Math.abs(
    distToRiderDrop + distFromRiderDropToDriverDrop - driverRouteDist
  );
  const maxAllowableDetour = driverRouteDist * 0.3; // 30% detour allowed
  const routeScore = Math.max(0, (1 - detourDist / maxAllowableDetour)) * 40;

  // --- 3. Time compatibility score (0-20) ---
  let timeScore = 0;
  if (riderDepartureTime) {
    const diffMs = Math.abs(
      new Date(driverRide.departure_time) - new Date(riderDepartureTime)
    );
    const diffMin = diffMs / 60000;
    timeScore = Math.max(0, (1 - diffMin / MAX_TIME_DIFF_MIN)) * 20;
  } else {
    timeScore = 20; // no time constraint from rider = full score
  }

  const total = Math.round(pickupScore + routeScore + timeScore);
  return Math.min(100, Math.max(0, total));
}

/**
 * Rank a list of rides by match score (descending).
 * @param {Object[]} rides
 * @param {number[]} riderPickupCoords
 * @param {number[]} riderDropCoords
 * @param {Date}    riderDepartureTime
 * @returns {Object[]} rides with matchScore attached, sorted desc
 */
function rankRides(rides, riderPickupCoords, riderDropCoords, riderDepartureTime) {
  const scored = rides.map((ride) => {
    const score = calculateMatchScore(
      ride,
      riderPickupCoords,
      riderDropCoords,
      riderDepartureTime
    );
    return { ...ride.toObject(), matchScore: score };
  });

  // O(n log n) sort — best match first
  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { calculateMatchScore, rankRides };
