const express = require("express");

const router = express.Router();

const {
  createCoach,
  getAllCoaches,
  getCoachById,
  assignProgramsToCoach,
  updateCoach,
  deleteCoach,
  exportCoachesCSV,
} = require("../controllers/CreateCoachController");

router.post("/create", createCoach);

router.get("/", getAllCoaches);

router.get("/export", exportCoachesCSV);

router.get("/:id", getCoachById);

router.patch(
  "/assign-programs/:id",
  assignProgramsToCoach
);

router.put("/:id", updateCoach);

router.delete("/:id", deleteCoach);

module.exports = router;