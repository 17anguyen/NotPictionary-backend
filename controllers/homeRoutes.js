const express = require("express");
const router = express.Router();
const { User, Score} = require("../models");

router.get("/", (req, res) => {
  Score.findAll({
    include: [User],
  }).then((scoreData) => {
    const hbsData = scoreData.map((score) => ({
      ...score.get({ plain: true }),
      logged_in: req.session.logged_in,
      logged_in_user: req.session.user_id,
    }));
    res.render("homepage", {
      allScores: hbsData,
      logged_in: req.session.logged_in,
      logged_in_user: req.session.user_id,
    });
  });
});

module.exports = router;