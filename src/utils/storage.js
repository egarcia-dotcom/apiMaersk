// src/utils/storage.js
import fs from "fs";
import path from "path";

const DATA_FILE = path.resolve("./src/bookings.json");

export function readBookings() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf8").trim();
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error loading bookings.json", err);
    return [];
  }
}

export function writeBookings(bookings) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing bookings.json", err);
  }
}
