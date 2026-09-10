import { cachedCitiesStr } from '../utils/cityService.js';
import passport from 'passport';
import bcrypt from 'bcrypt';
import User from "../models/user.js";
import { updateUserWithToken } from '../bin/credentials.js';
import { generateHashedToken, sendEmailWithToken } from '../bin/emails.js'

const { Strategy: LocalStrategy } = await import('passport-local');

// 1. Core Authentication Strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const normalizedEmail = email.trim().toLowerCase();
            const user = await User.findOne({ email: normalizedEmail }).exec();
            
            // Hardening mechanism against timing attacks
            if (!user) {
                await bcrypt.compare(password, '$2b$10$X3k7R6vW9qP2mN5zL8uY1eO4sT7vX8yZ9uI0oP1qR2sT3uV4wX5yZ');
                return done(null, false, { message: 'Invalid email or password.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Invalid email or password.' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// 2. Session Packaging (Serializing)
passport.serializeUser((user, done) => {
    console.log(`[Session] Serializing user ID ${user._id} to session file store.`);
    // Using user._id forces the native identifier representation
    done(null, user._id);
});

// 3. Request Unpacking (Deserializing)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        
        if (!user) {
            console.warn(`[Session] Deserialization failed: User ID ${id} no longer exists.`);
            return done(null, false);
        }

        console.log(`[Session] Deserialized successfully for user: ${user._id}`);
        return done(null, user);
    } catch (err) {
        console.error(`[Session] Database error during deserialization: ${err.message}`);
        return done(err);
    }
});

export const user_from_email = async(req, res, next) => {
    const user = await User.find({ email: req.body.email }).exec();
};

export const home = async(req, res, next) => {
    res.render('index', { user: req.user });
}

// startLoggedInSession.js
function startLoggedInSession(req, res, next, user) {
    req.logIn(user, (err) => {
        if (err) { return next(err); }
        
        console.log(`Authentication successful. User ID: ${user._id}. Redirecting...`);
        
        // 303 See Other is correct for redirecting after a POST request
        return res.status(303).redirect('/index');
    });
}

export const loginPost = (req, res, next) => {

    //front end enforces entry of these two
    const { email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).render('login', { error: 'Please enter a valid email address.' });
    }

    // 2. Passport Authentication
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        
        if (!user) { 
            return res.status(401).render('login', { error: 'Invalid email or password.' });
        }
        
        // 3. Establish Passport Session
        req.logIn(user, (loginErr) => {
            if (loginErr) { return next(loginErr); }
            
            req.session.userid = user._id;
            req.session.userRole = user.role;
            
            // 4. Pure SSR Redirect
            // The browser sees this status and automatically updates the URL to /index
            return res.status(303).redirect('/index');
        });
    })(req, res, next);
};

export const signupPost = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Input Validation
        if (!email || !password) {
            return res.status(404).render('login', { error: 'Email and password are required.' });
        }

        // Basic email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(404).render('signup', { error: 'Please enter a valid email.' });
        }

        // Normalize email to lowercase and trim spaces
        const normalizedEmail = email.trim().toLowerCase();
        console.log(`Signing up with email: ${normalizedEmail}`);

        // 2. Securely parse salt rounds and hash password
        const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
        const hash = await bcrypt.hash(password, saltRounds);

        if (!hash) {
            return res.status(500).render('signup', { error: 'Unable to process your password.' });
        }

        // 3. Admin Role Resolution
        const staffEmails = process.env.STAFF_EMAIL ? process.env.STAFF_EMAIL.split(',').map(e => e.trim().toLowerCase()) : [];
        const userRole = staffEmails.includes(normalizedEmail) ? 'admin' : 'user';

        console.log(`Assigned user role: ${userRole}`);

        // 4. Save User
        const newUser = new User({ email: normalizedEmail, password: hash, role: userRole });

        try {
            const result = await newUser.save();
            console.log(`New user created: ${result._id}`);
        } catch (err) {
            // Handle MongoDB duplicate key error
            if (err.code === 11000) {
                const duplicateField = Object.keys(err.keyValue)[0] || 'field';
                return res.status(400).render('signup', { error: `A user with this ${duplicateField} already exists. Please try another or log in as an existing user.` });
            }

            console.error(`Error saving user to database: ${err.message}`);
            return res.status(500).render('signup', { error: 'Error creating account. Please try again.' });
        }
        
        // 5. Establish Session
        startLoggedInSession(req, res, next, newUser);

    } catch (err) {
        // Catches unexpected errors (e.g., bcrypt failures, session crashes)
        next(err);
    }
};

