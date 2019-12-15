const express = require('express')
//const hbs = require('hbs')
const path = require('path')


const publicDirectoryPath = path.join(__dirname,"../public")

const app = express()

app.use(express.static(publicDirectoryPath))

//app.set('view engine','hbs')

/* app.get('/', (req,res) => {
    res.render('index',{
        title: 'Chat-Ops',
        author: "Xvr"
    })
})
 */


 // not needed
/* app.use(express.json())

app.get("/", (req, res) => {
    res.sendFile(publicFolder + '/index.html');
 }); */
// end_not_needed


module.exports = app