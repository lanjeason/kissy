function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/router/utils.js']) {
  _$jscoverage['/router/utils.js'] = {};
  _$jscoverage['/router/utils.js'].lineData = [];
  _$jscoverage['/router/utils.js'].lineData[5] = 0;
  _$jscoverage['/router/utils.js'].lineData[6] = 0;
  _$jscoverage['/router/utils.js'].lineData[7] = 0;
  _$jscoverage['/router/utils.js'].lineData[9] = 0;
  _$jscoverage['/router/utils.js'].lineData[10] = 0;
  _$jscoverage['/router/utils.js'].lineData[13] = 0;
  _$jscoverage['/router/utils.js'].lineData[14] = 0;
  _$jscoverage['/router/utils.js'].lineData[15] = 0;
  _$jscoverage['/router/utils.js'].lineData[16] = 0;
  _$jscoverage['/router/utils.js'].lineData[18] = 0;
  _$jscoverage['/router/utils.js'].lineData[21] = 0;
  _$jscoverage['/router/utils.js'].lineData[22] = 0;
  _$jscoverage['/router/utils.js'].lineData[23] = 0;
  _$jscoverage['/router/utils.js'].lineData[26] = 0;
  _$jscoverage['/router/utils.js'].lineData[28] = 0;
  _$jscoverage['/router/utils.js'].lineData[32] = 0;
  _$jscoverage['/router/utils.js'].lineData[36] = 0;
  _$jscoverage['/router/utils.js'].lineData[37] = 0;
  _$jscoverage['/router/utils.js'].lineData[39] = 0;
  _$jscoverage['/router/utils.js'].lineData[43] = 0;
  _$jscoverage['/router/utils.js'].lineData[44] = 0;
  _$jscoverage['/router/utils.js'].lineData[46] = 0;
  _$jscoverage['/router/utils.js'].lineData[50] = 0;
  _$jscoverage['/router/utils.js'].lineData[54] = 0;
  _$jscoverage['/router/utils.js'].lineData[55] = 0;
  _$jscoverage['/router/utils.js'].lineData[57] = 0;
  _$jscoverage['/router/utils.js'].lineData[63] = 0;
  _$jscoverage['/router/utils.js'].lineData[68] = 0;
  _$jscoverage['/router/utils.js'].lineData[69] = 0;
  _$jscoverage['/router/utils.js'].lineData[70] = 0;
  _$jscoverage['/router/utils.js'].lineData[83] = 0;
  _$jscoverage['/router/utils.js'].lineData[89] = 0;
  _$jscoverage['/router/utils.js'].lineData[93] = 0;
  _$jscoverage['/router/utils.js'].lineData[97] = 0;
  _$jscoverage['/router/utils.js'].lineData[102] = 0;
}
if (! _$jscoverage['/router/utils.js'].functionData) {
  _$jscoverage['/router/utils.js'].functionData = [];
  _$jscoverage['/router/utils.js'].functionData[0] = 0;
  _$jscoverage['/router/utils.js'].functionData[1] = 0;
  _$jscoverage['/router/utils.js'].functionData[2] = 0;
  _$jscoverage['/router/utils.js'].functionData[3] = 0;
  _$jscoverage['/router/utils.js'].functionData[4] = 0;
  _$jscoverage['/router/utils.js'].functionData[5] = 0;
  _$jscoverage['/router/utils.js'].functionData[6] = 0;
  _$jscoverage['/router/utils.js'].functionData[7] = 0;
  _$jscoverage['/router/utils.js'].functionData[8] = 0;
  _$jscoverage['/router/utils.js'].functionData[9] = 0;
  _$jscoverage['/router/utils.js'].functionData[10] = 0;
  _$jscoverage['/router/utils.js'].functionData[11] = 0;
  _$jscoverage['/router/utils.js'].functionData[12] = 0;
  _$jscoverage['/router/utils.js'].functionData[13] = 0;
  _$jscoverage['/router/utils.js'].functionData[14] = 0;
  _$jscoverage['/router/utils.js'].functionData[15] = 0;
}
if (! _$jscoverage['/router/utils.js'].branchData) {
  _$jscoverage['/router/utils.js'].branchData = {};
  _$jscoverage['/router/utils.js'].branchData['23'] = [];
  _$jscoverage['/router/utils.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/router/utils.js'].branchData['23'][2] = new BranchData();
  _$jscoverage['/router/utils.js'].branchData['28'] = [];
  _$jscoverage['/router/utils.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/router/utils.js'].branchData['32'] = [];
  _$jscoverage['/router/utils.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/router/utils.js'].branchData['36'] = [];
  _$jscoverage['/router/utils.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/router/utils.js'].branchData['43'] = [];
  _$jscoverage['/router/utils.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/router/utils.js'].branchData['54'] = [];
  _$jscoverage['/router/utils.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/router/utils.js'].branchData['70'] = [];
  _$jscoverage['/router/utils.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/router/utils.js'].branchData['89'] = [];
  _$jscoverage['/router/utils.js'].branchData['89'][1] = new BranchData();
}
_$jscoverage['/router/utils.js'].branchData['89'][1].init(21, 31, 'str.indexOf(\'__ks-vid=\') !== -1');
function visit26_89_1(result) {
  _$jscoverage['/router/utils.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/utils.js'].branchData['70'][1].init(115, 13, 'str1 === str2');
function visit25_70_1(result) {
  _$jscoverage['/router/utils.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/utils.js'].branchData['54'][1].init(18, 3, 'str');
function visit24_54_1(result) {
  _$jscoverage['/router/utils.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/utils.js'].branchData['43'][1].init(18, 24, 'this.startWithSlash(str)');
function visit23_43_1(result) {
  _$jscoverage['/router/utils.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/utils.js'].branchData['36'][1].init(18, 22, 'this.endWithSlash(str)');
function visit22_36_1(result) {
  _$jscoverage['/router/utils.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/utils.js'].branchData['32'][1].init(21, 21, 'str.charAt(0) === \'/\'');
function visit21_32_1(result) {
  _$jscoverage['/router/utils.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/utils.js'].branchData['28'][1].init(21, 34, 'str.charAt(str.length - 1) === \'/\'');
function visit20_28_1(result) {
  _$jscoverage['/router/utils.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/utils.js'].branchData['23'][2].init(55, 9, 'm && m[1]');
function visit19_23_2(result) {
  _$jscoverage['/router/utils.js'].branchData['23'][2].ranCondition(result);
  return result;
}_$jscoverage['/router/utils.js'].branchData['23'][1].init(55, 15, 'm && m[1] || \'\'');
function visit18_23_1(result) {
  _$jscoverage['/router/utils.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/router/utils.js'].lineData[5]++;
KISSY.add(function(S, require) {
  _$jscoverage['/router/utils.js'].functionData[0]++;
  _$jscoverage['/router/utils.js'].lineData[6]++;
  var utils;
  _$jscoverage['/router/utils.js'].lineData[7]++;
  var DomEvent = require('event/dom');
  _$jscoverage['/router/utils.js'].lineData[9]++;
  function removeVid(str) {
    _$jscoverage['/router/utils.js'].functionData[1]++;
    _$jscoverage['/router/utils.js'].lineData[10]++;
    return str.replace(/__ks-vid=.+$/, '');
  }
  _$jscoverage['/router/utils.js'].lineData[13]++;
  function getVidFromHash(hash) {
    _$jscoverage['/router/utils.js'].functionData[2]++;
    _$jscoverage['/router/utils.js'].lineData[14]++;
    var m;
    _$jscoverage['/router/utils.js'].lineData[15]++;
    if ((m = hash.match(/__ks-vid=(.+)$/))) {
      _$jscoverage['/router/utils.js'].lineData[16]++;
      return parseInt(m[1], 10);
    }
    _$jscoverage['/router/utils.js'].lineData[18]++;
    return 0;
  }
  _$jscoverage['/router/utils.js'].lineData[21]++;
  function getFragment(url) {
    _$jscoverage['/router/utils.js'].functionData[3]++;
    _$jscoverage['/router/utils.js'].lineData[22]++;
    var m = url.match(/#(.+)$/);
    _$jscoverage['/router/utils.js'].lineData[23]++;
    return visit18_23_1(visit19_23_2(m && m[1]) || '');
  }
  _$jscoverage['/router/utils.js'].lineData[26]++;
  utils = {
  endWithSlash: function(str) {
  _$jscoverage['/router/utils.js'].functionData[4]++;
  _$jscoverage['/router/utils.js'].lineData[28]++;
  return visit20_28_1(str.charAt(str.length - 1) === '/');
}, 
  startWithSlash: function(str) {
  _$jscoverage['/router/utils.js'].functionData[5]++;
  _$jscoverage['/router/utils.js'].lineData[32]++;
  return visit21_32_1(str.charAt(0) === '/');
}, 
  removeEndSlash: function(str) {
  _$jscoverage['/router/utils.js'].functionData[6]++;
  _$jscoverage['/router/utils.js'].lineData[36]++;
  if (visit22_36_1(this.endWithSlash(str))) {
    _$jscoverage['/router/utils.js'].lineData[37]++;
    str = str.substring(0, str.length - 1);
  }
  _$jscoverage['/router/utils.js'].lineData[39]++;
  return str;
}, 
  removeStartSlash: function(str) {
  _$jscoverage['/router/utils.js'].functionData[7]++;
  _$jscoverage['/router/utils.js'].lineData[43]++;
  if (visit23_43_1(this.startWithSlash(str))) {
    _$jscoverage['/router/utils.js'].lineData[44]++;
    str = str.substring(1);
  }
  _$jscoverage['/router/utils.js'].lineData[46]++;
  return str;
}, 
  addEndSlash: function(str) {
  _$jscoverage['/router/utils.js'].functionData[8]++;
  _$jscoverage['/router/utils.js'].lineData[50]++;
  return this.removeEndSlash(str) + '/';
}, 
  addStartSlash: function(str) {
  _$jscoverage['/router/utils.js'].functionData[9]++;
  _$jscoverage['/router/utils.js'].lineData[54]++;
  if (visit24_54_1(str)) {
    _$jscoverage['/router/utils.js'].lineData[55]++;
    return '/' + this.removeStartSlash(str);
  } else {
    _$jscoverage['/router/utils.js'].lineData[57]++;
    return str;
  }
}, 
  getFullPath: function(fragment, urlRoot) {
  _$jscoverage['/router/utils.js'].functionData[10]++;
  _$jscoverage['/router/utils.js'].lineData[63]++;
  return location.protocol + '//' + location.host + this.removeEndSlash(urlRoot) + this.addStartSlash(fragment);
}, 
  equalsIgnoreSlash: function(str1, str2) {
  _$jscoverage['/router/utils.js'].functionData[11]++;
  _$jscoverage['/router/utils.js'].lineData[68]++;
  str1 = this.removeEndSlash(str1);
  _$jscoverage['/router/utils.js'].lineData[69]++;
  str2 = this.removeEndSlash(str2);
  _$jscoverage['/router/utils.js'].lineData[70]++;
  return visit25_70_1(str1 === str2);
}, 
  getHash: function(url) {
  _$jscoverage['/router/utils.js'].functionData[12]++;
  _$jscoverage['/router/utils.js'].lineData[83]++;
  return removeVid(getFragment(url).replace(/^!/, '')).replace(DomEvent.REPLACE_HISTORY, '');
}, 
  removeVid: removeVid, 
  hasVid: function(str) {
  _$jscoverage['/router/utils.js'].functionData[13]++;
  _$jscoverage['/router/utils.js'].lineData[89]++;
  return visit26_89_1(str.indexOf('__ks-vid=') !== -1);
}, 
  addVid: function(str, vid) {
  _$jscoverage['/router/utils.js'].functionData[14]++;
  _$jscoverage['/router/utils.js'].lineData[93]++;
  return str + '__ks-vid=' + vid;
}, 
  getVidFromUrlWithHash: function(url) {
  _$jscoverage['/router/utils.js'].functionData[15]++;
  _$jscoverage['/router/utils.js'].lineData[97]++;
  return getVidFromHash(getFragment(url));
}, 
  getVidFromHash: getVidFromHash};
  _$jscoverage['/router/utils.js'].lineData[102]++;
  return utils;
});
