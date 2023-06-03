//catch async errors , remove duplicate code 
//async func return promises, the error will be rejected
//so catch the error
//remove try catch blocks in each async function and wrap the async func with this catchAsync
//so we dont have to use try catch anymore 
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //pass the error to the global error middleware
  };
};
