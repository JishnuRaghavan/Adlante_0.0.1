
const isLoggedin = async(req,res,next)=>{
  try {
    
    if(req.session.user_id){
      next();
    }
    else{
      res.redirect('/');
      console.log('1');
    }

  } catch (error) {
    console.log(error.message);
  }
}

const isLoggedout  = async(req,res,next)=>{
  try {
    
    console.log("5");
    if(req.session.user_id){
      
      res.redirect('/homepage');
    }else{
      next();
    }

  } catch (error) {
    console.log(error.message);
  }
}

module.exports  = {
  isLoggedin,
  isLoggedout
}