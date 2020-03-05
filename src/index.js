import { handle, getCfg } from './cmd';
import fileHash from './hash';


function start(config) {
    if (process.argv.length === 3 && !(config && config.debug)) {
        handle(process.argv[2]);
        return;
    }
    return getCfg().then(data => {
        fileHash(data);
    });
}

export default start;