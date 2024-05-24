"use strict";


const { query } = require("express");
const db = require("../db")
const {BadRequestError, NotFoundError, UnauthorizedError} =  require("../expressError")
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job{
/** Create a job (from data), update db, and return new job data.
 * 
 * data should be {title, salary, equity, company_handle}
 * 
 * Returns {id, title, salary, equity, company_handle}
 * 
 * Throws BadRequestError if job is already in the database
 */
static async create( {id, title, salary, equity, company_handle} ){

    const result = await db.query(`
        INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle`,
    [
        title, 
        salary, 
        equity, 
        company_handle
    ]);

    const job = result.rows[0]
    return job

}
    
/** Find all jobs w/ optional search filters
 * 
 * Optional Search Filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary 
 * - hasEquity (true returns only jobs with equity > 0, other values ignored)
 * 
 * Returns [{ id, title, salary, equity, company_handle}]
 */

static async findAll( { minSalary, hasEquity, title } = {} ){
    let querySql = `SELECT 
                        j.id, 
                        j.title, 
                        j.salary, 
                        j.equity, 
                        j.company_handle AS "companyHandle",
                        c.name AS "companyName"
                    FROM jobs j 
                    LEFT JOIN companies AS c ON c.handle = j.company_handle`;

    let whereExpressions = [];
    let queryValues = [];

    // For each possible search term, add to whereExpressions and
    // queryValues so we can generate the right SQL

    
    if ( minSalary !== undefined) {
        queryValues.push(minSalary)
        whereExpressions.push(`salary >= $${queryValues.length}`)
    }
    
    
    if ( hasEquity === true) {
        whereExpressions.push(`equity > 0`)
    }
    
    if ( title !== undefined) {
        queryValues.push(`%${title}%`)
        whereExpressions.push(`title ILIKE $${queryValues.length}`)
    }

    if(whereExpressions.length > 0){
            querySql += " WHERE " + whereExpressions.join(" AND ")
        }


    querySql += " ORDER BY title";

    const jobsRes = await db.query(querySql, queryValues)

    return jobsRes.rows

}

/** Given a job id, return data about a company */
static async get(id){

    let result = await db.query(`
    SELECT id, title, salary, equity, company_handle AS "companyHandle"
    FROM jobs
    WHERE id = $1`,
    [id]
    )

    const job = result.rows[0]

    if (!job) throw new NotFoundError(`Job ${id} not found`)


    const companiesRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
            FROM companies
            WHERE handle = $1`, [job.companyHandle]);

    delete job.companyHandle;
    job.company = companiesRes.rows[0];

    return job

    
}

/** Update company data with `data`.
 *
 * This is a "partial update" --- it's fine if data doesn't contain all the
 * fields; this only changes provided ones.
 *
 * Data can include: {title, salary, equity}
 *
 * Returns {id, title, salary, equity, company_handle}
 *
 * Throws NotFoundError if not found.
 */
static async update(id, data){
    const {setCols, values } = sqlForPartialUpdate(
        data,
        {});

    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                        SET ${setCols}
                        WHERE id = ${idVarIdx}
                        RETURNING id,
                                title,
                                salary,
                                equity,
                                company_handle AS "companyHandle"`;

    const result = await db.query(querySql, [...values, id])
    const job = result.rows[0]

    if (!job) throw new NotFoundError(`No job posting: ${id}`)

    return job;

}


/** Remove a company from database
 * 
 * id --> company handle
 * 
 */
static async remove(id){

    const result = await db.query(
        `DELETE
            FROM jobs
            WHERE id = $1
            RETURNING id`,
            [id]);

            const job = result.rows[0]

            if(!job) throw new NotFoundError(`No job with id: ${id}`)


}

}


module.exports = Job;