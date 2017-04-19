var express       = require('express');
var router        = express.Router();
var Media         = require('../models/media');
var Verify        = require('./verify');
var mongoose      = require('mongoose');
var fs            = require('fs');
var Grid          = require("gridfs-stream");
var multer        = require('multer');
var conf          = require('../config');

var conn          = mongoose.connection;
Grid.mongo        = mongoose.mongo;
var storage = require('multer-gridfs-storage')({url: conf.db.url});
var upload        = multer({ storage: storage });

/**
 * @swagger
 * definition:
 *   Media:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *       gridfsId:
 *         type: string
 *       mimetype:
 *         type: string
 *       filename:
 *         type: string
 *       originalname:
 *         type: string
 *       metaData:
 *         type: object
 *       type:
 *         type: string
 *       user:
 *         type: object
 *       createdAt:
 *         type: dateTime
 *       updatedAt:
 *         type: dateTime
 */

/**
 * @swagger
 * /media/:
 *   get:
 *     tags:
 *       - Media
 *     description: Returns all media files
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns the information about the stored media files as JSON
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Media'
 *       500:
 *         description: Error message
 */
router.get('/', function(req, res, next) {
  Media.find({}, function (err, media) {
    if (err) throw err;
    res.json(media);
  })
    //.populate('user')
  ;
});

/**
 * @swagger
 * /media/{mediaId}:
 *   get:
 *     tags:
 *       - Media
 *     description: Returns a specific media file
 *     parameters:
 *       - name: mediaId
 *         in: path
 *         description: The ID of a media file
 *         required: true
 *         type: string
 *     produces:
 *       - file
 *     responses:
 *       200:
 *         description: Returns a media file
 *         schema:
 *           type: file
 *       403:
 *         description: No token provided
 *       500:
 *         description: Error message
 */
router.get('/:mediaId', function(req, res, next) {
  Media.findById(req.params.mediaId, function (err, media) {
    if (err) throw err;
    
    var gfs = Grid(conn.db);
  
    var readstream = gfs.createReadStream({
      _id: media.gridfsId
    });
  
    readstream.on('error', function (err) {
      console.log('An error occurred!', err);
      throw err;
    });
  
    readstream.pipe(res);
  });
});

/**
 * @swagger
 * /media/metadata/{mediaId}:
 *   get:
 *     tags:
 *       - Media
 *     description: Returns the metadata of a mediafile
 *     parameters:
 *       - name: mediaId
 *         in: path
 *         description: The ID of a media file
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Metadata of a mediafile
 *         schema:
 *           type: object
 *       500:
 *         description: Error message
 */
router.get('/metadata/:mediaId', function(req, res, next) {
  Media.findById(req.params.mediaId, function (err, media) {
    if (err) throw err;
    res.json(media.metaData);
  });
});

/**
 * @swagger
 * /media/:
 *   post:
 *     tags:
 *       - Media
 *     description: Saves a media file
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - name: mediaFile
 *         in: formData
 *         type: file
 *         description: Add the media file with the key "mediaFile".
 *         required: true
 *       - name: metadata
 *         in: formData
 *         type: string
 *         description: Add metadata to the mediafile as JSON.
 *     responses:
 *       200:
 *         description: Successfully saved the mediafile
 *       500:
 *         description: Error message
 */
router.post('/', Verify.verifyOrdinaryUser, upload.single('mediaFile'), function(req, res, next) {
  var media = {
    gridfsId: req.file.id,
    mimetype: req.file.mimetype,
    filename: req.file.filename,
    originalname: req.file.originalname,
    metaData: req.body,
    user: req.decoded._doc._id
  };
  
  if (req.body.type){
    media.type = req.body.type
  }
  
  Media.create(media, function (err, media) {
    if (err) throw err;
    var id = media._id;
    var url = conf.swagger.definition.host+'/media/'+id;
    media.url = url;
    media.save(function (e, m) {
      if (e) throw e;
      res.status(200).json({
        status: 'Mediafile saved!',
        success: true,
        media: m
      });
    });
  });
});

//todo update media information
router.put('/:mediaId', function(req, res, next) {
  
});

/**
 * @swagger
 * /media/{mediaId}:
 *   delete:
 *     tags:
 *       - Media
 *     description: Deletes a specific media file
 *     parameters:
 *       - name: mediaId
 *         in: path
 *         description: The ID of a media file
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK, media file deleted
 *       403:
 *         description: You are not authorized to perform this operation
 *       500:
 *         description: Error message
 */
router.delete('/:mediaId', Verify.verifyOrdinaryUser, function(req, res, next) {
  Media.findById(req.params.mediaId, function (err, media) {
    if (err) throw err;
    if (media.user != req.decoded._doc._id) {
      var err = new Error('You are not authorized to perform this operation!');
      err.status = 403;
      return next(err);
    }
    var gfs = Grid(conn.db);
    
    gfs.remove({_id: media.gridfsId}, function (err) {
      if (err) throw err;
      media.remove(function (err) {
        if (err) throw err;
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end('Deleted mediafile with the id: '+media._id);
      });
    });
  });
});

module.exports = router;