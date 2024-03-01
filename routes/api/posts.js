const express = require('express');
const router = express.Router();

//@route request type:GET end point:api/posts
//@desc this is a test route
//@access public or private ? you need a token to access specfic routes e.g add a profile you need to be authenticated
// so you well need to sen a toekn to that route for it to work or you wont be autherized to do so.
router.get('/',  (req, res) => res.send('posts route')); 

module.exports = router;