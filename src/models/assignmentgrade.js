'use strict';
module.exports = (sequelize, DataTypes) => {
  const AssignmentGrade = sequelize.define('AssignmentGrade', {
    userId: DataTypes.INTEGER,
    assignmentId: DataTypes.INTEGER,
    grade: DataTypes.FLOAT
  }, {});
  AssignmentGrade.associate = function(models) {
    // associations can be defined here
  };
  return AssignmentGrade;
};