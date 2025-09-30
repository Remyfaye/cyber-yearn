class DirectusService {
  private directusUrl: string;
  private apiToken: string;

  constructor() {
    this.directusUrl = process.env.DIRECTUS_URL!;
    this.apiToken = process.env.DIRECTUS_API_TOKEN!;
  }

  async getPublishedTracks() {
    const response = await fetch(
      `${this.directusUrl}/items/tracks?filter[Published][_eq]=true`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      }
    );

    return response.json();
  }

  async getLessonContent(lessonId: string) {
    const response = await fetch(
      `${this.directusUrl}/items/lessons/${lessonId}`,
      {
        headers: { Authorization: `Bearer ${this.apiToken}` },
      }
    );

    return response.json();
  }
}

export const directus = new DirectusService();
