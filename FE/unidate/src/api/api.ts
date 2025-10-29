import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3979",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;
        if (err.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const res = await api.post("/refresh", { refreshToken });
                const newToken = res.data.data.accessToken;

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
