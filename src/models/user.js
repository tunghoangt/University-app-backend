'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    role: DataTypes.STRING,
    salt: DataTypes.STRING,
    passwordHash: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.belongsToMany(models.Course, {
      through: models.StudentCourse,
      foreignKey: 'userId',
    });
    User.hasMany(models.Course, {
      foreignKey: 'facultyId',
      as: 'Instructor',
    });
    User.belongsToMany(models.Assignment, {
      through: models.AssignmentGrade,
      foreignKey: 'userId',
    });
  };
  return User;
};