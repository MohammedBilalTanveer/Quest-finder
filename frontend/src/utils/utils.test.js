import { describe, expect, it } from "vitest";
import { calculateDistanceKm, formatDistance, parseCoord, withDistances } from "./distance.js";
import { getGoogleMapsUrl } from "./mapsUrl.js";
import { loadDone, pruneDone, saveDone, toggleDone } from "./doneStore.js";
import { validateResponse } from "../services/questApi.js";

describe("distance", () => {
  it("matches a known distance (Times Square to Empire State ~1.0 km)", () => {
    const d = calculateDistanceKm(
      { latitude: 40.758, longitude: -73.9855 },
      { latitude: 40.7484, longitude: -73.9857 }
    );
    expect(d).toBeGreaterThan(1.0);
    expect(d).toBeLessThan(1.15);
  });
  it("is zero for the same point", () => {
    expect(calculateDistanceKm({ latitude: 1, longitude: 2 }, { latitude: 1, longitude: 2 })).toBe(0);
  });
  it("one degree of latitude is ~111.2 km", () => {
    const d = calculateDistanceKm({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 });
    expect(d).toBeCloseTo(111.19, 1);
  });
  it("formats metres and km", () => {
    expect(formatDistance(0.4567)).toBe("457 m");
    expect(formatDistance(2.5)).toBe("2.50 km");
    expect(formatDistance(25.26)).toBe("25.3 km");
  });
});

describe("parseCoord", () => {
  it("validates", () => {
    expect(parseCoord("40.7", 90)).toBe(40.7);
    expect(parseCoord("91", 90)).toBeNull();
    expect(parseCoord("", 90)).toBeNull();
    expect(parseCoord("abc", 180)).toBeNull();
    expect(parseCoord("-180", 180)).toBe(-180);
  });
});

describe("withDistances", () => {
  const qs = [
    { id: "a", latitude: 0, longitude: 0.2 },
    { id: "b", latitude: 0, longitude: 0.05 },
    { id: "c", latitude: 0, longitude: 1 },
  ];
  it("sorts nearest first and filters by radius", () => {
    const loc = { latitude: 0, longitude: 0 };
    expect(withDistances(qs, loc, null).map((q) => q.id)).toEqual(["b", "a", "c"]);
    expect(withDistances(qs, loc, 10).map((q) => q.id)).toEqual(["b"]);
  });
  it("leaves order alone without a location", () => {
    expect(withDistances(qs, null, 5).map((q) => q.id)).toEqual(["a", "b", "c"]);
  });
});

describe("doneStore", () => {
  it("toggles without mutating and prunes old marks", () => {
    const a = toggleDone({}, "x", 1000);
    expect(a).toEqual({ x: 1000 });
    expect(toggleDone(a, "x")).toEqual({});
    const old = Date.now() - 8 * 24 * 60 * 60 * 1000;
    expect(pruneDone({ old, fresh: Date.now(), bad: "z" })).toHaveProperty("fresh");
    expect(Object.keys(pruneDone({ old, bad: "z" }))).toHaveLength(0);
  });
  it("load/save tolerate missing or blocked storage", () => {
    expect(loadDone()).toEqual({});
    expect(() => saveDone({ a: 1 })).not.toThrow();
  });
});

describe("maps url + validation", () => {
  it("builds a url and rejects bad coords", () => {
    expect(getGoogleMapsUrl(40.7, -74)).toBe("https://www.google.com/maps/dir/?api=1&destination=40.7,-74");
    expect(getGoogleMapsUrl(null, 3)).toBeNull();
    expect(getGoogleMapsUrl(100, 3)).toBeNull();
  });
  it("drops invalid and duplicate records", () => {
    const out = validateResponse({
      results: [
        { id: "1", latitude: 1, longitude: 2 },
        { id: "1", latitude: 1, longitude: 2 },
        { id: "2", latitude: null, longitude: 2 },
        { id: "3", latitude: 95, longitude: 2 },
      ],
    });
    expect(out.results).toHaveLength(1);
    expect(() => validateResponse({})).toThrow();
  });
});
