import { google } from 'googleapis'

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  extendedProperties?: {
    private?: {
      businessId?: string
      taskId?: string
      taskType?: string
    }
  }
}

export class GoogleCalendarService {
  private oauth2Client: any

  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    )
    this.oauth2Client.setCredentials({ access_token: accessToken })
  }

  async listEvents(calendarId: string = 'primary', timeMin?: Date, timeMax?: Date): Promise<GoogleCalendarEvent[]> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
      
      const response = await calendar.events.list({
        calendarId,
        timeMin: timeMin?.toISOString(),
        timeMax: timeMax?.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error)
      throw error
    }
  }

  async createEvent(event: Omit<GoogleCalendarEvent, 'id'>, calendarId: string = 'primary'): Promise<GoogleCalendarEvent> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
      
      const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
      })

      return response.data
    } catch (error) {
      console.error('Error creating Google Calendar event:', error)
      throw error
    }
  }

  async updateEvent(eventId: string, event: Partial<GoogleCalendarEvent>, calendarId: string = 'primary'): Promise<GoogleCalendarEvent> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
      
      const response = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
      })

      return response.data
    } catch (error) {
      console.error('Error updating Google Calendar event:', error)
      throw error
    }
  }

  async deleteEvent(eventId: string, calendarId: string = 'primary'): Promise<void> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
      
      await calendar.events.delete({
        calendarId,
        eventId,
      })
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error)
      throw error
    }
  }

  async getCalendarList(): Promise<any[]> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })
      
      const response = await calendar.calendarList.list()
      
      return response.data.items || []
    } catch (error) {
      console.error('Error fetching calendar list:', error)
      throw error
    }
  }
}