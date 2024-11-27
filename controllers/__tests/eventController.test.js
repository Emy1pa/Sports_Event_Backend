const { populate } = require("dotenv");
const {
  validateEvent,
  validateUpdateEvent,
  Event,
} = require("../../models/Event");
const {
  getAllEvents,
  getEventById,
  deleteEvent,
} = require("../eventController");
jest.mock("../../models/Event", () => ({
  ...jest.requireActual("../../models/Event"),
  Event: {
    find: jest.fn(),
    findById: jest.fn(),
  },
}));
jest.mock("../../models/User", () => ({
  User: {
    findById: jest.fn(),
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
        participants: ["67463c66b7233f8ef46f3128", "67463c66b7233f8ef46f3110"],
      },
    ];

    // Mocking the find method to return the mock events
    Event.find.mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockEvents),
    }));
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
    Event.find.mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue([]),
    }));

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

describe("GetEventById", () => {
  it("should return event when found", async () => {
    const mockEvent = {
      _id: "67463c66b7233f8ef46f3128",
      title: "Test Event",
    };
    Event.findById.mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockEvent),
    }));

    const req = { params: { id: "67463c66b7233f8ef46f3128" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await getEventById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockEvent);
  });
  it("should return 404 when event is not found", async () => {
    Event.findById.mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(null),
    }));
    const req = { params: { id: "nonExistentId" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await getEventById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Event not Found " });
  });
});

describe("deleteEvent", () => {
  let mockEvent;
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockEvent = {
      _id: "event1",
      title: "Test Event to Delete",
      organizer: "currentUser",
      deleteOne: jest.fn(),
    };

    req = {
      params: { id: "event1" },
      user: { id: "currentUser" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    Event.findById = jest.fn().mockResolvedValue(mockEvent);
  });

  it("should successfully delete an existing event", async () => {
    mockEvent.deleteOne.mockResolvedValue({});
    await deleteEvent(req, res);

    expect(Event.findById).toHaveBeenCalledWith(req.params.id);
    expect(mockEvent.deleteOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Event has been deleted successfully",
    });
  });

  it("should return 404 when event is not found", async () => {
    Event.findById.mockResolvedValue(null);

    await deleteEvent(req, res);

    expect(Event.findById).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Event not found" });
  });

  it("should prevent deleting an event the user does not own", async () => {
    mockEvent.organizer = "differentUser";
    req.user = { id: "currentUser" };
    await deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized to delete this event",
    });
  });
});
