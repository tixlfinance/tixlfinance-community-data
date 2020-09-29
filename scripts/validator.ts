import validate from './schema.validator'
import infoJson from "./../projects/bitcoin-btc/info.json";

function main () {
    const result = validate(infoJson);
    if (result) {
        console.log("successfully")
    }
}

main()