import { Game } from "../types";

const isProduction = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');

// IMPORTANT: Check your Render dashboard for the exact URL. 
// Based on logs, it might be xyba-backend or xybagg-backend.
const PRODUCTION_URL = 'https://xyba-backend.onrender.com/api/games';

const BASE_URL = isProduction ? PRODUCTION_URL : 'http://localhost:8080/api/games';

console.log(`[API] Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`[API] Base URL: ${BASE_URL}`);

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

        // In Development: Try localhost and 127.0.0.1
        const protocols = ["http://localhost:8080", "http://127.0.0.1:8080"];
        const path = url.split(":8080")[1] || "/api/games";

        let lastError: any;
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

                if (response.ok || (response.status >= 400 && response.status < 500)) {
                    return response;
                }
            } catch (err) {
                lastError = err;
            }
        }
        throw lastError || new Error("Backend unreachable");
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
            console.error(`[API] Add game failed:`, errorText);
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
            console.error(`[API] Update game failed:`, errorText);
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
