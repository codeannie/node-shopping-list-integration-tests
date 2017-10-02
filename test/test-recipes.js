'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should(); 

chai.use(chaiHttp);

describe('recipes', function() {
  //need to activate server -- runServer is a promise that's returned
  before(function() {
    return runServer();
  });
  //closer server at tned of test
  after(function() {
    return closeServer();
  });
  //inspect response object & test if it has right keys in response object
  it('should list recipes on GET', function () {
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array'); 
        res.body.length.should.be.at.least(1);
        const expectedKeys = ['id', 'name', 'ingredients'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });
  //inspect response object and test if it has right status code &
  //if returned object has id 
  it('should add a new recipe on POST', function () {
    const newRecipe = {name:'spam musubi', ingredients: ['rice', 'spam', 'teriyaki sauce']};
    return chai.request(app)
      .post('/recipes')
      .send(newRecipe)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.id.should.not.be.null;
        res.body.should.deep.equal(Object.assign(newRecipe, {id:res.body.id}));
      });
  });
  //make GET request to test PUT request -- get an recipe to update
  //add id to `updateData` & make PUT request
  //inspect response object to check if it has right status code & get updated recipe with correct data
  it('should update recipe on PUT', function () {
    const updateData = {
      name: 'testRecipe',
      ingredients: ['test', 'nori']
    };
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;

        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
  //make DELETE request and check for status 204 
  //for this  example, need to make GET request to get data 
  it('should remove recipe on DELETE', function () {
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        return chai.request(app)
          .delete(`/recipes/${res.body[0].id}`)
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});
