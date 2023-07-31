// Create web server
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Comment = require('../models/Comment.js');
var Post = require('../models/Post.js');
var User = require('../models/User.js');
var passport = require('passport');
require('../config/passport')(passport);

// GET comments for a specific post
router.get('/:postId', passport.authenticate('jwt', { session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        Comment.find({ postId: req.params.postId }, function (err, comments) {
            if (err) return next(err);
            res.json(comments);
        });
    } else {
        return res.status(403).send({success: false, msg: 'Unauthorized.'});
    }
});

// POST a new comment
router.post('/', passport.authenticate('jwt', { session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        Post.findById(req.body.postId, function (err, post) {
            if (err) return next(err);
            if (!post) {
                return res.status(404).send({success: false, msg: 'Post not found.'});
            }
            var comment = new Comment({
                content: req.body.content,
            });
            comment.postId = post._id;
            comment.userId = req.user._id;
            comment.save(function (err) {
                if (err) return next(err);
                res.json(comment);
            }
        );
        });
    } else {
        return res.status(403).send({success: false, msg: 'Unauthorized.'});
    }
});