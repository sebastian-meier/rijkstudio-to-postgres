const { Client } = require("pg");
const fs = require("fs");
const colConv = require("color-convert");

const objects = JSON.parse(fs.readFileSync("./temp/items.json"));

const client = new Client({
  user: "___YOUR_USERNAME___",
  host: "localhost",
  database: "___YOUR_DATABASE_NAME___",
  password: "",
  port: 5432,
});

const rs_colors = {};
const rs_colors32 = {};
const rs_arrays = {};
const rs_subjects = {};
const rs_artworks = {};

const insertsFromArray = (fieldName, tableName) => {
  const calls = [];
  rs_arrays[fieldName] = {};
  objects.forEach((object) => {
    if (object !== null && object[fieldName] !== null) {
      if(typeof object[fieldName] === 'object') {
        object[fieldName].forEach((value) => {
          if(value){
            value = value.trim();
            if(value.length > 0){
              if(!(value in rs_arrays[fieldName])) {
                rs_arrays[fieldName][value] = null;
                calls.push(client.query(
                  `INSERT INTO ${tableName} (name) VALUES($1) RETURNING *`,
                  [value]
                ));
              }
            }
          }
        });
      } else {
        if(object[fieldName]){
          object[fieldName] = object[fieldName].trim();
          if(object[fieldName].length > 0){
            if(!(object[fieldName] in rs_arrays[fieldName])) {
              rs_arrays[fieldName][object[fieldName]] = null;
              calls.push(client.query(
                `INSERT INTO ${tableName} (name) VALUES($1) RETURNING *`,
                [object[fieldName]]
              ));
            }
          }
        }
      }
    }
  });
  return calls;
};

const updateArray = (fieldName, results) => {
  results.forEach((result) => {
    rs_arrays[fieldName][result.rows[0].name] = result.rows[0].id;
  });
};

