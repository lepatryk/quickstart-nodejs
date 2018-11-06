// Reference mocha-typescript's global definitions:
// eslint-disable-next-line spaced-comment
/// <reference path='../node_modules/mocha-typescript/globals.d.ts' />
import {Helper} from '../lib/helper';
import * as firebase from '@firebase/testing';
import * as fs from 'fs';
import {expect} from 'chai';

/*
 * ============
 *    Setup
 * ============
 */
const projectIdBase = 'firestore-emulator-example-' + Date.now();

const rules = fs.readFileSync('firestore.rules', 'utf8');

// Run each test in its own project id to make it independent.
let testNumber = 0;

/**
* Returns the project ID for the current test
*
* @return {string} the project ID for the current test.
*/
function getProjectId() {
  return `${projectIdBase}-${testNumber}`;
}

/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid: some-uid})
 * @return {object} the app.
 */
function authedApp(auth) {
  return firebase.initializeTestApp({
    projectId: getProjectId(),
    auth: auth,
  }).firestore();
}

/*
 * ============
 *  Test Cases
 * ============
 */
/* eslint-disable require-jsdoc */
class TestingBase {
  async before() {
    // Create new project ID for each test.
    testNumber++;
    await firebase.loadFirestoreRules({
      projectId: getProjectId(),
      rules: rules,
    });
  }

  async after() {
    await Promise.all(firebase.apps().map((app) => app.delete()));
  }
}

// eslint-disable-next-line no-unused-vars
@suite class MyApp extends TestingBase {
  @test async 'test get all data'() {
    const db = authedApp(null);
    await firebase.assertSucceeds(db.doc('test/a').set({foo: 'bar'}));
    await firebase.assertSucceeds(db.doc('test/b').set({bar: 'baz'}));
    await firebase.assertSucceeds(db.doc('test/c').set({baz: 'bzz'}));

    const helper = new Helper(<any>db);
    const data = await helper.getAllData();
    expect(data).to.deep.equal([{foo: 'bar'}, {bar: 'baz'}, {baz: 'bzz'}]);
  }

  @test async 'test get top two docs'() {
    const db = authedApp(null);
    await firebase.assertSucceeds(db.doc('test/a').set({foo: 'bar'}));
    await firebase.assertSucceeds(db.doc('test/b').set({bar: 'baz'}));
    await firebase.assertSucceeds(db.doc('test/c').set({baz: 'bzz'}));

    const helper = new Helper(<any>db);
    await helper.getFirstTwoDocs();
  }
}
/* eslint-enable require-jsdoc */
