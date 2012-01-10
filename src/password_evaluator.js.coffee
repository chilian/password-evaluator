###
  password-evaluator v 0.2
  http://cc-web.eu/projects/javascript/password-evaluator
  Copyright 2012, Christoph Chilian <dev@cc-web.eu>

  Licensed under the MIT.
  http://cc-web.eu/projects/javascript/password-evaluator/license

  Date: 2012-01-14 14:51:24 +0100
###
class @PasswordEvaluator
  constructor: (@debug_mode = false)->
    @score = 0

  ###
    Logger for Firebug
    level: 0 = off, 1 = log, 2 = debug, 3 = info, 4 = warn, 5 = error
    2DO: refactor this method :)
  ###
  logger: (msg,level = 2)->
    if @debug_mode == true and typeof console != "undefined"
      switch parseInt(level)
        when 1 then console.log msg
        when 2 then console.debug msg
        when 3 then console.info msg
        when 4 then console.warn msg
        when 5 then console.error msg
    else if @debug_mode == true
      alert msg
    return msg


  check_password: (pwd = "")->
    @score = 0
    if pwd == "" then this.logger "Attention: no password is given!!!", 3

    this.logger "start checking pw", 1
    @score += this.calc_score_number_of_characters(pwd)
    @score += this.calc_score_lowercase_letters(pwd)
    @score += this.calc_score_uppercase_letters(pwd)
    @score += this.calc_score_numbers(pwd)
    @score += this.calc_score_symbols(pwd)
    @score += this.calc_score_middle_numbers_or_symbols(pwd)

    @score -= this.calc_score_letters_only(pwd)
    @score -= this.calc_score_numbers_only(pwd)
    @score -= this.calc_score_repeat_characters(pwd)
    @score -= this.calc_score_consecutive_lc_letters_and_uc_letters_and_numbers(pwd)
    @score -= this.calc_score_seq_alpha_or_numeric_or_symbols(pwd)

    this.logger "finished! The final score: " + @score, 1

    @score = if @score > 100 then 100 else if @score < 0 then 0 else @score


  ###
    The following methods calculate the pw-score
  ###

  ###
    positive score
  ###
  calc_score_number_of_characters: (pwd)->
    score = parseInt(pwd.length * 4)
    this.logger "Score=> number of characters: " + score
    score

  calc_score_lowercase_letters: (pwd)->
    count_lc = this.count_regex_matches(pwd, /[a-z]/g)
    score = if count_lc < pwd.length && count_lc >= 1 then parseInt((pwd.length-count_lc) * 2) else 0
    this.logger "Score=> lowercase_letters: " + score
    score

  calc_score_uppercase_letters: (pwd)->
    count_uc = this.count_regex_matches(pwd, /[A-Z]/g)
    score = if count_uc < pwd.length && count_uc >= 1 then parseInt((pwd.length-count_uc) * 2) else 0
    this.logger "Score=> uppercase_letters: " + score
    score

  calc_score_numbers: (pwd)->
    score = parseInt(this.count_regex_matches(pwd, /[0-9]/g) * 4)
    this.logger "Score=> numbers: " + score
    score

  calc_score_symbols: (pwd)->
    score = parseInt(this.count_regex_matches(pwd, /[^a-zA-Z0-9_]/g) * 6)
    this.logger "Score=> symbols: " + score
    score

  calc_score_middle_numbers_or_symbols: (pwd)->
    score = parseInt(this.count_regex_matches(pwd.substring(1,pwd.length-1), /([\W]|[\d])/ig) * 2)
    this.logger "Score=> middle_numbers_or_symbols: " + score
    score

  ###
    negative score
  ###
  calc_score_letters_only: (pwd)->
    score = if this.count_regex_matches(pwd, /[^a-z]/ig) then 0 else parseInt(this.count_regex_matches(pwd, /[a-z]/ig))
    this.logger "Score=> letters_only: -" + score
    score

  calc_score_numbers_only: (pwd)->
    score = if parseInt(this.count_regex_matches(pwd, /[^0-9]/)) > 0 then 0 else pwd.length
    this.logger "Score=> numbers_only: -" + score
    score

  calc_score_repeat_characters: (pwd)->
    nRepChar = 0
    nRepInc = 0
    bCharExists = false
    arr_pwd = pwd.replace(/\s+/g,"").split(/\s*/)
    (bCharExists = false;(if (a == b) && (_i!=_j) then bCharExists = true;nRepInc += Math.abs(arr_pwd.length/(_j-_i)))for b in arr_pwd; if bCharExists then (nRepChar++; nUnqChar = arr_pwd.length-nRepChar; if nUnqChar then nRepInc = Math.ceil(nRepInc/nUnqChar) else nRepInc = Math.ceil(nRepInc))) for a in arr_pwd
    score = nRepInc
    this.logger "Score=> repeat_characters: -" + score
    score

  calc_score_consecutive_lowercase_letters: (pwd)->
    score = parseInt(this.count_regex_matches(pwd, /[a-z]/g)) * 2
    this.logger "Score=> consecutive_lowercase_letters: -" + score
    score

  calc_score_consecutive_uppercase_letters: (pwd)->
    score = parseInt(this.count_regex_matches(pwd, /[A-Z]/g)) * 2
    this.logger "Score=> consecutive_uppercase_letters: -" + score
    score

  calc_score_consecutive_numbers: (pwd)->
    score = parseInt(this.count_regex_matches(pwd, /[0-9]/g)) * 2
    this.logger "Score=> consecutive_numbers: -" + score
    score

  calc_score_consecutive_lc_letters_and_uc_letters_and_numbers: (pwd)->
    tmp_lc = ''
    tmp_uc = ''
    tmp_number = ''

    count_lc = 0
    count_uc = 0
    count_number = 0

    arr_pwd = pwd.replace(/\s+/g,"").split(/\s*/)

    ((if (char.match(/[a-z]/)) then (if tmp_lc != '' then ((if (tmp_lc+1) == _i then count_lc++))); tmp_lc = _i); (if (char.match(/[A-Z]/)) then (if tmp_uc != '' then ((if (tmp_uc+1) == _i then count_uc++))); tmp_uc = _i); (if (char.match(/[0-9]/)) then (if tmp_number != '' then ((if (tmp_number+1) == _i then count_number++))); tmp_number = _i) ) for char in arr_pwd


    this.logger "Score=> consecutive_lowercase: -" + (count_lc*2), 1
    this.logger "Score=> consecutive_uppercase: -" + (count_uc*2), 1
    this.logger "Score=> consecutive_number: -" + (count_number*2), 1

    score = (count_lc + count_uc + count_number) * 2


  calc_score_seq_alpha_or_numeric_or_symbols: (pwd)->
    seq_alpha = 'abcdefghijklmnopqrstuvwxyz'
    seq_numeric = '012345678910'
    seq_symbols = '°!"§$%&/()=?`'

    count_alpha = 0
    count_numeric = 0
    count_symbols = 0

    pwd = pwd.toLowerCase()

    (if this.check_seq_fwd_and_rev(pwd, seq_alpha, seq_letter) then count_alpha++; if this.check_seq_fwd_and_rev(pwd, seq_numeric, seq_letter) then count_numeric++; if this.check_seq_fwd_and_rev(pwd, seq_symbols, seq_letter) then count_symbols++)for seq_letter in [0..23]

    this.logger "Score=> seq_alpha: -" + (count_alpha*3), 1
    this.logger "Score=> seq_numeric: -" + (count_numeric*3), 1
    this.logger "Score=> seq_symbols: -" + (count_symbols*3), 1

    score = (count_alpha + count_numeric + count_symbols) * 3



  ###
    helper-methods
  ###
  count_regex_matches: (str = '', regex = /[0-9]/g)->
    match = str.match(regex)
    if match then match.length else 0

  check_seq_fwd_and_rev: (pwd, seq, seq_pos,seq_length = 3)->
    search_fwd = seq.substring(seq_pos, parseInt(seq_pos+seq_length))
    search_rev = ""
    (search_rev = pwd.charAt(_i) + search_rev) for letter in pwd
    pwd.indexOf(search_fwd) != -1 || pwd.indexOf(search_rev) != -1










