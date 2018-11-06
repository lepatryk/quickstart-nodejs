import * as firebase from 'firebase-admin';

export class Helper {
  constructor(private db: firebase.firestore.Firestore) {
  }

  async getAllData() {
    let result = await this.db.collection('test').get();
    return result.docs.map((snap) => snap.data());
  }

  async getFirstTwoDocs() {
    let result = await this.db.collection('test').orderBy(firebase.firestore.FieldPath.documentId()).limit(2).get();
    return result.docs.map((snap) => snap.data());
  }
}
