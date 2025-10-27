import "express-session";
declare module "express-session" {
    interface SessionData {
        user?: User;
        error?: string;
        success_msg?: string;
    }
}