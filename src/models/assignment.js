'use strict';
module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
    name: DataTypes.STRING,
    courseId: DataTypes.INTEGER
  }, {});
  Assignment.associate = function(models) {
    // associations can be defined here
    Assignment.belongsTo(models.Course, {foreignKey: 'courseId'});
    Assignment.belongsToMany(models.User,{
    	through: models.AssignmentGrade, 
    	foreignKey: 'assignmentId',
    });
  };
  return Assignment;
};