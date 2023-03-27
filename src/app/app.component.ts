import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    public auth: AngularFireAuth,
    private fns: AngularFireFunctions
  ) {

  }

  tiles: Tile[] = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];

  login() {
    this.auth.signInWithEmailAndPassword("dve3413@gmail.com", "Welcome001")
      .then((userCredential) => {
        console.log("Logged In!");
      });
  }
  logout() {
    this.auth.signOut()
      .then(() => {
        console.log("Logged Out!");
      });
  }

  title = 'angular-stripe';

  createCustomer() {
    console.log("Create Customer!");
    const callable = this.fns.httpsCallable('createCustomer');
    let data = callable({}).subscribe((res) => {
      console.log("Create Stripe Customer! id = " + res.id);
    });
  }

  tryIt() {
    console.log("Test It!");
    const callable = this.fns.httpsCallable('createStripeCheckout');
    let data = callable({ name: 'David Edelstein' }).subscribe((res) => {
      console.log("Create Stripe Checkout! " + res.url);
      location.href = res.url;
    });
  }

  tryIt2() {
    console.log("Test It2!");
    const callable = this.fns.httpsCallable('createAccount');
    let data = callable({}).subscribe((res) => {
      console.log("Create Account! " + res.id);
      this.tryIt3(res.id);
    });
  }

  private tryIt3(id: string) {
    console.log("Test It2!");
    const callable = this.fns.httpsCallable('createConnectedAccount');
    let data = callable({ id: id }).subscribe((res) => {
      console.log("Create Connected Account! " + res.url);
      location.href = res.url;
    });
  }

  helloWorld() {
    console.log("Hello World!!");
    const callable = this.fns.httpsCallable('helloWorld');
    let data = callable({ name: 'some-data' }).subscribe((res) => {
      console.log("Hello World!! + res = " + res);
    });
  }

  ngOnInit(): void {
    // this.fns.useFunctionsEmulator("http://127.0.0.1:4000/");
  }
}

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}
