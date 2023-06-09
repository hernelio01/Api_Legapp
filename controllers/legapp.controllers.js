import {pool} from '../db/db.js';

/**
 * Funcion controlador para obtención de usuarios
 * @param {Object} req 
 * @param {Object} res 
 */
export const getUsers = async (req, res)=>{
    //destructuracion de Array para la respuesta de una consulta SELECT
    const [rows] = await pool.query("SELECT * FROM usuario");

    //Envío de respuesta al cliente
    res.json(rows);
}

export const getUser = async (req, res)=>{

    //destructuracion del objeto body de request
    const {email, password} = req.body;

    //destructuracion de Array para la respuesta de una consulta SELECT en el caso de autenticacion de legalizador
    let [rows] = await pool.query('SELECT * FROM usuario WHERE email = ? AND password = MD5( ? ) AND idRol=1', [email, password]);

    //Envío de respuesta al cliente
    if(rows.length > 0){
        res.json(
            {
                message: 'user legalizador found',
                result: rows
            });
        res.end();
    }else{
        [rows] = await pool.query('SELECT * FROM usuario WHERE email = ? AND password = MD5( ? ) AND idRol=2', [email, password]);
        if(rows.length > 0){
            res.json(
                {
                    message: 'user Administrador found',
                    result: rows
                });
            res.end();
        }
    }
    
}
/**
 * Creacion de proveedor
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} next 
 */
export const createProvider = async (req, res)=>{
    //Destructuración de valores nombreProveedor y telefonoProveedor desde el objeto body
    const {nit, nombreProveedor, telefonoProveedor, direccion, nombreContactoProveedor} = req.body;

    //Ejecución de la consulta SQL a la BD desde la función query del pool de conexión
    await pool.
        query("INSERT INTO proveedor(NIT, nombreProveedor, telefonoProveedor, direccion, nombreContactoProveedor, estado) VALUES( ?, ?, ?, ?, ?, 1 )",
        [nit, nombreProveedor, telefonoProveedor, direccion, nombreContactoProveedor]);

    //mensaje del servidor en el caso de que se haya ejecutado correctamente el controlador para crear proveedores
    res.json({
        message: "Proveedor creado"
    });
}
/**
 * Creación de usuario 
 * @param {Object} req 
 * @param {Object} res 
 */
export const createUser = async (req, res)=>{
    //Destructuración de valores idRol, nombre, email y password desde el objeto body del request
    const {idRol, nombre, email, password} = req.body;

    //Ejecución de consulta SQL a la BD desde la función query del objeto pool
    await pool.query("INSERT INTO usuario(idRol, nombre, email, password, estado) VALUES(?, ?, ?, MD5(?), ?)",
        [idRol, nombre, email, password, 1]);

    res.json({
        message: "Usuario creado"
    });
    
}

export const modifyStateUser = async (req, res)=>{
    //Destructuración del valor estado desde el objeto body
    const {email, estado} = req.body;

    //Ejecución de consulta SQL a la BD por medio de la función query
    await pool.query("UPDATE usuario SET estado = ? WHERE email = ?", [estado, email]);

    //Mensaje del servidor
    res.json({
        message: "state of user modified"
    });
}

export const updateProvider = async (req, res)=>{

    const {nit, nombreProveedor, telefonoProveedor, direccion, nombreContactoProveedor} = req.body;

    await pool.
        query("UPDATE proveedor SET nombreProveedor = IFNULL(?, nombreProveedor), telefonoProveedor = IFNULL(?, telefonoProveedor), direccion = IFNULL(?, direccion), nombreContactoProveedor = IFNULL(?, nombreContactoProveedor) WHERE NIT = ?", 
        [nombreProveedor, telefonoProveedor, direccion, nombreContactoProveedor, nit]);

    res.json({
        message: "Provider updated"
    });
}

export const updateUser = async (req, res)=>{
    const {emailToValidate} = req.params;

    const {idRol, nombre, email, password} = req.body;

    const [rows] = await pool.query("SELECT * FROM usuario WHERE email = ?", [emailToValidate]);

    const idUser = rows[0].idUsuario;    

    await pool.
        query("UPDATE usuario SET idRol=IFNULL(?, idRol), nombre=IFNULL(?, nombre), email=IFNULL(?, email), password=IFNULL(MD5(?), password) WHERE idUsuario = ?", [idRol, nombre, email, password, idUser]);
    
    res.json({
        message: "Updated User"
    })
}

export const getProviders = async (req, res)=>{
    
    const [rows] = await pool.query("SELECT * FROM proveedor");

    res.json(rows);
}
/**
 * Creacion de gasto en la BD
 * @param {Object} req 
 * @param {Object} res 
 */
export const createSpent = async (req, res)=>{

    const {nombreGasto} = req.body;

    await pool.query("INSERT INTO tipogasto(nombreGasto, estado) VALUES( ?, 1 )", [nombreGasto]);

    res.json({
        message: "El gasto ha sido insertado"
    });
}

/**
 * Obtener gastos
 * @param {Object} req 
 * @param {Object} res 
 */
export const getSpents = async (req, res)=>{

    const [rows] = await pool.query("SELECT * FROM tipogasto");

    res.json(rows);
}

export const updateStateProvider = async (req, res)=>{
    //Destructuración del valor estado desde el objeto body
    const {nit, estado} = req.body;

    //Ejecución de consulta SQL a la BD por medio de la función query
    await pool.query("UPDATE proveedor SET estado = ? WHERE NIT = ?", [estado, nit]);

    //Mensaje del servidor
    res.json({
        message: "state of provider modified"
    });
}

export const updateStateSpent = async (req, res)=>{
    //Destructuración del valor estado desde el objeto body
    const {id, estado} = req.body;

    //Ejecución de consulta SQL a la BD por medio de la función query
    await pool.query("UPDATE tipogasto SET estado = ? WHERE idTipoGasto = ?", [estado, id]);

    //Mensaje del servidor
    res.json({
        message: "state of spent modified"
    });
}

export const updateSpent = async (req, res)=>{
    //Destructuración del valor estado desde el objeto body
    const {id, nombreGasto} = req.body;

    //Ejecución de consulta SQL a la BD por medio de la función query
    await pool.query("UPDATE tipogasto SET nombreGasto = IFNULL(?, nombreGasto) WHERE idTipoGasto = ?", [nombreGasto, id]);

    //Mensaje del servidor
    res.json({
        message: "Spent modified"
    });
}

export const insertLegalization = async (req, res)=>{
    const {body, file} = req;
    
    const {idUsuario, idRol, idTipoGasto, idProveedor, descripcionGasto, valorGasto} = body;

    if(file){

        let url = `http://localhost:4500/images/${file.filename}`;
        
        await pool.
            query("INSERT INTO legalizacion(idUsuario, idRol, idTipoGasto, idProveedor, fechaCreacion, descripcionGasto, valorGasto, evidenciaGasto) VALUES ( ?, ?, ?, ?, CURDATE(), ?, ?, ? )", [idUsuario, idRol, idTipoGasto, idProveedor, descripcionGasto, valorGasto, url]);

        res.json({
            message: "Legalizacion creada"
        })
    }
    
}

export const getLegalization = async (req, res)=>{

    const [rows] = await pool.query("SELECT * FROM legalizacion");

    res.json(rows);
}

export const getLegalizationByUserId = async (req, res)=>{

    const userId = req.params.userId;

    const [rows] = await pool.query("SELECT * FROM legalizacion WHERE idUsuario = ?", [userId]);

    res.json(rows);
}