// middleware/authMiddleware.js

/**
 * Protects routes meant only for authenticated users (e.g., /dashboard, /profile)
 */
export const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // If not logged in, redirect them to the login screen
    res.redirect('/login');
};

/**
 * Redirects logged-in users away from auth pages (e.g., /login, /signup)
 */
export const forwardAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    // If already logged in, send them straight to the main page
    res.redirect('/index');
};

/**
 * Role-Based Access Control (RBAC) middleware for admin routes
 */
export const ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    // If not an admin, send an HTTP 403 Forbidden or custom error page
    res.status(403).render('error', { 
        message: 'Access Denied: You do not have permission to view this page.' 
    });
};
