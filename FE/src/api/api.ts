import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3979",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token && !config.url.includes("/api/auth/refresh")) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;

        if (original.url.includes("api/auth/refresh")) {
            localStorage.clear();
            window.location.href = "/landing";
            return Promise.reject(err);
        }

        if (err.response?.status === 401 && !original._retry) {
            original._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                localStorage.clear();
                window.location.href = "/";
                return Promise.reject(err);
            }

            try {
                const refreshApi = axios.create({
                    baseURL: "http://localhost:3979",
                    headers: { "Content-Type": "application/json" },
                });

                const res = await refreshApi.post("/api/auth/refresh", { refreshToken });
                const newToken = res.data.data.token;

                localStorage.setItem("accessToken", newToken);
                api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                original.headers["Authorization"] = `Bearer ${newToken}`;

                return api(original);
            } catch {
                localStorage.clear();
                window.location.href = "/landing";
            }
        }

        return Promise.reject(err);
    }
);

export default api;
