const ROLES = {
      admin : 2020 ,
      costumer : 2000
} // 2000 = costumer , 2020 = admin ;

const verifyRoles = (...allowedRoles) => {
      return (req , res ,next) => {
            if (!req?.roles) {
                  return res.status(401).json( { 'message' : 'Unauthorized'} )
            }
            const rolesArray = [...allowedRoles] ;
            const userRoles = Array.isArray(req.roles) ? req.roles : [req.roles] ;
            const result = userRoles.some(role => rolesArray.includes(role)) ;
            if (!result) {
                  return res.status(401).json( { 'message' : 'Unauthorized'} )
            }
            next() ;
      }
}

module.exports = { verifyRoles , ROLES } ;