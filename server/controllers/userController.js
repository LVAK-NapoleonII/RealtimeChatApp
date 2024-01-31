const User = require("../models/userModel")
const brcypt = require("bcrypt")

//Định nghĩa hàm xử lý đăng ký với các tham số req (đối tượng yêu cầu), res (đối tượng phản hồi), và next (hàm middleware tiếp theo).
module.exports.register = async (req, res, next) => {
    try {
        // Kiểm tra xem username và email đã tồn tại chưa
        const { username, email, password } = req.body
        const usernameCheck = await User.findOne({ username })
        const emailCheck = await User.findOne({ email })

        //Sử dụng bcrypt để mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu.
        const hashedPassword = await brcypt.hash(password, 10)

        if (usernameCheck) {
            return res.json({ msg: "Username already used", status: false })
        }
        if (emailCheck) {
            return res.json({ msg: "Email already used", status: false })
        }

        const user = await User.create({
            email,
            username,
            password: hashedPassword,
        })

        delete user.password
        return res.json({ status: true, user })
    } catch (ex) {
        next(ex)
    }
}

module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        const isPasswordValid = await brcypt.compare(password, user.password)

        // Sử dụng bcrypt để mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu.
        // 10: Đây là số vòng lặp của thuật toán băm. 10 chỉ ra số vòng lặp, và giá trị càng cao thì thời gian tính toán càng tăng, làm cho quá trình băm an toàn hơn đối với các cuộc tấn công brute-force.
        const hashedPassword = await brcypt.hash(password, 10)

        if (!user) {
            return res.json({ msg: "Incorrect username or password", status: false })
        }
        if (!isPasswordValid) {
            return res.json({ msg: "Incorrect username or password", status: false })
        }
        delete user.password
        return res.json({ status: true, user })
    } catch (ex) {
        next(ex)
    }
}

module.exports.setAvatar = async (req, res, next) => {
    try {
        const userId = req.params.id
        const avatarImage = req.body.image
        const userData = await User.findByIdAndUpdate(userId, {
            isAvatarImageSet: true,
            avatarImage,
        })
        return res.json({isSet: userData.isAvatarImageSet, image: userData.avatarImage, })
    } catch (ex) {
        next(ex)
    }
}

module.exports.getAllUsers = async (req, res, next) => {
    try{
        const users = await User.find({_id:{$ne:req.params.id }}).select([
            "email",
            "username",
            "avatarImage",
            "_id"
        ]);
        return res.json(users);
    }catch(ex){
        next(ex);
    }
}