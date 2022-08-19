const express = require("express");
const { body,validationResult } = require("express-validator");
const router = express.Router();
const control = require("../controladores/controladores")
const app = require("../app");
const { render } = require("../app");
const pool = require("../datacon")
const {isNotloggedIn, isloggedIn} = require("../funcRes")


router.get('/', isloggedIn, async (req,res)=>{
    const data = await pool.query('SELECT * FROM empleados where id_usuario = ?',[req.user.id])
    res.render('usuarios.ejs',{data})
    console.log(req.user.id)
})

router.post("/agregar", isloggedIn,[
    body("nombre","ingrese un nombre valido sin numeros")
    .exists()
    .isLength({min:4}).isAlpha(),
    body("apellido","ingrese un apellido valido, sin numeros y un minimo de 4 caracteres")
    .exists()
    .isLength({min:4}),
    body("edad","Ingrese una Edad valida en formato Numérico")
    .exists()
    .isNumeric(),
    body("id_sucursal","ingrese un valor en el campo id_sucursal en formato numérico ").exists().isNumeric()
], async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const valores = req.body
        const validaciones = errors.array()
        console.log(validaciones)
        const data = await pool.query('SELECT * FROM empleados')
        res.render('usuarios.ejs',{data,validaciones,valores})
        
    }else{
        console.log(req.body)
        console.log(req.user.id)
        req.body.id_usuario = req.user.id
        const data = req.body
        await pool.query("INSERT INTO empleados set ?",[data])
        res.redirect("/")
        console.log(data)
    }
})

router.get("/delete/:id", isloggedIn, async (req,res)=>{
    let id = req.params.id
    await pool.query(`DELETE FROM empleados where id_empleado = ${id}`)
    res.redirect('/')
})

router.get("/update/:id", isloggedIn, async(req,res)=>{
    let id = req.params.id
    const data = await pool.query('Select * from empleados where id_empleado = ?',[id])
    console.log(data)
    res.render("editusuarios.ejs",{data:data[0]})
})

router.post("/update/:id", async (req,res) =>{
    const {id} = req.params
    const NuevosDatos = req.body
    await pool.query('UPDATE empleados SET ? where id_empleado = ?',[NuevosDatos,id])
    res.redirect("/")
})

router.get("/sucursal/:id",isloggedIn ,async (req,res) =>{
    const {id} = req.params
    const data = await pool.query(`SELECT S.NOMBRE AS SUCURSAL,S.LOCALIDAD AS LOCACIÓN,E.NOMBRE AS NOMBRE_EMPLEADO,E.APELLIDO AS APELLIDO_EMPLEADO,E.EDAD AS EDAD, E.TELEFONO AS CONTACTO FROM SUCURSALES AS S JOIN EMPLEADOS AS E ON E.ID_SUCURSAL = S.ID WHERE E.ID_SUCURSAL = ${id};`)
    res.render('sucursales.ejs',{data}) 
    console.log(data)
})

router.get('/allempleados', isloggedIn,async (req,res) =>{
    const data = await pool.query('SELECT E.id_empleado ,concat(e.nombre," ",e.apellido) as Empleado, E.EDAD AS Edad , e.TELEFONO AS Contacto , s.nombre as Sucursal, concat(u.nombre," ", u.apellido) as jefe from sucursales as s join empleados as e on e.id_sucursal = s.id join usuarios as u on e.id_usuario = u.id order by jefe ;')
    res.render('allempleados.ejs',{data})
    console.log(data)
})

/* // Rutas deL Login y Register
router.get("/signup", (req,res)=>{
    res.render("signup.ejs")
})

router.post('/signup',passport.authenticate('local.signup',{
    successRedirect: '/signup',
    failureRedirect: '/perfil',
    failureFlash: false
}))
    



router.get('/perfil',(req,res)=>{
    res.send("tu perfil")
}) */
/* ESTAS LINEAS COMENTADAS SON LA PRUEBA DE QUE SE PUEDE CAMBIAR DE MANERA DINÁMICA LAS URLS, EN UNA PRIMERA INSTANCIA
LO QUE HICE FUE CREAR UNA RUTA NUEVA PARA CADA UNA DE LAS SUCURSALES, ASIGNANDOLES UN NUMERO ESTÁTICO, PERO ESTO CREÓ
MUCHAS RUTAS INNECESARIAS QUE PODRÍAN SER SOLO UNA CON UN PARAMETRO DINÁMICO DENTRO DE ELLAS (REQ.PARAMS)

/* router.get("/sucursal1", control.sucursal1)

router.get("/sucursal2", control.sucursal2)

router.get("/sucursal3", control.sucursal3) */

module.exports = router;




