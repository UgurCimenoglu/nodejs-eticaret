const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    description : {
        type : String
    }
})

module.exports = mongoose.model('Category' , categorySchema)




// const getDb = require('../utility/database').getDb;
// const mongodb = require('mongodb');

// class Category{
//     constructor(name,description , id){
//         this.name = name;
//         this.description = description;
//         this._id = id ? new mongodb.ObjectID(id) : null;
//     };

//     save(){
//         let db = getDb();
//         if(this._id){
//             return db.collection('category').updateOne({_id : this._id} , {$set : this});
//         }else{
//             return db.collection('category').insertOne(this);
//         }
        
//     }

//     static getCategory(){
//         let db = getDb();
//         return db.collection('category')
//         .find({})
//         .toArray()
//         .then((result) => {
//             return result;
//         }).catch((err) => {
//             console.log(err)
//         });
//     }


//     static findById(categoryid){
//         let db = getDb();
//         return db.collection('category')
//             .findOne({_id : new mongodb.ObjectID(categoryid)})
//             .then((result) => {
//                 return result
//             }).catch((err) => {
//                 console.log(err)
//             });
//     }

//     static deleteById(categoryid){
//         let db = getDb();
//         return db.collection('category')
//             .deleteOne({_id : new mongodb.ObjectID(categoryid)})
//             .then(result=>{
//                 console.log("deleted")
//             })
//             .catch(err => console.log(err))
//     }


// }



// module.exports = Category;