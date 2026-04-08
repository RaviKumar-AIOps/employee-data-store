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
    if (!req.files || !req.files.photo || !req.files.aadharFile) {
      return res.status(400).json({
        success: false,
        message: "Photo and Aadhar file are required",
      });
    }

    const photo = req.files.photo[0];
    const aadhar = req.files.aadharFile[0];

    const {
      firstName,
      lastName,
      email,
      contactNumber,
      residentialAddress,
      bloodGroup,
    } = req.body;

    // Check existing employee (only email now)
    const existingEmployee = await Employee.findOne({ email });

    if (existingEmployee) {
      // delete uploaded files
      [photo, aadhar].forEach((file) => {
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      contactNumber,
      residentialAddress,
      bloodGroup,
      photo: {
        filename: photo.filename,
        originalName: photo.originalname,
        mimetype: photo.mimetype,
        size: photo.size,
      },
      aadharFile: {
        filename: aadhar.filename,
        originalName: aadhar.originalname,
        mimetype: aadhar.mimetype,
        size: aadhar.size,
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
    // cleanup both files
    if (req.files) {
      Object.values(req.files).flat().forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
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
        // aadharNumber: emp.aadharNumber,
        residentialAddress: emp.residentialAddress,
        photoUrl: getPhotoUrl(req, emp.photo.filename),
        aadharUrl: getPhotoUrl(req, emp.aadharFile.filename),
bloodGroup: emp.bloodGroup,
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
        // aadharNumber: employee.aadharNumber,
        residentialAddress: employee.residentialAddress,
        photoUrl: getPhotoUrl(req, employee.photo.filename),
        aadharUrl: getPhotoUrl(req, emp.aadharFile.filename),
bloodGroup: emp.bloodGroup,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /employees/:id
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
      fs.unlinkSync(photoPath); // Delete Photo
    }

    await employee.deleteOne(); // Removes the document from MongoDB

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
