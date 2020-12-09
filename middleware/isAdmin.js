module.exports = (req,res,next)=>{
   res.locals.isAdmin = req.user ? req.user.isAdmin : false; 
   next()
}