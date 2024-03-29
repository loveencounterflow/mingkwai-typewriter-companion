// Generated by CoffeeScript 2.4.1
(function() {
  'use strict';
  var CND, Intertype, alert, badge, debug, help, info, intertype, jr, regex_cid_ranges, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = '明快打字机/TYPES';

  debug = CND.get_logger('debug', badge);

  alert = CND.get_logger('alert', badge);

  whisper = CND.get_logger('whisper', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  info = CND.get_logger('info', badge);

  jr = JSON.stringify;

  Intertype = (require('intertype')).Intertype;

  intertype = new Intertype(module.exports);

  //-----------------------------------------------------------------------------------------------------------
  this.declare('position', {
    tests: {
      '? isa pod': function(x) {
        return this.isa.object(x);
      },
      '? has_keys line, ch': function(x) {
        return this.has_keys(x, 'line', 'ch');
      },
      '?.line is a count': function(x) {
        return this.isa.count(x.line);
      },
      '?.ch is a count': function(x) {
        return this.isa.count(x.ch);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('range', {
    tests: {
      '? isa pod': function(x) {
        return this.isa.object(x);
      },
      '? has_keys from, to': function(x) {
        return this.has_keys(x, 'from', 'to');
      },
      '?.from is a position': function(x) {
        return this.isa.position(x.from);
      },
      '?.to is a position': function(x) {
        return this.isa.position(x.to);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT should check for upper boundary */
  this.declare('tsnr', {
    tests: {
      '? is a count': function(x) {
        return this.isa.count(x);
      }
    }
  });

  // 'transcriptor exists':      ( x ) -> S.transcriptors[ x ]?

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT this describes the *value* property of the event, but this will probably change to the event
  itself in the upcoming PipeDreams version. */
  this.declare('replace_text_event', {
    tests: {
      '? has keys 1': function(x) {
        return this.has_keys(x, 'otext', 'ntext');
      },
      '? has keys 2': function(x) {
        return this.has_keys(x, 'tsnr', 'sigil', 'origin', 'target', 'tsm');
      },
      '?.otext is a nonempty text': function(x) {
        return this.isa.nonempty_text(x.otext);
      },
      '?.ntext is a nonempty text': function(x) {
        return this.isa.nonempty_text(x.ntext);
      },
      '?.sigil is a nonempty text': function(x) {
        return this.isa.nonempty_text(x.sigil);
      },
      '?.tsnr is a tsnr': function(x) {
        return this.isa.tsnr(x.tsnr);
      },
      '?.target is a position': function(x) {
        return this.isa.position(x.target);
      },
      '?.tsm is a range': function(x) {
        return this.isa.range(x.tsm);
      },
      '?.origin is a range': function(x) {
        return this.isa.range(x.origin);
      }
    }
  });

  // { otext: 'ka',
  //   tsnr: 2,
  //   sigil: 'ひ',
  //   target: { line: 0, ch: 6 },
  //   tsm: { from: { line: 0, ch: 6 }, to: { line: 0, ch: 11 } },
  //   origin: { from: { line: 0, ch: 9 }, to: { line: 0, ch: 11 } },
  //   ntext: 'か' } }

  //-----------------------------------------------------------------------------------------------------------
  this.declare('edict2u_plural_row', {
    tests: {
      "? is an object": function(x) {
        return this.isa.object(x);
      },
      "? has key 'readings'": function(x) {
        return this.has_key(x, 'readings');
      },
      "? has key 'candidates'": function(x) {
        return this.has_key(x, 'candidates');
      },
      "? has key 'gloss'": function(x) {
        return this.has_key(x, 'gloss');
      },
      "? has key 'line'": function(x) {
        return this.has_key(x, 'line');
      },
      "?.readings is a *list": function(x) {
        return (x.readings == null) || this.isa.list(x.readings);
      },
      "?.candidates is a list": function(x) {
        return this.isa.list(x.candidates);
      },
      "?.gloss is a nonempty text": function(x) {
        return this.isa.nonempty_text(x.gloss);
      },
      "?.line is a nonempty text": function(x) {
        return this.isa.nonempty_text(x.line);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('edict2u_singular_row', {
    tests: {
      "? is an object": function(x) {
        return this.isa.object(x);
      },
      "? has key 'reading'": function(x) {
        return this.has_key(x, 'reading');
      },
      "? has key 'candidate'": function(x) {
        return this.has_key(x, 'candidate');
      },
      "? has key 'gloss'": function(x) {
        return this.has_key(x, 'gloss');
      },
      "? has key 'line'": function(x) {
        return this.has_key(x, 'line');
      },
      "?.reading is a nonempty text": function(x) {
        return this.isa.nonempty_text(x.reading);
      },
      "?.candidate is a nonempty text": function(x) {
        return this.isa.nonempty_text(x.candidate);
      },
      "?.gloss is a nonempty text": function(x) {
        return this.isa.nonempty_text(x.gloss);
      },
      "?.line is a nonempty text": function(x) {
        return this.isa.nonempty_text(x.line);
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  regex_cid_ranges = {
    hiragana: '[\u3041-\u3096]',
    katakana: '[\u30a1-\u30fa]',
    kana: '[\u3041-\u3096\u30a1-\u30fa]',
    ideographic: '[\u3006-\u3007\u3021-\u3029\u3038-\u303a\u3400-\u4db5\u4e00-\u9fef\uf900-\ufa6d\ufa70-\ufad9\u{17000}-\u{187f7}\u{18800}-\u{18af2}\u{1b170}-\u{1b2fb}\u{20000}-\u{2a6d6}\u{2a700}-\u{2b734}\u{2b740}-\u{2b81d}\u{2b820}-\u{2cea1}\u{2ceb0}-\u{2ebe0}\u{2f800}-\u{2fa1d}]'
  };

  //-----------------------------------------------------------------------------------------------------------
  this.declare('text_with_hiragana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? has hiragana': function(x) {
        return (x.match(RegExp(`${regex_cid_ranges.hiragana}`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('text_with_katakana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? has katakana': function(x) {
        return (x.match(RegExp(`${regex_cid_ranges.katakana}`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('text_with_kana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? has kana': function(x) {
        return (x.match(RegExp(`${regex_cid_ranges.kana}`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('text_with_ideographic', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? has ideographic': function(x) {
        return (x.match(RegExp(`${regex_cid_ranges.ideographic}`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('text_hiragana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? is hiragana': function(x) {
        return (x.match(RegExp(`^${regex_cid_ranges.hiragana}+$`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('text_katakana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? is katakana': function(x) {
        return (x.match(RegExp(`^${regex_cid_ranges.katakana}+$`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('text_kana', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? is kana': function(x) {
        return (x.match(RegExp(`^${regex_cid_ranges.kana}+$`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('text_ideographic', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? is ideographic': function(x) {
        return (x.match(RegExp(`^${regex_cid_ranges.ideographic}+$`, "u"))) != null;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  this.declare('blank_text', {
    tests: {
      '? is a text': function(x) {
        return this.isa.text(x);
      },
      '? is blank': function(x) {
        return (x.match(/^\s*$/u)) != null;
      }
    }
  });

  //###########################################################################################################
  if (module.parent == null) {
    null;
  }

}).call(this);

//# sourceMappingURL=types.js.map
