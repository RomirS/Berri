import firebase from 'firebase';

export class Provider {
    private provider!: firebase.auth.GoogleAuthProvider;

    constructor() {
        this.createProvider();
    }

    private createProvider(): void {
        this.provider = new firebase.auth.GoogleAuthProvider();
        this.provider.addScope('profile');
        this.provider.addScope('email');
        this.provider.setCustomParameters({
            prompt: 'select_account consent'
        });
    }

    public getProvider(): firebase.auth.GoogleAuthProvider {
        return this.provider;
    }
}