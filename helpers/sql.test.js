const { sqlForPartialUpdate } = require('./sql')

describe('Tests that sqlForPartialUpdate functions properly', () => {
    test('works: valid 1 entry', ()=>{
      let result = sqlForPartialUpdate(
        {"first_name": "test"}, 
        {"first_name": "first_name"})

        expect(result).toEqual({
          setCols: "\"first_name\"=$1",
          values: ["test"]
        })
        
    })
    test('works: valid 2 entry', ()=>{
      let result = sqlForPartialUpdate(
        {"first_name": "testF",
          "last_name": "testL"
        }, 
        {"first_name": "first_name",
          "last_name": "last_name"
        })

        expect(result).toEqual({
          setCols: "\"first_name\"=$1, \"last_name\"=$2",
          values: ["testF", "testL"]
        })
        
    }) 
})