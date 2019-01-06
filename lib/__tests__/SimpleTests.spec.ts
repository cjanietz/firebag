import 'reflect-metadata';
import { Max, Min } from 'class-validator';
import { Ref } from '../decorators/Ref';
import { ModelBase } from '../base/model/ModelBase';
import { Field } from '../decorators/Field';
import { FirestoreConnection } from '../base/FirestoreConnection';
import { firestore, initializeApp, credential } from 'firebase-admin';
import { ValidationError } from '../base/validation/ValidationError';

class Person extends ModelBase<Person> {
    @Field()
    firstname: string;
    @Field()
    lastname: string;

    @Ref({ lazy: false })
    father?: Person;

    @Min(0)
    @Max(100)
    age: number;
}

let firestoreConnection: FirestoreConnection;
let firestoreInstance: firestore.Firestore;
beforeAll(async () => {
    const firebaseApp = initializeApp({
        credential: credential.cert(require(process.env.GOOGLE_ADMIN_CREDENTIALS)),
        databaseURL: process.env.DATABASE_URL
    });
    firestoreInstance = firestore(firebaseApp);
    firestoreConnection = FirestoreConnection.fromFirestore(firestoreInstance);
});

it('should pass a simple creation and validation test', async () => {
    const boundModel = firestoreConnection.model(Person);
    const personInstance = new boundModel({
        age: 12,
        firstname: 'Test',
        lastname: 'Person'
    });
    const validationError = await personInstance.validate();
    expect(validationError).toBeNull();
});

it('should fail validation', async () => {
    const boundModel = firestoreConnection.model(Person);
    const personInstance = new boundModel({
        age: -1,
        firstname: 'Test',
        lastname: 'Person'
    });
    const validationError = await personInstance.validate();
    expect(validationError).toBeInstanceOf(ValidationError);
});

it('should save to database', async () => {
    const boundModel = firestoreConnection.model(Person);
    const personInstance = new boundModel({
        age: 12,
        firstname: 'Test',
        lastname: 'Person'
    });
    const dbPerson = await personInstance.save();

    const dbDocument = (await firestoreInstance
        .collection('person')
        .doc(dbPerson.id)
        .get()).data();
    expect(dbDocument).toMatchObject({
        firstname: 'Test',
        lastname: 'Person'
    });
});

it('should save nested entities', async () => {
    const boundModel = firestoreConnection.model(Person);
    const father = new boundModel({
        firstname: 'Test',
        lastname: 'Father',
        age: 45
    });
    const personInstance = new boundModel({
        age: 12,
        firstname: 'Test',
        lastname: 'Person',
        father
    });
    const dbPerson = await personInstance.save();
});
