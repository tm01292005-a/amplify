import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
});
const { cfnUserPool } = backend.auth.resources.cfnResources;
// an empty array denotes "email" and "phone_number" cannot be used as a username
cfnUserPool.usernameAttributes = [];
