import { Game } from "../types";

// Use production backend URL when deployed, localhost for development
const BASE_URL = import.meta.env.VITE_API_URL ||
    (window.location.hostname.includes('render.com') || window.location.hostname.includes('github.io')
        ? 'https://xybagg-backend.onrender.com/api/games'  // Replace with YOUR backend URL
        : 'http://localhost:8080/api/games');

class APIClient {
    private async _fetchWithFallback(url: string, options: RequestInit = {}): Promise<Response> {
        // In production, just use the URL directly
        // In development, try both localhost and 127.0.0.1
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (!isLocalDev) {
            // Production: use the URL as-is
            return fetch(url, {
                ...options,
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers,
                },
            });
        }

        // Development: try localhost fallbacks
        const protocols = ["http://localhost:8080", "http://127.0.0.1:8080"];
        const path = url.split(":8080")[1] || "/api/games";

        let lastError: any;
        let lastResponse: Response | null = null;

        for (const protocol of protocols) {
            try {
                const fullUrl = `${protocol}${path}`;

                const response = await fetch(fullUrl, {
                    ...options,
                    mode: 'cors',
                    headers: {
                        "Content-Type": "application/json",
                        ...options.headers,
                    },
                });

                if (response.ok) {
                    return response;
                }

                if (!lastResponse) {
                    lastResponse = response;
                }

                if (response.status >= 400 && response.status < 500) {
                    console.warn(`⚠️ Client error ${response.status}, returning response`);
                    return response;
                }

            } catch (err) {
                console.error(`❌ Network error for ${protocol}${path}:`, err);
                lastError = err;
            }
        }

        if (lastResponse) {
            console.warn(`⚠️ Returning last response with status ${lastResponse.status}`);
            return lastResponse;
        }

        console.error(`❌ All attempts failed. Last error:`, lastError);
        throw lastError || new Error("Failed to reach backend on any address");
    }

    async getAllGames(): Promise<Game[]> {
        const response = await this._fetchWithFallback(BASE_URL);
        if (!response.ok) throw new Error("Failed to fetch games");
        return response.json();
    }

    async getGameById(id: number): Promise<Game> {
        const response = await this._fetchWithFallback(`${BASE_URL}/${id}`);
        if (!response.ok) throw new Error("Failed to fetch game details");
        return response.json();
    }

    async searchGames(query: string): Promise<Game[]> {
        const response = await this._fetchWithFallback(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Search failed");
        return response.json();
    }

    async addGame(game: Omit<Game, 'id'>): Promise<Game> {
        const response = await this._fetchWithFallback(BASE_URL, {
            method: "POST",
            body: JSON.stringify(game),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Add game failed:`, errorText);
            throw new Error(errorText || "Failed to add game");
        }
        return response.json();
    }

    async updateGame(game: Game): Promise<Game> {
        const response = await this._fetchWithFallback(`${BASE_URL}/${game.id}`, {
            method: "PUT",
            body: JSON.stringify(game),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Update game failed:`, errorText);
            throw new Error(errorText || "Failed to update game");
        }

        const updatedGame = await response.json();
        return updatedGame;
    }

    async deleteGame(id: number): Promise<void> {
        const response = await this._fetchWithFallback(`${BASE_URL}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete game");
    }

    async reorderGames(gameIds: number[]): Promise<void> {
        const response = await this._fetchWithFallback(`${BASE_URL}/save-order`, {
            method: "POST",
            body: JSON.stringify(gameIds),
        });
        if (!response.ok) throw new Error("Failed to save game order");
    }
}

export default new APIClient();
