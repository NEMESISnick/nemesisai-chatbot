import  admin from  "firebase-admin";
import { cert, initializeApp } from "firebase-admin";

import  serviceAccount from "../nemesisai-bbdbf-firebase-adminsdk-fbsvc-22be983e48.json" with {type:"json"};

export const app = admin.initializeApp({
  credential: cert(serviceAccount)
});
