import pkg from '../package.json';

export const externals = Object.keys('dependencies' in pkg ? (pkg.dependencies as Record<string, unknown>) : {});
