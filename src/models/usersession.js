'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserSession = sequelize.define('UserSession', {
    userId: DataTypes.INTEGER,
    SessionId: DataTypes.STRING
  }, {});
  UserSession.associate = function(models) {
    // associations can be defined here
    UserSession.belongsTo(models.User,{
	foreignKey: 'userId'
    });
  };
  return UserSession;
};