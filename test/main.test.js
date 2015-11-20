var service = require('../')
var _ = require('lodash');
var fs = require('fs');
var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;
var expect = chai.expect;

describe('init-env suite: ', function () {
  var nodeEnv;
  beforeEach(function(){
      nodeEnv = _.cloneDeep(process.env);
  });
  afterEach(function(){
    process.env = nodeEnv;
  });

    describe('init-env with default config suite: ', function () {

      afterEach(function(){
        fs.readFileSync.restore();
      });

        it('should return empty object if no env vars in json', function(){
          sinon.stub(fs, 'readFileSync').returns(
            JSON.stringify({})
          );

          var envs = service();

          expect(envs).to.be.empty;
        });

        it('should return empty object if bad json is passed', function(){
          sinon.stub(fs, 'readFileSync').returns(
            "JSON.stringify({ test: 'testing' })"
          );

          var envs = service();

          expect(envs).to.be.empty;
        });

        it('should return empty object if json is valid but in wrong format', function(){
          sinon.stub(fs, 'readFileSync').returns(
            JSON.stringify([{ test: 'testing'}])
          );

          var envs = service();

          expect(envs).to.be.empty;
        });

        it('should return object of env vars if json is populated', function(){
          var value = {
            "test": "testing",
            OBJECT_PROP: {test: 'test'}
          };
          sinon.stub(fs, 'readFileSync').returns(
            JSON.stringify(value)
          );

          var envs = service();

          expect(envs).to.be.eql({test: 'testing'});
        });

        it('should return object without properties that have object values', function(){
          var value = {
            "test": "testing",
            OBJECT_PROP: {test: 'test'}
          };
          sinon.stub(fs, 'readFileSync').returns(
            JSON.stringify(value)
          );

          var envs = service();
          expect(envs).to.be.eql({test: 'testing'});
        });

        it('should return object without properties that have array values', function(){
          var value = {
            "test": "testing",
            OBJECT_PROP: [{test: 'test'}]
          };
          sinon.stub(fs, 'readFileSync').returns(
            JSON.stringify(value)
          );

          var envs = service();
          expect(envs).to.be.eql({test: 'testing'});
        });

    });

    describe('init-env with custom config suite: ', function () {
      afterEach(function(){
        fs.readFileSync.restore();
      });

        it('should return empty object if a json path is given but value not found', function(){
          sinon.stub(fs, 'readFileSync').returns(
            JSON.stringify({test: 'testing'})
          );

          var envs = service({logToConsole:true, jsonPath:'envs'});

          expect(envs).to.be.empty;
        });

        it('should return populated object if a json path is given and values are found', function(){
          sinon.stub(fs, 'readFileSync').returns(
            JSON.stringify({envs: {test: 'testing'}})
          );

          var envs = service({logToConsole:true, jsonPath:'envs'});

          expect(envs).to.be.eql({test: 'testing'});
        });

        it('should return empty object if a custom file path is given but no file  found', function(){
          sinon.stub(fs, 'readFileSync').returns(
            JSON.stringify({test: 'testing'})
          );

          var envs = service({logToConsole:true, jsonPath:'envs', filePath: './test/myfile.json'});

          expect(envs).to.be.empty;
        });

        it('should not overwrite an env var when overwrite flag is set to false', function(){
          process.env.NODE_ENV='stage';
          sinon.stub(fs, 'readFileSync').returns(
            JSON.stringify({NODE_ENV: 'testing'})
          );

          var envs = service({
            logToConsole:true,
            overwrite: false
          });

          expect(envs).to.be.eql({NODE_ENV: 'stage'});
        });


    });

    describe('init-env with real file require suite: ', function () {

      it('should return populated object if a json path is given and values are found', function(){
        var envs = service({logToConsole:true, jsonPath:'envs', filePath: './test/.test.env.json'});
        expect(envs).to.be.eql({test: 'testing'});
      });

    });

});