// The POST logout route
export const logoutPost = async (req, res, next) => {
    console.log('Inside /logout POST route');
    
    try {
        // 1. Log out from Passport (promisified)
        await new Promise((resolve, reject) => {
            req.logout((err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // 2. Destroy the express-session (promisified)
        await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // 3. Clear cookie and redirect safely
        const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'connect.sid';
        res.clearCookie(sessionCookieName);
        return res.status(303).redirect('/login');

    } catch (err) {
        console.error('Logout error occurred:', err);
        // Pass the error to your central Express error handler
        return next(err); 
    }
};

export const forgotPasswordEmailSend = async (req, res, next) => {
    try {
       const { email } = req.body;

        // 1. Robust input validation
        if (!email) {
            return res.status(400).render('login', { error: 'Email is required.' });
        }

        // Basic regex for email validation instead of just checking '@'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).render('login', { error: 'Invalid email.' });
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).render('login', { error: 'User not found--you may not have an account at that email.' });
        }

        const token = await generateHashedToken(user);
        if(!token) {
            return res.status(500).render('login', { error: 'Token generation error.' });
        }

        const modifedUser = updateUserWithToken(user, token);
        console.log(`modified user is ${modifedUser}`)
        if(!modifedUser) {
            return res.status(500).render('login', { error: 'Token save error.' });
        }

        sendEmailWithToken(user); 

        return res.status(200).render('login', { message: 'Reset your password by following the link just sent to your email. The token in the link will expire in one hour.' });

        //return res.json({
        //    message: 'Reset your password by following the link just sent to your email. The token in the link will expire in one hour.'
        //});
    } catch (error) {
        console.error(`Encountered error ${error}`);
        return res.status(500).render('login', { error: 'Sorry, but we encountered an error--please try again later.' });
    }
};

export const resetPasswordGet = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
        return res.status(400).render('login', { error: 'Required security token is missing.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
        return res.status(400).render('login', { error: 'Token is invalid or has expired.' });
    }

    res.locals.token = token;

    // The frontend form can then submit this token back during the POST request.
    res.redirect(302, `/password-reset-form?token=${encodeURIComponent(token)}`);

  } catch (error) {
    // Pass database or runtime errors safely to your global error handler
    next(error);
  }
};


export const resetPasswordPost = async (req, res, next) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // 1. Validate inputs; front end enforces entry of password and confirmPassword
    if (!token ) {
        return res.status(400).render('login', { error: 'Required security token is missing.  Please try "Forgot password?" again' });
    }

    if (password !== confirmPassword) {
        return res.status(303).redirect(`/password-reset-form?token=${encodeURIComponent(token)}&error=${encodeURIComponent('Passwords do not match.')}`);
    }

    // 2. Find the user by token and ensure it hasn't expired yet
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).render('login', { error: 'Security token is invalid or has expired.  Please try "Forgot password?" again' });
    }

    // 3. Hash the new password and update user
    // (If your User model has a pre-save hook that hashes passwords, you can skip manual hashing here)
    const saltRounds = 12;
    user.password = await bcrypt.hash(password, saltRounds);

    // 4. CRITICAL: Clear the token fields so they can't be used again
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // 5. Send a JSON response (standard for modern frontend frameworks) or redirect
    return res.status(201).render('login', { message: 'Password has been successfully reset--you may now log in' });

  } catch (error) {
    next(error); 
  }
};

