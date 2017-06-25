'use babel';

import fs from 'fs';
import Path from 'path';

const supportedPathsReg = paths => new RegExp(`^\/(app|lib|${paths.join('|')})\/`, 'i');
const specLibPathsReg = paths => new RegExp(`^\/(${paths.join('|')})\/lib\/`, 'i');
const specAppPathsReg = paths => new RegExp(`^\/(${paths.join('|')})\/`, 'i');

export default class Jest {
  constructor(root, specPaths, specDefault) {
    this.root = root;
    this.specPaths = specPaths;
    this.specDefault = specDefault;
  }

  toggleSpecFile(file) {
    let relativePath = file.substring(this.root.length);
    if (!relativePath.match(supportedPathsReg(this.specPaths))) {
      return null;
    }

    if (relativePath.match(/\.test\.jsx?$/)) {
      return this.getSourceFile(relativePath);
    }

    return this.findSpecFile(relativePath);
  }

  getSourceFile(path) {
    let sourcePath;

    if (path.match(/\.test\.jsx$/)) {
      sourcePath = path.replace(/\.test\.jsx$/, '.jsx');
    } else {
      sourcePath = path.replace(/\.test\.js$/, '.js');
    }

    sourcePath = sourcePath.replace(specLibPathsReg(this.specPaths), '/lib/')
    sourcePath = sourcePath.replace(specAppPathsReg(this.specPaths), '/app/')
    return Path.join(this.root, sourcePath);
  }

  findSpecFile(path) {
    const files = this.specPaths.map(specPath => this.getSpecFile(path, specPath));
    const foundFile = files.find(file => fs.existsSync(file));

    if (foundFile) { return foundFile; }
    return this.getSpecFile(path, this.specDefault);
  }

  getSpecFile(path, specPath) {
    let newSpecPath;

    if (path.match(/\.jsx$/)) {
      newSpecPath = path.replace(/\.jsx$/, '.test.jsx');
    } else {
      newSpecPath = path.replace(/\.js$/, '.test.js');
    }

    if (path.match(/^\/app\//)) {
      newSpecPath = newSpecPath.replace(/^\/app\//, `/${specPath}/`);
    } else {
      newSpecPath = newSpecPath.replace(/^\/lib\//, `/${specPath}/lib/`);
    }

    return Path.join(this.root, newSpecPath);
  }
}
