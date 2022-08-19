const bcrypt = require ('bcryptjs')

const helpers = {}

helpers.cifrarpw = async (pw) => {
    const alg = await bcrypt.genSalt(10);
    const pwfinal = await bcrypt.hash(pw,alg);
    return pwfinal
}

helpers.comparepw = async (pw,dbpw) =>{
    try {
        return  await bcrypt.compare(pw,dbpw);
    } catch(e){
        console.log(e)
    }
    
}



console.log(helpers.comparepw)
module.exports = helpers