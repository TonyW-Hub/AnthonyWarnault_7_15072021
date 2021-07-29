// Imports
const models = require('../models');
const jwtUtils = require('../utils/jwt.utils');
const asyncLib = require('async');

// Constants
const Disliked = 0;
const Liked = 1;

// Routes
exports.likePost = (req, res) => {
    const headerAuth = req.headers['authorization'];
    const userId = jwtUtils.getUserId(headerAuth);

    const messageId = parseInt(req.params.messageId);

    if (messageId <= 0) {
        return res.status(400).json({ error: 'invalid parameters' });
    }

    asyncLib.waterfall([
        function(done) {
          models.Message.findOne({
            where: { id: messageId }
          })
          .then(function(messageFound) {
            done(null, messageFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify message' });
          });
        },
        function(messageFound, done) {
          if(messageFound) {
            models.User.findOne({
              where: { id: userId }
            })
            .then(function(userFound) {
              done(null, messageFound, userFound);
            })
            .catch(function(err) {
              return res.status(500).json({ 'error': 'unable to verify user' });
            });
          } else {
            res.status(404).json({ 'error': 'post already liked' });
          }
        },
        function(messageFound, userFound, done) {
          if(userFound) {
            models.Like.findOne({
              where: {
                userId: userId,
                messageId: messageId
              }
            })
            .then(function(userAlreadyLikedFound) {
              done(null, messageFound, userFound, userAlreadyLikedFound);
            })
            .catch(function(err) {
              return res.status(500).json({ 'error': 'unable to verify is user already liked' });
            });
          } else {
            res.status(404).json({ 'error': 'user not exist' });
          }
        },
        function(messageFound, userFound, userAlreadyLikedFound, done) {
          if(!userAlreadyLikedFound) {
            messageFound.addUser(userFound, { isLike: Liked })
            .then(function (alreadyLikeFound) {
              done(null, messageFound, userFound);
            })
            .catch(function(err) {
              return res.status(500).json({ 'error': 'unable to set user reaction' });
            });
          } else {
            if (userAlreadyLikedFound.isLike === Disliked) {
              userAlreadyLikedFound.update({
                isLike: Liked,
              }).then(function() {
                done(null, messageFound, userFound);
              }).catch(function(err) {
                res.status(500).json({ 'error': 'cannot update user reaction' });
              });
            } else {
              res.status(409).json({ 'error': 'message already liked' });
            }
          }
        },
        function(messageFound, userFound, done) {
          messageFound.update({
            likes: messageFound.likes + 1,
          }).then(function() {
            done(messageFound);
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot update message like counter' });
          });
        },
      ], function(messageFound) {
        if (messageFound) {
          return res.status(201).json(messageFound);
        } else {
          return res.status(500).json({ 'error': 'cannot update message' });
        }
      });
};

exports.dislikePost = (req, res) => {
    const headerAuth = req.headers['authorization'];
    const userId = jwtUtils.getUserId(headerAuth);

    const messageId = parseInt(req.params.messageId);

    if (messageId <= 0) {
        return res.status(400).json({ error: 'invalid parameters' });
    }

    asyncLib.waterfall([
        function(done) {
           models.Message.findOne({
             where: { id: messageId }
           })
           .then(function(messageFound) {
             done(null, messageFound);
           })
           .catch(function(err) {
             return res.status(500).json({ 'error': 'unable to verify message' });
           });
         },
         function(messageFound, done) {
           if(messageFound) {
             models.User.findOne({
               where: { id: userId }
             })
             .then(function(userFound) {
               done(null, messageFound, userFound);
             })
             .catch(function(err) {
               return res.status(500).json({ 'error': 'unable to verify user' });
             });
           } else {
             res.status(404).json({ 'error': 'post already liked' });
           }
         },
         function(messageFound, userFound, done) {
           if(userFound) {
             models.Like.findOne({
               where: {
                 userId: userId,
                 messageId: messageId
               }
             })
             .then(function(userAlreadyLikedFound) {
                done(null, messageFound, userFound, userAlreadyLikedFound);
             })
             .catch(function(err) {
               return res.status(500).json({ 'error': 'unable to verify is user already liked' });
             });
           } else {
             res.status(404).json({ 'error': 'user not exist' });
           }
         },
         function(messageFound, userFound, userAlreadyLikedFound, done) {
          if(!userAlreadyLikedFound) {
            messageFound.addUser(userFound, { isLike: Disliked })
            .then(function (alreadyLikeFound) {
              done(null, messageFound, userFound);
            })
            .catch(function(err) {
              return res.status(500).json({ 'error': 'unable to set user reaction' });
            });
          } else {
            if (userAlreadyLikedFound.isLike === Liked) {
              userAlreadyLikedFound.update({
                isLike: Disliked,
              }).then(function() {
                done(null, messageFound, userFound);
              }).catch(function(err) {
                res.status(500).json({ 'error': 'cannot update user reaction' });
              });
            } else {
              res.status(409).json({ 'error': 'message already disliked' });
            }
          }
         },
         function(messageFound, userFound, done) {
           messageFound.update({
             likes: messageFound.likes - 1,
           }).then(function() {
             done(messageFound);
           }).catch(function(err) {
             res.status(500).json({ 'error': 'cannot update message like counter' });
           });
         },
       ], function(messageFound) {
         if (messageFound) {
           return res.status(201).json(messageFound);
         } else {
           return res.status(500).json({ 'error': 'cannot update message' });
         }
       });
};