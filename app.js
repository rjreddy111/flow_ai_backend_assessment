const express = require("express")
const sqlite3 = require("sqlite3")
const path = require("path")
const {open} = require("sqlite")

const routerPath = require("./routing/userRouting")


const app = express()

app.use(express.json())


let dbData = null 
const dbPath = path.join(__dirname,"users.db")





const initializeServer = async()=> {
         try {
                dbData= await  open({
                filename:dbPath, 
                driver:sqlite3.Database
            })

          await dbData.exec (

                `CREATE TABLE IF NOT EXISTS  categories(  
                 id INTEGER PRIMARY KEY AUTOINCREMENT, 
                 name TEXT NOT NULL, 
                 type TEXT CHECK (type IN ('income', 'expense')) NOT NULL
           )`
            );
           
            await dbData.exec (
                `CREATE TABLE IF NOT EXISTS  transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL, 
                    category INTEGER NOT NULL, 
                    amount REAL NOT NULL , 
                    date TEXT NOT NULL, 
                    description TEXT NOT NULL,
                    FOREIGN KEY (category) REFERENCES categories(id)
                )`
            );
            
           

            app.locals.dbData = dbData 

            app.listen(5001,()=> {
                console.log("server is running")
            })

        }
        catch (error) {
            console.log(`DB ERROR : ${error.message}`)
            process.exit(1)

        }



}




initializeServer()


app.use("/api", routerPath)

module.exports = app  