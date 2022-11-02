//Import validation result
const {validationResult}=require("express-validator/check");
//Import bcrypt
const bcrypt=require("bcryptjs");

//Import models
const User=require("../models/User");

exports.getLogIn=(req,res)=>{
    res.render("auth/login",{
        pageTitle:"Log In-SANDES",
        errorMessages:req.flash("error-message"),
        hasErrors:false
    });
}

exports.getSignUp=(req,res)=>{
    res.render("auth/signup",{
        pageTitle:"Sign Up-SANDES",
            hasErrors:false,
            errorMessages:[],
            errors:[]
    })
}

exports.postSignUp= async (req,res)=>{
    const body=JSON.parse(JSON.stringify(req.body));
    //Check validation result
    const errors=validationResult(req);
    if(!errors.isEmpty()){
       return res.status(422).render("auth/signup",{
            pageTitle:"Sign Up-SANDES",
            hasErrors:true,
            oldValue:body,
            errorMessages:errors.array().map(i=>i.msg),
            errors:errors.array()
        })

    }else{
        bcrypt.hash(body.password,12).then(hashedPassword=>{
            const user=new User({
                firstName:body.firstName,
                lastName:body.lastName,
                contactNumber:body.contactNumber,
                email:body.email,
                password:hashedPassword
            })
            return user.save();

        }).then(()=>{
        res.redirect("/login");

        }).catch(err=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            throw error;
            });
    }
}

exports.postLogIn=(req,res)=>{
    const body=JSON.parse(JSON.stringify(req.body));
    User.findOne({email:body.email}).then(user=>{
        if(user){
            bcrypt.compare(body.password,user.password).then(doMatch=>{
                if(doMatch){
                    req.session.isLoggedIn=true;
                    req.session.user=user;
                    res.redirect("/");
                }else{
                    return res.status(422).render("auth/login",{
                        pageTitle:"LogIn-Sandes",
                        oldValue:body,
                        hasErrors:true,
                        errorMessages:["Invalid credentials"]
                    })
                }
            }).catch(err=>{
                const error=new Error(err);
                error.httpStatusCode=500;
                throw error;
        
            })
        }else{
            return res.status(422).render("auth/login",{
                pageTitle:"LogIn-Sandes",
                oldValue:body,
                hasErrors:true,
                errorMessages:["Invalid credentials"]
            })
        }
    }).catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        throw error;

    })
}

exports.postSignOut=(req,res)=>{
    req.session.destroy()
    res.redirect("/login")
    
}

//Send details of user to the client
exports.getDetails=(req,res)=>{
    res.json(req.session.user);
    
}