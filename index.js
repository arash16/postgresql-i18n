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
    if (!dicts[lang]) {
      resolve(false);
    } else {
      dicts[lang]((err, result) => {
        if (err || !result) {
          resolve(false);
        }

        const dic = result.dic.toString('utf8');
        let aff = result.aff.toString('utf8').replace(/FLAG UTF-8/gi, '');

        if (lang === 'cs') {
          const lines = aff.split('\n');
          lines[2118] += ']';
          aff = lines.join('\n');
        }

        fs.writeFileSync(`dist/tdata/${lang}.dict`, dic);
        fs.writeFileSync(`dist/tdata/${lang}.affix`, aff);
        resolve(true);
      });
    }
  });
}

async function generateAll() {
  let sql = 'CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA pg_catalog;\n';

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
-- DROP TEXT SEARCH DICTIONARY IF EXISTS pg_catalog.${lang}_hunspell CASCADE;
CREATE TEXT SEARCH DICTIONARY pg_catalog.${lang}_hunspell (
  template = ispell,
  ${stopsConf}
  DictFile = ${lang},
  AffFile = ${lang}
);`;
    }

    sql += `
-- DROP TEXT SEARCH DICTIONARY IF EXISTS pg_catalog.${lang}_stem CASCADE;
CREATE TEXT SEARCH DICTIONARY pg_catalog.${lang}_stem (
  ${stopsConf}
  TEMPLATE = ${
    snowballStemmers[lang]
      ? `snowball,
  Language = ${snowballStemmers[lang]}`
      : 'simple'
  }
);

-- DROP TEXT SEARCH CONFIGURATION IF EXISTS pg_catalog."${lang}" CASCADE;
CREATE TEXT SEARCH CONFIGURATION pg_catalog."${lang}" (
  COPY = simple
);

ALTER TEXT SEARCH CONFIGURATION pg_catalog."${lang}" ALTER MAPPING
FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
WITH unaccent${hasDic ? `, ${lang}_hunspell` : ''}, ${lang}_stem;
-------------------------------------------------------------------------------

`;
  }

  fs.writeFileSync(
    'dist/tdata/all3.stop',
    [
      ...new Set(
        [].concat(
          ...Object.entries(stopwords)
            .filter(([k]) => k != 'zh')
            .map(([, l]) => l),
        ),
      ),
    ].join('\n'),
  );
  sql += `
  -- DROP TEXT SEARCH DICTIONARY IF EXISTS pg_catalog.stop_all;
CREATE TEXT SEARCH DICTIONARY pg_catalog.stop_all (
  TEMPLATE = simple,
  StopWords = all3
);

-- DROP TEXT SEARCH CONFIGURATION IF EXISTS pg_catalog.unaccent_stop;
CREATE TEXT SEARCH CONFIGURATION pg_catalog."unaccent_stop" (
  COPY = simple
);

ALTER TEXT SEARCH CONFIGURATION pg_catalog."unaccent_stop" ALTER MAPPING
FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
WITH unaccent, stop_all;

-------------------------------------------------------------------------------

-- DROP TEXT SEARCH CONFIGURATION IF EXISTS pg_catalog."unaccent";
CREATE TEXT SEARCH CONFIGURATION pg_catalog."unaccent" (
  COPY = simple
);

ALTER TEXT SEARCH CONFIGURATION pg_catalog."unaccent" ALTER MAPPING
FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
WITH unaccent, simple;
`;

  fs.writeFileSync('dist/setup.sql', sql);
}

generateAll();
