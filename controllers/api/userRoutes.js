const router = require('express').Router();
const { User,Score } = require('../../models');
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");

router.get('/', async (req, res) => {
  try {
    const userData = await User.findAll()
    res.status(200).json(userData)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.get('/:username', async (req, res) => {
  try {
    const findUser = await User.findOne({
      where: {
        username: req.params.username
      }
    })
    res.status(200).json(findUser)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
})

router.post('/', async (req, res) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      password: req.body.password
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
    res.status(200).json({
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
    const foundUser = await User.findOne({
      where: {
        username: req.body.username
      }
    });
    if (!foundUser) {
      return res.status(400).json({ msg: 'invalid login info' });
    } else if (!bcrypt.compareSync(req.body.password, foundUser.password)) {
      return res.status(400).json({ msg: 'invalid login' })
    } else {
      const token = jwt.sign(
        {
          username: foundUser.username,
          userId: foundUser.id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h"
        }
      );
      res.status(200).json({
        token,
        user: foundUser
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "womp womp",
      err
    });
  }
});

router.get("/verifytoken", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    console.log("tokek verify")
    console.log(date.userId)
    const foundUser = await User.findByPk(data.userId, {
      include: [Score]
    });
    res.status(200).json(foundUser);
  } catch (err) {
    console.log(err);
    res.status(403).json({ msg: "bad token", err });
  }
});




module.exports = router;