import { describe, it, expect } from "vitest";
import { generateId } from "../utils/id";

describe("generateId utility", () => {
  it("should generate a string with specified prefix", () => {
    const id = generateId("test");
    expect(id).toMatch(/^test_[0-9a-f-]{36}$/);
    expect(typeof id).toBe("string");
  });

  it("should generate unique IDs", () => {
    const id1 = generateId("test");
    const id2 = generateId("test");
    expect(id1).not.toBe(id2);
  });

  it("should handle empty prefix", () => {
    const id = generateId("");
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(typeof id).toBe("string");
  });
});
