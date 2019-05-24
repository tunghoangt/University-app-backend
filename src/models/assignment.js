'use strict';
module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
    name: DataTypes.STRING,
    courseId: DataTypes.INTEGER
  }, {});
  Assignment.associate = function(models) {
    // associations can be defined here
  };
  return Assignment;
};