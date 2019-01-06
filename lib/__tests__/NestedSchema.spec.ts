import 'reflect-metadata';
import { ModelBase } from '../base/model/ModelBase';
import { Field } from '../decorators/Field';
import { createFirestoreConnection } from '../@test-utils/createFirestoreConnection';
import { FirestoreConnection } from '../base/FirestoreConnection';
import { firestore } from 'firebase-admin';

class Address {
    street: string;
    zipCode: number;
}

class Person extends ModelBase<Person> {
    @Field()
    firstname: string;
    @Field()
    lastname: string;
    @Field()
    address: Address;
}

let firestoreConnection: FirestoreConnection;
let firestoreInstance: firestore.Firestore;
beforeAll(() => {
    const con = createFirestoreConnection();
    firestoreConnection = con.firestoreConnection;
    firestoreInstance = con.firestoreInstance;
});

fit('should save a nested object', async () => {
    const PersonModel = firestoreConnection.model(Person);
    const person = new PersonModel({
        firstname: 'Test',
        lastname: 'Person',
        address: {
            street: 'Somestreet 1',
            zipCode: 12345
        }
    });
    const savedPerson = await person.save();
});
