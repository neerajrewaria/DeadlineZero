const User = require('../models/User');
const Profile = require('../models/Profile');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gender, contactNo, dob, about } = req.body;

    // Find the user by ID
    const user = await User.findById(userId).populate('additionalDetails');
    const additionalDetails = user.additionalDetails;
    const profileDetails = await Profile.findById(additionalDetails);
    //at a first time profileDetails may be null so we need to handle that


    // Update profile details
    profileDetails.gender = gender?.toLowerCase() || profileDetails.gender;
    profileDetails.contactNo = contactNo || profileDetails.contactNo;
    profileDetails.dob = dob || profileDetails.dob;
    profileDetails.about = about || profileDetails.about;
    await profileDetails.save();

    const updatedUser = await User.findById(userId).populate('additionalDetails');
    if (updatedUser) {
      updatedUser.password = undefined;
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      profile: profileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};


//delete profile controller
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find the user by ID
    const user = await User.findById(userId).populate('additionalDetails');
    const additionalDetails = user.additionalDetails;



    // Delete profile details
    await Profile.findByIdAndDelete({ _id: additionalDetails });
    await User.findByIdAndDelete(userId);

    //todo also delete from enrolled users in courses
    return res.status(200).json({
      success: true,
      message: 'Profile deleted successfully',
    });



    //now also delete user 

  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message,
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        const enrolledCourses = await User.findById(userId)
            .populate({
                path: "courses",
                populate: [
                    {
                        path: "courseContent",
                        populate: {
                            path: "subSection",
                        },
                    },
                    {
                        path: "instructor",
                    },
                    {
                        path: "category",
                    },
                ],
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: "Enrolled courses fetched successfully",
            data: enrolledCourses.courses,
        });
    } catch (error) {
        console.error("Error in getEnrolledCourses:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
