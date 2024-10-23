const express = require("express");

const router = express.Router()




router.post("/categories", async(request,response)=> {
    const {name,type} = request.body
    if (!name || !type) {
        return response.status(400).json({error:"Missing the required fields"})
    }

    try {
        const dbDataShared = request.app.locals.dbData; 
        const querry =`INSERT INTO categories  (name,type) VALUES (?,?)`;
        await dbDataShared.run(querry,[name,type]) ;
        response.status(201).json({message:"Category added successfully"})
    }

    catch(error) {
        response.status(500).json({error:error.message})
    }
});

router.get("/categories", async (request, response) => {
    try {
      const db = request.app.locals.dbData;
      const categories = await db.all(`SELECT * FROM categories`);
      response.json(categories);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
  });

  
router.post ("/transactions", async(request,response)=> {
    const {type,category,amount,date,description} = request.body 
    if (!type || !category || !amount || !date || !description) {
        response.status(400).json({error:"Missing some required fields"})
    }

    try {
        const db = request.app.locals.dbData ;
        const querry = `INSERT INTO transactions (type,category,amount,date,description) VALUES (?,?,?,?,?)`; 
        await db.run(querry,[type,category,amount,date,description])
        response.status(201).json({message:"Transaction added successfully"})
    }
    catch (error) {
        response.status(500).json({error:error.message})
    }
})




router.get("/transactions", async(req,res)=> {

    try {
    const querry = `SELECT * FROM transactions`
    const dbResponse = await req.app.locals.dbData.all(querry)
    res.send(dbResponse)
    }
    catch(error) {
        res.status(500).json({error:error.message})
    }


});


router.get("/transactions/:id", async(request,response)=> {
    const {id} = request.params;
     try {
        const db = request.app.locals.dbData 
        const transactionQuerry = await db.get(`SELECT * FROM transactions where id = ?`, [id]) ;
        if (!transactionQuerry) {
            return response.status(404).json({error:"Transaction not found"})
        }
        response.json(transactionQuerry)
        
     }
     catch(error) {
        response.status(500).json({error:error.message})
     }
});

router.put("/transactions/:id", async(request,response)=> {

    const {id} = request.params 
    const {type,category,amount,date,description} = request.body 
    try {
        const db = request.app.locals.dbData;
        const querry = `UPDATE transactions SET type = ?, category = ?, amount = ?, date=?, description=? where id = ?`; 
        const outputQuerry = await db.run(querry, [type,category,amount,date,description,id] );
        if (outputQuerry.changes===0) {
            return  response.status(404).json({error:"Transaction not found"})
        }
        response.json({message:"Transaction has been updated successfully"})

    }
    catch (error) {
        response.status(500).json({error:error.message})
    }
});


router.delete("/transactions/:id", async(request,response)=> {
    const {id} = request.params 
    console.log(id)
    try {
        const db = request.app.locals.dbData 
        const deletedQuerry =await db.run(`DELETE FROM transactions where id = ?`,[id]); 
        if (deletedQuerry.changes===0) {
            return response.status(404).json({error: "Transaction not found"})

        }
        response.json({message:"Transaction has been deleted"})
    }
    catch(error) {
        response.status(500).json({error:error.message})
    }
});



router.get("/summary",async(request,response)=> {
    try {

        const db = request.app.locals.dbData 
        const summaryDetails =await db.all (
            `SELECT type,SUM(amount) as totalAmount 
            FROM transactions GROUP BY type 
            `
        );
         let totalIncome = 0 ;
         let totalExpenses = 0 ;
         summaryDetails.forEach((eachData)=> {
            if (eachData.type ==="income") {
                totalIncome = eachData.totalAmount
             }
             else if (eachData.type ==="expense") {
                totalExpenses = eachData.totalAmount
             }
         })
         const remainingBalance = totalIncome - totalExpenses 
         response.send({totalIncome,totalExpenses,remainingBalance})
    }

    catch(error) {
        response.send(500).json({error:error.message })
    }
})

module.exports = router