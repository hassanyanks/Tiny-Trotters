import { initMongoDB } from './bin/mongodb.js';
import { RedisClient } from './bin/redis.js';
import { startServer } from './bin/startServer.js';
import createError from 'http-errors';
import { v4 as uuid } from 'uuid';
import express from 'express';
import session from 'express-session';
import path from 'path';
import 'dotenv/config';
import logger from 'morgan';
import indexRouter from './routes/indexRoutes.js';
import ponyRouter from './routes/ponyRoutes.js';
import servicesRouter from './routes/servicesRoutes.js';
import galleryRouter from './routes/galleryRoutes.js';
import scheduleEventRouter from './routes/scheduleEventRoutes.js';
import waiverRouter from './routes/waiverRoutes.js'
import { RedisStore } from 'connect-redis';

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
//export const redisClient = new RedisClient();

try {
    const [mongoDbInstance] = await Promise.all([initMongoDB()]); //, redisClient.startRedis()]);
    //console.log(`promise all result:  ${mongoDbInstance}, ${redisStatus}`)
    if( mongoDbInstance === 'tiny-trotters') { //&& redisStatus === 'connected') {
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
    //store: new RedisStore({ client: redisClient.client }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: true, //process.env.NODE_ENV === 'production', // Use secure cookies in production
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

app.use('/', indexRouter);
app.use('/index', indexRouter);
app.use('/ponies', ponyRouter);
app.use('/services', servicesRouter);
app.use('/gallery', galleryRouter);
app.use('/', scheduleEventRouter);
app.use('/schedule-event', scheduleEventRouter);
app.use('/scheduled-event', scheduleEventRouter);
app.use('/', waiverRouter);
app.use('/sign-waiver', waiverRouter);

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
