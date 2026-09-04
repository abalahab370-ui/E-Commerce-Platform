const mongoose = require("mongoose") ;
const Product = require("../models/products") ;
const cloudinary = require("../config/cloudinary") ;


const deleteProduct = async (req , res) => {
      try {
            //So i think we must think about searching for that product if it exist we delet it else we say it doesnt exist 
            const {productId} = req.params ;
            
            const product = await Product.findByIdAndDelete(productId) ;

            if (product) {
                  //well we have to delete the related images too : 
                  if (product.images && product.images.length > 0) {
                  const imagesUrls = product.images.map((image) => {
                        return image.publicId ;
                  }) ;

                  const DeletePromises = imagesUrls.map( (url) => {
                        return cloudinary.uploader.destroy(url) ;
                  })

                  const result = await Promise.all(DeletePromises) ;
                  }

                  return res.status(200).json({ 'message' : 'Product Deleted Successfully'}) ;
            } else {
                  return res.status(404).json( {'message' : 'Product Does not Exist'})
            }

      } catch (err) {
            console.error(`Sir we have an error in Deleting Products : ${err}`) ;
            return res.status(500).json({ 'message': 'Internal Server Error' }) ;
      }
}

module.exports = deleteProduct ;