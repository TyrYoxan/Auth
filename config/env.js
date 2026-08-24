const fs = require('fs');
const dotenv = require('dotenv');
const schema = require('./env.schema');

const config = {};

try {
    const content = dotenv.parse(fs.readFileSync('../.env', 'utf8'));
    const errors = [];


    for (const key of Object.keys(schema)) {
        errors.push(validate_env(key, content, config));
    }

    displayValidationReport(errors);

}catch(err) {
    console.error(err);
}

module.exports = config;

function displayValidationReport(nestedErrors) {
    // 1. Aplatir le tableau et supprimer les lignes vides
    const allErrors = nestedErrors.flat();

    console.log("\n" + "=".repeat(50));
    console.log("📊 .ENV FILE VALIDATION REPORT");
    console.log("=".repeat(50));

    if (allErrors.length === 0) {
        console.log(" ✅ Valid configuration: No errors detected.");
    } else {
        console.log(` ❌ ${allErrors.length} error(s) detected: \n`);

        // 2. Affichage formaté avec une puce
        allErrors.forEach((error, index) => {
            // Optionnel : Colorer la clé pour plus de visibilité
            const [key, message] = error.split(' : ');
            console.log(`${String(index + 1).padStart(2, ' ')}. [${key}] ➔ ${message}`);
        });
    }

    console.log("=".repeat(50) + "\n");
}

function validate_env(key, value, config) {
    const errors = [];

    if (value[key] === undefined) {
        if (schema[key].default){
            errors.push(`${key}: is missing !!!`);
        }
        return errors;
    }else {
        if (value[key].length === 0){
            config[key] = schema[key].default;
            return errors;
        }
    }

    if (schema[key].obligation) {
        if (value[key].length === 0) {
            errors.push(`${key} : Value is obligated`);
        }
    }

    if (schema[key].type === 'number') {
        if (isNaN(value[key])) {
            errors.push(`${key} : Need to be a number`);
        }else{
            if (parseInt(value[key]) < 0) {
                errors.push(`${key} : Need to be positif`);
            }
        }

    }else if (schema[key].type === 'enum') {
        if (!schema[key].values.includes(value[key])) {
            errors.push(`${key} : String need to be ${schema[key].values}`);
        }
    }

    config[key] = isNaN(value[key])? value[key]: parseInt(value[key]);
    return errors;
}
