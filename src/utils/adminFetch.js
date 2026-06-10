import { clearAdminToken, getAdminToken } from "./auth.js";

const PUBLIC_WRITE_PATHS = new Set([
     "/api/admin/login",
     "/api/send-otp",
     "/api/submit-booking"
]);
const SAFE_METHODS = new Set([
     "GET",
     "HEAD",
     "OPTIONS"
]);

const getRequestMethod = (input, init) => {
     if (init?.method) {
          return init.method.toUpperCase();
     }

     if (input instanceof Request) {
          return input.method.toUpperCase();
     }

     return "GET";
};

const getRequestPath = (input) => {
     const rawUrl = input instanceof Request ? input.url : input;
     const url = new URL(rawUrl, window.location.origin);

     return url.pathname;
};

const needsAdminKey = (input, init) => {
     const method = getRequestMethod(input, init);

     if (SAFE_METHODS.has(method)) {
          return false;
     }

     const path = getRequestPath(input);

     return path.startsWith("/api/") && !PUBLIC_WRITE_PATHS.has(path);
};

const withAdminHeader = (input, init = {}) => {
     const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
     const adminToken = getAdminToken();

     if (adminToken) {
          headers.set("Authorization", `Bearer ${adminToken}`);
     }

     return {
          ...init,
          headers
     };
};

export const installAdminFetch = () => {
     const originalFetch = window.fetch.bind(window);

     window.fetch = async (input, init = {}) => {
          const requestInit = needsAdminKey(input, init) ? withAdminHeader(input, init) : init;
          const response = await originalFetch(input, requestInit);

          if (response.status === 401 || response.status === 503) {
               clearAdminToken();

               if (window.location.pathname !== "/login") {
                    window.location.assign("/login");
               }
          }

          return response;
     };
};
