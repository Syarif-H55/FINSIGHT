const API_BASE_URL = 'http://localhost:8000/backend/index.php';

class APIClient {
    static async request(endpoint, method = 'GET', body = null) {
        const token = localStorage.getItem('finsight_token');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method: method,
            headers: headers
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();
            return {
                status: response.status,
                success: data.success,
                message: data.message,
                data: (data.data !== undefined) ? data.data : []
            };
        } catch (error) {
            console.error("API Request Error:", error);
            return {
                success: false,
                message: "Network Error or Server Unreachable"
            };
        }
    }

    static async get(endpoint) {
        return this.request(endpoint, 'GET');
    }

    static async post(endpoint, body) {
        return this.request(endpoint, 'POST', body);
    }

    static async put(endpoint, body) {
        return this.request(endpoint, 'PUT', body);
    }

    static async delete(endpoint) {
        return this.request(endpoint, 'DELETE');
    }
}
