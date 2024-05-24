"use strict";

const request = require("supertest");
const app = require("../app");
const Job = require("../models/job")

const { BadRequestError } = require("../expressError");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*************** GET /jobs */
describe('GET /jobs ', () => {
  test('request with valid data', async () => {
    const resp = await request(app)
                        .get("/jobs")
    
    expect(resp.statusCode).toEqual(200)
    expect(resp.body).toEqual({
        jobs: [
          {
            id: expect.any(Number),
            title: "J1",
            salary: 1,
            equity: "0.1",
            companyHandle: "c1",
            companyName: "C1",
          },
          {
            id: expect.any(Number),
            title: "J2",
            salary: 2,
            equity: "0.2",
            companyHandle: "c1",
            companyName: "C1",
          },
          {
            id: expect.any(Number),
            title: "J3",
            salary: 3,
            equity: null,
            companyHandle: "c1",
            companyName: "C1",
          },
        ],
      },
  );
})

  test('query "okay" with 1 filter', async () =>{
    const resp = await request(app)
                        .get("/jobs")
                        .query({minSalary: 2 })

    expect(resp.body).toEqual({
        jobs: [
            {
                id: expect.any(Number),
                title: "J2",
                salary: 2,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
              },
              {
                id: expect.any(Number),
                title: "J3",
                salary: 3,
                equity: null,
                companyHandle: "c1",
                companyName: "C1",
              },
        ]
    })
    
  })

  test('query "okay" with 2 filters', async () =>{
    const resp = await request(app)
                        .get("/jobs")
                        .query({minSalary: 2, hasEquity: true})

    expect(resp.body).toEqual({
        jobs: [
            {
                id: expect.any(Number),
                title: "J2",
                salary: 2,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
              },
        ]
    })
    
  })

  test('query "error" with bad filter key', async () =>{
    const resp = await request(app)
                        .get("/jobs")
                        .query({minSalary: 2, nope: 'nope'})

    expect(resp.statusCode).toEqual(400)
    })
    
  })
  test('query "okay" with title', () =>{

  })
  test('query "okay" with hasEquity', () =>{

  })
  


/*************** POST /jobs */
describe('POST /jobs ', () => {
    test('successful request for admin', async () => {
        const data = { title: "J4", salary: 4, equity: "0.1", company_handle: "c1" }

        const resp = await request(app)
                                .post("/jobs")
                                .send(data)
                                .set("authorization", `Bearer ${adminToken}`);

        expect(resp.statusCode).toEqual(201)
        expect(resp.body).toEqual({
            job: { title: "J4", 
            salary: 4, 
            equity: "0.1", 
            company_handle: "c1",
            id: expect.any(Number) }
        })
    })
    
    test('invalid request with missing information', async () => {
        const data = { salary: 4, equity: "0.1", company_handle: "c1" }


const resp = await request(app)
                    .post("/jobs")
                    .send(data)
                    .set("authorization", `Bearer ${adminToken}`);


expect(resp.statusCode).toEqual(400)

    })
})
  


    /*************** PATCH /jobs */
describe('PATCH /jobs routes', () => {
    test('successful request', async () => {

        const data = { title: "J-New",
                         salary: 4,
                         equity: "0.1",
                        }


        const resp = await request(app)
                                .patch(`/jobs/${testJobIds[0]}`)
                                .send(data)
                                .set("authorization", `Bearer ${adminToken}`);


        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({
            job: 
            {
                id: expect.any(Number),
                title: "J-New",
                salary: 4,
                equity: "0.1",
                companyHandle: "c1"
            }
        }
        )


        
    })
    


    test('invalid request with invalid information', async () => {

        const data = { title: "J-New",
                         salary: 4,
                         equity: 4.0,
                        }

        const resp = await request(app)
                                .patch(`/jobs/${testJobIds[0]}`)
                                .send(data)
                                .set("authorization", `Bearer ${adminToken}`);
    

        expect(resp.statusCode).toEqual(400)
        
    })

    test('job not found', async () => {

        const data = {
            title: "job4",
            salary: '400',
            equity: '40'
        } 

        const resp = await request(app)
        .patch(`/jobs/069`)
        .send(data)
        .set("authorization", `Bearer ${adminToken}`);


expect(resp.statusCode).toEqual(400)

    }
)
})


/*************** DELETE /jobs */
describe('DELETE /jobs routes', () => {
    test('successful request', async () => {

        
        const resp = await request(app)
                                .delete(`/jobs/${testJobIds[0]}`)
                                .set("authorization", `Bearer ${adminToken}`);

        
        const jobs = await Job.findAll()

        expect(jobs.length).toEqual(2)

    })
    
    test('invalid request with missing information', async () => {

        const resp = await request(app)
                                .delete(`/jobs/8905`)
                                .set("authorization", `Bearer ${adminToken}`);

        expect(resp.statusCode).toEqual(404)
    })

})