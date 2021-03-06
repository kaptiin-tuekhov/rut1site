'use strict';

const _ = require('lodash');

function Table(prefs) {
  var self = this;
  this.mapper = _.shuffle(Object.keys(prefs));
  this.table = this.mapper.map(function(studentId) {
    return prefs[studentId].map(function(prefId) {
      return self.mapper.indexOf(prefId.toString());
    });
  });
  this.proposed = -1;
  this.phase = 1;
}

Table.prototype.propose = function(proposer) {
  if (this.noStablePairing()) { return false; }
  var self = this;
  if (proposer > this.proposed && this.phase === 1) {
    this.proposed = proposer;
  }
  var desired = this.table[proposer][0];
  var proposerIdx = this.table[desired].indexOf(proposer);
  if (proposerIdx === -1) {
    this.reject(desired, proposer);
  } else if (this.phase === 1) {
    this.table[desired].slice(proposerIdx+1).forEach(function (toReject) {
      self.reject(desired, toReject);
    });
  }
  return true;
};

Table.prototype.reject = function(rejector, rejected) {
  _.pull(this.table[rejector], rejected);
  var idxOfRejector = this.table[rejected].indexOf(rejector);
  this.table[rejected].splice(idxOfRejector, 1);
  if (this.phase === 1 && !idxOfRejector && this.proposed >= rejected) {
    this.propose(rejected);
  }
};

Table.prototype.eliminateRotation = function(start) {
  var starts = [start];
  var rot = [[start, this.table[start][1]]];
  var beginningOfCycle = -1;
  while (beginningOfCycle === -1) {
    var next = this.nextElemInRotation(rot[rot.length-1]);
    rot.push(next);
    beginningOfCycle = starts.indexOf(next[0]);
    starts.push(next[0]);
  }
  for(var i = beginningOfCycle; i < rot.length - 1; i++) {
    this.reject(rot[i][1], rot[i+1][0]);
  }
};

Table.prototype.nextElemInRotation = function(oldRot) {
  if (!this.table[oldRot[1]]) { return; }
  var newRot = this.table[oldRot[1]].slice(-1);
  newRot.push(this.table[newRot[0]][1]);
  return newRot;
};

Table.prototype.noStablePairing = function() {
  return this.table.some(pref => !pref.length);
};

Table.prototype.finished = function() {
  var done = this.table.every(pref => pref.length === 1);
  if (!done) { return false; }

  var pairs = [];
  this.table.forEach(function (arr, student1) {
    var student2 = arr[0];
    var alreadyInPairs = _.find(pairs, pair => pair[0] === student2);
    if (!alreadyInPairs) {
      pairs.push([student1, student2]);
    }
  });
  return pairs;
};

Table.prototype.phase1 = function() {
  for(var i = 0; i < this.table.length; i++) {
    if (!this.propose(i)) { return false; }
  }
  return this.table;
};

Table.prototype.phase2 = function() {
  this.phase = 2;
  if (this.noStablePairing()) { return false; }
  var complete = this.finished();
  if (complete) { return complete; }
  var start = _.findIndex(this.table, pref => pref.length > 1);
  this.eliminateRotation(start);
  return this.phase2();
};

Table.prototype.findPairs = function() {
  var pairs;
  if (this.phase1()) { pairs = this.phase2(); }
  if (pairs) {
    return pairs.map(pair => pair.map(idx => this.mapper[idx]));
  }
};

module.exports = function(prefObj) {
  var t = new Table(prefObj);
  return t.findPairs();
};
