const ADMIN_TOKEN_STORAGE = "kreeya_admin_token";

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_STORAGE) || "";

export const setAdminToken = (token) => {
     localStorage.setItem(ADMIN_TOKEN_STORAGE, token);
};

export const clearAdminToken = () => {
     localStorage.removeItem(ADMIN_TOKEN_STORAGE);
};

export const isAdminLoggedIn = () => Boolean(getAdminToken());
