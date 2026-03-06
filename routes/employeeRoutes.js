const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createEmployee,
  getAllEmployees,
  getEmployee,
  deleteEmployee // ✅ Add this
} = require('../controllers/employeeController');

// POST /api/employees - Create employee with photo
router.post(
  '/',
  upload.single('photo'),
  createEmployee
);

// GET /api/employees - Get all employees
router.get('/', getAllEmployees);

// GET /api/employees/:id - Get single employee
router.get('/:id', getEmployee);

// DELETE /api/employees/:id - Delete employee ✅ Add this
router.delete('/:id', deleteEmployee);

module.exports = router;