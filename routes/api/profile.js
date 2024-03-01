const express = require('express');
const router = express.Router();
const auth = require('../../middelware/auth');
const { check, validationResult } = require('express-validator');

const profile = require('../../models/Profile');
const User = require('../../models/User');


//  @route    request type:GET end point:api/profile/me
//  @desc     get current users profile
//  @access   public or private ? you need a token to access specfic routes e.g add a profile you need to be authenticated
// so you well need to sen a toekn to that route for it to work or you wont be autherized to do so.
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user'['name', 'avatar']);

        if (!profile) {
            return res.status(404).json({ msg: 'there is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//  @route    request type:POST api/profile
//  @desc     create or update a user profile
//  @access   private
router.post(
    '/', 
    [
        auth, 
        [
    check('status', 'status is required')
        .not()
        .isEmpty(),
    check('skills', 'skills is required')
        .not()
        .isEmpty()
]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        // build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            //console.log(123);//just checking if this is working or not
            profileFields.skills = skills.split(',').map(skill => skill.trim());//we did this so that spaces are removed becuase people may have diffrent spaces while writing
        }

        //Build social profile object
        profileFields.social = {};//if we dont initialize social like this it will give us an error saying social is undefined
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;


        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                //if profile exists then update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }

            //if the profile from above is not found then create profile
            profile = new Profile(profileFields);

            //finally save and send the profile
            await profile.save();
            res.json(profile);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }

    }
);

//  @route    request type:GET api/profile
//  @desc     GET all profiles
//  @access   public
router.get('/',async(req, res) => {
try {
    const profiles = await Profile.find().populate('user', ['name','avatar']);
    res.json(profiles);
} catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
}
});

//  @route    request type:GET api/profile/user/:user_id
//  @desc     GET profiles by user id
//  @access   public
router.get('/user/:user_id',async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name','avatar']);

        if(!profile)
        return res.status(404).json({ msg: 'Profile not found' });

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind=='ObjectId'){return res.status(404).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error');
    }
    });

//  @route    DELETE api/profile
//  @desc     DELETE a prfile, userand posts
//  @access   Private
router.delete('/', auth, async(req, res) => {
    try {
        //Remove the profile 
        await Profile.findOneAndDelete({ user: req.user.id});
        //Remove the user
        await User.findOneAndDelete({ _id: req.user.id});

        res.json({ msg: 'User deleted !' });
    } 
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    });

//  @route    PUT api/profile/experience
//  @desc     Add profile experience
//  @access   Private  
router.put('/experience',
     [
        auth,
        [
    check('title', 'title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty(),

]
],
async(req, res)=>{
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
   }
   const { 
    title, 
    company, 
    location, 
    from, 
    to, 
    current, 
    description 
    } = req.body;

    const newExp={
        title, 
        company, 
        location, 
        from, 
        to, 
        current, 
        description 
    }

        try {
            const profile = await Profile.findOne({ user: req.user.id });
 
            const { experience } = profile
 
            experience.unshift(newExp);
 
            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }

} ); 

//  @route    DELETE api/profile/experience/:exp_id
//  @desc     Delete experience from profile
//  @access   Private 
router.delete('/experience/:exp_id', auth,async(req, res)=>{
    try {
        const profile = await Profile.findOne({ user: req.user.id });//getting the profile of the user

        //Get the index of the experience that we want to remove
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);//splicing the experience of the index we choose to remove above

        await profile.save();//saving it
        res.json(profile);//sending back a response

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//  @route    PUT api/profile/education
//  @desc     Add profile education
//  @access   Private  
router.put('/education',
     [
        auth,
        [
    check('school', 'school is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'field of study is required').not().isEmpty(),
    check('from', 'from date is required').not().isEmpty(),

]
],
async(req, res)=>{
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
   }
   const { 
    school, 
    degree, 
    fieldofstudy, 
    from, 
    to, 
    current, 
    description 
    } = req.body;

    const newEdu={
        school, 
        degree, 
        fieldofstudy, 
        from, 
        to, 
        current, 
        description 
    }

        try {
            const profile = await Profile.findOne({ user: req.user.id });
 
            const { education } = profile
 
            education.unshift(newEdu);
 
            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }

} ); 

//  @route    DELETE api/profile/education/:edu_id
//  @desc     Delete education from profile
//  @access   Private 
router.delete('/education/:edu_id', auth,async(req, res)=>{
    try {
        const profile = await Profile.findOne({ user: req.user.id });//getting the profile of the user

        //Get the index of the education that we want to remove
        const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);//splicing the education of the index we choose to remove above

        await profile.save();//saving it
        res.json(profile);//sending back a response

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;