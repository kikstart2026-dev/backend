const HeadingModel = require("../../models/AllHeading/AllHeadingModel");

exports.createHead = async (req, res) => {
    try {
        const { tagline, heading, description } = req.body;

        const newhead = await HeadingModel.create({
            tagline,
            heading,
            description
        });

        res.status(201).json({
            status: "success",
            message: "New heading created",
            data: {
                _id: newhead._id,
                tagline: newhead.tagline,
                heading: newhead.heading,
                description: newhead.description,
            }
        });

    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};

// Get All Headings
exports.getAll = async (req, res) => {
    try {
        const data = await HeadingModel.find();

        res.status(200).json({
            status: "success",
            results: data.length,
            data
        });
        
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// Get Heading By ID
exports.getById = async (req, res) => {
    try {
        const data = await HeadingModel.findById(req.params.id);

        if (!data) {
            return res.status(404).json({
                status: "error",
                message: "Heading not found"
            });
        }

        res.status(200).json({
            status: "success",
            data
        });

    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// Update Heading
exports.update = async (req, res) => {
    try {
        const { tagline, heading, description } = req.body;

        const updatedData = await HeadingModel.findByIdAndUpdate( req.params.id,
            { tagline, heading, description },
            { new: true }
        );

        if (!updatedData) {
            return res.status(404).json({
                status: "error",
                message: "Heading not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Heading updated successfully",
            data: updatedData
        });

    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// Delete Single Heading by Id
exports.singleDelete = async (req, res) => {
    try {
        const data = await HeadingModel.findByIdAndDelete(req.params.id);

        if (!data) {
            return res.status(404).json({
                status: "error",
                message: "Heading not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Heading deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// Delete selective Headings
exports.selectiveDelete = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({
                status: "error",
                message: "Please provide an array of ids"
            });
        }

        const result = await HeadingModel.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            status: "success",
            message: "Headings deleted successfully",
            deletedCount: result.deletedCount
        });

    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// Delete All Headings
exports.MultipleDelete = async (req, res) => {
    try {
        const result = await HeadingModel.deleteMany({});

        if (result.deletedCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "No headings found to delete"
            });
        }

        res.status(200).json({
            status: "success",
            message: "All headings deleted successfully",
            deletedCount: result.deletedCount
        });

    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message
        });
    }
};