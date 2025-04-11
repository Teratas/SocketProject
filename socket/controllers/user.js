const User = require('../models/User')

exports.handleLoginController =  async (req, res, next) => {
    // do something
    const {username} = req.body
    const findUser = await User.findOne({username : username})
    if(!findUser){
        const user = await User.create({
            username,
            password : "",
    
        })
        if(!user){
            res.status(401).json({
                success : false,
                message : "failed to create user"
            })
        }
        res.status(200).json({
            success : true,
            findUser : user,
            message : "Create User Successfully!"
        })
    }
    else{
        res.status(200).json({
            success: true,
            findUser,
            message: "Find User Succesfully"
        })
    }
    
}

exports.handleFetchById = async (req, res, next) => {
    const username = req.query.username
    const findUser = await User.findOne({username : username})

    if(findUser){
        res.status(200).json({
            success : true,
            message : "Find User Successfully",
            findUser
        })
    }else{
        res.status(400).json({
            success : false,
            message: "Cannot find this User"
        })
    }
}

exports.handleFetchAll = async (req, res, next) => {
    try{
        const users = await User.find()
        res.status(200).json({
            success : true,
            data : users
        })
    }catch(err){
        console.log(err)
    }

}