import "express-session";

declare module "express-session" {
    interface SessionData {
        user?: string;
        accesslvl?: string;
        error?: string;
        success_msg?: string;
    }
}