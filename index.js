const dicts = require('./dictionaries');
const stopwords = require('stopwords-iso');
const snowballStemmers = {
  ar: 'arabic',
  da: 'danish',
  nl: 'dutch',
  en: 'english',
  fi: 'finnish',
  fr: 'french',
  de: 'german',
  hu: 'hungarian',
  id: 'indonesian',
  ga: 'irish',
  it: 'italian',
  lt: 'lithuanian',
  ne: 'nepali',
  nb: 'norwegian',
  nn: 'norwegian',
  pt: 'portuguese',
  ro: 'romanian',
  ru: 'russian',
  es: 'spanish',
  sv: 'swedish',
  ta: 'tamil',
  tr: 'turkish',
};

// fa.stop
// fa.dict
// fa.affix

// _hunspell+stop, unaccent, _stop, _stem/simple
