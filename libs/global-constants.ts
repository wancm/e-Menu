export const GLOBAL_CONSTANTS = {
    BROWSER_PORT: 4200,
    SSR_PORT: 4000,
    EXPRESS_PORT: 4001,
    COOKIE: {
        SESSION_ID: "x-session-id",
    },
    HTTP_HEADER: {
        ORIGIN: "x-url-origin",
        SESSION_ID: "x-session-id",
        CLIENT_INFO: "x-client-info",
    },
} as const
