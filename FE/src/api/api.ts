import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3979",
    // baseURL: "https://freddie-forestial-tiny.ngrok-free.dev/",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
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

        // Nếu lỗi ngay tại /refresh → logout luôn để tránh loop
        if (original.url.includes("api/auth/refresh")) {
            localStorage.clear();
            window.location.href = "/landing";
            return Promise.reject(err);
        }

        // Nếu 401 và chưa retry
        if (err.response?.status === 401 && !original._retry) {
            original._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");

            // Không có refreshToken → logout luôn
            if (!refreshToken) {
                localStorage.clear();
                window.location.href = "/";
                return Promise.reject(err);
            }

            try {
                const res = await api.post("api/auth/refresh", { refreshToken });
                const newToken = res.data.data.accessToken;

                // Lưu token mới
                localStorage.setItem("accessToken", newToken);
                api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
                original.headers["Authorization"] = `Bearer ${newToken}`;

                // Retry request cũ
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
