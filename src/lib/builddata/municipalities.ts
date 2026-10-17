/**
 * Metro Vancouver / Fraser Valley municipality slugs confirmed present in
 * BuildData's /permit/coverage response on 2026-10-17 (lowercase,
 * underscore-separated): vancouver, surrey, burnaby, coquitlam, delta,
 * new_westminster, port_moody, langley_township, langley_city, white_rock,
 * port_coquitlam, north_vancouver_city, north_vancouver_district,
 * maple_ridge, mission.
 *
 * Pilot starts with a single measured municipality per the approved spec
 * ("start with a measured BC pilot footprint") — vancouver has the largest
 * confirmed record count (52,400 permits). Expand this list only after
 * refreshCoverage() confirms a new municipality is actually covered for
 * the dataset being ingested.
 */
export const PILOT_MUNICIPALITIES: readonly string[] = ["vancouver"];
