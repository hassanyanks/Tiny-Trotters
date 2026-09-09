import createError from 'http-errors';
import { v4 as uuid } from 'uuid';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import 'dotenv/config';
import logger from 'morgan';
import { RedisStore } from 'connect-redis';
import { EventEmitter } from 'events';

import { initMongoDB } from './bin/mongodb.js';
import redisClient from './bin/redis.js';
import { startServer } from './bin/startServer.js';
import indexRouter from './routes/indexRoutes.js';
import ponyRouter from './routes/ponyRoutes.js';
import servicesRouter from './routes/servicesRoutes.js';
import galleryRouter from './routes/galleryRoutes.js';
import scheduleEventRouter from './routes/scheduleEventRoutes.js';
import waiverRouter from './routes/waiverRoutes.js'
import calendarRouter from './routes/calendarRoutes.js';
import formsRouter from './routes/formDataRoutes.js';
import autocompleteRouter from './routes/autocompleteRoutes.js';
import { initializeRedisCache } from './bin/mongodb.js';
import authRouter from './routes/authRoutes.js';

// Change the global default for all emitters
EventEmitter.defaultMaxListeners = 15;

const app = express();
const __dirname = import.meta.dirname
const sessionDir = path.join(__dirname, 'sessions');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'templates')));
app.use(express.static(path.join(__dirname, 'lib')));
app.use(express.static(path.join(__dirname, 'bin')));

try {
    const [mongoDbInstance, redisReady] = await Promise.all([initMongoDB(), redisClient.isOpen]);
    //console.log(`promise all result:  ${mongoDbInstance}, ${redisStatus}`)
    if( mongoDbInstance === 'tiny-trotters' && redisReady ) {
      initializeRedisCache();
      startServer();
    } else {
      console.error(`Not starting server: mongodb connection: ${mongoDbInstance}`);
    }
} catch (error) {
    console.error('Failed to start server:', error);
}


app.use(session({
  genid: (req) => {
    return uuid() // use UUIDs for session IDs
  },
    store: new RedisStore({ client: redisClient }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Prevents client-side JS from reading the cookie
        maxAge: 1000 * 60 * 60 * 24 // Cookie expiration time (e.g., 1 day)
    },
},));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.citiesServed = req.session.citiesServed;
  next();
});

// app.js / server.js
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    if( req.isAuthenticated() ) {
        res.locals.user, req.user = req.session.passport.user; 
        console.log(`*************************************req.isAuthenticated():  res.locals.user now is ${JSON.stringify(req.session.passport.user)}*********************************************`)
    } else {
        res.locals.user = null;
    }
  next();
});

// Global middleware to pass req.user to all Pug templates
app.use((req, res, next) => {
    // Passport automatically drops the deserialized user into req.user
    res.locals.currentUser = req.user || null; 
    next();
});

// Your routes go below this line
app.use('/', indexRouter);

app.use('/', indexRouter);
app.use('/index', indexRouter);
app.use('/ponies', ponyRouter);
app.use('/services', servicesRouter);
app.use('/gallery', galleryRouter);
app.use('/', scheduleEventRouter);
app.use('/schedule-event', scheduleEventRouter);
app.use('/schedule-an-event', scheduleEventRouter); //DEVELOPMENT***********************************
app.use('/scheduled-event', scheduleEventRouter);
app.use('/', waiverRouter);
app.use('/waiver', waiverRouter);
app.use('/index', waiverRouter);
app.use('/', calendarRouter);
app.use('/', formsRouter);
app.use('/api', formsRouter);
app.use('/api/city-address', formsRouter);
app.use('/schedule-event', formsRouter);
app.use('/', autocompleteRouter);
app.use('/api', autocompleteRouter);
app.use('/api/autocomplete', autocompleteRouter);
app.use('/', authRouter);
app.use('/logout', authRouter);
app.use('/login', authRouter);
app.use('/forgot-password-email-send', authRouter);
app.use('/reset-password', authRouter);
app.use('/password-reset-form', authRouter);
app.use('/pswd-reset-usermatch', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
