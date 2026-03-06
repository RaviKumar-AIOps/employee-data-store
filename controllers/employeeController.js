const Employee = require("../models/Employee");
const fs = require("fs");
const path = require("path");

// Helper: Generate full URL for photo
const getPhotoUrl = (req, filename) => {
  const baseUrl =
    process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

  return `${baseUrl}/uploads/photos/${filename}`;
};

// @desc    Create new employee
// @route   POST /api/employees
exports.createEmployee = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a passport size photo",
      });
    }

    const {
      firstName,
      lastName,
      email,
      contactNumber,
      residentialAddress,
      aadharNumber,
    } = req.body;

    // Check for existing employee
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { aadharNumber }],
    });

    if (existingEmployee) {
      // Delete uploaded file if employee exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }

      return res.status(400).json({
        success: false,
        message:
          existingEmployee.email === email
            ? "Employee with this email already exists"
            : "Employee with this AADHAR number already exists",
      });
    }

    // Create employee
    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      contactNumber,
      residentialAddress,
      aadharNumber,
      photo: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        photoUrl: getPhotoUrl(req, employee.photo.filename),
      },
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    next(error);
  }
};

// @desc    Get all employees
// @route   GET /api/employees
exports.getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({ isActive: true })
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees.map((emp) => ({
        id: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        contactNumber: emp.contactNumber,
        aadharNumber: emp.aadharNumber,
        residentialAddress: emp.residentialAddress,
        photoUrl: getPhotoUrl(req, emp.photo.filename),
        createdAt: emp.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).select("-__v");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        contactNumber: employee.contactNumber,
        aadharNumber: employee.aadharNumber,
        residentialAddress: employee.residentialAddress,
        photoUrl: getPhotoUrl(req, employee.photo.filename),
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Delete photo file
    const photoPath = path.join(
      __dirname,
      "..",
      "uploads",
      "photos",
      employee.photo.filename,
    );
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
