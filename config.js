//if user and password is required uncomment the relevant sections
var db = {
  db: 'mlearn4web'
  ,host: 'localhost'
  ,port: 27017
  //,username: 'user'
  //,password: 'password'
};

var dbUrl = 'mongodb://';
//dbUrl += db.username+':'+db.password+'@';
dbUrl += db.host + ':' + db.port;
dbUrl += '/' + db.db;

exports.db = {
  db: db,
  secret : 'megaubersecret',
  url: dbUrl
};

exports.passport = {
  'secretKey': '12345-67890-09876-54321',
  'facebook': {
    clientID: 'ID',
    clientSecret: 'SECRET',
    callbackURL: 'https://localhost:3443/users/facebook/callback'
  }
};

exports.swagger = {
  definition : {
    info: {
      title: 'API Seed Project',
      version: '1.0.0',
      description: 'This is a seed project for an API that has user authentication and authorization processes included. Enjoy!'
    },
    host: 'localhost:3000',
    securityDefinitions: {
      /*Bearer: {
        type: 'apiKey',
        description: 'Submits a token to identify a user',
        name: 'token',
        in: 'query'
      },*/
      Bearer: {
        type: 'apiKey',
        description: 'Submits a token to identify a user',
        name: 'x-access-token',
        in: 'header'
      }
    },
    basePath: '/'
  }
};