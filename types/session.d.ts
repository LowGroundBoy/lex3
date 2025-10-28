import "express-session";
declare module "express-session" {
    interface SessionData {
        user?: string;
        error?: string;
        success_msg?: string;
    }
}