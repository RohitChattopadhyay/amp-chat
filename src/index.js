import './style';
import App from './components/app';
import Amplify from "aws-amplify"
import { withAuthenticator } from "@aws-amplify/ui-react"

import awsExports from "./aws-exports"
Amplify.configure(awsExports)


export default withAuthenticator(App);
