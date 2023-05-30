const User = require('./User');
const Score = require('./Score');

User.hasMany(Score, {
    foreignKey:'user_id'
})

Score.belongsTo(User, {
    foreignKey:'user_id'
})

module.exports = { User, Score };