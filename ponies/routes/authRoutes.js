import express from 'express';
import User from '../models/user.js';
import path from 'path';
import passport from 'passport';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { signupPost, loginPost, logoutPost, forgotPasswordEmailSend, resetPasswordGet, resetPasswordPost } from '../controllers/authControllers.js';
import { cachedCitiesStr } from '../utils/cityService.js';

const __dirname = import.meta.dirname
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('starting auth routes init...');

var router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json()); 
router.use(passport.initialize());
router.use(passport.session()); // This uses the express-session middleware

//router.get('/index'), (req, res) => {
//    res.render('index');
//}


router.get('/signup', (req, res) => {
    res.locals.citiesServed = cachedCitiesStr;
    res.render("signup");
} );
router.post('/signup', signupPost);
router.post('/login', loginPost);
router.get('/login', (req, res) => {
    res.locals.citiesServed = cachedCitiesStr;
    res.render('login');
} );
router.post('/logout', logoutPost);

router.post('/forgot-password-email-send', forgotPasswordEmailSend );
router.post('/reset-password', resetPasswordPost);
router.get('/pswd-reset-usermatch', resetPasswordGet);

router.get('/password-reset-form', async (req, res) => {
    const token = req.query.token;
    console.log(`inside /password-reset-form GET, token is ${token}`)
    res.locals.citiesServed = cachedCitiesStr;
    res.render('reset_password', { token });
});

router.get('/uploaded', (req, res) => {
    const error_msg = req.flash('error');
    const success_msg = req.flash('success');
    res.render('index', { user: req.user, success_msg: success_msg.toString().trim(), error_msg: error_msg.toString().trim()});
} );

export default router;