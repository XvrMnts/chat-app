const request = require('supertest')
const app = require('../src/app')

test('Should return index.html', async () => {
    await request(app).get('/')
    .send()
    .expect(200)
})