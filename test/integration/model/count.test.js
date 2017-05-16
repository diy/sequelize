'use strict';

/* jshint -W030 */
/* jshint -W110 */
var chai = require('chai')
  , expect = chai.expect
  , Support = require(__dirname + '/../support')
  , DataTypes = require(__dirname + '/../../../lib/data-types');

describe(Support.getTestDialectTeaser('Model'), function() {
  beforeEach(function() {
    this.User = this.sequelize.define('User', {
      username: DataTypes.STRING,
      age: DataTypes.INTEGER
    });
    this.Project = this.sequelize.define('Project', {
      name: DataTypes.STRING
    });

    this.User.hasMany(this.Project);
    this.Project.belongsTo(this.User);

    return this.sequelize.sync({force: true});
  });

  describe('count', function() {
    beforeEach(function () {
      var self = this;
      return this.User.bulkCreate([
        {username: 'boo'},
        {username: 'boo2'}
      ]).then(function () {
        return self.User.findOne();
      }).then(function (user) {
        return user.createProject({
          name: 'project1'
        });
      });
    });

    it('should count rows', function () {
      return expect(this.User.count()).to.eventually.equal(2);
    });

    it('should support include', function () {
      return expect(this.User.count({
        include: [{
          model: this.Project,
          where: {
            name: 'project1'
          }
        }]
      })).to.eventually.equal(1);
    });

    it('should be able to use where clause on included models', function() {
      var self = this;
      var queryObject = {
        col: 'username',
        include: [self.Project],
        where: {
          '$Projects.name$': 'project1'
        }
      };
      return self.User.count(queryObject).then(function(count) {
        expect(parseInt(count)).to.be.eql(1);
        queryObject.where['$Projects.name$'] = 'project2';
        return self.User.count(queryObject);
      }).then(function(count) {
        expect(parseInt(count)).to.be.eql(0);
      });
    });

    it('should be able to specify column for COUNT()', function() {
      var self = this;
      return this.sequelize.sync({ force: true })
      .then(function() {
        return self.User.bulkCreate([
          { username: 'ember' , age: 10},
          { username: 'angular' , age: 20},
          { username: 'mithril' , age: 10}
        ]);
      })
      .then(function() {
        return self.User.count({
          col: 'username'
        });
      })
      .then(function(count) {
        expect(parseInt(count)).to.be.eql(3);
        return self.User.count({
          col: 'age',
          distinct: true
        });
      })
      .then(function(count) {
        expect(parseInt(count)).to.be.eql(2);
      });
    });
  });
});
