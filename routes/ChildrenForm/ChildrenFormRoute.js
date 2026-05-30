const express = require("express");
const router = express.Router();

const childController = require("../../controllers/ChildrenForm/ChildrenFormController");
const upload = require("../../middleware/uploadMiddleware");


router.post("/createChild",upload.single("profileImage"),childController.createChild);

router.get("/getAllChild",childController.getAllChild);

router.get("/getChildById/:id",childController.getChildById);

router.get(
  "/my-children/:email",
  childController.getMyChildren
);

// router.put("/updateChild/:id",childController.updateChild);
router.put(
  "/updateChild/:id",
  upload.single("profileImage"),
  childController.updateChild
);

router.delete("/deleteChild/:id",childController.deleteChild);

router.delete("/deleteAllChild",childController.deleteAllChild);

module.exports = router;