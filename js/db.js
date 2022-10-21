import firebase from 'firebase/app';
import { GoogleAuthProvider } from "firebase/auth";
import 'firebase/firestore';

export const db = firebase
    .initializeApp({
        apiKey: "AIzaSyCVG1qyRBdRI-PDKhAxhsqNnPtpphcfcfw",
    })
    .firestore();

const provider = new GoogleAuthProvider();