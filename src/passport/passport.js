const { use } = require('passport');
const passport = require('passport');
const { connect } = require('../app');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../datacon')
const helpers = require('../helpers/helpers')
const { body,validationResult } = require("express-validator");


passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'Contraseña',
    passReqToCallback: true
    
},[body('nombre',"Este campo es obligatorio, no puede llevar numeros").exists().isAlpha(),
body('apellido','Este campo es obligatorio y no puede tener numeros').exists(),
body('')


], async (req,username,password,done) => {
    const {Nombre , Apellido} = req.body
    let usuario = {
        Nombre,
        Apellido,
        username,
        password
    };
    /* usuario.password = await helpers.cifrarpw(password) */
    const result = await pool.query('INSERT INTO usuarios set ?', [usuario])
    
    usuario.id = result.insertId
    
    return done(null,usuario) 
    
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'Contraseña',
    passReqToCallback: true
}, async (req,username,password,done)=>{
      const row = await pool.query('select * from usuarios where username = ?',[username])
      const user = row[0]
      if (row.length > 0){
        if (user.username === username){
            if(user.password === password){
                console.log('todo ok')
                done(null,user,req.flash('sucess',"welcome" + user.username))
            }else{
                console.log('pw mal')
                done(null,false,req.flash('success','contraseña incorrecta'))
            }
        }
    }else{
        console.log('no user')
        done(null,false,req.flash('success','Este usuario no se encuentra en la base de datos'))
        
    }
      
}))


passport.serializeUser((usuario,done) =>{
        done(null,usuario.id);
})

passport.deserializeUser( async (id,done) =>{
    try{
        const rows = await pool.query("select * from usuarios where id = ?",[id] ) 
        done(null,rows[0]);
    } catch(e){
        console.log(e)
    }
     
})