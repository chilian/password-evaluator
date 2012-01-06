/*
  password-evaluator v 0.1
  http://cc-web.eu/projects/javascript/password-evaluator
  Copyright 2012, Christoph Chilian

  Dual licensed under the MIT or GPL Version 2 licenses.
  http://cc-web.eu/projects/password-evaluator/license

  Date: 2012-01-06 17:51:24 +0100
*/

(function() {

  this.PasswordEvaluator = (function() {

    function PasswordEvaluator(debug_mode) {
      this.debug_mode = debug_mode != null ? debug_mode : false;
      this.score = 0;
    }

    /*
        Logger for Firebug
        level: 0 = off, 1 = log, 2 = debug, 3 = info, 4 = warn, 5 = error
        2DO: refactor this method :)
    */

    PasswordEvaluator.prototype.logger = function(msg, level) {
      if (level == null) level = 0;
      if (this.debug_mode === true && typeof console !== "undefined") {
        switch (parseInt(level)) {
          case 1:
            console.log(msg);
            break;
          case 2:
            console.debug(msg);
            break;
          case 3:
            console.info(msg);
            break;
          case 4:
            console.warn(msg);
            break;
          case 5:
            console.error(msg);
        }
      }
      return msg;
    };

    PasswordEvaluator.prototype.check_password = function(pwd) {
      this.score = 0;
      this.logger("start checking pw", 1);
      this.score += this.calc_score_number_of_characters(pwd);
      this.score += this.calc_score_lowercase_letters(pwd);
      this.score += this.calc_score_uppercase_letters(pwd);
      this.score += this.calc_score_numbers(pwd);
      this.score += this.calc_score_symbols(pwd);
      this.score += this.calc_score_middle_numbers_or_symbols(pwd);
      this.score -= this.calc_score_letters_only(pwd);
      this.score -= this.calc_score_numbers_only(pwd);
      this.score -= this.calc_score_repeat_characters(pwd);
      this.score -= this.calc_score_consecutive_lc_letters_and_uc_letters_and_numbers(pwd);
      this.score -= this.calc_score_seq_alpha_or_numeric_or_symbols(pwd);
      this.logger("finished! The final score: " + this.score, 1);
      return this.score = this.score > 100 ? 100 : this.score < 0 ? 0 : this.score;
    };

    /*
        The following methods calculate the pw-score
    */

    /*
        positive score
    */

    PasswordEvaluator.prototype.calc_score_number_of_characters = function(pwd) {
      var score;
      score = parseInt(pwd.length * 4);
      this.logger("Score=> number of characters: " + score, 1);
      return score;
    };

    PasswordEvaluator.prototype.calc_score_lowercase_letters = function(pwd) {
      var count_lc, score;
      count_lc = this.count_regex_matches(pwd, /[a-z]/g);
      score = count_lc < pwd.length && count_lc >= 1 ? parseInt((pwd.length - count_lc) * 2) : 0;
      this.logger("Score=> lowercase_letters: " + score, 1);
      return score;
    };

    PasswordEvaluator.prototype.calc_score_uppercase_letters = function(pwd) {
      var count_uc, score;
      count_uc = this.count_regex_matches(pwd, /[A-Z]/g);
      score = count_uc < pwd.length && count_uc >= 1 ? parseInt((pwd.length - count_uc) * 2) : 0;
      this.logger("Score=> uppercase_letters: " + score, 1);
      return score;
    };

    PasswordEvaluator.prototype.calc_score_numbers = function(pwd) {
      var score;
      score = parseInt(this.count_regex_matches(pwd, /[0-9]/g) * 4);
      this.logger("Score=> numbers: " + score, 1);
      return score;
    };

    PasswordEvaluator.prototype.calc_score_symbols = function(pwd) {
      var score;
      score = parseInt(this.count_regex_matches(pwd, /[^a-zA-Z0-9_]/g) * 6);
      this.logger("Score=> symbols: " + score, 1);
      return score;
    };

    PasswordEvaluator.prototype.calc_score_middle_numbers_or_symbols = function(pwd) {
      var score;
      score = parseInt(this.count_regex_matches(pwd.substring(1, pwd.length - 1), /([\W]|[\d])/ig) * 2);
      this.logger("Score=> middle_numbers_or_symbols: " + score, 1);
      console.log(pwd.match(/[a-z]+([^a-z])[a-z]*/ig));
      return score;
    };

    /*
        negative score
    */

    PasswordEvaluator.prototype.calc_score_letters_only = function(pwd) {
      var score;
      score = this.count_regex_matches(pwd, /[^a-z]/ig) ? 0 : parseInt(this.count_regex_matches(pwd, /[a-z]/ig));
      this.logger("Score=> letters_only: -" + score, 1);
      return score;
    };

    PasswordEvaluator.prototype.calc_score_numbers_only = function(pwd) {
      var score;
      score = parseInt(this.count_regex_matches(pwd, /[^0-9]/)) > 0 ? 0 : pwd.length;
      this.logger("Score=> numbers_only: -" + score, 1);
      return score;
    };

    PasswordEvaluator.prototype.calc_score_repeat_characters = function(pwd) {
      var a, arr_pwd, b, bCharExists, nRepChar, nRepInc, nUnqChar, score, _i, _j, _len, _len2;
      nRepChar = 0;
      nRepInc = 0;
      bCharExists = false;
      arr_pwd = pwd.replace(/\s+/g, "").split(/\s*/);
      for (_i = 0, _len = pwd.length; _i < _len; _i++) {
        a = pwd[_i];
        bCharExists = false;
        for (_j = 0, _len2 = pwd.length; _j < _len2; _j++) {
          b = pwd[_j];
          if ((a === b) && (_i !== _j)) {
            bCharExists = true;
            nRepInc += Math.abs(arr_pwd.length / (_j - _i));
          }
        }
        if (bCharExists) {
          nRepChar++;
          nUnqChar = arr_pwd.length - nRepChar;
          if (nUnqChar) {
            nRepInc = Math.ceil(nRepInc / nUnqChar);
          } else {
            nRepInc = Math.ceil(nRepInc);
          }
        }
      }
      score = nRepInc;
      this.logger("Score=> repeat_characters: -" + score, 1);
      return score;
    };

    PasswordEvaluator.prototype.calc_score_consecutive_lowercase_letters = function(pwd) {
      var score;
      score = parseInt(this.count_regex_matches(pwd, /[a-z]/g)) * 2;
      this.logger("Score=> consecutive_lowercase_letters: -" + score, 1);
      return score;
    };

    PasswordEvaluator.prototype.calc_score_consecutive_uppercase_letters = function(pwd) {
      var score;
      score = parseInt(this.count_regex_matches(pwd, /[A-Z]/g)) * 2;
      this.logger("Score=> consecutive_uppercase_letters: -" + score, 1);
      return score;
    };

    PasswordEvaluator.prototype.calc_score_consecutive_numbers = function(pwd) {
      var score;
      score = parseInt(this.count_regex_matches(pwd, /[0-9]/g)) * 2;
      this.logger("Score=> consecutive_numbers: -" + score, 1);
      return score;
    };

    PasswordEvaluator.prototype.calc_score_consecutive_lc_letters_and_uc_letters_and_numbers = function(pwd) {
      var arr_pwd, char, count_lc, count_number, count_uc, score, tmp_lc, tmp_number, tmp_uc, _i, _len;
      tmp_lc = '';
      tmp_uc = '';
      tmp_number = '';
      count_lc = 0;
      count_uc = 0;
      count_number = 0;
      arr_pwd = pwd.replace(/\s+/g, "").split(/\s*/);
      for (_i = 0, _len = arr_pwd.length; _i < _len; _i++) {
        char = arr_pwd[_i];
        if (char.match(/[a-z]/)) {
          if (tmp_lc !== '') if ((tmp_lc + 1) === _i) count_lc++;
          tmp_lc = _i;
        }
        if (char.match(/[A-Z]/)) {
          if (tmp_uc !== '') if ((tmp_uc + 1) === _i) count_uc++;
          tmp_uc = _i;
        }
        if (char.match(/[0-9]/)) {
          if (tmp_number !== '') if ((tmp_number + 1) === _i) count_number++;
          tmp_number = _i;
        }
      }
      this.logger("Score=> consecutive_lowercase: -" + (count_lc * 2), 1);
      this.logger("Score=> consecutive_uppercase: -" + (count_uc * 2), 1);
      this.logger("Score=> consecutive_number: -" + (count_number * 2), 1);
      return score = (count_lc + count_uc + count_number) * 2;
    };

    PasswordEvaluator.prototype.calc_score_seq_alpha_or_numeric_or_symbols = function(pwd) {
      var count_alpha, count_numeric, count_symbols, score, seq_alpha, seq_letter, seq_numeric, seq_symbols;
      seq_alpha = 'abcdefghijklmnopqrstuvwxyz';
      seq_numeric = '012345678910';
      seq_symbols = '°!"§$%&/()=?`';
      count_alpha = 0;
      count_numeric = 0;
      count_symbols = 0;
      pwd = pwd.toLowerCase();
      for (seq_letter = 0; seq_letter <= 23; seq_letter++) {
        if (this.check_seq_fwd_and_rev(pwd, seq_alpha, seq_letter)) {
          count_alpha++;
          if (this.check_seq_fwd_and_rev(pwd, seq_numeric, seq_letter)) {
            count_numeric++;
            if (this.check_seq_fwd_and_rev(pwd, seq_symbols, seq_letter)) {
              count_symbols++;
            }
          }
        }
      }
      this.logger("Score=> seq_alpha: -" + (count_alpha * 3), 1);
      this.logger("Score=> seq_numeric: -" + (count_numeric * 3), 1);
      this.logger("Score=> seq_symbols: -" + (count_symbols * 3), 1);
      return score = (count_alpha + count_numeric + count_symbols) * 3;
    };

    /*
        helper-methods
    */

    PasswordEvaluator.prototype.count_regex_matches = function(str, regex) {
      var match;
      if (str == null) str = '';
      if (regex == null) regex = /[0-9]/g;
      match = str.match(regex);
      if (match) {
        return match.length;
      } else {
        return 0;
      }
    };

    PasswordEvaluator.prototype.check_seq_fwd_and_rev = function(pwd, seq, seq_pos, seq_length) {
      var letter, search_fwd, search_rev, _i, _len;
      if (seq_length == null) seq_length = 3;
      search_fwd = seq.substring(seq_pos, parseInt(seq_pos + seq_length));
      search_rev = "";
      for (_i = 0, _len = pwd.length; _i < _len; _i++) {
        letter = pwd[_i];
        search_rev = pwd.charAt(_i) + search_rev;
      }
      return pwd.indexOf(search_fwd) !== -1 || pwd.indexOf(search_rev) !== -1;
    };

    return PasswordEvaluator;

  })();

}).call(this);


