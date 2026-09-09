import { cachedCitiesStr } from '../utils/cityService.js';
import passport from 'passport';
import bcrypt from 'bcrypt';
import User from "../models/user.js";
import { updateUserWithToken } from '../bin/credentials.js';
import { generateHashedToken, sendEmailWithToken } from '../bin/emails.js'

const { Strategy: LocalStrategy } = await import('passport-local');

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      // 1. Fetch user and handle database lookup
      const user = await User.findOne({ email: email }).exec();
      
      if (!user) {
        //await bcrypt.compare(password, '$2b$10$invalidhashplaceholder'); //security hardening here
        return done(null, false, { message: 'Invalid email or password.' });
      }

      // 2. Compare passwords (promisified or wrapped securely)
      // Note: verify if your schema uses user.passwordHash or user.password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password.' });
      }

      // 3. Success
      return done(null, user);

    } catch (err) {
      // 4. Handle server/database errors cleanly
      return done(err);
    }
  }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
console.log(`*********************Inside serializeUser callback. User id ${user.id} is saved to the session file store here`)
done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
try {
    // Await the database query directly
    const user = await User.findById(id).exec();
    
    // If no user is found, pass false
    if (!user) {
    return done(null, false);
    }
    
    // Success: pass the user object
    console.log(`**************************user found is ${user.id}`);
    return done(null, user);
    
} catch (err) {
    // Safely catch database connection errors or casting errors
    return done(err);
}
});

export const user_from_email = async(req, res, next) => {
    const user = await User.find({ email: req.body.email }).exec();
};

export const home = async(req, res, next) => {
    res.render('index', { user: req.user });
}

async function startLoggedInSession(req, res, next, user) {
    req.logIn(user, function(err) {
        if (err) { return next(err); }
        
        req.session.userid = user._id;
        req.session.userRole = user.role;
        console.log(`req.session.userRole is ${req.session.userRole}`);
        
        console.log(`Authentication successful. User: ${req.session.userid}. Redirecting...`);
        
        return res.status(303).redirect('/index');
    });
}

export const loginPost = async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Robust input validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Basic regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const user = await User.find({ email }).exec();
    console.log(`user is ${user}...`);

    // 2. Passport Authentication
    passport.authenticate('local', (err, user, info) => {
        if (err) { 
            return next(err); 
        }
        console.log('past first error check');
        // Handle authentication failure (Generic message prevents user enumeration)
        if (!user) { 
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        console.log('past if !user');
        
        // 3. Establish session
        // Note: startLoggedInSession must properly handle res/next or be promisified
        try {
            startLoggedInSession(req, res, next, user);
        } catch (sessionErr) {
            return next(sessionErr);
        }

    })(req, res, next);
};

export const signupPost = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Robust input validation
        if (!email || !password) {
            return res.status(400).send('<h2>Email and password are required.</h2>');
        }

        // Basic regex for email validation instead of just checking '@'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send('<h2>Seems you did not enter a valid email address. Hit the back button and please try again.</h2>');
        }

        console.log(`Signing up with email: ${email}`);

        // 2. Securely parse salt rounds
        const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
        const hash = await bcrypt.hash(password, saltRounds);

        if (!hash) {
            return res.status(500).json({ message: 'Unable to register you due to an error!!' });
        }

        // 3. Secure Admin Role Resolution
        // Splitting by comma assumes STAFF_EMAIL is a string like "admin@test.com,staff@test.com"
        const staffEmails = process.env.STAFF_EMAIL ? process.env.STAFF_EMAIL.split(',') : [];
        const userRole = staffEmails.includes(email.trim()) ? 'admin' : 'user';

        console.log(`user role to be ${userRole}`);
        // 4. Save User
        const newUser = new User({ email: email.trim(), password: hash, role: userRole });

        try {
            const result = await newUser.save();
            console.log(`New user result: ${result}`);
        } catch(err) {
            if( err.code === 11000 ) {
                const duplicateField = Object.keys(err.keyValue)[0]
                return res.status(409).json({
                    error: "Conflict",
                    message: `A user with this ${duplicateField} already exists. Please press back button, then use another or try 'Forgot password?' if this user is you.`
                });
            }

            console.error(`encountered error creating account: ${err.message}`)
            return res.status(400).send(`<h2>Error creating account--press back button and try again .</h2>`);
        }
        
        // 5. Establish Session
        await startLoggedInSession(req, res, next, newUser);

    } catch (err) {
        // Handle MongoDB duplicate key error (index on email field)
        if (err.code === 11000) {
            return res.status(400).send('<h2>Email already in use--try \'Forgot password?\' on login page.</h2>');
        }
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
        res.clearCookie('connect.sid');
        return res.redirect(303, '/index');

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
            return res.status(400).send('<h2>Email is required.</h2>');
        }

        // Basic regex for email validation instead of just checking '@'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send('<h2>Seems you did not enter a valid email address. Hit the back button and please try again.</h2>');
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send('User not found.');
        }

        const token = await generateHashedToken(user);
        if(!token) {
            return res.status(400).send('Token generation error!!');
        }

        const modifedUser = updateUserWithToken(user, token);
        console.log(`modified user is ${modifedUser}`)
        if(!modifedUser) {
            return res.status(400).send('Token save error!!');
        }

        sendEmailWithToken(user); 

        return res.json({
            message: 'Reset your password by following the link just sent to your email. The token in the link will expire in one hour.'
        });
    } catch (error) {
        console.error(`Encountered error ${error}`);
        return res.status(400).send('We encountered an error!!');
    }
};

export const resetPasswordGet = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send('Token is required.');
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).send('Token is invalid or has expired.');
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

    // 1. Validate inputs
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required--click the back button, then re-enter password and try again.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match--click the back button and try again.' });
    }

    // 2. Find the user by token and ensure it hasn't expired yet
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired--click the back button, then re-do "Forgot password?".' });
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
    return res.status(200).json({ message: 'Password has been successfully reset--now use the back button to log in.' });

  } catch (error) {
    next(error); 
  }
};

