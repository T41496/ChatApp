//Import Modules
const express=require("express");

//Instantiate router
const router=express.Router();

//Import models
const User=require("../models/User");

//Import controller
const authController=require("../controllers/authController");

//Import middleware
const {ensureAuth,ensureGuest}=require("../middlewares/is-Auth");


//Import validator
const {body}=require("express-validator/check")

router.get("/login",ensureGuest,authController.getLogIn);

router.get("/signup",ensureGuest,authController.getSignUp);

router.post("/signup",[
    body("firstName","Invalid First Name").isAlpha().isLength({min:2,max:20}).trim(),
    body("lastName","Invalid Last Name").isAlpha().isLength({min:2,max:20}).trim(),
    body("contactNumber","Invalid Contact Number").isNumeric().isLength({min:10,max:10}).trim(),
    body("email","Invalid Email").isEmail().custom((value,{req})=>{
        return User.findOne({email:value}).then(user=>{
            if(user){
                return Promise.reject("Email already exists");
            }
            return true;
        })

    }).normalizeEmail(),
    body("password","Weak Password").isStrongPassword({minLength:6,minSymbols:1,minNumbers:1}).trim(),
    body("confirmPassword").custom((value,{req})=>{
        if(value===req.body.password){
            return true;
        }
        throw new Error("Password doesn't match");
    })

],authController.postSignUp);

router.post("/login",authController.postLogIn);

router.post("/sign-out",authController.postSignOut);

router.get("/details",ensureAuth,authController.getDetails);


//Export router
module.exports=router;