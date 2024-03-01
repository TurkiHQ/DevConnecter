const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');


//@route request type:POST end point:api/users
//@desc to register a user
//@access public or private ? you need a token to access specfic routes e.g add a profile you need to be authenticated
// so you well need to sen a toekn to that route for it to work or you wont be autherized to do so.
router.post(
    '/',
    [
    check('name', 'Name is required')
    .not()
    .isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('password', 'Please enter a password with at least 9 character').isLength({min:9})
    

] , async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
    
    let user = await User.findOne({ email})
    if (user) {
        return res.status(400).json({ errors: [{ msg: 'invalid credentials' }] });// see if user already exists
    }
    const avatar = gravatar.url(email,{
        s: '200',//size
        r: 'pg',//avatar type
        d:'mm'//degault avatar to display even if the users dont have one
    })//Get users gravatar

    user = new User({
        name,
        email,
        avatar,
        password
    });//create new instance of User (doesnt save to database)

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt)//Encrypt password (Using bcrypt)

    await user.save();

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
