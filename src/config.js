import path from 'path';
import crypto from 'crypto';
import readPkgUp from 'read-pkg-up';

const defaultConfig = {
    template: '[hash].[ext]',
    relativePath(fileMeta, options) {
        return path.join(
            options.dest,
            path.relative(fileMeta.src, fileMeta.dirname)
        );
    },
    hashFunction(contents) {
        return crypto.createHash('sha1')
            .update(contents)
            .digest('hex')
            .substr(0, 16);
    },
    transform(fileMeta) {
        return fileMeta;
    }
};

export default function config(userOpts = {}) {
    const result = readPkgUp.sync();
    let pkgOpts = {};
    if (result.pkg && result.pkg.copyAsset) {
        pkgOpts = result.pkg.copyAsset;
        if (pkgOpts.extend) {
            pkgOpts = require(
                require.resolve(path.dirname(result.pkg.path), pkgOpts.extend)
            );
        }
    }
    const opts = Object.assign({}, defaultConfig, pkgOpts, userOpts);
    if (opts.src) {
        if (typeof opts.src === 'string') {
            opts.src = [path.resolve(opts.src)];
        } else {
            opts.src = opts.src.map((elem) => path.resolve(elem));
        }
    } else {
        throw new Error('Option `src` is required.');
    }
    if (opts.dest) {
        opts.dest = path.resolve(opts.dest);
    } else {
        throw new Error('Option `dest` is required ');
    }
    return opts;
}
