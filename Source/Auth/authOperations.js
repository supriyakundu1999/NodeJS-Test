const connection = require("../../Database/dbConnection");
const uuid = require('uuid')
const crypto = require('crypto')

module.exports = {

    "login": function (req, res) {
        console.log("Login called...")
        qString = 'SELECT * FROM auth_users where (user_name = ?);'
        qUser = req.body.userName
        connection.query(qString, [qUser], (err, rows, fields) => {
            if (!err) {
                if (rows.length == 0) {
                    console.log("Rows: " + rows)
                    res.send("No user found")
                }
                else {
                    console.log("Rows: " + rows)
                    let encrpPassword = crypto.createHash('sha1').update(req.body.password).digest('hex')
                    if (encrpPassword === rows[0].password){
                        qString = 'INSERT INTO session (`user_name`, `session_value`) VALUES (?, ?)'
                        connection.query(qString, [qUser, uuid.v4()], (session_err, session_rows, session_fields) => {
                            if(!session_err){
                                res.send({
                                    "auth_user": rows[0],
                                    "session": session_rows
                                })
                            }
                            else{
                                console.log(session_err)
                                res.send(session_err)
                            }
                        })
                    }
                    else{
                        console.log("Password not matched..")
                        res.send("Password not matched..")
                    }
                }
            }
            else {
                console.log(err)
                res.send(err)
            }
        })
    },

    "register": function (req, res) {
        console.log("Register called....")
        qString = 'SELECT count(user_name) AS user_count FROM auth_users where (user_name = ?);'
        qUser = req.body.userName
        connection.query(qString, [qUser], (err, rows, fields) => {
            if(!err){
                if(rows[0].user_count == 0){
                    qString = 'INSERT INTO auth_users (`user_name`, `password`) VALUES (?, ?)'
                    let encrpPassword = crypto.createHash('sha1').update(req.body.password).digest('hex')
                    connection.query(qString, [qUser, encrpPassword], (err, rows, fields) => {
                        if(!err){
                            console.log("User registered...")
                            res.send(rows)
                        }
                        else{
                            console.log(err)
                            res.send(err)
                        }
                    })
                }
                else{
                    console.log("User already exits..")
                    res.send("User already exits..")
                }
            }
            else {
                console.log(err)
                res.send(err)
            }
        })
    }
}


// Table create
// CREATE TABLE studentdb.auth_users (
//     users_id INT NOT NULL AUTO_INCREMENT,
//     user_name VARCHAR(50) NULL,
//     password VARCHAR(36) NULL,
//     PRIMARY KEY (users_id),
//     UNIQUE INDEX users_id_UNIQUE (users_id ASC) VISIBLE,
//     UNIQUE INDEX user_name_UNIQUE (user_name ASC) VISIBLE);
