"use strict";

/** Job routes  */

const express = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");
const { authenticateJWT, ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jsonschema = require("jsonschema");
const jobsNewSchema = require("../schemas/jobNew.json")
const jobsUpdateSchema = require("../schemas/jobUpdate.json")
const jobSearchSchema = require("../schemas/jobSearch.json")

const router = new express.Router();



/** POST / { job } => { job }
 * 
 * job should be {id, title, salary, equity, company_handle}
 * 
 * Returns {id, title, salary, equity, company_handle}
 * 
 * Authorization required: isAdmin
 */

router.post('/', ensureAdmin, async function(req, res, next){
    try{

        const validator = jsonschema.validate(req.body, jobsNewSchema)
        if(!validator.valid) {
            const errs = validator.errors.map( e => e.stack);
            throw new BadRequestError(errs)
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job });

    } catch(err){
        return next(err)
    }
})

/** GET / => { jobs [ {id, title, salary, equity, company_handle}, .... ]} 
 * 
 * Can filter on provided search filters 
 * - title
 * - minSalary
 * - has Equity
 * 
 * Authorization : NonE
*/

router.get("/", async function(req, res, next){
    const q = req.query;

    // convert query "string" into int/bool formatas

    if(q.minSalary !== undefined) q.minSalary = +q.minSalary
    q.hasEquity = q.hasEquity === "true";

    try{
        if(q){
            const validator = jsonschema.validate(q, jobSearchSchema)
        
            if(!validator.valid){
                const errs = validator.errors.map(e => e.stack);
                throw new BadRequestError(errs);
            }
        }
        
        const jobs = await Job.findAll(q);

        return res.json({ jobs })
        
    } catch(err){
        return next(err)
    }
})


/** GET /:id => {id, title, salary, equity, company_handle} 
 * 
 * 
 * Authorization : Logged In
*/

router.get('/:id', ensureLoggedIn, async function(req, res, next){
    try{
        const job = await Job.get(req.params.id)

        return res.json({ job })

    } catch(err){
        return next(err)
    }
})


/** Patch /:id => { id, title, salary, equity, company_handle} 
 *  * 
 * Authorization : Admin
*/
router.patch('/:id', ensureAdmin, async function(req, res, next){
    try{

        const validator = jsonschema.validate(req.body, jobsUpdateSchema)
        if(!validator.valid) {
            const errs = validator.errors.map( e => e.stack);
            throw new BadRequestError(errs)
        }

        const job = await Job.update(req.params.id, req.body);

        return res.json({ job })

    } catch(err){
        return next(err)
    }
})

/** DELETE /:id
 * 
 * Remove a job from the database
 * 
 * 
 * Authorization : Admin
*/
router.delete('/:id', ensureAdmin, async function(req, res, next){
    try{
        await Job.remove(req.params.id)
        return res.json({deleted: +req.params.id})
    } catch(err){
        return next(err)
    }
})

module.exports = router;