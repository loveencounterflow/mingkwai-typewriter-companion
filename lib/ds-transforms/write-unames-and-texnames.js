// Generated by CoffeeScript 2.4.1
(function() {
  'use strict';
  var $, $async, CND, FS, L, PATH, PD, Sqlite_db, assign, badge, csvesc, debug, echo, help, info, jr, rpr, select, settings, urge, warn, whisper, xray;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'IME/EXPERIMENTS/KB';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  FS = require('fs');

  PATH = require('path');

  PD = require('pipedreams');

  ({$, $async, select} = PD);

  ({assign, jr} = CND);

  Sqlite_db = require('better-sqlite3');

  //-----------------------------------------------------------------------------------------------------------
  xray = function(text) {
    var chr, i, len, ref, results;
    ref = Array.from(text);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      chr = ref[i];
      results.push((chr.codePointAt(0)).toString(16));
    }
    return results;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$reshape = function() {
    return $(function(d0, send) {
      var d, i, len, names, new_name, old_name;
      d = {};
      names = [['ucid', 'ID'], ['uname', 'UNICODE DESCRIPTION'], ['texname', 'latex'], ['description', 'op dict']];
      for (i = 0, len = names.length; i < len; i++) {
        [new_name, old_name] = names[i];
        d[new_name] = d0[old_name];
      }
      return send(d);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$omit_empty = function() {
    var names;
    names = ['ucid', 'uname', 'texname', 'description'];
    return $(function(d, send) {
      var i, len, name;
      for (i = 0, len = names.length; i < len; i++) {
        name = names[i];
        if ((d[name].match(/^\s*$/)) != null) {
          delete d[name];
        }
      }
      return send(d);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$cleanup_texname = function() {
    var cleanup_texname;
    cleanup_texname = function(text) {
      var R;
      R = text;
      R = R.replace(/\\/g, '');
      R = R.replace(/[{}]/g, '-');
      R = R.replace(/-+/g, '-');
      R = R.replace(/^-/g, '');
      R = R.replace(/-$/g, '');
      R = R.replace(/'/g, 'acute');
      return R;
    };
    return $(function(d, send) {
      if (d.texname != null) {
        d.texname = cleanup_texname(d.texname);
      }
      return send(d);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$cleanup_uname = function() {
    var cleanup_uname;
    cleanup_uname = function(text) {
      var R;
      if (text == null) {
        return null;
      }
      R = text;
      R = R.toLowerCase();
      return R;
    };
    return $(function(d, send) {
      d.uname = cleanup_uname(d.uname);
      return send(d);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$distinct_tokens_from_uname = function() {
    var seen, split;
    split = function(text) {
      return text.split(/[\s-]+/);
    };
    seen = new Set();
    return $(function(d, send) {
      var i, len, ref, uname_token;
      ref = split(d.uname);
      for (i = 0, len = ref.length; i < len; i++) {
        uname_token = ref[i];
        if (seen.has(uname_token)) {
          continue;
        }
        seen.add(uname_token);
        if (uname_token.length !== 0) {
          send({uname_token});
        }
      }
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$ranked_tokens_from_uname = function() {
    var last, ranks, split;
    split = function(text) {
      return text.split(/[\s-]+/);
    };
    ranks = {};
    last = Symbol('last');
    return $({last}, function(d, send) {
      var i, len, rank, ref, uname_token;
      if (d === last) {
        for (uname_token in ranks) {
          rank = ranks[uname_token];
          send({uname_token, rank});
        }
      } else {
        ref = split(d.uname);
        for (i = 0, len = ref.length; i < len; i++) {
          uname_token = ref[i];
          if (uname_token.length === 0) {
            continue;
          }
          ranks[uname_token] = (ranks[uname_token] != null ? ranks[uname_token] : ranks[uname_token] = 0) + 1;
        }
      }
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$skip_extraneous = function() {
    return PD.$filter(function(d) {
      if (d.uname == null) {
        return true;
      }
      if ((d.uname.match(/^cjk compatibility ideograph/)) != null) {
        return false;
      }
      if ((d.uname.match(/^language tag/)) != null) {
        return false;
      }
      if ((d.uname.match(/^tag /)) != null) {
        return false;
      }
      if ((d.uname.match(/^variation selector-/)) != null) {
        return false;
      }
      if ((d.uname.match(/^multiple character operator/)) != null) {
        return false;
      }
      return true;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$_XXX_skip_whitespace_etc = function() {
    /* TAINT should implement symbolic whitespace representation */
    return PD.$filter(function(d) {
      if (d.glyph == null) {
        return false;
      }
      if ((d.glyph.match(/^\s+$/)) != null) {
        return false;
      }
      if ((d.glyph.match(/^[\x00-\x20]+$/)) != null) {
        return false;
      }
      return true;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$_XXX_skip_longer_texts = function() {
    /* TAINT must implement target texts with more than a single glyph */
    return PD.$filter(function(d) {
      return (d.ucid.match(/^U[0-9A-F]{5}$/)) != null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$add_glyph = function() {
    return $(function(d, send) {
      var cid;
      if (d.ucid == null) {
        return send(d);
      }
      cid = parseInt(d.ucid.replace(/^U/, ''), 16);
      d.glyph = String.fromCodePoint(cid);
      d.cid_hex = 'u/' + cid.toString(16);
      delete d.ucid;
      return send(d);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$as_tsv = function(names) {
    return PD.$map(function(d) {
      var name;
      return (((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = names.length; i < len; i++) {
          name = names[i];
          results.push(d[name]);
        }
        return results;
      })()).join('\t')) + '\n';
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  csvesc = function(text) {
    return text.replace(/"/g, '""');
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$as_csv = function(names) {
    var first;
    first = Symbol('first');
    return $({first}, function(d, send) {
      var name;
      if (d === first) {
        send((((function() {
          var i, len, results;
          results = [];
          for (i = 0, len = names.length; i < len; i++) {
            name = names[i];
            results.push(`"${csvesc(name)}"`);
          }
          return results;
        })()).join(',')) + '\n');
      } else {
        send((((function() {
          var i, len, results;
          results = [];
          for (i = 0, len = names.length; i < len; i++) {
            name = names[i];
            results.push(`"${csvesc(d[name].toString())}"`);
          }
          return results;
        })()).join(',')) + '\n');
      }
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$filter_unames = function() {
    return PD.$filter(function(d) {
      return (d.uname != null) && (d.glyph != null);
    });
  };

  this.$filter_texnames = function() {
    return PD.$filter(function(d) {
      return (d.texname != null) && (d.glyph != null);
    });
  };

  this.$skip_tautological_texnames = function() {
    return PD.$filter(function(d) {
      return d.texname !== d.glyph;
    });
  };

  this.$as_uname_tsv = function() {
    return this.$as_tsv(['cid_hex', 'glyph', 'uname']);
  };

  this.$as_texname_tsv = function() {
    return this.$as_tsv(['cid_hex', 'glyph', 'texname']);
  };

  this.$as_uname_csv = function() {
    return this.$as_csv(['cid_hex', 'glyph', 'uname']);
  };

  this.$as_texname_csv = function() {
    return this.$as_csv(['cid_hex', 'glyph', 'texname']);
  };

  this.$as_uname_token_csv = function() {
    return this.$as_csv(['uname_token', 'rank']);
  };

  // @$as_uname_token_csv          = -> @$as_csv [ 'uname_token',                 ]

  //-----------------------------------------------------------------------------------------------------------
  this.write_unames_and_texnames = function(settings) {
    var convert, get_texnames_byline, get_uname_tokens_byline, get_unames_byline, new_csv_parser, njs_source, source, strip_bom;
    new_csv_parser = require('csv-parser');
    strip_bom = require('strip-bom-stream');
    njs_source = FS.createReadStream(settings.source_path);
    njs_source = njs_source.pipe(strip_bom());
    njs_source = njs_source.pipe(new_csv_parser());
    source = PD.read_from_nodejs_stream(njs_source);
    //.........................................................................................................
    get_unames_byline = () => {
      var pipeline;
      pipeline = [];
      pipeline.push(this.$filter_unames());
      pipeline.push(this.$as_uname_csv());
      // pipeline.push PD.$watch ( d ) => info d
      pipeline.push(PD.write_to_file(settings.unames_target_path));
      return PD.pull(...pipeline);
    };
    //.........................................................................................................
    get_uname_tokens_byline = () => {
      var pipeline;
      pipeline = [];
      pipeline.push(this.$filter_unames());
      // pipeline.push @$distinct_tokens_from_uname()
      pipeline.push(this.$ranked_tokens_from_uname());
      pipeline.push(this.$as_uname_token_csv());
      // pipeline.push PD.$watch ( d ) => info d
      pipeline.push(PD.write_to_file(settings.uname_tokens_target_path));
      return PD.pull(...pipeline);
    };
    //.........................................................................................................
    get_texnames_byline = () => {
      var pipeline;
      pipeline = [];
      pipeline.push(this.$filter_texnames());
      pipeline.push(this.$skip_tautological_texnames());
      pipeline.push(this.$as_texname_csv());
      pipeline.push(PD.write_to_file(settings.texnames_target_path));
      return PD.pull(...pipeline);
    };
    //.........................................................................................................
    convert = () => {
      var pipeline;
      pipeline = [];
      pipeline.push(source);
      // pipeline.push PD.$sample 1 / 2000
      pipeline.push(this.$reshape());
      pipeline.push(this.$omit_empty());
      pipeline.push(PD.$watch((d) => {
        if (d.ucid.endsWith('0002D')) {
          return urge(jr(d));
        }
      }));
      pipeline.push(this.$cleanup_texname());
      pipeline.push(this.$cleanup_uname());
      pipeline.push(this.$skip_extraneous());
      pipeline.push(this.$_XXX_skip_longer_texts());
      pipeline.push(this.$add_glyph());
      pipeline.push(this.$_XXX_skip_whitespace_etc());
      // pipeline.push PD.$show()
      pipeline.push(PD.$tee(get_unames_byline()));
      pipeline.push(PD.$tee(get_uname_tokens_byline()));
      pipeline.push(PD.$tee(get_texnames_byline()));
      pipeline.push(PD.$drain());
      PD.pull(...pipeline);
      return null;
    };
    //.........................................................................................................
    convert();
    return null;
  };

  L = this;

  settings = {
    source_path: PATH.resolve(PATH.join(__dirname, '../../db/unicode-names-and-entities.csv')),
    unames_target_path: PATH.resolve(PATH.join(__dirname, '../../db/unames.csv')),
    uname_tokens_target_path: PATH.resolve(PATH.join(__dirname, '../../db/uname-tokens.csv')),
    texnames_target_path: PATH.resolve(PATH.join(__dirname, '../../db/texnames.csv'))
  };

  //   db_path:              PATH.resolve PATH.join __dirname, '../../db/data.db'
  // settings.db = new Sqlite_db settings.db_path, { verbose: urge }
  L.write_unames_and_texnames(settings);

}).call(this);

//# sourceMappingURL=write-unames-and-texnames.js.map