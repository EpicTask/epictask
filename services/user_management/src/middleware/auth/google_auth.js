import {getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase-admin';

const provider = new GoogleAuthProvider();
const auth = getAuth();
auth().useDeviceLanguage();

signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    console.log('Token: ', token);
    console.log('User: ', user.uid);
  })
  .catch((error) => {
    // Handle Errors here.
    console.error('Failed to sign in user:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Email:', error.customData.email);
    console.error(
      'Credential:',
      auth.GoogleAuthProvider.credentialFromError(error)
    );
    throw error;
    // ...
  });