client.connect()
  .then(() => {
    const colors = [];

    objects.forEach((object) => {
      if (object !== null) {
        object.colors.forEach((color) => {
          if(color && color.hex && color.hex.length > 4){
    
            color.hex = color.hex.trim();
            if(!(color.hex in rs_colors)) {
              rs_colors[color.hex] = null;
              const rgb = colConv.hex.rgb(color.hex);
              const cmyk = colConv.hex.cmyk(color.hex);
              colors.push(client.query(
                `INSERT INTO rs_colors(hex, red, green, blue, cyan, magenta, yellow, black) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [color.hex, rgb[0], rgb[1], rgb[2], cmyk[0], cmyk[1], cmyk[2], cmyk[3]]
              ));
            }
          }
        });
      }
    });

    return Promise.all(colors);
  })
  .then((res) => {
    res.forEach((r) => {
      rs_colors[r.rows[0].hex] = r.rows[0].id;
    });

    const colors = [];

    objects.forEach((object) => {
      if (object !== null) {
        object.normalized32Colors.forEach((color) => {
          if(color && color.hex && color.hex.length > 4){
    
            color.hex = color.hex.trim();
            if(!(color.hex in rs_colors32)) {
              rs_colors32[color.hex] = null;
              const rgb = colConv.hex.rgb(color.hex);
              const cmyk = colConv.hex.cmyk(color.hex);
              colors.push(client.query(
                `INSERT INTO rs_colors32(hex, red, green, blue, cyan, magenta, yellow, black) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [color.hex, rgb[0], rgb[1], rgb[2], cmyk[0], cmyk[1], cmyk[2], cmyk[3]]
              ));
            }
          }
        });
      }
    });

    return Promise.all(colors);
  })
  .then((res) => {
    res.forEach((r) => {
      rs_colors32[r.rows[0].hex] = r.rows[0].id;
    });

    return Promise.all(insertsFromArray("exhibitions", "rs_exhibitions"));
  })
  .then((res) => {
    updateArray("exhibition", res);
    return Promise.all(insertsFromArray("location", "rs_locations"));
  })
  .then((res) => {
    updateArray("location", res);
    return Promise.all(insertsFromArray("objectCollection", "rs_collections"));
  })
  .then((res) => {
    updateArray("objectCollection", res);
    return Promise.all(insertsFromArray("materials", "rs_materials"));
  })
  .then((res) => {
    updateArray("materials", res);
    return Promise.all(insertsFromArray("techniques", "rs_techniques"));
  })
  .then((res) => {
    updateArray("techniques", res);
    return Promise.all(insertsFromArray("productionPlaces", "rs_places"));
  })
  .then((res) => {
    updateArray("productionPlaces", res);
    return Promise.all(insertsFromArray("objectTypes", "rs_objecttypes"));
  })
  .then((res) => {
    updateArray("objectTypes", res);
    return Promise.all(insertsFromArray("physicalMedium", "rs_mediums"));
  })
  .then((res) => {
    updateArray("physicalMedium", res);
    
    const calls = [];
    rs_arrays["artists"] = {};

    objects.forEach((object) => {
      if (object !== null) {
        object.principalMakers.forEach((maker) => {
          if(maker && !(maker.name in rs_arrays["artists"])){
            rs_arrays["artists"][maker.name] = null;
            calls.push(client.query(
              `INSERT INTO rs_artists(name,unfixedname,placeofbirth,dateofbirth,dateofbirthprecision,dateofdeath,dateofdeathprecision,placeofdeath,occupation,roles,nationality,biography,qualification) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
              [maker.name,
                maker.unFixedName,
                maker.placeOfBirth,
                maker.dateOfBirth,
                maker.dateOfBirthPrecision,
                maker.dateOfDeath,
                maker.dateOfDeathPrecision,
                maker.placeOfDeath,
                maker.occupation,
                maker.roles,
                maker.nationality,
                maker.biography,
                maker.qualification]
            ));
          }
        });

        object.makers.forEach((maker) => {
          if(maker && !(maker.name in rs_arrays["artists"])){
            rs_arrays["artists"][maker.name] = null;
            calls.push(client.query(
              `INSERT INTO rs_artists(name,unfixedname,placeofbirth,dateofbirth,dateofbirthprecision,dateofdeath,dateofdeathprecision,placeofdeath,occupation,roles,nationality,biography,qualification) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
              [maker.name,
                maker.unFixedName,
                maker.placeOfBirth,
                maker.dateOfBirth,
                maker.dateOfBirthPrecision,
                maker.dateOfDeath,
                maker.dateOfDeathPrecision,
                maker.placeOfDeath,
                maker.occupation,
                maker.roles,
                maker.nationality,
                maker.biography,
                maker.qualification]
            ));
          }
        });
      }
    });

    return Promise.all(calls);
  })
  .then((res) => {
    updateArray("artists", res);

    const calls = [];

    objects.forEach((object) => {
      if (object !== null) {
        (["motifs","places","people","periods","events"]).forEach((key) => {
          if(!(key in rs_subjects)){
            rs_subjects[key] = {};
          }
          object.classification[key].forEach((value) => {
            if(value){
              if(!(value in rs_subjects[key])){
                rs_subjects[key][value] = null;
                calls.push(client.query(
                  `INSERT INTO rs_subjects(name,type) VALUES($1, $2) RETURNING *`,
                  [value, key]
                ));
              }
            }
          });
        });
      }
    });

    return Promise.all(calls);
  })
  .then((res) => {
    res.forEach((r) => {
      rs_subjects[r.rows[0].type][r.rows[0].name] = r.rows[0].id;
    });

    const calls = [];

    rs_arrays["classifications"] = {};

    objects.forEach((object) => {
      if (object !== null) {
        object.classification.iconClassIdentifier.forEach((value, index) => {
          if(value){
            if(!(value in rs_arrays["classifications"])){
              rs_arrays["classifications"][value] = null;
              calls.push(client.query(
                `INSERT INTO rs_classifications(name,description) VALUES($1, $2) RETURNING *`,
                [value, object.classification.iconClassDescription[index]]
              ));
            }
          }
        });
      }
    });

    return Promise.all(calls);
  })
  .then((res) => {
    res.forEach((r) => {
      rs_arrays['classifications'][r.rows[0].name] = r.rows[0].id;
    });

    const calls = [];

    objects.forEach((object) => {
      if(object !== null){

        if(!("webImage" in object) || object.webImage === null){
          object["webImage"] = {};
          object.webImage["guid"] = null;
          object.webImage["offsetPercentageX"] = null;
          object.webImage["offsetPercentageY"] = null;
          object.webImage["height"] = null;
          object.webImage["width"] = null;
          object.webImage["url"] = null;
        }

        calls.push(client.query(
          `INSERT INTO rs_artworks (objectid,priref,objectnumber,language,title,titles,description,labeltext,plaquedescriptiondutch,plaquedescriptionenglish,principalmaker,acquisition_method,acquisition_date,acquisition_creditline,dating_presentingdate,dating_sortingdate,dating_period,dating_yearearly,dating_yearlate,hasimage,documentation,longtitle,subtitle,sclabelline,label_title,label_makerline,label_description,label_notes,label_date,webimage_guid,webimage_offsetpercentagex,webimage_offsetpercentagey,webimage_height,webimage_width,webimage_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35) RETURNING *`,
          [
            object.id,
            object.priref,
            object.objectNumber,
            object.language,
            object.title,
            object.titles,
            object.description,
            object.labelText,
            object.plaqueDescriptionDutch,
            object.plaqueDescriptionEnglish,
            object.principalMaker,
            object.acquisition.method,
            object.acquisition.date,
            object.acquisition.creditLine,
            object.dating.presentingDate,
            object.dating.sortingDate,
            object.dating.period,
            object.dating.yearEarly,
            object.dating.yearLate,
            object.hasImage,
            object.documentation,
            object.longTitle,
            object.subTitle,
            object.scLabelLine,
            object.label.title,
            object.label.makerLine,
            object.label.description,
            object.label.notes,
            object.label.date,
            object.webImage.guid,
            object.webImage.offsetPercentageX,
            object.webImage.offsetPercentageY,
            object.webImage.height,
            object.webImage.width,
            object.webImage.url  
          ]
        ));
      }
    });
        
    return Promise.all(calls);
  })
  .then((res) => {
    res.forEach((r) => {
      rs_artworks[r.rows[0].objectid] = r.rows[0].id;
    });

    const calls = [];

    objects.forEach((object) => {
      if(object !== null){
        const id = rs_artworks[object.id];

        object.dimensions.forEach((dimension)=> {
          calls.push(client.query(
            `INSERT INTO rs_dimensions (unit,type,part,value,artworks_id)VALUES($1,$2,$3,$4,$5)`,
            [dimension.unit, dimension.type, dimension.part, dimension.value, id]
          ));
        });

        ([
          ['physicalMedium', 'mediums'],
          ['objectTypes', 'objecttypes'],
          ['productionPlaces', 'places'],
          ['techniques', 'techniques'],
          ['materials', 'materials'],
          ['objectCollection', 'collections'],
          ['location', 'locations'],
          ['exhibitions', 'exhibitions']
        ]).forEach((arrAttr) => {
          if(arrAttr[0] in object && object[arrAttr[0]] !== null){
            if(typeof object[arrAttr[0]] === "object"){
              object[arrAttr[0]].forEach((value) => {
                calls.push(client.query(
                  `INSERT INTO rs_artworks_${arrAttr[1]} (artworks_id,${arrAttr[1]}_id)VALUES($1,$2)`,
                  [id, rs_arrays[arrAttr[0]][value]]
                ));
              });
            } else {
              calls.push(client.query(
                `INSERT INTO rs_artworks_${arrAttr[1]} (artworks_id,${arrAttr[1]}_id)VALUES($1,$2)`,
                [id, rs_arrays[arrAttr[0]][object[arrAttr[0]]]]
              ));
            }
          }
        });

        object.colors.forEach((color) => {
          calls.push(client.query(
            `INSERT INTO rs_artworks_colors (artworks_id,colors_id,percentage)VALUES($1,$2,$3)`,
            [id, rs_colors[color.hex], color.percentage]
          ));
        });

        object.normalized32Colors.forEach((color) => {
          calls.push(client.query(
            `INSERT INTO rs_artworks_colors32 (artworks_id,colors32_id,percentage)VALUES($1,$2,$3)`,
            [id, rs_colors32[color.hex], color.percentage]
          ));
        });

        object.classification.iconClassIdentifier.forEach((ident) => {
          calls.push(client.query(
            `INSERT INTO rs_artworks_classifications (artworks_id,classifications_id)VALUES($1,$2)`,
            [id, rs_arrays["classifications"][ident]]
          ));
        });

        object.makers.forEach((maker) => {
          calls.push(client.query(
            `INSERT INTO rs_artists_artworks (artists_id, artworks_id, type)VALUES($1,$2,$3)`,
            [rs_arrays["artists"][maker.name], id, "maker"]
          ));
        });

        object.principalMakers.forEach((maker) => {
          calls.push(client.query(
            `INSERT INTO rs_artists_artworks (artists_id, artworks_id, type)VALUES($1,$2,$3)`,
            [rs_arrays["artists"][maker.name], id, "principalMakers"]
          ));
        });

        (["motifs","places","people","periods","events"]).forEach((key) => {
          object.classification[key].forEach((value) => {
            calls.push(client.query(
              `INSERT INTO rs_artworks_subjects (artworks_id, subjects_id)VALUES($1,$2)`,
              [id, rs_subjects[key][value]]
            ));
          });
        });
      }
    });

    return Promise.all(calls);
  })
  .then((res) => {
    console.log("DONE");
    process.exit();
  })
  .catch((err) => {
    throw err;
  });

// dimensions
