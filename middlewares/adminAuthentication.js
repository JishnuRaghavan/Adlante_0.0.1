const isLoggedin  = async(req,res,next)=>{
  
  try {
    
    if(req.session.admin_id){
      next();
    }
    else{
      res.redirect('/admin');
    }

  } catch (error) {
    console.log(error.message);
  }

}

const isLoggedout = async(req,res,next)=>{

  try {
    
    if(req.session.admin_id){
      res.redirect('/admin/adminhome');
    }
    else{
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