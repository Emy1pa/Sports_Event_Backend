const { validateEvent, validateUpdateEvent } = require("../../models/Event");

describe("Event Validation", () => {
  it("should validate a valid event", () => {
    const validEvent = {
      title: "Event Title",
      description: "Event Description",
      location: "123 Sample Street, Sample City",
      date: "2024-11-31T18:00:00Z",
    };
    const { error } = validateEvent(validEvent);
    expect(error).toBeUndefined();
  });
  it("should return an error for missing title", () => {
    const invalidEvent = {
      description: "Event Description",
      location: "123 Sample Street, Sample City",
      date: "2024-11-31T18:00:00Z",
    };
    const { error } = validateEvent(invalidEvent);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("title");
  });
  it("should return an error for missing description", () => {
    const invalidEvent = {
      title: "Event Title",
      location: "123 Sample Street, Sample City",
      date: "2024-11-31T18:00:00Z",
    };
    const { error } = validateEvent(invalidEvent);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("description");
  });
});
