//backend routes
export const API = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        UPDATE_PROFILE: "/api/auth/profile",
        CHANGE_PASSWORD: "/api/auth/change-password",
        FORGOT_PASSWORD_SEND_OTP: "/api/auth/forgot-password/send-otp",
        FORGOT_PASSWORD_VERIFY_OTP: "/api/auth/forgot-password/verify-otp",
        FORGOT_PASSWORD_RESET: "/api/auth/forgot-password/reset-password"
    },
    PRODUCTS: {
        GET_ALL: "/api/products",
        GET_BY_ID: "/api/products",
        SEARCH: "/api/products/search",
        BY_CATEGORY: "/api/products/category",
        CREATE: "/api/products",
        UPDATE: "/api/products",
        DELETE: "/api/products",
        UPDATE_STOCK: "/api/products"
    },
    ORDERS: {
        CREATE: "/api/orders",
        GET_MY_ORDERS: "/api/orders/my-orders",
        GET_BY_ID: "/api/orders",
        GET_ALL: "/api/orders",
        UPDATE_STATUS: "/api/orders",
        DELETE: "/api/orders"
    },
    PAYMENTS: {
        KHALTI_INITIATE: "/api/payments/khalti/initiate",
        KHALTI_VERIFY: "/api/payments/khalti/verify"
    },
    ADMIN: {
        USERS: {
            GET_ALL: "/api/admin/users",
            GET_BY_ID: "/api/admin/users",
            CREATE: "/api/admin/users",
            UPDATE: "/api/admin/users",
            DELETE: "/api/admin/users"
        }
    }
}