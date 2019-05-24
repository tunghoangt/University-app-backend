'use strict';
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    name: DataTypes.STRING,
    facultyId: DataTypes.INTEGER
  }, {});
  Course.associate = function(models) {
    // associations can be defined here
    Course.belongsToMany(models.User,{
    	through: models.StudentCourse,
    	foreignKey: 'courseId',
    });
    Course.belongsTo(models.User,{
    	foreignKey: 'facultyId',
    	as: 'teachingCourses',
    });
    Course.hasMany(models.Assignment, {foreignKey: 'courseId'});
  };
  return Course;
};