const mongoose = require("mongoose") ;
const Product = require("../models/products") ;


const deleteProduct = async (req , res) => {
      try {
            //So i think we must think about searching for that product if it exist we delet it else we say it doesnt exist 
            const {productId} = req.params ;
            
            const product = await Product.findByIdAndDelete(productId) ;

            if (product) {
                  return res.status(200).json({ 'message' : 'Product Deleted Successfully'}) ;
            } else {
                  return res.status(404).json( {'message' : 'Product Does not Exist'})
            }

      } catch (err) {
            console.error(`Sir we have an error in Deleting Products : ${err}`)
      }
}

module.exports = deleteProduct ;