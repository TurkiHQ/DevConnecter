const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middelware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

//@route request type:GET end point:api/users
//@desc this is a test route
//@access public or private ? you need a token to access specfic routes e.g add a profile you need to be authenticated
// so you well need to sen a toekn to that route for it to work or you wont be autherized to do so.
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route request type:GET end point:api/auth
//@desc authenticate user and get token
//@access public
router.post(
    '/',
    [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').exists()
    

] , async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email, password } = req.body;

    try {
    let user = await User.findOne({ email})

    if (!user) {
        return res.status(400).json({ errors: [{ msg: 'invalid credentials' }] });// see if user already exists
    }
    

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        return res.status(400).json({ errors: [{ msg: 'invalid credentials' }] });
    }


    const payload = {
        user: {
            id: user.id
        }
    }//Return jsonwebtoken
    
    jwt.sign(
        payload, 
        config.get('jwtSecret'),
        {expiresIn: 360000},
        (err, token) => {
            if (err) throw err;
            res.json({token});
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
}); 

module.exports = router;
