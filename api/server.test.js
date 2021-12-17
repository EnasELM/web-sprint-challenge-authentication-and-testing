const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')
const bcrypt = require('bcryptjs')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

afterAll(async () => {
  await db.destroy()
})
// Write your tests here
test('sanity', () => {
 expect(true).not.toBe(false)
})

describe('server.js', () => {
  describe('[POST] /api/auth/login', () => {
    it('[1] responds with the correct status and message on invalid credentials', async () => {
      let res = await request(server).post('/api/auth/login').send({ username: 'yasee', password: '1234' })
      expect(res.body.message).toMatch(/invalid credentials/i)
      expect(res.status).toBe(401)
       res = await request(server).post('/api/auth/login').send({ username: 'enas', password: '12345' })
      expect(res.body.message).toMatch(/invalid credentials/i)
      expect(res.status).toBe(401)
    }, 750)
    
  })
  describe('[POST] /api/auth/register', () => {
    it('[2] creates a new user in the database when client provide username and password', async () => {
      await request(server).post('/api/auth/register').send({ username: 'enas', password: '1234' })
      const name = await db('users').where('username', 'enas').first()
      expect(name).toMatchObject({ username: 'enas' })
    }, 750)
    it('[3] creates a new user in the database when client does not provide  password', async () => {
     let res = await request(server).post('/api/auth/register').send({ username: 'sara' })
     expect(res.body.message).toMatch(/username and password required/i)
    }, 750)
    it('[4] creates a new user in the database when client does not provide username', async () => {
      let res = await request(server).post('/api/auth/register').send({ password: '1234' })
      expect(res.body.message).toMatch(/username and password required/i)
     }, 750)
     it('[5] saves the user with a bcrypted', async () => {
      await request(server).post('/api/auth/register').send({ username: 'fafi', password: '1234' })
      const name = await db('users').where('username', 'fafi').first()
      expect(bcrypt.compareSync('1234', name.password)).toBeTruthy()
    }, 750)
 })
 describe('[GET] /api/jokes', () => {
  it('[6] requests without a token ', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.body.message).toMatch(/token required/i)
  }, 750)
  it('[7] requests with an invalid token ', async () => {
    const res = await request(server).get('/api/jokes').set('Authorization', 'awad')
    expect(res.body.message).toMatch(/token invalid/i)
  }, 750)
 })
})