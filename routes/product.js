const express = require('express')
const router = express.Router()
const multer = require('multer')
const productCtrl = require('../controllers/product')
const userAuth = require('../middleware/user-auth')


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
      //cb(null, new Date().toISOString() + file.originalname);
      cb(null, new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname);
    }
})
  
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
}
  
const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
})


router.get("/", productCtrl.getAllProducts);

router.post("/", userAuth, upload.single('productImage'), productCtrl.createProducts);

router.get("/:productId", productCtrl.getOneProduct);

router.patch("/:productId", userAuth, productCtrl.updateProduct);

router.delete("/:productId", userAuth, productCtrl.deleteProduct);

module.exports = router;