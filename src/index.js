import {
  ApolloServer,
  gql,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server';

import regeneratorRuntime from "regenerator-runtime";
import crypto from "crypto";  // used to hash passowrd
import jwt from "jsonwebtoken" // token using json

import _ from "lodash" // to use .<operation>

import db from './models';

var APP_SECRET = '123';

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
    todos: [Todo]
    courses: [Course]
    users: [User]
    currentUser: User
    students: [Student]
    faculties: [Faculty]
    login: [User]
    studentcourses: [StudentCourse]
    assignments: [Assignment]
    assignmentgrades: [AssignmentGrade]
  }

  type Mutation {

    loginUser(email: String!, password: String!): AuthPayload
    logoutUser: Boolean


    createTodo(name: String): Todo
    
    createUser(name: String, email: String, role: String, password: String): User
    deleteUser(userId: ID, role: Role): User

    createCourse(name: String, facultyId: ID): Course
    
    deleteCourse(courseId: ID): Course

    addStudentCourse(userId: Int, courseId: Int): StudentCourse
    delStudentCourse(userId: Int, courseId: Int): StudentCourse

    createAssignment(name: String, courseId: ID): Assignment
    deleteAssignment(assignmentId: ID): Assignment

    addAssignmentGrade(userId: Int, assignmentId: Int, grade: Float): AssignmentGrade
    delAssignmentGrade(userId: Int, assignmentId: Int): AssignmentGrade
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Todo {
    id: ID!
    name: String!
    done: Boolean!
  }

  enum Role {
    Admin
    Student
    Faculty
  }

  interface User {
    id: ID!
    name: String
    email: String
    role: Role
    salt: String
    passwordHash: String
  }

  type Student implements User {
    id: ID!
    name: String
    email: String
    role: Role
    courses: [Course]
    assignmentgrades: [AssignmentGrade]
    salt: String
    passwordHash: String
  }

  type Faculty implements User {
    id: ID!
    name: String
    email: String
    role: Role
    courses: [Course]
    salt: String
    passwordHash: String
  }

  type Admin implements User {
    id: ID!
    name: String
    email: String
    role: Role
    salt: String
    passwordHash: String
  }

  type StudentCourse {
    id: ID!
    userId: Int
    courseId: Int
  }

  type Course {
    id: ID!
    name: String
    students: [User]
    faculty: [User]
  }

  type Assignment {
    id: ID!
    name: String
    course: [Course]
    grades: [AssignmentGrade]
  }

  type AssignmentGrade {
    id: ID!
    userId: Int
    assignmentId: Int
    grade: Float
  }

`;


// Function def for hashing passowrd
function genRandomString(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
};

function sha512(password, salt) {
  var hash = crypto.createHmac(
    'sha512',
    salt,
  ); /** Hashing algorithm sha512 */
  hash.update(password);
  var value = hash.digest('hex');
  return {
    salt: salt,
    passwordHash: value,
  };
};

function genSaltHashPassword(userpassword) {
  var salt = genRandomString(16); /** Gives us salt of length 16 */
  var passwordData = sha512(userpassword, salt);
  // console.log('UserPassword = ' + userpassword);
  // console.log('Passwordhash = ' + passwordData.passwordHash);
  // console.log('nSalt = ' + passwordData.salt);

  return passwordData;
};

async function getSession(sessionID){
        /*
         * Search for the session row based on sessionID
         *
         * INPUT: sessionID | str/int?
         *
         * OUTPUT: object {sessionID: str/int?, userID: str/int?)
         */
        const i = _.findIndex(this.userSessions, u => u.id === sessionID) // search
        return i === -1 ? null : this.userSessions[i]; // return session row, return -1 if not found
    }
    
    // append new row to the database and return a token for validation
function createSession(userId, secret, expiresIn = 60 * 30){
    /*
     * Create session with userID based on jwt (json web token)
     *
     * INPUT:
     *  - userID | str/int | the id information of the user
     *  - secret | str | a private key 
     *  - expiresIn | int | duration in second 
     * 
     * OUTPUT: token | str | the encrypted token 
     */

    // GOHERE 0.1 : create new row in UserSession tb with userID
     // row add to UserSession
    
    
    var sessionId = genRandomString(16);
    
    const session = {userId: userId, SessionId: sessionId};
    db.UserSession.create(session)
    
    // Generate a token with payload, which is the claim about the user: userID has session ID
    const token = jwt.sign(session, secret, {expiresIn});

    // Return the token containing the information
    return token;
}

// remove row from database
function invalidateSession(sessionID){
    /*
     * remove the row with session id from db
     *
     * INPUT: sessionID | str/int | session id to be removed
     * OUTPUT: null
     */
    db.UserSession.destroy({where: {SessionId: sessionID}});
}  

async function login(emailAddress, password) {

    // GOHERE 2 | adding var userinfo = value outside the findAll loop
    // does a user with the specified emailAddress exist?

    //var test_user;

    //var user_test = db.User.findOne({raw: true, where: {email: emailAddress}});
    //console.log(user_test.get('id'));
    //var res = user_test.then(function(value) {
      //console.log(value);
      //return value;
    //});
    var query_res = await db.User.findAll({where: {email: emailAddress}}).map(el => el.get({plain: true}))
    
    //console.log(query_res[0]);

    
    if(_.isEmpty(query_res)){
      throw new AuthenticationError('Bad Login or Password')
    }

    var user = query_res[0];

    // hash the password with the user salt
    const hashedPassword = sha512(password, user.salt).passwordHash;

    // compare the hashed password against the one in the user record
    if (hashedPassword !== user.passwordHash) {
    //     console.log(hashedPassword);
    //     console.log(user);
       throw new AuthenticationError('Bad Login or Password');
    }

    // create a jwt token and store
    //

    return {
        user: _.omit(user, ['passwordHash', 'salt']),
        token: createSession(user.id, APP_SECRET),
    };
}


//login('t1212131@aol.com', '123')


//console.log('--------') 
   
//console.log(login('tete@aol.com', '123'));

//login('tete@aol.com', '123').then((result) => console.log(result));

//console.log(createSession(1, APP_SECRET));

async function getUserForToken(token){    
    /*
     * Return an array containing user and the session.id corresponding to that user using token
     *
     * INPUT: token | str | the togen from user somewhere
     * OUTPUT: [user | str, session.id | str] | array 
     */

    try{
        const { userId, SessionId } = jwt.verify(token, APP_SECRET); // get the user id and sessionID by decrypting the token
        
        console.log(SessionId)

        var query_res_user = await db.User.findAll({where: {id: userId}} ).map(el => el.get({plain: true}))

          
        if(_.isEmpty(query_res_user)){
          throw new AuthenticationError('User not found')
        }

        var user = query_res_user[0];
        //console.log(user);

        // search for the session
        var query_res_session = await db.UserSession.findAll({where: {SessionId: SessionId}} ).map(el => el.get({plain: true}))
          
        if(_.isEmpty(query_res_session)){
            throw new AuthenticationError('Invalid sessionID')
          }

        return [user, SessionId]; // 
       } catch(error){
         // Catching token expiration error and remove it from DB
        if( error instanceof jwt.TokenExpiredError ){
            const { sessionID } = jwt.decode(token); // Just decode the token WITHOUT verification 
            invalidateSession(sessionID); // Remove the session from Session DB

            console.log("Session expired");
            throw new AuthenticationError("Session expired"); // Raise Error Exception
        }

        console.log("Bad token"); 
        throw new AuthenticationError("Bad Token"); // Raise Error Exception
    }
}

async function getFaculty() {
  var result = await db.User.findAll({
    where: {role: "Faculty"},
    include: [
      {
        model: db.Course,
        as: "teachingCourses"
      }
    ]
  })
  return result;
}

//login('tete@aol.com', '123').then((result) => console.log(result));

//var test = getUserForToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIxLCJTZXNzaW9uSWQiOiJjNjllZDY1YzMyMzMyMmZlIiwiaWF0IjoxNTU4NDE0MDgxLCJleHAiOjE1NTg0MTQ2ODF9.xRq7ATnEiwdy3RJgPeZauqDlmu9RmHKR2WCbMMQnPYQ');

//console.log(test);

// test.then((res) => u = res);

const makeResolver = (resolver, options) => {
  // return an adorned resolver function
  return async (root, args, context, info) => {
    const o = {
      requireUser: true,
      roles: ['Admin', 'Student', 'Faculty'],
      ...options,
    };
    const { requireUser } = o;
    const { roles } = o;
    let user = null;
    let SessionId = null;

    if (requireUser) {
      // get the token from the request
      const token = context.req.headers.authorization || '';
      if (!token) {
        throw new AuthenticationError('Token Required');
      }
      
      // retrieve the user given the token
      [user, SessionId] = await getUserForToken(token);
      
      if (!user) {
        throw new AuthenticationError('GraphQL error: Bad Token');
      }

      // authorize the operation for the user
      const userRole = user.role;
      if (_.indexOf(roles, userRole) === -1) {
        throw new ForbiddenError('Operation Not Permitted');
      }
    }

    // call the passed resolver with context extended with user
    return resolver(
      root,
      args,
      { ...context, db:db, user: user, SessionId: SessionId },
      info,
    );
  };
};


const resolvers = {
  Query: {
    hello: () => 'world',
    todos: makeResolver((root, args, context, info) => db.Todo.findAll()),

    currentUser:  makeResolver((root, args, context) => context.user),

    users: makeResolver((root, args, context, info) => db.User.findAll(), {roles: ['Admin','Faculty','Student']}),
    
    courses: makeResolver((root, args, context, info) => db.Course.findAll(), {roles: ['Admin','Faculty','Student']}),

    students: makeResolver((root, args, context, info) => db.User.findAll(
        {where: {role: 'Student'}}
      ), {roles: ['Admin','Faculty','Student']}),
    
    faculties: makeResolver((root, args, context, info) => db.User.findAll(
      {where: {role: 'Faculty'}}
      ), {roles: ['Admin','Faculty','Student']}),

    studentcourses: makeResolver((root, args, context, info) => db.StudentCourse.findAll(), {roles: ['Admin','Faculty','Student']}),
    assignments: makeResolver((root, args, context, info) => db.Assignment.findAll(), {roles: ['Admin','Faculty','Student']}),
    assignmentgrades: makeResolver((root, args, context, info) => db.AssignmentGrade.findAll(), {roles: ['Admin','Faculty','Student']}),
  },

  //Resolving user type
  User: {
    __resolveType: (user, context, info) => user.role
  },

  //Querying all courses by specific student
  Student: {
    courses: (student, context, info) => {
      return student.getCourses()
    },

    assignmentgrades: (student, context, info) => {
      return student.getAssignments()
    },
  },

  //Querying all courses taught by a faculty
  Faculty: {
    courses: (faculty, context, info) => {
      // return faculty.getInstructor()
      return db.Course.findAll({
        where: {facultyId: faculty.dataValues.id}
      })
    }
  },

  //Querying all students & faculty belongs to a courses
  Course: {
    students: (course, context, info) => {
      return course.getUsers({where: {role: 'Student'}})
    },

    faculty: (course, context, info) => {
      return db.User.findAll({
        where: {id: course.dataValues.facultyId}
      })
    },

  },

  //Querying all grades related to an assignment
  Assignment: {
    grades: (assignment, context, info) => {
      return assignment.getUsers({where: {role: 'Student'}})
    },

    course: (assignment, context, info) => {
      return db.Course.findAll({
        where: {id: assignment.dataValues.courseId}
      })
    }
  },


  Mutation: {

    loginUser: makeResolver(
        (root, args, context, info) => {
          return login(args.email, args.password);
        },
        { requireUser: false },
      ),

    logoutUser: makeResolver((root, args, context, info) => {
        const sessionID = context.sessionID;
        invalidateSession(sessionID);
        return true;
      }),

    // Create todo item
    createTodo: makeResolver((root, args, context, info) => {
      return db.Todo.create({ 
        name: args.name, 
        done: false });
    }, {roles: ['Admin','Faculty','Student']}),

    // Create user (Admin only)
    createUser: makeResolver((root, args, context, info) => {
      return db.User.create({ name: args.name,email: args.email, 
                              role: args.role, 
                              ...genSaltHashPassword(args.password)});
    }, {role: ['Admin']}),
    // createUser: (root, args, context, info) => {
    //   return db.User.create({ 
    //     name: args.name,
    //     email: args.email, 
    //     role: args.role, 
    //     ...genSaltHashPassword(args.password)});
    // },

    // Delete user by ID (Admin only)
    deleteUser: makeResolver((root, args, context, info) => {
      return db.User.destroy({
        where: {
          id: args.userId, 
          role: args.role}});
    }, {roles: ['Admin']}),

    //Add a course (Admin & Faculty only)
    createCourse: makeResolver((root, args, context) => {
      return db.Course.create({
        name: args.name, 
        facultyId: args.facultyId,
      });
    }, {roles: ['Admin']}),

    // Delete course (Admin only)
    deleteCourse: makeResolver((root, args, context, info) => {
      return db.Course.destroy({
        where: {id: args.courseId}});
    }, {roles: ['Admin']}),

    //Add an assignment
    createAssignment: makeResolver((root, args, context) => {
      return db.Assignment.create({
        name: args.name, 
        courseId: args.courseId,
      });
    }, {roles: ['Admin','Faculty']}),

    // Delete an assignment
    deleteAssignment: makeResolver((root, args, context, info) => {
      return db.Assignment.destroy({
        where: {id: args.assignmentId}});
    }, {roles: ['Admin','Faculty']}),

    // Add student to course given userId and courseId
    addStudentCourse: makeResolver((root, args, context, info) => {
      return db.StudentCourse.create({
        userId: args.userId, 
        courseId: args.courseId});
    },{roles: ['Admin','Faculty']}), 
    
    // Delete student from course
    delStudentCourse: makeResolver((root, args, context, info) => {
      return db.StudentCourse.destroy({
        where: {
          userId: args.userId, 
          courseId: args.courseId}});
    },{roles: ['Admin','Faculty']}), 
    // Add student grade given userId and courseId
    addAssignmentGrade: makeResolver((root, args, context, info) => {
      return db.AssignmentGrade.create({
        userId: args.userId, 
        assignmentId: args.assignmentId, 
        grade: args.grade});
    },{roles: ['Admin','Faculty']}), 
    //Remove grade record for an assignment
    delAssignmentGrade: makeResolver((root, args, context, info) => {
      return db.AssignmentGrade.destroy({
        where: {
          userId: args.userId, 
          assignmentId: 
          args.assignmentId}});
    }, {roles: ['Admin','Faculty']}), 
  },
};

const server = new ApolloServer({
  cors: true,
  typeDefs,
  resolvers,
  context: request => {
    return request;
  },
  // enable playground even in production
  introspection: true,
  playground: true,
});

const PORT = process.env.PORT || 4000;

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});


