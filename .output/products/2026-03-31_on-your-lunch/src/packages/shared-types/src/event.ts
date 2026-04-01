// POST /events 요청
export interface CreateEventRequest {
  eventName: string;
  eventData: Record<string, unknown>;
}
