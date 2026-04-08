const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  createEmployee,
  getAllEmployees,
  getEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

// POST /employees - Create employee with photo
router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharFile", maxCount: 1 },
  ]),
  createEmployee
);

// GET /employees - Get all employees
router.get("/", getAllEmployees);

// GET /employees/:id - Get single employee
router.get("/:id", getEmployee);

// DELETE /employees/:id - Delete employee
router.delete("/:id", deleteEmployee);

module.exports = router;
