exports.get404=(req,res)=>{
    res.status(404).render("errors/404",{
        pageTitle:"Page not found-Sandes"
    })
}