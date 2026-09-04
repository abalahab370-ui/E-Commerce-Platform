const mangoose = require("mangoose") ;
const Category = require("../models/category") ;
const Product = require("../models/products") ;

const deleteCategory = async (req , res) => {
      try {
            //First the admin SHould Send the id of the category that he want to delete , But at this point there is already iteams releated to this category So we have to decide wather we cant to delete them too cuz that is a conflict So maybe Updating a Category At this Point Would be Better then Deleting it !
            const { categoryId }= req.query ;
            const category = await Category.findById(categoryId) ;
             if (!category) {
                  return res.status(404).json({ message: 'Category not found' });
             }
             //we have to check if there are Product related to this category !
             const products = await Product.find({ category : categoryId }) ;
                  if (products.length > 0) {
                        // it think we can also do : if (!products) ! 
                        return res.status(400).json({ message: 'Cannot delete category with associated products' });
                  }
                  //else we can delete this category : 
                  const result = await Category.deleteOne({ _id : categoryId }) ;
                  return res.status(200).json( { message : 'Category deleted successfully' }) ;

      } catch (err) {
            console.error(`Sir we have an error in deleting category : ${err}`) ;
            return res.status(500).json({ message : 'Internal Server ERROR'}) ;
      }
}