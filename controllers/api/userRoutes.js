const router = require('express').Router();
const { User } = require('../../models');
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");

router.get('/', async (req,res) => {
    try {
        const userData = await User.findAll()
        res.status(200).json(userData)
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

router.post('/', async (req, res) => {
    try {
      const newUser = await User.create({
        username:req.body.username,
        password:req.body.password
    });
    const token = jwt.sign(
        {
          username: newUser.username,
          userId: newUser.id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h"
        }
      );
      res.json({
        token,
        user: newUser
      });
    } catch (err) {
      console.log(err)
      res.status(400).json(err);
    }
  });
  
router.post('/login', async (req, res) => {
    try {
      const userData = await User.findOne({ where: { username: req.body.username } });
  
      if (!userData) {
        res
          .status(400)
          .json({ message: 'Incorrect username or password, please try again' });
        return;
      }
  
      const validPassword = await userData.checkPassword(req.body.password);
  
      if (!validPassword) {
        res
          .status(400)
          .json({ message: 'Incorrect username or password, please try again' });
        return;
      }
  
      req.session.save(() => {
        req.session.user_id = userData.id;
        req.session.logged_in = true;
        
        res.json({ user: userData, message: 'You are now logged in!' });
      });
  
    } catch (err) {
      console.log(err)
      res.status(400).json(err);
    }
  });

  router.post('/logout', (req, res) => {
    if (req.session.logged_in) {
      req.session.destroy(() => {
        res.render("login");
      });
    } else {
      res.status(404).end();
    }
  });  
  

  module.exports = router;
