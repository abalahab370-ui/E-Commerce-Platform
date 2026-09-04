
//So basiclly am just trying to test if i did really got the concept used in getproduct.js !

const getProduct = async (req , res ) => {

      const { category , Lprice , Hprice, sort , page , limit , search }= req.query ;
      // there is no need to check for their existance cuz it will be controlled by the front end using zod Schema (mostly) , So we gonna just check for the category !

      const filter = {} ;

      if (category) {
            const categoryDoc = await Category.findOne({ slug : category }) ;
            filter.category = categoryDoc._id ;
      } else {
            return res.status(400).json({ message : 'category is required' }) ;
      }

      //next we gonna set hte text index search : 

      if (search) {
            filter.$text = { $search : search } ;
      }
      
      //now setting the price rang : 

      if (Hprice) {
            filter.price.$lte = Number(Hprice) ;      
      }
      
      if (Lprice) {
            filter.price.$gte = Number(Lprice) ;
      }
}