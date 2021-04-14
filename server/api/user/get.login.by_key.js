module.exports = (database) => (req, res) => {
  const { email, password } = req.json();

  res.status(200).json({ message: "vot te user" });

  // sequelize.models.User.findOne({whe})
};
