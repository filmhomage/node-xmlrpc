var vows           = require('vows')
  , assert         = require('assert')
  , date_formatter = require('../lib/date_formatter')

vows.describe('Date Formatter').addBatch({
  "A local date": {
    topic: function () {
      return new Date(2014,0,20,14,25,25)
    }
  , "when encoded": {
      "without hyphens": makeEncodeCase({hyphens: false}, '^\\d{8}T')
    , "with hyphens": makeEncodeCase({hyphens: true}, '^\\d{4}[-]\\d{2}[-]\\d{2}T')
    , "without colons": makeEncodeCase({colons: false}, 'T\\d{6}')
    , "with colons": makeEncodeCase({colons: true}, 'T\\d{2}:\\d{2}:\\d{2}')
    , "without offset": makeEncodeCase({offset: false}, 'T\\d{2}[:]?\\d{2}[:]?\\d{2}(\\.\\d{3})?$')
    , "with offset": makeEncodeCase({offset: true}, '([+-]\\d{2}[:]\\d{2}|Z)$')
    , "with milliseconds": makeEncodeCase({milliseconds: true}, '\\.\\d{3}([+-]\\d{2}[:]\\d{2}|Z)?$')
    , "without milliseconds": makeEncodeCase({milliseconds: false}, 'T\\d{2}[:]?\\d{2}[:]?\\d{2}([+-]\\d{2}[:]\\d{2}|Z)?$')
    , "to local representation": {
        topic: function (d) {
          date_formatter.setOpts()
          date_formatter.setOpts({local: true})
          return date_formatter.encodeIso8601(d)
        }
      , "must return a properly formatted string": function (e, str) {
          var reStr = '^\\d{4}[-]?\\d{2}[-]?\\d{2}T\\d{2}[:]?\\d{2}[:]?\\d{2}(\\.\\d{3})?([+-]\\d{2}[:]\\d{2})?$'
          assert.isNull(e)
          assert.isString(str)
          assert.match(str, new RegExp(reStr))
        }
      , "must match the correct time": function (str) {
          var reStr = '^T14[:]?25[:]?25(\\.000)?([+-]\\d{2}[:]\\d{2})?$'
          assert.isString(str)
          assert.match(str, new RegExp())
        }
      , teardown: function () { date_formatter.setOpts(); }
      }
    , "to utc representation": {
        topic: function (d) {
          date_formatter.setOpts()
          date_formatter.setOpts({local: false})
          return date_formatter.encodeIso8601(d)
        }
      , "must return a properly formatted string": function (e, str) {
          var reStr = '^\\d{4}[-]?\\d{2}[-]?\\d{2}T\\d{2}[:]?\\d{2}[:]?\\d{2}(\\.\\d{3})?Z$'
          assert.isNull(e)
          assert.isString(str)
          assert.match(str, new RegExp(reStr))
        }
      , "must match the correct time": function (str) {
          var offset = new Date().getTimezoneOffset()
          var round = (offset < 0) ? 'ceil' : 'floor'
          var reStr = ['T[0]?', 14+Math[round](offset/60), '[:]?[0]?', 25+(offset%60), '[:]?25(\\.000)?Z'].join('')
          assert.isString(str)
          assert.match(str, new RegExp(reStr))
        }
      , teardown: function () { date_formatter.setOpts(); }
      }
    }
  }
}).addBatch({
  "When decoding": {
    "YYYY-MM-DDTHH:mm:ss.mss": makeDecodeCase('2014-01-20T14:25:25.050', localDate(2014,0,20,14,25,25,50))
  , "YYYY-MM-DDTHH:mm:ss": makeDecodeCase('2014-01-20T14:25:25', localDate(2014,0,20,14,25,25))
  , "YYYY-MM-DDTHH:mm": makeDecodeCase('2014-01-20T14:25', localDate(2014,0,20,14,25))
  , "YYYY-MM-DDTHH": makeDecodeCase('2014-01-20T14', localDate(2014,0,20,14))
  , "YYYY-MM-DD": makeDecodeCase('2014-01-20', localDate(2014,0,20))
  , "YYYYMMDDTHH:mm:ss": makeDecodeCase('20140120T14:25:25', localDate(2014,0,20,14,25,25))
  , "YYYYMMDDTHHmmss": makeDecodeCase('20140120T142525', localDate(2014,0,20,14,25,25))
  , "YYYYMMDDTHHmm": makeDecodeCase('20140120T1425', localDate(2014,0,20,14,25))
  , "YYYYMMDD": makeDecodeCase('20140120', localDate(2014,0,20))
  , "YYYY-MM-DDTHH:mm:ss.mssZ": makeDecodeCase('2014-01-20T14:25:25.050Z', '2014-01-20T14:25:25.050Z')
  , "YYYY-MM-DDTHH:mm:ssZ": makeDecodeCase('2014-01-20T14:25:25Z', '2014-01-20T14:25:25.000Z')
  , "YYYY-MM-DDTHHZ": makeDecodeCase('2014-01-20T14Z', '2014-01-20T14:00:00.000Z')
  , "YYYY-MM-DDTHH:mm:ss.mss+hh:mm": makeDecodeCase('2014-01-20T14:25:25.000+09:30', function () {
      var d = new Date('2014-01-20T14:25:25.000Z')
      d.setUTCHours(d.getUTCHours() - 9)
      d.setUTCMinutes(d.getUTCMinutes() - 30)
      return d.toISOString()
    })
  , "YYYY-MM-DDTHH:mm:ss.mss+hhmm": makeDecodeCase('2014-01-20T14:25:25.000+0930', function () {
      var d = new Date('2014-01-20T14:25:25.000Z')
      d.setUTCHours(d.getUTCHours() - 9)
      d.setUTCMinutes(d.getUTCMinutes() - 30)
      return d.toISOString()
    })
  , "YYYY-MM-DDTHH:mm:ss.mss+hh": makeDecodeCase('2014-01-20T14:25:25.000+09', function () {
      var d = new Date('2014-01-20T14:25:25.000Z')
      d.setUTCHours(d.getUTCHours() - 9)
      return d.toISOString()
    })
  }
}).export(module)

function makeEncodeCase (opts, reStr) {
  return {
    topic: function (d) {
      date_formatter.setOpts(opts)
      return date_formatter.encodeIso8601(d)
    }
  , "must return a properly formatted string": function (e, str) {
      assert.isNull(e)
      assert.isString(str)
      assert.match(str, new RegExp(reStr))
    }
  , teardown: function () { date_formatter.setOpts(); }
  }
}

function makeDecodeCase(str, check) {
  if (typeof(check) === 'function') check = check()
  return {
    topic: function () {
      return date_formatter.decodeIso8601(str)
    }
  , "must return the right Date": function (e, date) {
      assert.isNull(e)
      assert.instanceOf(date, Date)
      assert.equal(check, date.toISOString())
    }
  }
}

function localDate (y,M,d,h,m,s,ms) {
  return (new Date(y||0,M||0,d||0,h||0,m||0,s||0,ms||0)).toISOString()
}
