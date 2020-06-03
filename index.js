const fs = require('fs');

const dicts = require('./dictionaries');
const stopwords = require('stopwords-iso');
const snowballStemmers = {
  ar: 'arabic',
  fa: 'arabic',
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

const allLangs = Object.keys({
  ...dicts,
  ...stopwords,
  ...snowballStemmers,
});

function writeDictFiles(lang) {
  return new Promise(resolve => {
    dicts.fa((err, result) => {
      if (err || !result) {
        resolve(false);
      }

      fs.writeFileSync(`dist/tdata/${lang}.dict`, result.dic);
      fs.writeFileSync(`dist/tdata/${lang}.affix`, result.aff);
      resolve(true);
    });
  });
}

async function generateAll() {
  let sql = 'CREATE EXTENSION IF NOT EXISTS unaccent;\n';

  for (const lang of allLangs) {
    if (stopwords[lang]) {
      fs.writeFileSync(`dist/tdata/${lang}.stop`, stopwords[lang].join('\n'));
    }
    const hasDic = await writeDictFiles(lang);
    const stopsConf = stopwords[lang] ? `StopWords = ${lang},` : '';

    sql += `
---------------------------------------${lang}--------------------------------------
`;

    if (hasDic) {
      sql += `
-- DROP TEXT SEARCH DICTIONARY IF EXISTS ${lang}_hunspell CASCADE;
CREATE TEXT SEARCH DICTIONARY ${lang}_hunspell (
  template = ispell,
  ${stopsConf}
  DictFile = ${lang},
  AffFile = ${lang}
);`;
    }

    sql += `
-- DROP TEXT SEARCH DICTIONARY IF EXISTS ${lang}_stem CASCADE;
CREATE TEXT SEARCH DICTIONARY ${lang}_stem (
  ${stopsConf}
  TEMPLATE = ${
    snowballStemmers[lang]
      ? `snowball,
  Language = ${snowballStemmers[lang]}`
      : 'simple'
  }
);

-- DROP TEXT SEARCH CONFIGURATION IF EXISTS "${lang}" CASCADE;
CREATE TEXT SEARCH CONFIGURATION "${lang}" (
  COPY = simple
);

ALTER TEXT SEARCH CONFIGURATION "${lang}" ALTER MAPPING
FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
WITH unaccent${hasDic ? `, ${lang}_hunspell` : ''}, ${lang}_stem;
-------------------------------------------------------------------------------

`;
  }

  fs.writeFileSync('dist/setup.sql', sql);
}

generateAll();
