const {
  validateEvent,
  validateUpdateEvent,
  Event,
} = require("../../models/Event");
const { getAllEvents } = require("../eventController");
jest.mock("../../models/Event", () => ({
  ...jest.requireActual("../../models/Event"),
  Event: {
    find: jest.fn(),
  },
}));
describe("Event Validation", () => {
  it("should validate a valid event", () => {
    const validEvent = {
      title: "Event Title",
      description: "Event Description",
      location: "123 Sample Street, Sample City",
      date: "2024-11-30T18:00:00Z",
    };
    const { error } = validateEvent(validEvent);
    expect(error).toBeUndefined();
  });
  it("should return an error for missing title", () => {
    const invalidEvent = {
      description: "Event Description",
      location: "123 Sample Street, Sample City",
      date: "2024-11-30T18:00:00Z",
    };
    const { error } = validateEvent(invalidEvent);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("title");
  });
  it("should return an error for missing description", () => {
    const invalidEvent = {
      title: "Event Title",
      location: "123 Sample Street, Sample City",
      date: "2024-11-30T18:00:00Z",
    };
    const { error } = validateEvent(invalidEvent);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("description");
  });
  it("should validate a validate event update", () => {
    const validUpdate = {
      title: "event updated",
      description: "event description updated",
    };
    const { error } = validateUpdateEvent(validUpdate);
    expect(error).toBeUndefined();
  });
  it("should return an error for invalid title in event", () => {
    const invalidUpdate = {
      title: "",
    };
    const { error } = validateUpdateEvent(invalidUpdate);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain("Title");
  });
});
describe("get All Events", () => {
  beforeEach(() => {
    // Clearing all mocks before test
    jest.clearAllMocks();
  });
  it("should return all events", async () => {
    const mockEvents = [
      {
        _id: "6744e04918bd699001fe9241",
        title: "Event 1",
        description: "Description 1",
        date: "2024-11-30T18:00:00Z",
      },
    ];

    // Mocking the find method to return the mock events
    Event.find.mockResolvedValue(mockEvents);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getAllEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockEvents);
  });

  it("should return 404 if no events are found", async () => {
    // Mocking find to return an empty array
    Event.find.mockResolvedValue([]);

    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getAllEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No events found." });
  });
});
