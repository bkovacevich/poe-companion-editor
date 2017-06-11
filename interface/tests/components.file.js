'use strict';

const { expect }      = require('chai');
const React           = require('react');
const { createStore } = require('redux');
const os              = require('os');
const fs              = require('fs');

const helpers = require('./helpers');

const { testFindDefaultPath, FileBrowser, TestFileBrowser, TestFileSaver, FileSaver } = require('../src/components/file');

describe('interface.components.file', function() {
  let store;
  let initial_state;
  let reducer;

  beforeEach(function() {
    initial_state = {
      file: {
        file_loading:            false,
        filename:                'fake-filename',
        companion_asset_editor:  { fake: 'asset-editor' },
      },
    };

    reducer = this.sinon.stub().returns(initial_state);

    store = createStore(reducer);
  });

  describe('findDefaultPath', function() {
    let home;
    let filename;

    beforeEach(function() {
      home = '/fake/home';
      filename = '';
    });

    context('when filename is set', function() {
      beforeEach(function() {
        filename = '/base/filename';
      });

      it('returns the path for files directory', function() {
        return testFindDefaultPath(home, filename)
          .catch(function(err) {
            expect(err).to.not.exist;
          })
          .then(function(path) {
            expect(path).to.equal('/base');
          });
      });
    });

    context('when the platform is win32', function() {
      beforeEach(function() {
        this.sinon.stub(os, 'platform').returns('win32');
      });

      it('resolves to the default windowes path', function() {
        return testFindDefaultPath(home, filename)
          .catch(function(err) {
            expect(err).to.not.exist;
          })
          .then(function(path) {
            expect(path).to.equal('C:\\Program Files\\Steam (x86)\\SteamApps\\Common\\Pillars of Eternity\\PillarsOfEternity_Data\\assetbundles\\prefabs\\objectbundle');
          });
      });
    });

    context('when the platform is darwin', function() {
      beforeEach(function() {
        this.sinon.stub(os, 'platform').returns('darwin');
      });

      it('resolves to the default mac path', function() {
        return testFindDefaultPath(home, filename)
          .catch(function(err) {
            expect(err).to.not.exist;
          })
          .then(function(path) {
            expect(path).to.equal('/fake/home/Library/Application Support/SteamSteam/Apps/common/Pillars of Eternity/PillarsOfEternity_Data/assetbundles/prefabs/objectbundle');
          });
      });
    });

    context('when the platform is not win32 or darwin', function() {
      context('and the ~/.local/share/Steam path exists', function() {
        beforeEach(function() {
          this.sinon.stub(fs, 'access').yields();
        });

        it('uses that path', function() {
          return testFindDefaultPath(home, filename)
            .catch(function(err) {
              expect(err).to.not.exist;
            })
            .then(function(path) {
              expect(path).to.equal('/fake/home/.local/share/Steam/SteamApps/common/Pillars of Eternity/PillarsOfEternity_Data/assetbundles/prefabs/objectbundle');
            });
        });
      });

      context('when the ~/.local/share/Steam path does not exist', function() {
        beforeEach(function() {
          this.sinon.stub(fs, 'access').yields(new Error('fake access error'));
        });

        it('uses the ~/.steam/steam path', function() {
          return testFindDefaultPath(home, filename)
            .catch(function(err) {
              expect(err).to.not.exist;
            })
            .then(function(path) {
              expect(path).to.equal('/fake/home/.steam/steam/SteamApps/common/Pillars of Eternity/PillarsOfEternity_Data/assetbundles/prefabs/objectbundle');
            });
        });

      });
    });
  });

  describe('FileBrowser', function() {
    context('when rendered with redux', function() {
      let rendered;

      beforeEach(function() {
        rendered = helpers.shallowRender(<FileBrowser store={ store }/>);
      });

      it('sets file loading and filename props', function() {
        expect(rendered.props.file_loading).to.equal(false);
        expect(rendered.props.filename).to.equal('fake-filename');
      });
    });

    context('when rendered without redux', function() {
      let rendered;

      beforeEach(function() {
        rendered = helpers.shallowRender(<TestFileBrowser file_loading={ false }/>);
      });

      it('renders a button', function() {
        let buttons = helpers.findAllWithType(rendered, 'button');
        expect(buttons).to.have.length(1);

        expect(buttons[0].props.id).to.equal('open-file');
        expect(buttons[0].props.className).to.equal('pure-button');
      });

      context('and the file is currently loading', function() {
        beforeEach(function() {
          rendered = helpers.shallowRender(<TestFileBrowser file_loading={ true }/>);
        });

        it('uses the inactive class', function() {
          let buttons = helpers.findAllWithType(rendered, 'button');
          expect(buttons[0].props.className).to.equal('pure-button pure-button-disabled');
        });
      });
    });
  });

  describe('FileSaver', function() {
    context('when rendered with redux', function() {
      let rendered;

      beforeEach(function() {
        rendered = helpers.shallowRender(<FileSaver store={ store }/>);
      });

      it('sets file loading, filename, and asset editor props', function() {
        expect(rendered.props.file_loading).to.equal(false);
        expect(rendered.props.filename).to.equal('fake-filename');
        expect(rendered.props.companion_asset_editor).to.deep.equal({ fake: 'asset-editor' });
      });
    });

    context('when rendered without redux', function() {
      let rendered;

      beforeEach(function() {
        rendered = helpers.shallowRender(<TestFileSaver file_loading={ false} filename={ 'fake-filename' } />);
      });

      it('renders a button', function() {
        let buttons = helpers.findAllWithType(rendered, 'button');
        expect(buttons).to.have.length(1);

        expect(buttons[0].props.id).to.equal('save-file');
        expect(buttons[0].props.className).to.equal('pure-button');
      });

      context('and the file is currently loading', function() {
        beforeEach(function() {
          rendered = helpers.shallowRender(<TestFileSaver file_loading={ true } filename={ 'fake-filename' } />);
        });

        it('uses the inactive class', function() {
          let buttons = helpers.findAllWithType(rendered, 'button');
          expect(buttons[0].props.className).to.equal('pure-button pure-button-disabled');
        });
      });

      context('and the has not been loaded', function() {
        beforeEach(function() {
          rendered = helpers.shallowRender(<TestFileSaver file_loading={ false } />);
        });

        it('uses the inactive class', function() {
          let buttons = helpers.findAllWithType(rendered, 'button');
          expect(buttons[0].props.className).to.equal('pure-button pure-button-disabled');
        });
      });
    });

  });


  //TODO: Figure out how to mock showOpenDialog and test openFile
});
