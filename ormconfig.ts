import { getTypeOrmConfig } from '@core/database/database.providers';
import * as dotenv from 'dotenv';

dotenv.config();

module.exports = getTypeOrmConfig(process.env);
