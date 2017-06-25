'use babel';

import { CompositeDisposable } from 'atom';
import Jest from './jest';

export default {
  subscriptions: null,
  config: {
    projectRootPath: {
      type: 'string',
      default: ''
    },
    specSearchPaths: {
      type: 'array',
      default: ['__tests__']
    },
    specDefaultPath: {
      type: 'string',
      default: '__tests__'
    }
  },

  activate(state) {
    const projectRootPath = atom.config.get('jest-test-toggler.projectRootPath');

    if (!projectRootPath || projectRootPath === '') {
      atom.config.set('jest-test-toggler.projectRootPath', atom.project.getPaths()[0]);
    }

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'jest-test-toggler:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.jestSpecOpenerView.destroy();
  },

  toggle() {
    let editor = atom.workspace.getActiveTextEditor();
    let specPaths = atom.config.get('jest-test-toggler.specSearchPaths');
    let specDefault = atom.config.get('jest-test-toggler.specDefaultPath');
    let root = atom.config.get('jest-test-toggler.projectRootPath');
    let jest = new Jest(root, specPaths, specDefault);
    let file = jest.toggleSpecFile(editor.getPath());

    if (file) { atom.workspace.open(file) };
  }
};
