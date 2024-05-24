const { BadRequestError } = require("../expressError");

/**
 * Params:
 * dataToUpdate --> data that will be used to update user table in database. At minimum, one of the following is required  { firstName, lastName, password, email, isAdmin }.
 * 
 * jsToSql --> object containing the columns to be updated.
 * 
 * Create a keys array using the keys of the dataToUpdate.
 * 
 * Create a cols array using the key and idx of keys array to create parameterized array for SQL query.
 * 
 * Returns {setCols: str(SQL columns to be SET during query),
 *          values: values to be set to SQL parameters }
 * 
 * Throws BadRequestError if there is no data in req.body already in database.
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );


  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

