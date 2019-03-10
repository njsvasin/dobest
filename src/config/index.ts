import * as configFile from './config.json';
import * as packageFile from '../../package.json';

const config = {...configFile.default, ...packageFile.default};

export { config };
